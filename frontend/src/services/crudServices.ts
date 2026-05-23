import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { 
  Room, 
  Seat, 
  Occupant, 
  Payment, 
  Task, 
  Expense, 
  AppNotification, 
  AttendanceSession,
  RoomType
} from '../types/models';
import { OccupantStatus } from '../types/models';

// --- GLOBAL UTILITIES FOR METADATA ---

const createMetadata = (uid: string) => {
  const now = new Date().toISOString();
  return {
    createdAt: now,
    updatedAt: now,
    createdBy: uid,
    updatedBy: uid,
  };
};

const updateMetadata = (uid: string) => {
  return {
    updatedAt: new Date().toISOString(),
    updatedBy: uid,
  };
};

const createSoftDelete = () => {
  return {
    isActive: true,
    archivedAt: null,
    deletedAt: null,
  };
};

// --- ROOM SERVICE ---

export const roomService = {
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

// --- SEAT SERVICE ---

export const seatService = {
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

// --- OCCUPANT SERVICE ---

export const occupantService = {
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
    
    // Execute a batch to safely set occupant and link/occupy the Seat document
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

// --- PAYMENT SERVICE ---

export const paymentService = {
  subscribePayments: (hallId: string, callback: (payments: Payment[]) => void) => {
    const q = query(
      collection(db, 'payments'),
      where('hallId', '==', hallId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const payments: Payment[] = [];
      snapshot.forEach((docSnap) => {
        payments.push({ id: docSnap.id, ...docSnap.data() } as Payment);
      });
      callback(payments);
    });
  },

  createPayment: async (
    hallId: string, 
    operatorId: string, 
    paymentData: Omit<Payment, 'id' | 'hallId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isActive' | 'archivedAt' | 'deletedAt'>
  ) => {
    const payRef = doc(collection(db, 'payments'));
    const payDoc: Payment = {
      id: payRef.id,
      hallId,
      ...paymentData,
      ...createMetadata(operatorId),
      ...createSoftDelete(),
    };
    await setDoc(payRef, payDoc);
    return payRef.id;
  },

  updatePayment: async (paymentId: string, operatorId: string, fields: Partial<Payment>) => {
    const payRef = doc(db, 'payments', paymentId);
    await updateDoc(payRef, {
      ...fields,
      ...updateMetadata(operatorId),
    });
  },

  softDeletePayment: async (paymentId: string, operatorId: string) => {
    const now = new Date().toISOString();
    const payRef = doc(db, 'payments', paymentId);
    await updateDoc(payRef, {
      isActive: false,
      deletedAt: now,
      archivedAt: now,
      ...updateMetadata(operatorId),
    });
  }
};

// --- ATTENDANCE SERVICE ---

export const attendanceService = {
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

// --- ADMINISTRATIVE TASKS SERVICE ---

export const taskService = {
  subscribeTasks: (hallId: string, callback: (tasks: Task[]) => void) => {
    const q = query(
      collection(db, 'tasks'),
      where('hallId', '==', hallId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const tasks: Task[] = [];
      snapshot.forEach((docSnap) => {
        tasks.push({ id: docSnap.id, ...docSnap.data() } as Task);
      });
      callback(tasks);
    });
  },

  createTask: async (hallId: string, operatorId: string, title: string, priority: 'Low' | 'Medium' | 'High', dueDate: string) => {
    const taskRef = doc(collection(db, 'tasks'));
    const taskDoc: Task = {
      id: taskRef.id,
      hallId,
      title,
      isCompleted: false,
      dueDate,
      priority,
      ...createMetadata(operatorId),
      ...createSoftDelete(),
    };
    await setDoc(taskRef, taskDoc);
    return taskRef.id;
  },

  updateTask: async (taskId: string, operatorId: string, fields: Partial<Task>) => {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...fields,
      ...updateMetadata(operatorId),
    });
  },

  softDeleteTask: async (taskId: string, operatorId: string) => {
    const now = new Date().toISOString();
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      isActive: false,
      deletedAt: now,
      archivedAt: now,
      ...updateMetadata(operatorId),
    });
  }
};

// --- EXPENSES SERVICE ---

export const expenseService = {
  subscribeExpenses: (hallId: string, callback: (expenses: Expense[]) => void) => {
    const q = query(
      collection(db, 'expenses'),
      where('hallId', '==', hallId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const expenses: Expense[] = [];
      snapshot.forEach((docSnap) => {
        expenses.push({ id: docSnap.id, ...docSnap.data() } as Expense);
      });
      callback(expenses);
    });
  },

  createExpense: async (hallId: string, operatorId: string, category: string, amount: number, date: string, description: string, month: string) => {
    const expRef = doc(collection(db, 'expenses'));
    const expDoc: Expense = {
      id: expRef.id,
      hallId,
      category,
      amount,
      date,
      description,
      month,
      ...createMetadata(operatorId)
    };
    await setDoc(expRef, expDoc);
    return expRef.id;
  }
};

// --- NOTIFICATION SERVICE ---

export const notificationService = {
  subscribeNotifications: (hallId: string, callback: (notifs: AppNotification[]) => void) => {
    const q = query(
      collection(db, 'notifications'),
      where('hallId', '==', hallId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const notifs: AppNotification[] = [];
      snapshot.forEach((docSnap) => {
        notifs.push({ id: docSnap.id, ...docSnap.data() } as AppNotification);
      });
      callback(notifs);
    });
  },

  createNotification: async (
    hallId: string, 
    operatorId: string, 
    title: string, 
    message: string, 
    type: AppNotification['type']
  ) => {
    const notifRef = doc(collection(db, 'notifications'));
    const notifDoc: AppNotification = {
      id: notifRef.id,
      hallId,
      title,
      message,
      timestamp: new Date().toISOString(),
      type,
      isRead: false,
      ...createMetadata(operatorId)
    };
    await setDoc(notifRef, notifDoc);
    return notifRef.id;
  },

  markNotificationAsRead: async (notifId: string, operatorId: string) => {
    const notifRef = doc(db, 'notifications', notifId);
    await updateDoc(notifRef, {
      isRead: true,
      ...updateMetadata(operatorId)
    });
  }
};
