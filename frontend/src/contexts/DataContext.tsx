import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { useToast } from '../components/Toast';

import { roomRepository } from '../repositories/roomRepository';
import { seatRepository } from '../repositories/seatRepository';
import { occupantRepository } from '../repositories/occupantRepository';
import { paymentRepository } from '../repositories/paymentRepository';
import { attendanceRepository } from '../repositories/attendanceRepository';
import { taskRepository } from '../repositories/taskRepository';
import { expenseRepository } from '../repositories/expenseRepository';
import { notificationRepository } from '../repositories/notificationRepository';

import { seedDemoData } from '../lib/demoSeed/seedDemoData';
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

interface DataContextType {
  rooms: Room[];
  seats: Seat[];
  occupants: Occupant[];
  payments: Payment[];
  attendanceSessions: AttendanceSession[];
  tasks: Task[];
  expenses: Expense[];
  notifications: AppNotification[];
  loading: boolean;
  
  // Scoped Repository Actions
  createRoom: (name: string, type: RoomType) => Promise<string>;
  updateRoom: (roomId: string, fields: Partial<Room>) => Promise<void>;
  softDeleteRoom: (roomId: string) => Promise<void>;
  
  createSeat: (roomId: string, number: string) => Promise<string>;
  batchCreateSeats: (roomId: string, count: number, prefix: string) => Promise<void>;
  updateSeat: (seatId: string, fields: Partial<Seat>) => Promise<void>;
  softDeleteSeat: (seatId: string) => Promise<void>;
  
  createOccupant: (occupantData: Omit<Occupant, 'id' | 'hallId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isActive' | 'archivedAt' | 'deletedAt'>) => Promise<string>;
  updateOccupant: (occupantId: string, fields: Partial<Occupant>) => Promise<void>;
  softDeleteOccupant: (occupantId: string) => Promise<void>;
  
  createPayment: (paymentData: Omit<Payment, 'id' | 'hallId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isActive' | 'archivedAt' | 'deletedAt'>) => Promise<string>;
  updatePayment: (paymentId: string, fields: Partial<Payment>) => Promise<void>;
  softDeletePayment: (paymentId: string) => Promise<void>;
  
  saveAttendanceSession: (date: string, isSubmitted: boolean, records: AttendanceSession['records']) => Promise<string>;
  softDeleteAttendanceSession: (sessionId: string) => Promise<void>;
  
  createTask: (title: string, priority: 'Low' | 'Medium' | 'High', dueDate: string) => Promise<string>;
  updateTask: (taskId: string, fields: Partial<Task>) => Promise<void>;
  softDeleteTask: (taskId: string) => Promise<void>;
  
  createExpense: (category: string, amount: number, date: string, description: string, month: string) => Promise<string>;
  
  createNotification: (title: string, message: string, type: AppNotification['type']) => Promise<string>;
  markNotificationAsRead: (notifId: string) => Promise<void>;
  
