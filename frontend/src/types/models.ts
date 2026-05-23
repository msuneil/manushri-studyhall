// --- CENTRALIZED ENUMS & CONSTANTS ---

export const PaymentStatus = {
  PENDING: 'Pending',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  PARTIAL: 'Partial'
} as const;
export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export const AttendanceStatus = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  UNMARKED: 'Unmarked',
  LATE: 'Late'
} as const;
export type AttendanceStatus = typeof AttendanceStatus[keyof typeof AttendanceStatus];

export const SessionState = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  EDITED: 'Edited'
} as const;
export type SessionState = typeof SessionState[keyof typeof SessionState];

export const RoomType = {
  AC: 'AC Hall',
  NON_AC: 'Non-AC Hall'
} as const;
export type RoomType = typeof RoomType[keyof typeof RoomType];

export const UserRole = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  STAFF: 'Staff'
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const NotificationType = {
  PAYMENT: 'Payment',
  MAINTENANCE: 'Maintenance',
  SYSTEM: 'System'
} as const;
export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export const OccupantStatus = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive'
} as const;
export type OccupantStatus = typeof OccupantStatus[keyof typeof OccupantStatus];

// --- GLOBAL METADATA STANDARD ---

export interface BaseMetadata {
  createdAt: string; // ISO 8601 Timestamp
  updatedAt: string; // ISO 8601 Timestamp
  createdBy: string; // Operator/Admin User ID (uid)
  updatedBy: string; // Operator/Admin User ID (uid)
}

export interface SoftDeletable {
  isActive: boolean;    // Master toggle for queries (filter out deleted records)
  archivedAt: string | null; // Nullable ISO date for history retrieval
  deletedAt: string | null;  // Nullable ISO date for auditing purposes
}

// --- CORE MODELS & SCHEMAS ---

export interface Hall extends BaseMetadata {
  id: string; // Dynamic Firebase UID
  name: string;
  logo: string; // Base64 Canvas compressed string or Firebase Storage URL
  phone: string;
  email: string;
  address: string;
}

export interface SettingsDoc {
  hallId: string;
  hallDetails: {
    name: string;
    logo: string;
    phone: string;
    email: string;
    address: string;
  };
  ownerDetails: {
    name: string;
    role: string;
    phone: string;
    email: string;
  };
  paymentSettings: {
    defaultMonthlyFee: number;
    dueDateDay: number;
    gracePeriodDays: number;
    lateFeeAmount: number;
    reminderTemplate: string;
  };
  attendanceSettings: {
    openingTime: string;
    closingTime: string;
    attendanceGracePeriodMinutes: number;
    autoMarkAbsent: boolean;
  };
  roomDefaults: {
    defaultSeatCount: number;
    acEnabled: boolean;
    defaultAmenities: string;
    commonRules: string;
    autoOccupancy: boolean;
  };
}

export interface Room extends BaseMetadata, SoftDeletable {
  id: string;
  hallId: string;
  name: string;
  type: RoomType;
}

export interface Seat extends BaseMetadata, SoftDeletable {
  id: string;
  hallId: string;
  roomId: string;
  number: string;
  isOccupied: boolean;
  isOverdue: boolean;
  isReserved: boolean;
  occupantId?: string; // Links to Occupant
}

export interface Occupant extends BaseMetadata, SoftDeletable {
  id: string;
  hallId: string;
  name: string;
  seatId: string; // Links to Seat
  phone: string;
  email: string;
  joinDate: string;
  status: OccupantStatus;
  attendanceRate: number;
  monthlyFee: number;
  emergencyContact?: string;
  planType: 'Full Day' | 'Half Day' | 'Morning' | 'Evening';
  notes?: string;
}

export interface AttendanceRecord {
  occupantId: string;
  status: AttendanceStatus;
  markedAt: string;
  markedBy: string;
}

export interface AttendanceSession extends BaseMetadata, SoftDeletable {
  id: string; // Format: session-{hallId}-{date}
  hallId: string;
  date: string; // Format: YYYY-MM-DD
  isSubmitted: boolean;
  records: {
    [occupantId: string]: AttendanceRecord;
  };
  unlockedAt?: string;
  unlockedBy?: string;
  presentCount?: number;
  absentCount?: number;
  unmarkedCount?: number;
}

export interface Payment extends BaseMetadata, SoftDeletable {
  id: string;
  hallId: string;
  occupantId: string; // Links to Occupant
  amount: number;
  status: PaymentStatus;
  month: string; // Format: "May 2026"
  dueDate: string; // Format: YYYY-MM-DD
  paidDate?: string; // Format: YYYY-MM-DD
  notes?: string;
}

export interface Task extends BaseMetadata, SoftDeletable {
  id: string;
  hallId: string;
  title: string;
  isCompleted: boolean;
  dueDate: string; // Format: YYYY-MM-DD
  priority: 'Low' | 'Medium' | 'High';
}

export interface Expense extends BaseMetadata {
  id: string;
  hallId: string;
  category: string;
  amount: number;
  date: string; // Format: YYYY-MM-DD
  description: string;
  month: string; // Format: "May 2026"
}

export interface AppNotification extends BaseMetadata {
  id: string;
  hallId: string;
  title: string;
  message: string;
  timestamp: string; // Format: ISO Date String
  type: NotificationType;
  isRead: boolean;
}
