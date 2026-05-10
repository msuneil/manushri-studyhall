export interface Room {
  id: string;
  name: string;
  type: 'AC Hall' | 'Non-AC Hall';
}

export interface Occupant {
  id: string;
  name: string;
  seatId: string;
  phone: string;
  email: string;
  joinDate: string;
  status: 'Active' | 'Inactive';
  attendanceRate: number;
  monthlyFee: number;
  emergencyContact?: string;
  planType?: 'Full Day' | 'Half Day' | 'Morning' | 'Evening';
  notes?: string;
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

export interface Payment {
  id: string;
  occupantId: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  month: string;
  dueDate: string;
  paidDate?: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  month: string;
}

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'Payment' | 'Maintenance' | 'System';
  isRead: boolean;
}

export const rooms: Room[] = [
  { id: 'room-1', name: 'AC Hall', type: 'AC Hall' },
  { id: 'room-2', name: 'Non-AC Hall', type: 'Non-AC Hall' },
];

export const generateSeats = (roomId: string, prefix: string, count: number): Seat[] => {
  return Array.from({ length: count }, (_, i) => {
    const seatNumber = `${prefix}-${String(i + 1).padStart(2, '0')}`;
    return {
      id: `seat-${roomId}-${i + 1}`,
      number: seatNumber,
      roomId,
      isOccupied: false,
      isOverdue: false,
      isReserved: false,
    };
  });
};

export const occupants: Occupant[] = [
  {
    id: 'occ-1',
    name: 'Rahul Sharma',
    seatId: 'seat-room-1-12',
    phone: '+91 98765 43210',
    email: 'rahul@email.com',
    joinDate: '2026-01-15',
    status: 'Active',
    attendanceRate: 92,
    monthlyFee: 2000,
    emergencyContact: '+91 98765 00001',
    planType: 'Full Day',
  },
  {
    id: 'occ-2',
    name: 'Priya Patel',
    seatId: 'seat-room-2-23',
    phone: '+91 98765 43211',
    email: 'priya@email.com',
    joinDate: '2026-02-01',
    status: 'Active',
    attendanceRate: 88,
    monthlyFee: 1500,
    emergencyContact: '+91 98765 00002',
    planType: 'Half Day',
  },
  {
    id: 'occ-3',
    name: 'Amit Kumar',
    seatId: 'seat-room-1-05',
    phone: '+91 98765 43212',
    email: 'amit@email.com',
    joinDate: '2026-01-20',
    status: 'Active',
    attendanceRate: 95,
    monthlyFee: 2000,
    emergencyContact: '+91 98765 00003',
    planType: 'Full Day',
  },
];

export const seats: Seat[] = [
  ...generateSeats('room-1', 'AC', 50).map(s => {
    if (s.number === 'AC-12') return { ...s, isOccupied: true, occupantId: 'occ-1' };
    if (s.number === 'AC-05') return { ...s, isOccupied: true, isOverdue: true, occupantId: 'occ-3' };
    return s;
  }),
  ...generateSeats('room-2', 'NAC', 50).map(s => {
    if (s.number === 'NAC-23') return { ...s, isOccupied: true, occupantId: 'occ-2' };
    return s;
  }),
];

export const payments: Payment[] = [
  { id: 'pay-1', occupantId: 'occ-1', amount: 2000, status: 'Paid', month: 'May 2026', dueDate: '2026-05-01', paidDate: '2026-05-01' },
  { id: 'pay-2', occupantId: 'occ-2', amount: 1500, status: 'Paid', month: 'May 2026', dueDate: '2026-05-02', paidDate: '2026-05-02' },
  { id: 'pay-3', occupantId: 'occ-3', amount: 2000, status: 'Overdue', month: 'May 2026', dueDate: '2026-05-05' },
  { id: 'pay-4', occupantId: 'occ-1', amount: 2000, status: 'Paid', month: 'April 2026', dueDate: '2026-04-01', paidDate: '2026-04-01' },
];

export const expenses: Expense[] = [
  { id: 'exp-1', category: 'Electricity', amount: 18500, date: '2026-05-05', description: 'Monthly electricity bill', month: 'May 2026' },
  { id: 'exp-2', category: 'Rent', amount: 20000, date: '2026-05-01', description: 'Building rent', month: 'May 2026' },
  { id: 'exp-3', category: 'Cleaning', amount: 6700, date: '2026-05-07', description: 'Cleaning service', month: 'May 2026' },
];

export const tasks: Task[] = [
  { id: 'task-1', title: 'Send fee reminders', isCompleted: true, dueDate: '2026-05-10', priority: 'High' },
  { id: 'task-2', title: 'Check AC maintenance', isCompleted: false, dueDate: '2026-05-12', priority: 'Medium' },
  { id: 'task-3', title: 'Update attendance records', isCompleted: true, dueDate: '2026-05-10', priority: 'High' },
  { id: 'task-4', title: 'Review pending payments', isCompleted: false, dueDate: '2026-05-11', priority: 'High' },
];

export const notifications: Notification[] = [
  { id: 'not-1', title: 'Payment Received', message: 'Rahul Sharma paid ₹2,000', timestamp: '2 hours ago', type: 'Payment', isRead: false },
  { id: 'not-2', title: 'Overdue Payment', message: 'Amit Kumar is 5 days overdue', timestamp: '1 day ago', type: 'Payment', isRead: true },
  { id: 'not-3', title: 'Maintenance Alert', message: 'AC servicing scheduled for tomorrow', timestamp: '3 hours ago', type: 'Maintenance', isRead: false },
];
