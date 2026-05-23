import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { SectionHeader } from './SectionHeader';
import { EmptyState } from './EmptyState';

interface DefaulterPayment {
  id: string;
  occupantId: string;
  occupantName: string;
  seatNumber: string;
  amount: number;
  dueDate: string;
  phone: string;
}

interface DefaultersListProps {
  defaulters: DefaulterPayment[];
  onSendReminder: (payment: DefaulterPayment) => void;
  onNavigateToPayments: () => void;
}

export const DefaultersList: React.FC<DefaultersListProps> = ({
  defaulters,
  onSendReminder,
  onNavigateToPayments,
}) => {
  return (
    <section id="overdue-ledger" className="space-y-3">
      <SectionHeader 
        title="Defaulters & Collections" 
        subtitle="Business Risk Watchlist" 
        bulletColor="bg-rose-400"
        actionLabel="View All"
        onActionClick={onNavigateToPayments}
      />

      <div className="bg-[#FFFDFB] rounded-2xl border border-[#F4EFE6] shadow-[0_16px_40px_rgba(180,160,140,0.04),0_2px_8px_rgba(180,160,140,0.02)] overflow-hidden flex flex-col min-h-[120px] transition-all duration-200">
        <div className="divide-y divide-[#F4EFE6]/70 flex-1 flex flex-col justify-center">
          {defaulters.length > 0 ? (
            defaulters.slice(0, 3).map((payment) => (
              <div 
                key={payment.id} 
                onClick={onNavigateToPayments}
                className="p-4 flex items-center justify-between hover:bg-[#FAF8F5]/50 transition-all duration-150 active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Avatar name={payment.occupantName} size="sm" />
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-bold text-slate-800 truncate">{payment.occupantName}</p>
                    <p className="text-xs font-semibold text-slate-450 mt-1 truncate">
                      Seat {payment.seatNumber} • <span className="text-rose-600 font-bold">₹{payment.amount.toLocaleString()}</span> overdue
                    </p>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSendReminder(payment);
                  }}
                  className="p-2 bg-[#FFFDFB] hover:bg-amber-50 hover:text-amber-700 hover:border-amber-250 active:scale-[0.95] text-slate-500 rounded-xl border border-[#F4EFE6] transition-all cursor-pointer shrink-0 ml-3 shadow-[0_1px_3px_rgba(180,160,140,0.05)]"
                  title="Send WhatsApp Reminder"
                >
                  <MessageCircle size={15} strokeWidth={2} className="text-slate-450 hover:text-amber-600" />
                </button>
              </div>
            ))
          ) : (
            /* Permanent Reassurance Slot: Soft and concise empty-state message */
            <div className="p-6">
              <EmptyState message="All collections are up to date" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
