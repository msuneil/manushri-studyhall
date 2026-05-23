import type { 
  Room, 
  Seat, 
  Occupant, 
  Payment, 
  Task, 
  Expense, 
  AttendanceSession
} from '../types/models';
import { IndianRupee, Armchair, Clock, CheckCircle2 } from 'lucide-react';

export const dashboardService = {
  /**
   * Summarizes monthly financial aggregates based on active payments and monthly expenses.
   */
  calculateFinancialMetrics: (payments: Payment[], expenses: Expense[], activeMonth: string) => {
    const collectedRevenue = payments
      .filter(p => p.month === activeMonth && p.status === 'Paid')
      .reduce((sum, p) => sum + p.amount, 0);

    const pendingDues = payments
      .filter(p => p.month === activeMonth && (p.status === 'Pending' || p.status === 'Overdue'))
      .reduce((sum, p) => sum + p.amount, 0);

    const expectedIncome = collectedRevenue + pendingDues;

    const monthlyExpenses = expenses
      .filter(e => e.month === activeMonth)
      .reduce((sum, e) => sum + e.amount, 0);

    const estimatedProfit = expectedIncome - monthlyExpenses;

    return {
      expectedIncome,
      collectedRevenue,
      pendingDues,
      monthlyExpenses,
      estimatedProfit
    };
  },

  /**
   * Sums seat utilization counts and AC vs Non-AC metrics.
   */
  calculateOccupancyMetrics: (seats: Seat[], rooms: Room[]) => {
    const totalSeats = seats.length;
    const occupiedSeats = seats.filter(s => s.isOccupied).length;
    const availableSeats = Math.max(0, totalSeats - occupiedSeats);

    let acTotal = 0;
    let acOccupied = 0;
    let nonAcTotal = 0;
    let nonAcOccupied = 0;

    seats.forEach(s => {
      const room = rooms.find(r => r.id === s.roomId);
      const isAC = room ? (room.type.toLowerCase().includes('ac') && !room.type.toLowerCase().includes('non-ac')) : true;
      if (isAC) {
        acTotal++;
        if (s.isOccupied) acOccupied++;
      } else {
        nonAcTotal++;
        if (s.isOccupied) nonAcOccupied++;
      }
    });

    const acRate = acTotal > 0 ? Math.round((acOccupied / acTotal) * 100) : 0;
    const nonAcRate = nonAcTotal > 0 ? Math.round((nonAcOccupied / nonAcTotal) * 100) : 0;

    return {
      totalSeats,
      occupiedSeats,
      availableSeats,
      acRate,
      nonAcRate,
      acOccupied,
      acTotal,
      nonAcOccupied,
      nonAcTotal
    };
  },

  /**
   * Combines overdue payment records with occupant contact information for reminding dispatch.
   */
  enrichDefaultersList: (payments: Payment[], occupants: Occupant[], seats: Seat[]) => {
    return payments
      .filter(p => p.status === 'Overdue')
      .map(p => {
        const occupant = occupants.find(o => o.id === p.occupantId);
        const seat = seats.find(s => s.id === occupant?.seatId);
        return {
          ...p,
          occupantName: occupant?.name || 'Unknown',
          seatNumber: seat?.number || 'N/A',
          phone: occupant?.phone || '',
        };
      });
  },

  /**
   * Derives a priority queue up to 4 items in descending order of operational urgency.
   */
  derivePriorityQueue: (
    defaultersCount: number,
    pendingDues: number,
    seatsStats: { totalSeats: number; occupiedSeats: number; availableSeats: number },
    tasks: Task[],
    attendanceSessions: AttendanceSession[],
    occupants: Occupant[]
  ) => {
    const queue = [];

    // 1. Overdue payments (Payment Card)
    if (defaultersCount > 0) {
      queue.push({
        id: 'payments',
        type: 'payments',
        icon: IndianRupee,
        iconColor: 'text-rose-500',
        bgTheme: 'from-rose-50/20 to-white',
        borderColor: 'border-l-rose-400 border-rose-100/60',
        title: `${defaultersCount} overdue payment${defaultersCount > 1 ? 's require' : ' requires'} attention`,
        description: `Outstanding balance is ₹${pendingDues.toLocaleString()} across active seat cycles.`,
        actionLabel: "Review Payments",
        actionPath: "/payments"
      });
    }

    // 2. Seat occupancy review (Seats Card)
    const occupancyPercent = seatsStats.totalSeats > 0 ? Math.round((seatsStats.occupiedSeats / seatsStats.totalSeats) * 100) : 0;
    queue.push({
      id: 'seats',
      type: 'seats',
      icon: Armchair,
      iconColor: 'text-emerald-500',
      bgTheme: 'from-emerald-50/20 to-white',
      borderColor: 'border-l-emerald-400 border-emerald-100/60',
      title: "Seat occupancy review",
      description: `${occupancyPercent}% seat occupancy. ${seatsStats.availableSeats} seats available for new bookings.`,
      actionLabel: "View Seat Map",
      actionPath: "/seats"
    });

    // 3. Pending tasks (Tasks Card)
    const activeTasks = tasks.filter(t => !t.isCompleted);
    if (activeTasks.length > 0) {
      const highestTask = activeTasks.find(t => t.priority === 'High') || activeTasks[0];
      queue.push({
        id: 'tasks',
        type: 'tasks',
        icon: Clock,
        iconColor: 'text-indigo-500',
        bgTheme: 'from-indigo-50/20 to-white',
        borderColor: 'border-l-indigo-400 border-indigo-100/60',
        title: `${activeTasks.length} task${activeTasks.length > 1 ? 's' : ''} still pending today`,
        description: `Priority item: "${highestTask.title}"`,
        actionLabel: "Review Tasks",
        actionPath: "/tasks"
      });
    }

    // 4. Attendance incomplete (Attendance Card - LAST)
    const todayDateStr = new Date().toISOString().split('T')[0];
    const todaysSession = attendanceSessions.find(s => s.date === todayDateStr);
    const isAttendanceSubmitted = todaysSession ? todaysSession.isSubmitted : false;

    if (!isAttendanceSubmitted) {
      const markedCount = todaysSession ? Object.keys(todaysSession.records).length : 0;
      const unmarkedCount = Math.max(0, occupants.filter(o => o.status === 'Active').length - markedCount);
      
      queue.push({
        id: 'attendance',
        type: 'attendance',
        icon: CheckCircle2,
        iconColor: 'text-amber-500',
        bgTheme: 'from-amber-50/45 to-white',
        borderColor: 'border-l-amber-500 border-amber-100/60',
        title: "Daily attendance still pending",
        description: todaysSession 
          ? `Daily attendance is in draft. ${unmarkedCount} unmarked occupants remaining.`
          : `Daily attendance for today has not been started yet.`,
        actionLabel: "Complete Attendance",
        actionPath: "/attendance"
      });
    }

    return queue.slice(0, 4);
  }
};

export default dashboardService;
