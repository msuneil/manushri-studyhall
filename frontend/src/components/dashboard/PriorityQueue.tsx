import React from 'react';
import { ChevronRight } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { EmptyState } from './EmptyState';

interface PriorityItem {
  id: string;
  type: string;
  icon: React.ComponentType<any>;
  iconColor: string;
  bgTheme: string;
  borderColor: string;
  title: string;
  description: string;
  actionLabel: string;
  actionPath: string;
}

interface PriorityQueueProps {
  priorityQueue: PriorityItem[];
  onPriorityClick: (item: PriorityItem) => void;
  onActionClick: (actionPath: string) => void;
}

export const PriorityQueue: React.FC<PriorityQueueProps> = ({
  priorityQueue,
  onPriorityClick,
}) => {
  const featuredPriority = priorityQueue[0];
  const secondaryPriorities = priorityQueue.slice(1);

  return (
    <section className="space-y-3">
      <SectionHeader 
        title="Operational Priorities" 
        subtitle="Intelligently Guided" 
      />

      <div className="space-y-2.5">
        {priorityQueue.length > 0 ? (
          <>
            {/* 1. Featured Priority Card: Elegant warm parchment with quiet amber border accent */}
            {featuredPriority && (
              <div 
                onClick={() => onPriorityClick(featuredPriority)}
                className="flex items-center justify-between p-3.5 rounded-2xl border bg-[#FFFDF9] border-[#EADFCA] shadow-[0_16px_40px_rgba(180,160,140,0.04),0_2px_8px_rgba(180,160,140,0.02)] gap-4 transition-all duration-200 active:scale-[0.99] cursor-pointer hover:border-[#D8CBB2]"
              >
                <div className="flex items-center gap-3.5 min-w-0 text-left">
                  <div className="p-2 bg-white rounded-xl border border-[#F4EFE6] text-amber-600 shrink-0">
                    <featuredPriority.icon className={`w-4 h-4 ${featuredPriority.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 leading-snug truncate">{featuredPriority.title}</h3>
                    <p className="text-xs text-slate-500 font-semibold truncate mt-0.5">{featuredPriority.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-amber-700 shrink-0 ml-3">
                  <ChevronRight size={14} className="text-amber-600" strokeWidth={2.5} />
                </div>
              </div>
            )}

            {/* 2. Secondary Priorities: Quiet, warm parchment cards */}
            {secondaryPriorities.map((item) => (
              <div 
                key={item.id}
                onClick={() => onPriorityClick(item)}
                className="flex items-center justify-between p-3.5 bg-[#FFFDFB] border border-[#F4EFE6] rounded-2xl transition-all duration-200 active:scale-[0.99] cursor-pointer shadow-[0_16px_40px_rgba(180,160,140,0.03),0_2px_8px_rgba(180,160,140,0.015)] hover:border-[#EAE2D2]"
              >
                <div className="flex items-center gap-3.5 min-w-0 text-left">
                  <div className="p-2 bg-[#FAF8F5] rounded-xl border border-[#F4EFE6] text-slate-400 shrink-0">
                    <item.icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 truncate leading-snug">{item.title}</h4>
                    <p className="text-xs text-slate-450 font-semibold truncate mt-0.5">{item.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-slate-400 shrink-0 ml-3">
                  <ChevronRight size={14} className="text-slate-400" strokeWidth={2} />
                </div>
              </div>
            ))}
          </>
        ) : (
          /* Permanent Quiet Reassurance Empty Slot */
          <div className="bg-[#FFFDFB] border border-[#F4EFE6] rounded-2xl p-5 shadow-[0_16px_40px_rgba(180,160,140,0.04),0_2px_8px_rgba(180,160,140,0.02)]">
            <EmptyState message="Operations running smoothly today" />
          </div>
        )}
      </div>
    </section>
  );
};
