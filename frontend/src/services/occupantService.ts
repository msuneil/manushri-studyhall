import { writeBatch, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase/firestore';
import type { Seat, Occupant } from '../types/models';
import { updateMetadata } from '../repositories/baseRepository';

export const validateOccupantOnboarding = (occupantData: any): string | null => {
  if (!occupantData.name || occupantData.name.trim().length === 0) {
    return 'Full Name is required.';
  }
  if (!occupantData.phone || occupantData.phone.trim().length === 0) {
    return 'Phone Number is required.';
  }
  if (!occupantData.planType) {
    return 'Plan Type is required.';
  }
  return null;
};

export const preventDuplicateActiveAssignments = (occupants: Occupant[], occupantId: string, seatId: string): boolean => {
  if (!seatId || seatId === 'N/A') return false;
  return (occupants ?? []).some(
    o => o.isActive && o.status === 'Active' && o.id !== occupantId && o.seatId === seatId
  );
};

export const deriveSeatStatus = (seat: Seat, _occupant?: Occupant): 'Available' | 'Occupied' | 'Overdue' | 'Reserved' => {
  if (seat.isReserved) return 'Reserved';
  if (seat.isOccupied) {
    if (seat.isOverdue) return 'Overdue';
    return 'Occupied';
  }
  return 'Available';
};

export const occupantService = {
  validateOccupantOnboarding,
  preventDuplicateActiveAssignments,
  deriveSeatStatus,

  assignSeatToOccupant: async (_hallId: string, operatorId: string, occupantId: string, seatId: string): Promise<void> => {
    const occRef = doc(db, 'occupants', occupantId);
    const seatRef = doc(db, 'seats', seatId);

    const [occSnap, seatSnap] = await Promise.all([getDoc(occRef), getDoc(seatRef)]);
    if (!occSnap.exists()) throw new Error('Occupant not found.');
    if (!seatSnap.exists()) throw new Error('Seat not found.');

    const occupant = occSnap.data() as Occupant;
    const seat = seatSnap.data() as Seat;

    if (seat.isActive === false) throw new Error('Cannot allocate an inactive seat.');
    if (occupant.status !== 'Active') throw new Error('Cannot assign seat to an inactive occupant.');
    if (seat.isOccupied) throw new Error('Seat is already occupied.');
    if (occupant.seatId && occupant.seatId !== 'N/A') throw new Error('Occupant already holds an active seat.');

    const batch = writeBatch(db);
    const now = new Date().toISOString();

    // Atomically link seat to occupant
    batch.update(occRef, {
      seatId,
      assignedAt: now,
      ...updateMetadata(operatorId)
    });

    // Atomically link occupant to seat
    batch.update(seatRef, {
      isOccupied: true,
      occupantId,
      ...updateMetadata(operatorId)
    });

    await batch.commit();
  },

  vacateSeatAssignment: async (_hallId: string, operatorId: string, occupantId: string): Promise<void> => {
    const occRef = doc(db, 'occupants', occupantId);
    const occSnap = await getDoc(occRef);
    if (!occSnap.exists()) throw new Error('Occupant not found.');

    const occupant = occSnap.data() as Occupant;
    if (!occupant.seatId || occupant.seatId === 'N/A') {
      return; // Already vacant
    }

    const seatRef = doc(db, 'seats', occupant.seatId);
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    // Release occupant linkage
    batch.update(occRef, {
      seatId: 'N/A',
      vacatedAt: now,
      ...updateMetadata(operatorId)
    });

    // Release seat occupancy
    batch.update(seatRef, {
      isOccupied: false,
      occupantId: '',
      ...updateMetadata(operatorId)
    });

    await batch.commit();
  },

  transferSeatAssignment: async (_hallId: string, operatorId: string, occupantId: string, previousSeatId: string, newSeatId: string): Promise<void> => {
    const occRef = doc(db, 'occupants', occupantId);
    const oldSeatRef = doc(db, 'seats', previousSeatId);
    const newSeatRef = doc(db, 'seats', newSeatId);

    const [occSnap, oldSeatSnap, newSeatSnap] = await Promise.all([
      getDoc(occRef),
      getDoc(oldSeatRef),
      getDoc(newSeatRef)
    ]);

    if (!occSnap.exists()) throw new Error('Occupant not found.');
    if (!oldSeatSnap.exists()) throw new Error('Previous seat not found.');
    if (!newSeatSnap.exists()) throw new Error('New seat not found.');

    const occupant = occSnap.data() as Occupant;
    const newSeat = newSeatSnap.data() as Seat;

    if (newSeat.isActive === false) throw new Error('Cannot transfer to an inactive seat.');
    if (occupant.status !== 'Active') throw new Error('Cannot transfer seat for an inactive occupant.');
    if (newSeat.isOccupied) throw new Error('New seat is already occupied.');

    const batch = writeBatch(db);
    const now = new Date().toISOString();

    // 1. Release previous seat
    batch.update(oldSeatRef, {
      isOccupied: false,
      occupantId: '',
      ...updateMetadata(operatorId)
    });

    // 2. Occupy new seat
    batch.update(newSeatRef, {
      isOccupied: true,
      occupantId,
      ...updateMetadata(operatorId)
    });

    // 3. Link occupant to new seat
    batch.update(occRef, {
      seatId: newSeatId,
      assignedAt: now,
      ...updateMetadata(operatorId)
    });

    await batch.commit();
  }
};

export default occupantService;
