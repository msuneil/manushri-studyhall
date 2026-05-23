import type { AttendanceSession, Occupant } from '../types/models';
import { attendanceRepository } from '../repositories/attendanceRepository';

/**
 * Validates that the selected date is not in the future.
 */
export const validateAttendanceSession = (date: string): void => {
  const today = new Date().toISOString().split('T')[0];
  if (date > today) {
    throw new Error('Cannot create or manage attendance sessions for future dates.');
  }
};

/**
 * Validates that edits are not being made to a submitted/locked session.
 */
export const validateSessionEdit = (session: AttendanceSession | null | undefined): void => {
  if (session?.isSubmitted) {
    throw new Error('This attendance session is submitted and locked. Edits are disabled.');
  }
};

/**
 * Calculates statistical metrics based strictly on active occupants with valid seat assignments.
 */
export const calculateAttendanceSummary = (
  records: AttendanceSession['records'],
  activeOccupants: Occupant[]
) => {
  const eligibleOccupants = (activeOccupants ?? []).filter(
    occ => occ.isActive && occ.status === 'Active' && occ.seatId && occ.seatId !== 'N/A'
  );

  const total = eligibleOccupants.length;
  let presentCount = 0;
  let absentCount = 0;

  eligibleOccupants.forEach(occ => {
    const record = records[occ.id];
    if (record?.status === 'Present') presentCount++;
    else if (record?.status === 'Absent') absentCount++;
  });

  const unmarkedCount = Math.max(0, total - (presentCount + absentCount));

  return {
    presentCount,
    absentCount,
    unmarkedCount,
    total
  };
};

/**
 * Safe Daily Session Initialization Guard.
 * Reuses existing session if present, or creates a new one only if missing.
 */
export const ensureTodayAttendanceSession = async (
  hallId: string,
  operatorId: string,
  date: string,
  activeOccupants: Occupant[]
): Promise<AttendanceSession> => {
  // 1. Prevent future-date attendance
  validateAttendanceSession(date);

  // 2. Fetch existing session
  const existing = await attendanceRepository.getAttendanceByDate(hallId, date);
  if (existing) {
    return existing;
  }

  // 3. Create a fresh draft session
  const eligibleOccupants = (activeOccupants ?? []).filter(
    occ => occ.isActive && occ.status === 'Active' && occ.seatId && occ.seatId !== 'N/A'
  );

  const records: AttendanceSession['records'] = {};
  const summary = calculateAttendanceSummary(records, eligibleOccupants);

  const sessionId = await attendanceRepository.createAttendanceSession(
    hallId,
    date,
    operatorId,
    records,
    summary
  );

  return {
    id: sessionId,
    hallId,
    date,
    isSubmitted: false,
    records,
    presentCount: summary.presentCount,
    absentCount: summary.absentCount,
    unmarkedCount: summary.unmarkedCount,
    isActive: true,
    archivedAt: null,
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: operatorId,
    updatedBy: operatorId
  };
};

/**
 * Bulk attendance marking helper that batch updates a list of occupant IDs.
 */
export const bulkMarkAttendance = (
  currentRecords: AttendanceSession['records'],
  occupantIds: string[],
  status: 'Present' | 'Absent' | 'Unmarked',
  operatorId: string
): AttendanceSession['records'] => {
  const updatedRecords = { ...currentRecords };

  occupantIds.forEach(id => {
    if (status === 'Unmarked') {
      delete updatedRecords[id];
    } else {
      updatedRecords[id] = {
        occupantId: id,
        status,
        markedAt: new Date().toISOString(),
        markedBy: operatorId
      };
    }
  });

  return updatedRecords;
};

export const attendanceService = {
  validateAttendanceSession,
  validateSessionEdit,
  calculateAttendanceSummary,
  ensureTodayAttendanceSession,
  bulkMarkAttendance
};

export default attendanceService;
