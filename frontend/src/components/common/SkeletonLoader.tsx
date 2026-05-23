import React from 'react';

export function SkeletonPulse({ className = '', children }: { className?: string; children?: React.ReactNode }) {
  return (
    <div className={`animate-pulse bg-slate-100 rounded-2xl ${className}`}>
      {children || <div className="invisible">Loading</div>}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="flex items-center justify-around bg-slate-900 rounded-3xl p-5 shadow-xl animate-pulse">
      <div className="text-center w-1/4 space-y-2">
        <div className="h-2.5 bg-slate-800 rounded-full mx-auto w-10" />
        <div className="h-5 bg-slate-800 rounded-xl mx-auto w-8" />
      </div>
      <div className="w-px h-8 bg-slate-800" />
      <div className="text-center w-1/4 space-y-2">
        <div className="h-2.5 bg-slate-800 rounded-full mx-auto w-10" />
        <div className="h-5 bg-slate-800 rounded-xl mx-auto w-8" />
      </div>
      <div className="w-px h-8 bg-slate-800" />
      <div className="text-center w-1/4 space-y-2">
        <div className="h-2.5 bg-slate-800 rounded-full mx-auto w-10" />
        <div className="h-5 bg-slate-800 rounded-xl mx-auto w-8" />
      </div>
    </div>
  );
}

export function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4 animate-pulse">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100" />
              <div className="space-y-2">
                <div className="w-24 h-3.5 bg-slate-100 rounded-lg" />
                <div className="w-16 h-2.5 bg-slate-100 rounded-lg" />
              </div>
            </div>
            <div className="w-12 h-5 bg-slate-100 rounded-full" />
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4" />
          <div className="flex gap-2 pt-3 border-t border-slate-50">
            <div className="flex-1 h-8 bg-slate-100 rounded-xl" />
            <div className="flex-1 h-8 bg-slate-100 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonRows({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-slate-100" />
            <div className="flex-1 space-y-2">
              <div className="w-1/3 h-3.5 bg-slate-100 rounded-lg" />
              <div className="w-2/3 h-2.5 bg-slate-100 rounded-lg" />
            </div>
          </div>
          <div className="w-16 h-8 bg-slate-100 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export const SkeletonLoader = {
  Pulse: SkeletonPulse,
  Stats: SkeletonStats,
  Cards: SkeletonCards,
  Rows: SkeletonRows
};

export default SkeletonLoader;