  // Seeding
  triggerSeeding: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { hallId, user } = useAuth();
  const { showToast } = useToast();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [occupants, setOccupants] = useState<Occupant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  // Synchronize realtime collection snapshots in single-instance connections
  useEffect(() => {
    if (!hallId) {
      setRooms([]);
      setSeats([]);
      setOccupants([]);
      setPayments([]);
      setAttendanceSessions([]);
      setTasks([]);
      setExpenses([]);
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    let activeSubsCount = 8;

    // Failsafe timeout to prevent app from getting stuck on loading spinner if any subscriber fails (e.g., due to missing indexes or rules)
    const failsafeTimeout = setTimeout(() => {
      console.warn("DataContext subscription failsafe triggered: forcing loading to false after 2.5s.");
      setLoading(false);
    }, 2500);

    const checkLoaded = () => {
      activeSubsCount--;
      if (activeSubsCount <= 0) {
        setLoading(false);
        clearTimeout(failsafeTimeout);
      }
    };

    // Subscriptions setup
    const unsubRooms = roomRepository.subscribeRooms(hallId, (data) => {
      setRooms(data);
      checkLoaded();
    });

    const unsubSeats = seatRepository.subscribeSeats(hallId, (data) => {
      setSeats(data);
      checkLoaded();
    });

    const unsubOccupants = occupantRepository.subscribeOccupants(hallId, (data) => {
      setOccupants(data);
      checkLoaded();
    });

    const unsubPayments = paymentRepository.subscribePayments(hallId, (data) => {
      setPayments(data);
      checkLoaded();
    });

    const unsubAttendance = attendanceRepository.subscribeAttendanceSessions(hallId, (data) => {
      setAttendanceSessions(data);
      checkLoaded();
    });

    const unsubTasks = taskRepository.subscribeTasks(hallId, (data) => {
      setTasks(data);
      checkLoaded();
    });

    const unsubExpenses = expenseRepository.subscribeExpenses(hallId, (data) => {
      setExpenses(data);
      checkLoaded();
    });

    const unsubNotifications = notificationRepository.subscribeNotifications(hallId, (data) => {
      setNotifications(data);
      checkLoaded();
    });

    return () => {
      clearTimeout(failsafeTimeout);
      unsubRooms();
      unsubSeats();
      unsubOccupants();
      unsubPayments();
      unsubAttendance();
      unsubTasks();
      unsubExpenses();
      unsubNotifications();
    };
  }, [hallId]);

  // Automated onboarding seeding check
  useEffect(() => {
    if (!loading && hallId && rooms.length === 0 && !isSeeding) {
      const executeSeeding = async () => {
        setIsSeeding(true);
        setLoading(true);
        try {
          showToast('Initializing study hall with default templates...', 'info');
          await seedDemoData(hallId, user?.email || '');
          showToast('Study Hall successfully initialized with live demo metrics!', 'success');
        } catch (error) {
          console.error('Seeding error:', error);
          showToast('Failed to seed onboarding demo data.', 'error');
        } finally {
          setLoading(false);
          setIsSeeding(false);
        }
      };
      executeSeeding();
    }
  }, [loading, rooms.length, hallId]);

  const triggerSeeding = async () => {
    if (!hallId || isSeeding) return;
    setIsSeeding(true);
    setLoading(true);
    try {
      await seedDemoData(hallId, user?.email || '');
      showToast('Demo data seeded successfully!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to seed demo data.', 'error');
    } finally {
      setLoading(false);
      setIsSeeding(false);
    }
  };

  // Scoped Wrapper Methods that inject hallId and operatorId dynamically
  const createRoom = async (name: string, type: RoomType) => {
    if (!hallId) throw new Error('Unauthenticated');
    return roomRepository.createRoom(hallId, hallId, name, type);
  };

  const updateRoom = async (roomId: string, fields: Partial<Room>) => {
    if (!hallId) throw new Error('Unauthenticated');
    return roomRepository.updateRoom(roomId, hallId, fields);
  };

  const softDeleteRoom = async (roomId: string) => {
    if (!hallId) throw new Error('Unauthenticated');
    return roomRepository.softDeleteRoom(roomId, hallId);
  };

  const createSeat = async (roomId: string, number: string) => {
    if (!hallId) throw new Error('Unauthenticated');
    return seatRepository.createSeat(hallId, hallId, roomId, number);
  };

  const batchCreateSeats = async (roomId: string, count: number, prefix: string) => {
    if (!hallId) throw new Error('Unauthenticated');
    return seatRepository.batchCreateSeats(hallId, hallId, roomId, count, prefix);
  };

  const updateSeat = async (seatId: string, fields: Partial<Seat>) => {
    if (!hallId) throw new Error('Unauthenticated');
    return seatRepository.updateSeat(seatId, hallId, fields);
  };

  const softDeleteSeat = async (seatId: string) => {
    if (!hallId) throw new Error('Unauthenticated');
    return seatRepository.softDeleteSeat(seatId, hallId);
  };

  const createOccupant = async (occupantData: Omit<Occupant, 'id' | 'hallId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isActive' | 'archivedAt' | 'deletedAt'>) => {
    if (!hallId) throw new Error('Unauthenticated');
    return occupantRepository.createOccupant(hallId, hallId, occupantData);
  };

  const updateOccupant = async (occupantId: string, fields: Partial<Occupant>) => {
    if (!hallId) throw new Error('Unauthenticated');
    return occupantRepository.updateOccupant(occupantId, hallId, fields);
  };

  const softDeleteOccupant = async (occupantId: string) => {
    if (!hallId) throw new Error('Unauthenticated');
    return occupantRepository.softDeleteOccupant(occupantId, hallId);
  };

  const createPayment = async (paymentData: Omit<Payment, 'id' | 'hallId' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'isActive' | 'archivedAt' | 'deletedAt'>) => {
    if (!hallId) throw new Error('Unauthenticated');
    return paymentRepository.createPayment(hallId, hallId, paymentData);
  };

  const updatePayment = async (paymentId: string, fields: Partial<Payment>) => {
    if (!hallId) throw new Error('Unauthenticated');
    return paymentRepository.updatePayment(paymentId, hallId, fields);
  };

  const softDeletePayment = async (paymentId: string) => {
    if (!hallId) throw new Error('Unauthenticated');
    return paymentRepository.softDeletePayment(paymentId, hallId);
  };

  const saveAttendanceSession = async (date: string, isSubmitted: boolean, records: AttendanceSession['records']) => {
    if (!hallId) throw new Error('Unauthenticated');
    return attendanceRepository.saveAttendanceSession(hallId, hallId, date, isSubmitted, records);
  };

  const softDeleteAttendanceSession = async (sessionId: string) => {
    if (!hallId) throw new Error('Unauthenticated');
    return attendanceRepository.softDeleteAttendanceSession(sessionId, hallId);
  };

  const createTask = async (title: string, priority: 'Low' | 'Medium' | 'High', dueDate: string) => {
    if (!hallId) throw new Error('Unauthenticated');
    return taskRepository.createTask(hallId, hallId, title, priority, dueDate);
  };

  const updateTask = async (taskId: string, fields: Partial<Task>) => {
    if (!hallId) throw new Error('Unauthenticated');
    return taskRepository.updateTask(taskId, hallId, fields);
  };

  const softDeleteTask = async (taskId: string) => {
    if (!hallId) throw new Error('Unauthenticated');
    return taskRepository.softDeleteTask(taskId, hallId);
  };

  const createExpense = async (category: string, amount: number, date: string, description: string, month: string) => {
    if (!hallId) throw new Error('Unauthenticated');
    return expenseRepository.createExpense(hallId, hallId, category, amount, date, description, month);
  };

  const createNotification = async (title: string, message: string, type: AppNotification['type']) => {
    if (!hallId) throw new Error('Unauthenticated');
    return notificationRepository.createNotification(hallId, hallId, title, message, type);
  };

  const markNotificationAsRead = async (notifId: string) => {
    if (!hallId) throw new Error('Unauthenticated');
    return notificationRepository.markNotificationAsRead(notifId, hallId);
  };

  return (
    <DataContext.Provider value={{
      rooms,
      seats,
      occupants,
      payments,
      attendanceSessions,
      tasks,
      expenses,
      notifications,
      loading,
      createRoom,
      updateRoom,
      softDeleteRoom,
      createSeat,
      batchCreateSeats,
      updateSeat,
      softDeleteSeat,
      createOccupant,
      updateOccupant,
      softDeleteOccupant,
      createPayment,
      updatePayment,
      softDeletePayment,
      saveAttendanceSession,
      softDeleteAttendanceSession,
      createTask,
      updateTask,
      softDeleteTask,
      createExpense,
      createNotification,
      markNotificationAsRead,
      triggerSeeding
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
export default DataContext;
