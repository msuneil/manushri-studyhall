import { 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc,
  query, 
  collection,
  where, 
  orderBy, 
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase/firestore';
import type { AttendanceSession } from '../types/models';
import { createMetadata, updateMetadata, createSoftDelete } from './baseRepository';

export const attendanceRepository = {
  subscribeAttendanceSessions: (hallId: string, callback: (sessions: AttendanceSession[]) => void) => {
    const q = query(
      collection(db, 'attendanceSessions'),
      where('hallId', '==', hallId),
      where('isActive', '==', true),
      orderBy('date', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const sessions: AttendanceSession[] = [];
      snapshot.forEach((docSnap) => {
        sessions.push({ id: docSnap.id, ...docSnap.data() } as AttendanceSession);
      });
      callback(sessions);
    });
  },

  saveAttendanceSession: async (
    hallId: string, 
    operatorId: string, 
    date: string, 
    isSubmitted: boolean, 
    records: AttendanceSession['records']
  ) => {
    const sessionId = `session-${hallId}-${date}`;
    const sessionRef = doc(db, 'attendanceSessions', sessionId);
    const snap = await getDoc(sessionRef);

    if (snap.exists()) {
      await updateDoc(sessionRef, {
        isSubmitted,
        records,
        ...updateMetadata(operatorId)
      });
    } else {
      const newSession: AttendanceSession = {
        id: sessionId,
        hallId,
        date,
        isSubmitted,
        records,
        ...createMetadata(operatorId),
        ...createSoftDelete(),
      };
      await setDoc(sessionRef, newSession);
    }
    return sessionId;
  },

  softDeleteAttendanceSession: async (sessionId: string, operatorId: string) => {
    const now = new Date().toISOString();
    const sessionRef = doc(db, 'attendanceSessions', sessionId);
    await updateDoc(sessionRef, {
      isActive: false,
      deletedAt: now,
      archivedAt: now,
      ...updateMetadata(operatorId),
    });
  }
};

export default attendanceRepository;
