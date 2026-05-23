import { 
  collection, 
  doc, 
  getDoc,
  query, 
  where, 
  orderBy,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase/firestore';
import type { Occupant } from '../types/models';
import { OccupantStatus } from '../types/models';
import { createMetadata, updateMetadata, createSoftDelete } from './baseRepository';

export const occupantRepository = {
  subscribeOccupants: (hallId: string, callback: (occupants: Occupant[]) => void) => {
    const q = query(
      collection(db, 'occupants'),
      where('hallId', '==', hallId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const occupants: Occupant[] = [];
      snapshot.forEach((docSnap) => {
        occupants.push({ id: docSnap.id, ...docSnap.data() } as Occupant);
      });
      callback(occupants);
    });
  },

  createOccupant: async (
    hallId: string, 
    operatorId: string, 
    occupantData: Omit<Occupant, 'id' | 'hallId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isActive' | 'archivedAt' | 'deletedAt'>
  ) => {
    const occRef = doc(collection(db, 'occupants'));
    const occDoc: Occupant = {
      id: occRef.id,
      hallId,
      ...occupantData,
      ...createMetadata(operatorId),
      ...createSoftDelete(),
    };
    
    const batch = writeBatch(db);
    batch.set(occRef, occDoc);
    
    if (occupantData.seatId) {
      const seatRef = doc(db, 'seats', occupantData.seatId);
      batch.update(seatRef, {
        isOccupied: true,
        occupantId: occRef.id,
        ...updateMetadata(operatorId)
      });
    }

    await batch.commit();
    return occRef.id;
  },

  updateOccupant: async (occupantId: string, operatorId: string, fields: Partial<Occupant>) => {
    const occRef = doc(db, 'occupants', occupantId);
    const oldSnap = await getDoc(occRef);
    const batch = writeBatch(db);

    batch.update(occRef, {
      ...fields,
      ...updateMetadata(operatorId),
    });

    if (fields.seatId && oldSnap.exists()) {
      const oldOcc = oldSnap.data() as Occupant;
      if (oldOcc.seatId !== fields.seatId) {
        // Unoccupy old seat
        if (oldOcc.seatId) {
          batch.update(doc(db, 'seats', oldOcc.seatId), {
            isOccupied: false,
            occupantId: '',
            ...updateMetadata(operatorId)
          });
        }
        // Occupy new seat
        batch.update(doc(db, 'seats', fields.seatId), {
          isOccupied: true,
          occupantId,
          ...updateMetadata(operatorId)
        });
      }
    }

    await batch.commit();
  },

  softDeleteOccupant: async (occupantId: string, operatorId: string) => {
    const now = new Date().toISOString();
    const occRef = doc(db, 'occupants', occupantId);
    const snap = await getDoc(occRef);
    const batch = writeBatch(db);

    batch.update(occRef, {
      isActive: false,
      status: OccupantStatus.INACTIVE,
      deletedAt: now,
      archivedAt: now,
      ...updateMetadata(operatorId),
    });

    if (snap.exists()) {
      const data = snap.data() as Occupant;
      if (data.seatId) {
        batch.update(doc(db, 'seats', data.seatId), {
          isOccupied: false,
          occupantId: '',
          ...updateMetadata(operatorId)
        });
      }
    }

    await batch.commit();
  }
};

export default occupantRepository;
