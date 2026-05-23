import React from 'react';

interface MetricTileProps {
  label: string;
  value: string | number;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  progressBarPercent?: number;
  progressBarColor?: string;
  onClick?: () => void;
}

export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  subtitle,
  badge,
  badgeColor = 'bg-slate-50 text-slate-650 border-slate-200/50',
  progressBarPercent,
  progressBarColor = 'bg-amber-600',
  onClick,
}) => {
  const isClickable = !!onClick;
  
  return (
    <div 
      onClick={onClick}
      className={`bg-[#FFFDFB] p-5 rounded-2xl border border-[#F4EFE6] shadow-[0_16px_40px_rgba(180,160,140,0.04),0_2px_8px_rgba(180,160,140,0.02)] space-y-4 flex flex-col justify-between transition-all duration-200 ${
        isClickable 
          ? 'active:scale-[0.99] cursor-pointer hover:border-[#EAE2D2] hover:shadow-[0_18px_48px_rgba(180,160,140,0.06)]' 
          : ''
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
          {badge && (
            <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-lg border ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-2xl sm:text-3.5xl font-black text-slate-800 tracking-tight leading-none mt-1">{value}</p>
        {subtitle && (
          <p className="text-xs font-medium text-slate-400 leading-snug mt-1.5">{subtitle}</p>
        )}
      </div>
      
      {progressBarPercent !== undefined && (
        <div className="space-y-2">
          <div className="w-full bg-[#FAF7EE] rounded-full h-1 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${progressBarColor}`}
              style={{ width: `${progressBarPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            <span>{progressBarPercent}% Collected</span>
          </div>
        </div>
      )}
    </div>
  );
};

