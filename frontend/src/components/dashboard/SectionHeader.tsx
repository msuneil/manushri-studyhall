import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  bulletColor?: string; // Keep for backward-compat but do not render
  actionLabel?: string;
  onActionClick?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onActionClick,
}) => {
  return (
    <div className="flex items-center justify-between pb-1.5 border-b border-amber-100/30 px-0.5">
      <div>
        <h2 className="text-xs font-bold text-slate-550 uppercase tracking-widest leading-none">{title}</h2>
        {subtitle && (
          <p className="text-[10px] text-slate-400 font-medium tracking-normal mt-1.5">{subtitle}</p>
        )}
      </div>
      {actionLabel && onActionClick && (
        <button 
          onClick={onActionClick} 
          className="text-xs font-bold text-amber-700/80 hover:text-amber-850 transition-colors uppercase tracking-wide flex items-center gap-0.5 cursor-pointer"
        >
          <span>{actionLabel}</span>
          <ChevronRight size={13} strokeWidth={2.5} className="text-amber-600" />
        </button>
      )}
    </div>
  );
};

