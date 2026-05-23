import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { createMetadata, createSoftDelete } from '../../repositories/baseRepository';
import { OccupantStatus, PaymentStatus, RoomType } from '../../types/models';

/**
 * Seeds complete demo data scope under a newly created hall ID (uid) in a single transactional batch.
 * @param hallId The unique identifier of the study hall (operator uid)
 * @param email The registered administrator's email
 */
export const seedDemoData = async (hallId: string, _email: string) => {
  const batch = writeBatch(db);
  const now = new Date().toISOString();
  
  // --- 1. SEED ROOMS ---
  const room1Ref = doc(collection(db, 'rooms'));
  const room2Ref = doc(collection(db, 'rooms'));
  
  const room1Id = room1Ref.id;
  const room2Id = room2Ref.id;
  
  batch.set(room1Ref, {
    id: room1Id,
    hallId,
    name: 'Hall A (AC Premium)',
    type: RoomType.AC,
    ...createMetadata(hallId),
    ...createSoftDelete()
  });

  batch.set(room2Ref, {
    id: room2Id,
    hallId,
    name: 'Hall B (Non-AC)',
    type: RoomType.NON_AC,
    ...createMetadata(hallId),
    ...createSoftDelete()
  });

  // --- 2. SEED SEATS (Generates 30 AC seats and 30 Non-AC seats to keep size lightweight but premium) ---
  const seatMap: Record<string, string> = {}; // Mapping from seat number (e.g. "AC-12") to seat document ID
  
  // AC Seats (1 to 30)
  for (let i = 1; i <= 30; i++) {
    const seatRef = doc(collection(db, 'seats'));
    const seatNumber = `AC-${String(i).padStart(2, '0')}`;
    seatMap[seatNumber] = seatRef.id;
    
    batch.set(seatRef, {
      id: seatRef.id,
      hallId,
      roomId: room1Id,
      number: seatNumber,
      isOccupied: false,
      isOverdue: false,
      isReserved: false,
      ...createMetadata(hallId),
      ...createSoftDelete()
    });
  }

  // Non-AC Seats (1 to 30)
  for (let i = 1; i <= 30; i++) {
    const seatRef = doc(collection(db, 'seats'));
    const seatNumber = `NAC-${String(i).padStart(2, '0')}`;
    seatMap[seatNumber] = seatRef.id;
    
    batch.set(seatRef, {
      id: seatRef.id,
      hallId,
      roomId: room2Id,
      number: seatNumber,
      isOccupied: false,
      isOverdue: false,
      isReserved: false,
      ...createMetadata(hallId),
      ...createSoftDelete()
    });
  }

  // --- 3. SEED OCCUPANTS ---
  const occ1Ref = doc(collection(db, 'occupants'));
  const occ2Ref = doc(collection(db, 'occupants'));
  const occ3Ref = doc(collection(db, 'occupants'));
  
  const occ1Id = occ1Ref.id;
  const occ2Id = occ2Ref.id;
  const occ3Id = occ3Ref.id;

  const seat12Id = seatMap['AC-12'];
  const seat23Id = seatMap['NAC-23'];
  const seat05Id = seatMap['AC-05'];

  // Occupant 1: Rahul Sharma (AC-12)
  batch.set(occ1Ref, {
    id: occ1Id,
    hallId,
    name: 'Rahul Sharma',
    seatId: seat12Id,
    phone: '9876543210',
    email: 'rahul@email.com',
    joinDate: '2026-01-15',
    status: OccupantStatus.ACTIVE,
    attendanceRate: 92,
    monthlyFee: 2000,
    emergencyContact: '9876500001',
    planType: 'Full Day',
    notes: 'Preparing for Civil Services.',
    ...createMetadata(hallId),
    ...createSoftDelete()
  });

  // Occupant 2: Priya Patel (NAC-23)
  batch.set(occ2Ref, {
    id: occ2Id,
    hallId,
    name: 'Priya Patel',
    seatId: seat23Id,
    phone: '9876543211',
    email: 'priya@email.com',
    joinDate: '2026-02-01',
    status: OccupantStatus.ACTIVE,
    attendanceRate: 88,
    monthlyFee: 1500,
    emergencyContact: '9876500002',
    planType: 'Half Day',
    notes: 'Morning slot only.',
    ...createMetadata(hallId),
    ...createSoftDelete()
  });

  // Occupant 3: Amit Kumar (AC-05, Overdue candidate)
  batch.set(occ3Ref, {
    id: occ3Id,
    hallId,
    name: 'Amit Kumar',
    seatId: seat05Id,
    phone: '9876543212',
    email: 'amit@email.com',
    joinDate: '2026-01-20',
    status: OccupantStatus.ACTIVE,
    attendanceRate: 95,
    monthlyFee: 2000,
    emergencyContact: '9876500003',
    planType: 'Full Day',
    notes: 'Payment regular until this cycle.',
    ...createMetadata(hallId),
    ...createSoftDelete()
  });

  // --- Update linked Seats status ---
  if (seat12Id) {
    batch.update(doc(db, 'seats', seat12Id), {
      isOccupied: true,
      occupantId: occ1Id
    });
  }
  if (seat23Id) {
    batch.update(doc(db, 'seats', seat23Id), {
      isOccupied: true,
      occupantId: occ2Id
    });
  }
  if (seat05Id) {
    batch.update(doc(db, 'seats', seat05Id), {
      isOccupied: true,
      isOverdue: true,
      occupantId: occ3Id
    });
  }

  // --- 4. SEED PAYMENTS ---
  const pay1Ref = doc(collection(db, 'payments'));
  const pay2Ref = doc(collection(db, 'payments'));
  const pay3Ref = doc(collection(db, 'payments'));
  const pay4Ref = doc(collection(db, 'payments'));

  batch.set(pay1Ref, {
    id: pay1Ref.id,
    hallId,
    occupantId: occ1Id,
    amount: 2000,
    status: PaymentStatus.PAID,
    month: 'May 2026',
    dueDate: '2026-05-05',
    paidDate: '2026-05-04',
    notes: 'Paid via GPay.',
    ...createMetadata(hallId),
    ...createSoftDelete()
  });

  batch.set(pay2Ref, {
    id: pay2Ref.id,
    hallId,
    occupantId: occ2Id,
    amount: 1500,
    status: PaymentStatus.PAID,
    month: 'May 2026',
    dueDate: '2026-05-05',
    paidDate: '2026-05-05',
    notes: 'Cash receipt #1092',
    ...createMetadata(hallId),
    ...createSoftDelete()
  });

  batch.set(pay3Ref, {
    id: pay3Ref.id,
    hallId,
    occupantId: occ3Id,
    amount: 2000,
    status: PaymentStatus.OVERDUE,
    month: 'May 2026',
    dueDate: '2026-05-05',
    notes: 'Awaiting online transfer.',
    ...createMetadata(hallId),
    ...createSoftDelete()
  });

  batch.set(pay4Ref, {
    id: pay4Ref.id,
    hallId,
    occupantId: occ1Id,
    amount: 2000,
    status: PaymentStatus.PAID,
    month: 'April 2026',
    dueDate: '2026-04-05',
    paidDate: '2026-04-04',
    notes: 'Previous month cleared.',
    ...createMetadata(hallId),
    ...createSoftDelete()
  });

  // --- 5. SEED EXPENSES ---
  const exp1Ref = doc(collection(db, 'expenses'));
  const exp2Ref = doc(collection(db, 'expenses'));
  const exp3Ref = doc(collection(db, 'expenses'));

  batch.set(exp1Ref, {
    id: exp1Ref.id,
    hallId,
    category: 'Electricity',
    amount: 8500,
    date: '2026-05-08',
    description: 'Central AC units electricity billing.',
    month: 'May 2026',
    ...createMetadata(hallId)
  });

  batch.set(exp2Ref, {
    id: exp2Ref.id,
    hallId,
    category: 'Rent',
    amount: 15000,
    date: '2026-05-01',
    description: 'Operational facility floor rent.',
    month: 'May 2026',
    ...createMetadata(hallId)
  });

  batch.set(exp3Ref, {
    id: exp3Ref.id,
    hallId,
    category: 'Cleaning',
    amount: 3000,
    date: '2026-05-06',
    description: 'Weekly sanitization materials and fees.',
    month: 'May 2026',
    ...createMetadata(hallId)
  });

  // --- 6. SEED TASKS ---
  const task1Ref = doc(collection(db, 'tasks'));
  const task2Ref = doc(collection(db, 'tasks'));
  const task3Ref = doc(collection(db, 'tasks'));

  batch.set(task1Ref, {
    id: task1Ref.id,
    hallId,
    title: 'Disburse May WhatsApp payment alerts',
    isCompleted: true,
    dueDate: '2026-05-05',
    priority: 'High',
    ...createMetadata(hallId),
    ...createSoftDelete()
  });

  batch.set(task2Ref, {
    id: task2Ref.id,
    hallId,
    title: 'Schedule quarterly RO filter replacement',
    isCompleted: false,
    dueDate: '2026-05-25',
    priority: 'Medium',
    ...createMetadata(hallId),
    ...createSoftDelete()
  });

  batch.set(task3Ref, {
    id: task3Ref.id,
    hallId,
    title: 'Update daily seat allocations grid',
    isCompleted: false,
    dueDate: '2026-05-23',
    priority: 'High',
    ...createMetadata(hallId),
    ...createSoftDelete()
  });

  // --- 7. SEED NOTIFICATIONS ---
  const not1Ref = doc(collection(db, 'notifications'));
  const not2Ref = doc(collection(db, 'notifications'));

  batch.set(not1Ref, {
    id: not1Ref.id,
    hallId,
    title: 'Clearing Recorded',
    message: 'Rahul Sharma settled dues for May 2026.',
    timestamp: now,
    type: 'Payment',
    isRead: false,
    ...createMetadata(hallId)
  });

  batch.set(not2Ref, {
    id: not2Ref.id,
    hallId,
    title: 'Payment Alert Overdue',
    message: 'Amit Kumar billing is 5 days overdue.',
    timestamp: now,
    type: 'Payment',
    isRead: false,
    ...createMetadata(hallId)
  });

  await batch.commit();
};
export default seedDemoData;
