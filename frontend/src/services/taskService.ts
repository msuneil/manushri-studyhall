
export interface OperationalAlert {
  id: string;
  type: 'attendance' | 'payment' | 'task' | 'info';
  title: string;
  description: string;
  actionLabel?: string;
  actionPath?: string;
  isAggregate?: boolean;
  count?: number;
  paymentData?: any; // Preserved raw data for WhatsApp ping inside task/alerts
  priorityValue: number; // 1: attendance, 2: payment, 3: task, 4: info
}

/**
 * Priority-Based Alert Ordering.
 * 1: attendance pending, 2: overdue payments, 3: unresolved tasks, 4: informational reminders
 */
export const orderOperationalAlerts = (alerts: OperationalAlert[]): OperationalAlert[] => {
  return [...(alerts ?? [])].sort((a, b) => a.priorityValue - b.priorityValue);
};

/**
 * Operational Alert Deduplication.
 * Filters out duplicate alerts by their unique ID.
 */
export const dedupeOperationalAlerts = (alerts: OperationalAlert[]): OperationalAlert[] => {
  const seenIds = new Set<string>();
  return (alerts ?? []).filter(alert => {
    if (seenIds.has(alert.id)) return false;
    seenIds.add(alert.id);
    return true;
  });
};

/**
 * Prevent Operational Alert Flooding (Aggregation).
 * If the number of overdue payments exceeds the threshold (e.g. 3), aggregates them into a single card.
 * Otherwise, returns them as individual detailed alert rows.
 */
export const aggregateOverduePayments = (
  overduePayments: any[],
  threshold = 3
): OperationalAlert[] => {
  if (!overduePayments || overduePayments.length === 0) return [];

  if (overduePayments.length > threshold) {
    // Return a single aggregated card
    return [{
      id: 'payment-aggregate',
      type: 'payment',
      priorityValue: 2,
      isAggregate: true,
      count: overduePayments.length,
      title: `${overduePayments.length} overdue payments require attention`,
      description: 'Outstanding dues require direct recovery follow-up.',
      actionLabel: 'Review Ledger',
      actionPath: '/payments'
    }];
  }

  // Keep them detailed and individual
  return overduePayments.map(p => ({
    id: `payment-${p.id}`,
    type: 'payment',
    priorityValue: 2,
    isAggregate: false,
    title: `${p.occupantName}: fee of ₹${p.amount.toLocaleString()} is OVERDUE`,
    description: `Billing cycle for ${p.month} was due on ${p.dueDate}.`,
    actionLabel: 'WhatsApp Ping',
    actionPath: '/payments',
    paymentData: p
  }));
};

export const taskService = {
  orderOperationalAlerts,
  dedupeOperationalAlerts,
  aggregateOverduePayments
};

export default taskService;
