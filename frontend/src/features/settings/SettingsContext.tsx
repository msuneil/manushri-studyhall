import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase/firestore';
import { useAuth } from '../auth/AuthContext';
import { useToast } from '../../components/Toast';

export interface HallDetails {
  name: string;
  logo: string;
  phone: string;
  email: string;
  address: string;
}

export interface OwnerDetails {
  name: string;
  role: string;
  phone: string;
  email: string;
}

export interface PaymentSettings {
  defaultMonthlyFee: number;
  dueDateDay: number;
  gracePeriodDays: number;
  lateFeeAmount: number;
  reminderTemplate: string;
}

export interface AttendanceSettings {
  openingTime: string;
  closingTime: string;
  attendanceGracePeriodMinutes: number;
  autoMarkAbsent: boolean;
}

export interface RoomDefaultSettings {
  defaultSeatCount: number;
  acEnabled: boolean;
  defaultAmenities: string;
  commonRules: string;
  autoOccupancy: boolean;
}

export interface AppSettings {
  hallDetails: HallDetails;
  ownerDetails: OwnerDetails;
  paymentSettings: PaymentSettings;
  attendanceSettings: AttendanceSettings;
  roomDefaults: RoomDefaultSettings;
  isOnboarded?: boolean;
  initialized?: boolean;
  initializedAt?: string;
  seedVersion?: number;
  isInitializing?: boolean;
}

export const defaultSettings: AppSettings = {
  hallDetails: {
    name: 'Manushri Study Hall',
    logo: '',
    phone: '+91 98765 43210',
    email: 'contact@manushri.com',
    address: 'Main Road, Sector 4, Udaipur'
  },
  ownerDetails: {
    name: 'Suneil Patel',
    role: 'Founder & Administrator',
    phone: '+91 98765 00000',
    email: 'suneil@manushri.com'
  },
  paymentSettings: {
    defaultMonthlyFee: 2000,
    dueDateDay: 5,
    gracePeriodDays: 3,
    lateFeeAmount: 200,
    reminderTemplate: `*MANUSHRI STUDY HALL - FEE REMINDER* 🎓\n` +
      `-----------------------------------------\n` +
      `👤 *Occupant:* {name}\n` +
      `💺 *Seat Number:* {seatNumber}\n` +
      `📅 *Month:* {month}\n` +
      `💰 *Pending Amount:* ₹{amount}\n` +
      `🗓️ *Due Date:* {dueDate}\n` +
      `-----------------------------------------\n` +
      `Please settle your dues at the earliest. Thank you! 🙏`
  },
  attendanceSettings: {
    openingTime: '06:00',
    closingTime: '22:00',
    attendanceGracePeriodMinutes: 30,
    autoMarkAbsent: true
  },
  roomDefaults: {
    defaultSeatCount: 40,
    acEnabled: true,
    defaultAmenities: 'WiFi, Power Backup, RO Water',
    commonRules: "1. No noise in the hall.\n2. Maintain cleanliness.\n3. Mobile on silent mode.",
    autoOccupancy: true
  },
  isOnboarded: false,
  initialized: false,
  isInitializing: false,
  seedVersion: 0
};

interface SettingsContextType {
  settings: AppSettings;
  loaded: boolean;
  updateSettings: <K extends keyof AppSettings>(
    section: K,
    values: AppSettings[K] extends object ? Partial<AppSettings[K]> : AppSettings[K]
  ) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { hallId } = useAuth();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('manushri_studyhall_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          hallDetails: { ...defaultSettings.hallDetails, ...parsed.hallDetails },
          ownerDetails: { ...defaultSettings.ownerDetails, ...parsed.ownerDetails },
          paymentSettings: { ...defaultSettings.paymentSettings, ...parsed.paymentSettings },
          attendanceSettings: { ...defaultSettings.attendanceSettings, ...parsed.attendanceSettings },
          roomDefaults: { ...defaultSettings.roomDefaults, ...parsed.roomDefaults },
          isOnboarded: parsed.isOnboarded ?? false,
          initialized: parsed.initialized ?? false,
          isInitializing: parsed.isInitializing ?? false,
          initializedAt: parsed.initializedAt,
          seedVersion: parsed.seedVersion ?? 0
        };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  const [loaded, setLoaded] = useState(false);

