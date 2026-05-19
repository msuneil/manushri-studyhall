import type { LucideIcon } from 'lucide-react';
import { MessageCircle, Calendar, IndianRupee } from 'lucide-react';
import { Avatar } from './common/Avatar';

interface BaseCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  avatarNode?: React.ReactNode;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'error' | 'neutral';
  };
  actions?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

export function OperationalCard({ title, subtitle, icon: Icon, avatarNode, badge, actions, children, onClick }: BaseCardProps) {
  const badgeStyles = {
    success: 'bg-green-100 text-green-700 border border-green-200',
    warning: 'bg-amber-100 text-amber-700 border border-amber-200',
    error: 'bg-red-100 text-red-700 border border-red-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer active:scale-[0.99] hover:border-indigo-100' : ''}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Icon size={20} />
            </div>
          )}
          {avatarNode}
          <div>
            <h4 className="font-bold text-slate-900 leading-tight">{title}</h4>
            {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {badge && (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeStyles[badge.variant]}`}>
            {badge.text}
          </span>
        )}
      </div>

      <div className="mb-4">
        {children}
      </div>

      {actions && (
        <div className="flex gap-2 pt-3 border-t border-slate-50">
          {actions}
        </div>
      )}
    </div>
  );
}

// Specialized Card for Members
export function MemberCard({ name, seat, attendance, status, onCall, onViewProfile, onClick }: any) {
  const getBadgeVariant = (s: string) => {
    switch (s) {
      case 'Active': return 'success';
      case 'Blocked': return 'error';
      case 'Left': return 'neutral';
      case 'Inactive':
      default:
        return 'warning';
    }
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return { text: 'text-emerald-600', bar: 'bg-emerald-600' };
    if (rate >= 80) return { text: 'text-amber-500', bar: 'bg-amber-500' };
    return { text: 'text-red-600', bar: 'bg-red-600' };
  };

  const attStyle = getAttendanceColor(attendance);

  return (
    <OperationalCard
      title={name}
      subtitle={`Seat: ${seat}`}
      avatarNode={<Avatar name={name} size="sm" />}
      badge={{ text: status, variant: getBadgeVariant(status) }}
      onClick={onClick}
      actions={
        <>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (onCall) onCall(e);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            <MessageCircle size={14} /> WhatsApp
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (onViewProfile) onViewProfile(e);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            View
          </button>
        </>
      }
    >
      <div className="flex items-center justify-between text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1">
          <Calendar size={14} /> Attendance
        </div>
        <span className={`font-black ${attStyle.text}`}>{attendance}%</span>
      </div>
      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
        <div 
          className={`h-full rounded-full ${attStyle.bar}`} 
          style={{ width: `${attendance}%` }}
        />
      </div>
    </OperationalCard>
  );
}

// Specialized Card for Payments
export function PaymentCard({ name, seat, amount, month, status, onRemind }: any) {
  const getVariant = () => {
    if (status === 'Paid') return 'success';
    if (status === 'Pending') return 'warning';
    return 'error';
  };

  return (
    <OperationalCard
      title={name}
      subtitle={seat}
      badge={{ text: status, variant: getVariant() }}
      actions={
        <>
          <button className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold">Details</button>
          {status !== 'Paid' && (
            <button 
              onClick={onRemind}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              <MessageCircle size={14} /> Remind
            </button>
          )}
        </>
      }
    >
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500 font-medium">{month}</div>
        <div className="text-lg font-black text-slate-900 flex items-center gap-0.5">
          <IndianRupee size={16} />{amount.toLocaleString()}
        </div>
      </div>
    </OperationalCard>
  );
}
