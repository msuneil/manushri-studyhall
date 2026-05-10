import { Header } from '../components/Header';
import { 
  CreditCard, 
  Info,
  Check,
  MoreHorizontal,
  Wrench,
  Inbox
} from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { notifications } from '../data/mockData';

export default function Notifications() {
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'Payment': return { bg: 'bg-green-100', text: 'text-green-600', icon: CreditCard };
      case 'Maintenance': return { bg: 'bg-amber-100', text: 'text-amber-600', icon: Wrench };
      default: return { bg: 'bg-indigo-100', text: 'text-indigo-600', icon: Info };
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Notifications" subtitle="Recent Alerts" showBack />

      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-4">
        {notifications.map((notif) => {
          const styles = getTypeStyles(notif.type);
          return (
            <div 
              key={notif.id} 
              className={`
                bg-white rounded-2xl border p-4 shadow-sm flex items-start gap-4 transition-all
                ${notif.isRead ? 'border-slate-100 opacity-75' : 'border-indigo-100 bg-indigo-50/10 ring-1 ring-indigo-50'}
              `}
            >
              <div className={`p-3 rounded-xl shrink-0 ${styles.bg} ${styles.text}`}>
                <styles.icon size={20} />
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className={`text-sm font-bold ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                    {notif.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {notif.message}
                </p>
                {!notif.isRead && (
                  <div className="mt-3 flex gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-md shadow-indigo-500/20">
                      <Check size={12} strokeWidth={3} /> Mark Read
                    </button>
                    <button className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      Dismiss
                    </button>
                  </div>
                )}
              </div>

              <button className="p-1 text-slate-300 hover:text-slate-500">
                <MoreHorizontal size={18} />
              </button>
            </div>
          );
        })}

        {notifications.length === 0 && (
          <EmptyState 
            icon={Inbox}
            title="No new notifications"
            description="We'll notify you here when there are new payments, maintenance, or system alerts."
          />
        )}
      </div>
    </div>
  );
}
