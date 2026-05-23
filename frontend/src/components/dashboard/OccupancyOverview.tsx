import React from 'react';
import { SectionHeader } from './SectionHeader';

interface OccupancyOverviewProps {
  totalSeats: number;
  occupiedSeats: number;
  availableSeats: number;
  acRate: number;
  nonAcRate: number;
  acOccupied: number;
  acTotal: number;
  nonAcOccupied: number;
  nonAcTotal: number;
  onNavigateToSeats: () => void;
}

export const OccupancyOverview: React.FC<OccupancyOverviewProps> = ({
  totalSeats,
  occupiedSeats,
  availableSeats,
  acRate,
  nonAcRate,
  acOccupied,
  acTotal,
  nonAcOccupied,
  nonAcTotal,
  onNavigateToSeats,
}) => {
  const occupancyPercent = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0;
  
  // Custom Donut Circumference calculations (r = 28)
  const radius = 28;
  const circumference = 2 * Math.PI * radius; // 175.93
  const dashOffset = circumference - (circumference * occupancyPercent) / 100;

  return (
    <section className="space-y-3">
      <SectionHeader 
        title="Occupancy & Seat Utilization" 
        subtitle="Live Capacity Insights" 
        actionLabel="Seat Map"
        onActionClick={onNavigateToSeats}
      />

      <div 
        onClick={onNavigateToSeats}
        className="bg-[#FFFDFB] p-5 md:p-6 rounded-2xl border border-[#F4EFE6] shadow-[0_16px_40px_rgba(180,160,140,0.04),0_2px_8px_rgba(180,160,140,0.02)] active:scale-[0.99] transition-all duration-200 cursor-pointer group hover:border-[#EAE2D2] hover:shadow-[0_18px_48px_rgba(180,160,140,0.06)]"
      >
        {/* Top Fold: Horizontal layout for donut and key statistics */}
        <div className="flex items-center gap-6 md:gap-8 pb-4 border-b border-amber-100/30">
          
          {/* Compact SVG Donut Chart */}
          <div className="relative shrink-0 flex items-center justify-center">
            <svg className="w-22 h-22 transform -rotate-90" viewBox="0 0 64 64">
              {/* Background Track Circle */}
              <circle 
                cx="32" 
                cy="32" 
                r={radius} 
                className="text-[#FAF7EE]" 
                strokeWidth="5.5" 
                stroke="currentColor" 
                fill="transparent" 
              />
              {/* Animated Colored Progress Circle */}
              <circle 
                cx="32" 
                cy="32" 
                r={radius} 
                className="text-amber-600 transition-all duration-700 ease-out" 
                strokeWidth="5.5" 
                strokeDasharray={circumference} 
                strokeDashoffset={dashOffset} 
                strokeLinecap="round" 
                stroke="currentColor" 
                fill="transparent" 
              />
            </svg>
            {/* Centered Readable Percentage */}
            <div className="absolute text-center">
              <p className="text-xl font-black text-slate-800 tracking-tight leading-none">{occupancyPercent}%</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Filled</p>
            </div>
          </div>

          {/* Occupancy Core Metrics Grid */}
          <div className="flex-1 grid grid-cols-3 gap-3 text-left">
            <div>
              <p className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Total Seats</p>
              <p className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mt-1 leading-none">{totalSeats}</p>
            </div>
            <div className="border-l border-amber-100/35 pl-3">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Filled</p>
              <p className="text-xl sm:text-2xl font-black text-amber-700 tracking-tight mt-1 leading-none">{occupiedSeats}</p>
            </div>
            <div className="border-l border-amber-100/35 pl-3">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Available</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight mt-1 leading-none">{availableSeats}</p>
            </div>
          </div>
        </div>

        {/* Bottom Fold: Highly integrated AC / Non-AC horizontal status breakdown */}
        <div className="pt-4 grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between gap-2 px-0.5">
            <div>
              <p className="text-[11px] font-bold text-slate-700 leading-none">AC Hall</p>
              <p className="text-[10px] font-medium text-slate-400 mt-1">
                {acOccupied} of {acTotal} active seats
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] sm:text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-100/40">
                {acRate}%
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-2 border-l border-amber-100/30 pl-4">
            <div>
              <p className="text-[11px] font-bold text-slate-700 leading-none">Non-AC Hall</p>
              <p className="text-[10px] font-medium text-slate-400 mt-1">
                {nonAcOccupied} of {nonAcTotal} active seats
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100/40">
                {nonAcRate}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
