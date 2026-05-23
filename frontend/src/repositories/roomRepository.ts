import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase/firestore';
import type { Room, RoomType } from '../types/models';
import { createMetadata, updateMetadata, createSoftDelete } from './baseRepository';

export const roomRepository = {
  subscribeRooms: (hallId: string, callback: (rooms: Room[]) => void) => {
    const q = query(
      collection(db, 'rooms'),
      where('hallId', '==', hallId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const rooms: Room[] = [];
      snapshot.forEach((docSnap) => {
        rooms.push({ id: docSnap.id, ...docSnap.data() } as Room);
      });
      callback(rooms);
    });
  },

  createRoom: async (hallId: string, operatorId: string, name: string, type: RoomType) => {
    const roomRef = doc(collection(db, 'rooms'));
    const roomDoc: Room = {
      id: roomRef.id,
      hallId,
      name,
      type,
      ...createMetadata(operatorId),
      ...createSoftDelete(),
    };
    await setDoc(roomRef, roomDoc);
    return roomRef.id;
  },

  updateRoom: async (roomId: string, operatorId: string, fields: Partial<Room>) => {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      ...fields,
      ...updateMetadata(operatorId),
    });
  },

  softDeleteRoom: async (roomId: string, operatorId: string) => {
    const now = new Date().toISOString();
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      isActive: false,
      deletedAt: now,
      archivedAt: now,
      ...updateMetadata(operatorId),
    });
  }
};

export default roomRepository;
