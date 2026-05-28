import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from '../features/auth/AuthContext';
import { useToast } from '../components/Toast';
import { useSettings } from '../features/settings/SettingsContext';

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
  const { settings, loaded: settingsLoaded, updateSettings } = useSettings();
  
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

  const subscribedHallIdRef = useRef<string | null>(null);
  const unsubscribesRef = useRef<(() => void)[]>([]);
  const hasTriggeredOnboardingRef = useRef<boolean>(false);

  // Synchronize realtime collection snapshots in single-instance connections
  useEffect(() => {
    // 1. Explicit cleanup during auth logout, hallId change, or session invalidation
    if (!hallId) {
      if (unsubscribesRef.current.length > 0) {
        console.log(`[DataContext] Cleaning up ${unsubscribesRef.current.length} active Firestore listeners (auth/session transition)`);
        unsubscribesRef.current.forEach((unsub) => {
          try {
            unsub();
          } catch (e) {
            console.error('Error executing unsubscribe handler:', e);
          }
        });
        unsubscribesRef.current = [];
      }
      subscribedHallIdRef.current = null;
      hasTriggeredOnboardingRef.current = false; // Reset session onboarding lock

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

    // 2. Prevent duplicate/parallel subscription attachments
    if (subscribedHallIdRef.current === hallId) {
      console.log('[DataContext] Subscription already established for hall:', hallId, '- ignoring redundant call.');
      return;
    }

    // Ensure any previously lingering listeners are terminated first
    if (unsubscribesRef.current.length > 0) {
      console.log(`[DataContext] Terminating ${unsubscribesRef.current.length} lingering listeners before establishing new context`);
      unsubscribesRef.current.forEach((unsub) => {
        try {
          unsub();
        } catch (e) {
          console.error(e);
        }
      });
      unsubscribesRef.current = [];
    }

    subscribedHallIdRef.current = hallId;
    setLoading(true);

    // Failsafe timeout to prevent app from getting stuck on loading spinner if any subscriber fails
    const failsafeTimeout = setTimeout(() => {
      console.warn("DataContext subscription failsafe triggered: forcing loading to false after 2.5s.");
      setLoading(false);
    }, 2500);

    const loadedCollections = new Set<string>();
    const checkLoaded = (collectionName: string) => {
      loadedCollections.add(collectionName);
      if (loadedCollections.size >= 8) {
        setLoading(false);
        clearTimeout(failsafeTimeout);
      }
    };

    // Subscriptions setup
    const unsubRooms = roomRepository.subscribeRooms(hallId, (data) => {
      setRooms(data);
      checkLoaded('rooms');
    });

    const unsubSeats = seatRepository.subscribeSeats(hallId, (data) => {
      setSeats(data);
      checkLoaded('seats');
    });

    const unsubOccupants = occupantRepository.subscribeOccupants(hallId, (data) => {
      setOccupants(data);
      checkLoaded('occupants');
    });

    const unsubPayments = paymentRepository.subscribePayments(hallId, (data) => {
      setPayments(data);
      checkLoaded('payments');
    });

    const unsubAttendance = attendanceRepository.subscribeAttendanceSessions(hallId, (data) => {
      setAttendanceSessions(data);
      checkLoaded('attendance');
    });

    const unsubTasks = taskRepository.subscribeTasks(hallId, (data) => {
      setTasks(data);
      checkLoaded('tasks');
    });

    const unsubExpenses = expenseRepository.subscribeExpenses(hallId, (data) => {
      setExpenses(data);
      checkLoaded('expenses');
    });

    const unsubNotifications = notificationRepository.subscribeNotifications(hallId, (data) => {
      setNotifications(data);
      checkLoaded('notifications');
    });

    unsubscribesRef.current = [
      unsubRooms,
      unsubSeats,
      unsubOccupants,
      unsubPayments,
      unsubAttendance,
      unsubTasks,
      unsubExpenses,
      unsubNotifications
    ];

    // 3. Provider unmount cleanup
    return () => {
      console.log('[DataContext] Provider unmounted: cleaning up active Firestore listeners');
      clearTimeout(failsafeTimeout);
      unsubscribesRef.current.forEach((unsub) => {
        try {
          unsub();
        } catch (e) {
          console.error(e);
        }
      });
      unsubscribesRef.current = [];
      subscribedHallIdRef.current = null;
    };
  }, [hallId]);

  // Automated onboarding seeding check
  useEffect(() => {
    if (!settingsLoaded || settings?.initialized === true || settings?.isInitializing === true || hasTriggeredOnboardingRef.current) {
      return;
    }

    const isActuallyEmpty = rooms.length === 0 && seats.length === 0 && occupants.length === 0;
    const isAlreadyOnboarded = settings?.isOnboarded === true || hasTriggeredOnboardingRef.current;

    if (settingsLoaded && !loading && hallId && isActuallyEmpty && !isAlreadyOnboarded && !isSeeding) {
      hasTriggeredOnboardingRef.current = true; // Set lock instantly
      const executeSeeding = async () => {
        setIsSeeding(true);
        setLoading(true);
        try {
          // Set concurrency lock
          await updateSettings('isInitializing', true);
          
          if (!settings?.initialized) {
            showToast('Initializing study hall with default templates...', 'info');
          }
          
          await seedDemoData(hallId, user?.email || '');
          
          // Mark successful completion atomically/sequentially
          await updateSettings('isOnboarded', true);
          await updateSettings('initialized', true);
          await updateSettings('seedVersion', 1);
          await updateSettings('initializedAt', new Date().toISOString());
          await updateSettings('isInitializing', false);
          
          showToast('Study Hall successfully initialized with live demo metrics!', 'success');
        } catch (error) {
          console.error('Seeding error:', error);
          // Safely release concurrency lock on failure
          hasTriggeredOnboardingRef.current = false; // Reset lock on error
          await updateSettings('isInitializing', false);
          showToast('Failed to seed onboarding demo data.', 'error');
        } finally {
          setLoading(false);
          setIsSeeding(false);
        }
      };
      executeSeeding();
    }
  }, [loading, settingsLoaded, rooms.length, seats.length, occupants.length, hallId, settings?.isOnboarded, settings?.initialized, settings?.isInitializing, isSeeding, updateSettings]);

  const triggerSeeding = async () => {
    if (!hallId || isSeeding || settings?.isInitializing) return;
    setIsSeeding(true);
    setLoading(true);
    try {
      await updateSettings('isInitializing', true);
      await seedDemoData(hallId, user?.email || '');
      await updateSettings('isOnboarded', true);
      await updateSettings('initialized', true);
      await updateSettings('seedVersion', 1);
      await updateSettings('initializedAt', new Date().toISOString());
      await updateSettings('isInitializing', false);
      showToast('Demo data seeded successfully!', 'success');
    } catch (e) {
      console.error(e);
      await updateSettings('isInitializing', false);
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
