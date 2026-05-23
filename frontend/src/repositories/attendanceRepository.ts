import { 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc,
  query, 
  collection,
  where, 
  orderBy, 
  onSnapshot,
  getDocs
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

  getAttendanceByDate: async (hallId: string, date: string): Promise<AttendanceSession | null> => {
    const sessionId = `session-${hallId}-${date}`;
    const sessionRef = doc(db, 'attendanceSessions', sessionId);
    const snap = await getDoc(sessionRef);
    if (snap.exists() && snap.data().isActive !== false) {
      return { id: snap.id, ...snap.data() } as AttendanceSession;
    }
    return null;
  },

  getTodayAttendanceSession: async (hallId: string): Promise<AttendanceSession | null> => {
    const today = new Date().toISOString().split('T')[0];
    return attendanceRepository.getAttendanceByDate(hallId, today);
  },

  createAttendanceSession: async (
    hallId: string,
    date: string,
    operatorId: string,
    records: AttendanceSession['records'],
    summary: { presentCount: number; absentCount: number; unmarkedCount: number }
  ): Promise<string> => {
    const existing = await attendanceRepository.getAttendanceByDate(hallId, date);
    if (existing) {
      throw new Error(`Attendance session already exists for date ${date}`);
    }

    const sessionId = `session-${hallId}-${date}`;
    const sessionRef = doc(db, 'attendanceSessions', sessionId);
    const newSession: AttendanceSession = {
      id: sessionId,
      hallId,
      date,
      isSubmitted: false,
      records,
      presentCount: summary.presentCount,
      absentCount: summary.absentCount,
      unmarkedCount: summary.unmarkedCount,
      ...createMetadata(operatorId),
      ...createSoftDelete(),
    };

    await setDoc(sessionRef, newSession);
    return sessionId;
  },

  updateAttendanceSession: async (
    sessionId: string,
    records: AttendanceSession['records'],
    operatorId: string,
    summary: { presentCount: number; absentCount: number; unmarkedCount: number }
  ): Promise<void> => {
    const sessionRef = doc(db, 'attendanceSessions', sessionId);
    const snap = await getDoc(sessionRef);
    if (!snap.exists()) {
      throw new Error(`Attendance session not found for ID: ${sessionId}`);
    }

    const data = snap.data() as AttendanceSession;
    if (data.isSubmitted) {
      throw new Error('Cannot edit a submitted and locked attendance session.');
    }

    await updateDoc(sessionRef, {
      records,
      presentCount: summary.presentCount,
      absentCount: summary.absentCount,
      unmarkedCount: summary.unmarkedCount,
      ...updateMetadata(operatorId)
    });
  },

  submitAttendanceSession: async (
    sessionId: string,
    records: AttendanceSession['records'],
    operatorId: string,
    summary: { presentCount: number; absentCount: number; unmarkedCount: number }
  ): Promise<void> => {
    const sessionRef = doc(db, 'attendanceSessions', sessionId);
    const snap = await getDoc(sessionRef);
    if (!snap.exists()) {
      throw new Error(`Attendance session not found for ID: ${sessionId}`);
    }

    await updateDoc(sessionRef, {
      isSubmitted: true,
      records,
      presentCount: summary.presentCount,
      absentCount: summary.absentCount,
      unmarkedCount: summary.unmarkedCount,
      ...updateMetadata(operatorId)
    });
  },

  unlockAttendanceSession: async (
    sessionId: string,
    operatorId: string
  ): Promise<void> => {
    const sessionRef = doc(db, 'attendanceSessions', sessionId);
    const now = new Date().toISOString();

    await updateDoc(sessionRef, {
      isSubmitted: false,
      unlockedAt: now,
      unlockedBy: operatorId,
      ...updateMetadata(operatorId)
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

    let presentCount = 0;
    let absentCount = 0;
    Object.values(records).forEach(rec => {
      if (rec.status === 'Present') presentCount++;
      if (rec.status === 'Absent') absentCount++;
    });

    let totalEligible = 0;
    try {
      const occQuery = query(
        collection(db, 'occupants'),
        where('hallId', '==', hallId),
        where('isActive', '==', true),
        where('status', '==', 'Active')
      );
      const occSnap = await getDocs(occQuery);
      occSnap.forEach(docSnap => {
        const d = docSnap.data();
        if (d.seatId && d.seatId !== 'N/A') {
          totalEligible++;
        }
      });
    } catch (err) {
      console.error("Failed to query occupants for unmarked count:", err);
    }
    const unmarkedCount = Math.max(0, totalEligible - (presentCount + absentCount));

    if (snap.exists()) {
      const data = snap.data() as AttendanceSession;
      if (data.isSubmitted && isSubmitted) {
        throw new Error('Cannot edit a submitted and locked attendance session.');
      }
      
      const updateData: Partial<AttendanceSession> = {
        isSubmitted,
        records,
        presentCount,
        absentCount,
        unmarkedCount,
        ...updateMetadata(operatorId)
      };

      if (data.isSubmitted && !isSubmitted) {
        updateData.unlockedAt = new Date().toISOString();
        updateData.unlockedBy = operatorId;
      }

      await updateDoc(sessionRef, updateData);
    } else {
      const newSession: AttendanceSession = {
        id: sessionId,
        hallId,
        date,
        isSubmitted,
        records,
        presentCount,
        absentCount,
        unmarkedCount,
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
