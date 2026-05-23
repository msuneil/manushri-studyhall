import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase/firestore';
import type { Seat } from '../types/models';
import { createMetadata, updateMetadata, createSoftDelete } from './baseRepository';

export const seatRepository = {
  subscribeSeats: (hallId: string, callback: (seats: Seat[]) => void) => {
    const q = query(
      collection(db, 'seats'),
      where('hallId', '==', hallId),
      where('isActive', '==', true)
    );
    return onSnapshot(q, (snapshot) => {
      const seats: Seat[] = [];
      snapshot.forEach((docSnap) => {
        seats.push({ id: docSnap.id, ...docSnap.data() } as Seat);
      });
      callback(seats);
    });
  },

  createSeat: async (hallId: string, operatorId: string, roomId: string, number: string) => {
    const seatRef = doc(collection(db, 'seats'));
    const seatDoc: Seat = {
      id: seatRef.id,
      hallId,
      roomId,
      number,
      isOccupied: false,
      isOverdue: false,
      isReserved: false,
      ...createMetadata(operatorId),
      ...createSoftDelete(),
    };
    await setDoc(seatRef, seatDoc);
    return seatRef.id;
  },

  batchCreateSeats: async (hallId: string, operatorId: string, roomId: string, count: number, prefix: string) => {
    const batch = writeBatch(db);
    for (let i = 1; i <= count; i++) {
      const seatRef = doc(collection(db, 'seats'));
      const seatNumber = `${prefix}-${String(i).padStart(2, '0')}`;
      const seatDoc: Seat = {
        id: seatRef.id,
        hallId,
        roomId,
        number: seatNumber,
        isOccupied: false,
        isOverdue: false,
        isReserved: false,
        ...createMetadata(operatorId),
        ...createSoftDelete(),
      };
      batch.set(seatRef, seatDoc);
    }
    await batch.commit();
  },

  updateSeat: async (seatId: string, operatorId: string, fields: Partial<Seat>) => {
    const seatRef = doc(db, 'seats', seatId);
    await updateDoc(seatRef, {
      ...fields,
      ...updateMetadata(operatorId),
    });
  },

  softDeleteSeat: async (seatId: string, operatorId: string) => {
    const now = new Date().toISOString();
    const seatRef = doc(db, 'seats', seatId);
    await updateDoc(seatRef, {
      isActive: false,
      deletedAt: now,
      archivedAt: now,
      ...updateMetadata(operatorId),
    });
  }
};

export default seatRepository;
