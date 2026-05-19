import type { RoomStatus } from '../../rooms/types';

export type SeatState = 
  | 'Vacant'
  | 'Occupied'
  | 'Overdue'
  | 'Maintenance'
  | 'Inactive'
  | 'Reserved';

export interface Occupant {
  id: string;
  name: string;
  phone: string;
  email: string;
  joinDate: string;
  status: 'Active' | 'Inactive';
  attendanceRate: number;
  monthlyFee: number;
  emergencyContact?: string;
  planType?: 'Full Day' | 'Half Day' | 'Morning' | 'Evening';
  notes?: string;
  aadhaarPlaceholder?: string;
  profileImage?: string;
  
  // Payment specifics for Seat details sheet
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  lastPaymentDate: string;
  overdueDays?: number;
  lastAttendanceDate: string;
  attendanceTrend: 'Stable' | 'Improving' | 'Declining';
}

export interface Seat {
  id: string;
  number: string;
  roomId: string;
  isOccupied: boolean;
  isOverdue: boolean;
  isReserved: boolean;
  occupantId?: string;
}

export interface ActivityEvent {
  id: string;
  title: string;
  timestamp: string;
  type: 'Payment' | 'Attendance' | 'Reminder' | 'System';
  details?: string;
}

export function getSeatState(seat: Seat, roomStatus: RoomStatus): SeatState {
  if (roomStatus === 'Maintenance') return 'Maintenance';
  if (roomStatus === 'Inactive') return 'Inactive';
  if (seat.isOverdue) return 'Overdue';
  if (seat.isOccupied) return 'Occupied';
  if (seat.isReserved) return 'Reserved';
  return 'Vacant';
}
