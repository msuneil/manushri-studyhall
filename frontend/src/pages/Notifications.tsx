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
import { useData } from '../contexts/DataContext';
import { useToast } from '../components/Toast';
import { Avatar } from '../components/common/Avatar';

export default function Notifications() {
  const { notifications, occupants, loading, markNotificationAsRead } = useData();
  const { showToast } = useToast();

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'Payment': 
        return { bg: 'bg-emerald-50 text-emerald-600 border border-emerald-100', icon: CreditCard };
      case 'Maintenance': 
        return { bg: 'bg-amber-50 text-amber-600 border border-amber-100', icon: Wrench };
      default: 
        return { bg: 'bg-stone-50 text-stone-600 border border-stone-100', icon: Info };
    }
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      
      // If time is in the future or within a minute
      if (diffMs < 60000) return 'Just now';
      
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    } catch (e) {
      return '';
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      showToast('Notification marked as read', 'success');
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      showToast('Failed to update notification status.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-full">
        <Header title="Notifications" subtitle="Recent Alerts" showBack />
        <div className="flex-1 flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-amber-600/20 border-t-amber-600 rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-amber-800/60 uppercase tracking-widest animate-pulse">Syncing alerts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-[#FAF8F5]">
      <Header title="Notifications" subtitle="Recent Alerts" showBack />

      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-4">
        {notifications.map((notif) => {
          const styles = getTypeStyles(notif.type);
          const matchedOccupant = occupants.find(o => 
            notif.message.toLowerCase().includes(o.name.toLowerCase())
          );
          
          return (
            <div 
              key={notif.id} 
              className={`
                bg-white rounded-2xl border p-4 shadow-sm flex items-start gap-4 transition-all duration-300
                ${notif.isRead 
                  ? 'border-stone-100 opacity-60 hover:opacity-100' 
                  : 'border-amber-200/80 bg-amber-50/10 ring-1 ring-amber-100/50 shadow-md shadow-amber-900/[0.02]'
                }
              `}
            >
              {matchedOccupant ? (
                <div className="shrink-0 pt-0.5">
                  <Avatar name={matchedOccupant.name} size="sm" />
                </div>
              ) : (
                <div className={`p-2.5 rounded-xl shrink-0 ${styles.bg}`}>
                  <styles.icon size={18} />
                </div>
              )}

              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className={`text-sm font-bold ${notif.isRead ? 'text-stone-600' : 'text-stone-900'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[10px] font-bold text-amber-800/50 whitespace-nowrap bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100/40">
                    {formatTime(notif.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed font-medium">
                  {notif.message}
                </p>
                {!notif.isRead && (
                  <div className="mt-3 flex gap-2">
                    <button 
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C8A261] hover:bg-[#B69150] text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-md shadow-amber-900/10 transition-colors"
                    >
                      <Check size={12} strokeWidth={3} /> Mark Read
                    </button>
                    <button 
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>

              <button className="p-1 text-stone-300 hover:text-stone-500 transition-colors">
                <MoreHorizontal size={18} />
              </button>
            </div>
          );
        })}

        {notifications.length === 0 && (
          <EmptyState 
            icon={Inbox}
            title="All caught up"
            description="We'll notify you here when there are new payments, maintenance events, or system alerts."
          />
        )}
      </div>
    </div>
  );
}

