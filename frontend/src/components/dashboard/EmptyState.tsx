import React from 'react';
import { Check } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  icon?: React.ComponentType<any>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, icon: Icon = Check }) => {
  return (
    <div className="bg-[#FAF8F5] border border-[#EDE8DF] rounded-xl p-5 text-center flex flex-col items-center justify-center space-y-2 animate-in fade-in duration-300">
      <div className="p-1.5 bg-[#FFFDFB] border border-[#F4EFE6] text-amber-600/80 rounded-lg shadow-[0_1px_3px_rgba(180,160,140,0.03)] shrink-0">
        <Icon size={14} strokeWidth={2.5} />
      </div>
      <p className="text-xs font-bold text-slate-500 leading-snug">{message}</p>
    </div>
  );
};