  const subscribedHallIdRef = useRef<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Listen to live database changes in settings scoped by hallId
  useEffect(() => {
    // 1. Full cleanup under auth logout / hallId change / session invalidation
    if (!hallId) {
      if (unsubscribeRef.current) {
        console.log('[SettingsProvider] Cleaning up settings subscription (auth/session teardown)');
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      subscribedHallIdRef.current = null;
      setSettings(defaultSettings);
      setLoaded(false);
      return;
    }

    // 2. Prevent duplicate/redundant subscriptions
    if (subscribedHallIdRef.current === hallId) {
      return;
    }

    // Clean up any stale subscription before registering new one
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    subscribedHallIdRef.current = hallId;

    const docRef = doc(db, 'settings', hallId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      setLoaded(true);
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<AppSettings>;
        setSettings({
          hallDetails: { ...defaultSettings.hallDetails, ...data.hallDetails },
          ownerDetails: { ...defaultSettings.ownerDetails, ...data.ownerDetails },
          paymentSettings: { ...defaultSettings.paymentSettings, ...data.paymentSettings },
          attendanceSettings: { ...defaultSettings.attendanceSettings, ...data.attendanceSettings },
          roomDefaults: { ...defaultSettings.roomDefaults, ...data.roomDefaults },
          isOnboarded: data.isOnboarded ?? false,
          initialized: data.initialized ?? false,
          isInitializing: data.isInitializing ?? false,
          initializedAt: data.initializedAt,
          seedVersion: data.seedVersion ?? 0
        });
      } else {
        // Fallback to defaultSettings locally, DO NOT mutate or automatically create settings document in Firestore.
        setSettings(defaultSettings);
      }
    }, (error) => {
      console.error('Settings listening error:', error);
    });

    unsubscribeRef.current = unsubscribe;

    // 3. Provider unmount cleanup
    return () => {
      if (unsubscribeRef.current) {
        console.log('[SettingsProvider] Provider unmounted: cleaning up active listeners');
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      subscribedHallIdRef.current = null;
    };
  }, [hallId]);

  // Sync to localStorage as backup
  useEffect(() => {
    localStorage.setItem('manushri_studyhall_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = async <K extends keyof AppSettings>(
    section: K,
    values: AppSettings[K] extends object ? Partial<AppSettings[K]> : AppSettings[K]
  ) => {
    // 1. Optimistic UI update locally
    setSettings(prev => {
      const isObj = prev[section] !== null && typeof prev[section] === 'object';
      return {
        ...prev,
        [section]: isObj 
          ? { ...(prev[section] as object), ...(values as object) } 
          : values
      };
    });

    // 2. Persist to Firestore if user is authenticated
    if (hallId) {
      try {
        const docRef = doc(db, 'settings', hallId);
        const isObj = settings[section] !== null && typeof settings[section] === 'object';
        await updateDoc(docRef, {
          [`${section}`]: isObj
            ? { ...(settings[section] as object), ...(values as object) }
            : values
        });
      } catch (error) {
        console.error('Firestore settings update error:', error);
        showToast('Error syncing settings online.', 'error');
      }
    }
  };

  const resetToDefaults = async () => {
    setSettings(defaultSettings);
    if (hallId) {
      try {
        const docRef = doc(db, 'settings', hallId);
        await setDoc(docRef, { ...defaultSettings, hallId });
        showToast('Settings reset to defaults successfully.', 'success');
      } catch (error) {
        console.error('Settings reset error:', error);
        showToast('Error resetting settings online.', 'error');
      }
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loaded, updateSettings, resetToDefaults }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
