import React from 'react';
import { 
  CheckCircle2, 
  IndianRupee, 
  PlusCircle, 
  Armchair 
} from 'lucide-react';
import { SectionHeader } from './SectionHeader';

interface QuickActionsProps {
  onNavigate: (path: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
  const quickActions = [
    { label: 'Attendance', icon: CheckCircle2, color: 'text-indigo-600/80', path: '/attendance' },
    { label: 'Payments', icon: IndianRupee, color: 'text-emerald-600/80', path: '/payments' },
    { label: 'Occupants', icon: PlusCircle, color: 'text-slate-500/80', path: '/occupants' },
    { label: 'Seat Map', icon: Armchair, color: 'text-slate-600/80', path: '/seats' },
  ];

  return (
    <section className="space-y-3">
      <SectionHeader 
        title="Quick Utilities" 
        subtitle="Operational Shortcuts" 
      />
      
      {/* Mobile-peeking horizontal strip layout */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => onNavigate(action.path)}
            className="flex items-center justify-center gap-2 px-3 py-2.5 h-11 w-[115px] sm:w-auto sm:flex-1 bg-[#FFFDFB] hover:bg-[#FAF8F5] border border-[#F4EFE6] rounded-xl transition-all active:scale-[0.99] shrink-0 cursor-pointer shadow-[0_16px_40px_rgba(180,160,140,0.02),0_2px_8px_rgba(180,160,140,0.01)] hover:border-[#EAE2D2]"
          >
            <action.icon size={13} className={action.color} strokeWidth={2.2} />
            <span className="text-xs font-bold text-slate-600">{action.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
};
