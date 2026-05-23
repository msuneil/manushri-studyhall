import type { Seat, Occupant, ActivityEvent } from '../types';

export const mockOccupants: Occupant[] = [
  {
    id: 'occ_1',
    name: 'Rahul Sharma',
    phone: '+91 98765 43210',
    email: 'rahul@email.com',
    joinDate: '2026-01-15',
    status: 'Active',
    seatId: 'seat_room_1_12',
    attendanceRate: 92,
    monthlyFee: 2000,
    emergencyContact: '+91 98765 00001',
    planType: 'Full Day',
    notes: 'Frequently absent on weekends. Requested a corner seat.',
    aadhaarPlaceholder: 'XXXX-XXXX-1234',
    profileImage: '',
    paymentStatus: 'Paid',
    lastPaymentDate: '2026-05-01',
    lastAttendanceDate: '2026-05-17',
    attendanceTrend: 'Stable'
  },
  {
    id: 'occ_2',
    name: 'Priya Patel',
    phone: '+91 98765 43211',
    email: 'priya@email.com',
    joinDate: '2026-02-01',
    status: 'Active',
    seatId: 'seat_room_2_23',
    attendanceRate: 88,
    monthlyFee: 1200,
    emergencyContact: '+91 98765 00002',
    planType: 'Half Day',
    notes: 'Prepares for UPSC exams.',
    aadhaarPlaceholder: 'XXXX-XXXX-5678',
    profileImage: '',
    paymentStatus: 'Paid',
    lastPaymentDate: '2026-05-02',
    lastAttendanceDate: '2026-05-16',
    attendanceTrend: 'Improving'
  },
  {
    id: 'occ_3',
    name: 'Amit Kumar',
    phone: '+91 98765 43212',
    email: 'amit@email.com',
    joinDate: '2026-01-20',
    status: 'Active',
    seatId: 'seat_room_1_5',
    attendanceRate: 95,
    monthlyFee: 2000,
    emergencyContact: '+91 98765 00003',
    planType: 'Full Day',
    notes: 'Very punctual. Quiet and keeps space clean.',
    aadhaarPlaceholder: 'XXXX-XXXX-9012',
    profileImage: '',
    paymentStatus: 'Overdue',
    lastPaymentDate: '2026-04-05',
    overdueDays: 12,
    lastAttendanceDate: '2026-05-17',
    attendanceTrend: 'Declining'
  }
];

export const mockSeats: Seat[] = [];

// Helper to generate seats
const generateSeats = (roomId: string, prefix: string, count: number): Seat[] => {
  return Array.from({ length: count }, (_, i) => {
    const seatNumber = `${prefix}-${String(i + 1).padStart(2, '0')}`;
    return {
      id: `seat_${roomId}_${i + 1}`,
      number: seatNumber,
      roomId,
      isOccupied: false,
      isOverdue: false,
      isReserved: false
    };
  });
};

// Generate seats for Room 1 (Hall A - AC - 50 Seats)
const r1Seats = generateSeats('room_1', 'AC', 50);
r1Seats[11] = { ...r1Seats[11], isOccupied: true, occupantId: 'occ_1' }; // AC-12
r1Seats[4] = { ...r1Seats[4], isOccupied: true, isOverdue: true, occupantId: 'occ_3' }; // AC-05
mockSeats.push(...r1Seats);

// Generate seats for Room 2 (Hall B - NAC - 30 Seats)
const r2Seats = generateSeats('room_2', 'NAC', 30);
r2Seats[22] = { ...r2Seats[22], isOccupied: true, occupantId: 'occ_2' }; // NAC-23
mockSeats.push(...r2Seats);

// Generate seats for Room 3 (Hall C - PRM - 20 Seats)
const r3Seats = generateSeats('room_3', 'PRM', 20);
mockSeats.push(...r3Seats);

export const mockActivityTimeline: Record<string, ActivityEvent[]> = {
  'occ_1': [
    { id: 'ev_1', title: 'Fee payment of ₹2,000 received', timestamp: '2026-05-01 10:30 AM', type: 'Payment', details: 'Collected via UPI. Transaction ID: UPI98234891' },
    { id: 'ev_2', title: 'Attendance marked: PRESENT', timestamp: '2026-05-17 08:15 AM', type: 'Attendance', details: 'Check-in: 08:15 AM' },
    { id: 'ev_3', title: 'WhatsApp fee reminder sent', timestamp: '2026-04-28 09:00 AM', type: 'Reminder', details: 'Message status: Read' }
  ],
  'occ_2': [
    { id: 'ev_4', title: 'Fee payment of ₹1,200 received', timestamp: '2026-05-02 11:00 AM', type: 'Payment', details: 'Collected in Cash.' },
    { id: 'ev_5', title: 'Attendance marked: PRESENT', timestamp: '2026-05-16 09:00 AM', type: 'Attendance', details: 'Check-in: 09:00 AM' }
  ],
  'occ_3': [
    { id: 'ev_6', title: 'Attendance marked: PRESENT', timestamp: '2026-05-17 08:30 AM', type: 'Attendance', details: 'Check-in: 08:30 AM' },
    { id: 'ev_7', title: 'WhatsApp payment warning sent', timestamp: '2026-05-10 09:30 AM', type: 'Reminder', details: 'Warning for 5 days overdue sent to registered WhatsApp.' }
  ]
};
