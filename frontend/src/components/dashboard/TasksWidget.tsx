import React from 'react';
import { SectionHeader } from './SectionHeader';
import { EmptyState } from './EmptyState';

interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
}

interface TasksWidgetProps {
  tasks: Task[];
  completingTasks: string[];
  onCompleteTask: (taskId: string, title: string) => void;
  onNavigateToTasks: () => void;
  highlighted?: boolean;
}

export const TasksWidget: React.FC<TasksWidgetProps> = ({
  tasks,
  completingTasks,
  onCompleteTask,
  onNavigateToTasks,
  highlighted = false,
}) => {
  return (
    <section id="tasks-checklist" className="space-y-3">
      <SectionHeader 
        title="Today's Pending Tasks" 
        subtitle="Active operational tasks" 
        bulletColor="bg-indigo-400"
        actionLabel="View All"
        onActionClick={onNavigateToTasks}
      />
      
      <div 
        className={`bg-[#FFFDFB] rounded-2xl border ${
          highlighted 
            ? 'border-indigo-300 bg-indigo-50/5 shadow-lg ring-4 ring-indigo-100/40' 
            : 'border-[#F4EFE6] shadow-[0_16px_40px_rgba(180,160,140,0.04),0_2px_8px_rgba(180,160,140,0.02)]'
        } overflow-hidden p-5 md:p-6 space-y-3 flex flex-col justify-center min-h-[140px] transition-all duration-700`}
      >
        {tasks.length > 0 ? (
          tasks.slice(0, 3).map((task) => {
            const isCompleting = completingTasks.includes(task.id);
            return (
              <div 
                key={task.id} 
                className={`flex items-center gap-3.5 p-3.5 bg-[#FFFDFB] border border-[#F4EFE6] rounded-xl transition-all duration-300 hover:bg-[#FAF8F5]/80 hover:border-[#EAE2D2] ${
                  isCompleting ? 'opacity-0 scale-95 max-h-0 py-0 my-0 border-transparent overflow-hidden' : 'max-h-16 shadow-[0_4px_12px_rgba(180,160,140,0.015)]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                  isCompleting ? 'bg-emerald-500' : task.priority === 'High' ? 'bg-rose-400' : 'bg-amber-400'
                }`} />
                <span className={`text-sm font-bold text-slate-700 flex-1 transition-all duration-300 text-left ${
                  isCompleting ? 'line-through text-slate-300' : ''
                }`}>
                  {task.title}
                </span>
                <button 
                  onClick={() => onCompleteTask(task.id, task.title)}
                  disabled={isCompleting}
                  className={`text-[10px] font-black uppercase px-3 py-2 rounded-xl border transition-all active:scale-[0.97] cursor-pointer shrink-0 ${
                    isCompleting 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'text-slate-600 bg-[#FFFDFB] border-[#F4EFE6] hover:bg-[#FAF8F5] hover:border-[#EAE2D2] shadow-[0_1px_2px_rgba(0,0,0,0.01)]'
                  }`}
                >
                  {isCompleting ? 'Done' : 'Done'}
                </button>
              </div>
            );
          })
        ) : (
          /* Permanent Reassurance Slot: Soft and concise empty-state message */
          <EmptyState message="All tasks completed for today" />
        )}
      </div>
    </section>
  );
};
