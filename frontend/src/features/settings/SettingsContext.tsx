import React, { createContext, useContext, useState, useEffect } from 'react';

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
}

const defaultSettings: AppSettings = {
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
  }
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: <K extends keyof AppSettings>(section: K, values: Partial<AppSettings[K]>) => void;
  resetToDefaults: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('manushri_studyhall_settings');
    if (saved) {
      try {
        // Deep merge saved settings with default settings to handle dynamic schema additions safely
        const parsed = JSON.parse(saved);
        return {
          hallDetails: { ...defaultSettings.hallDetails, ...parsed.hallDetails },
          ownerDetails: { ...defaultSettings.ownerDetails, ...parsed.ownerDetails },
          paymentSettings: { ...defaultSettings.paymentSettings, ...parsed.paymentSettings },
          attendanceSettings: { ...defaultSettings.attendanceSettings, ...parsed.attendanceSettings },
          roomDefaults: { ...defaultSettings.roomDefaults, ...parsed.roomDefaults }
        };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('manushri_studyhall_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = <K extends keyof AppSettings>(section: K, values: Partial<AppSettings[K]>) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...values
      }
    }));
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetToDefaults }}>
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
