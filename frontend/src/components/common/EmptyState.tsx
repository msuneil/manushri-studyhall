import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 border border-slate-100 rounded-4xl gap-4">
      <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
        <Icon size={28} strokeWidth={2.5} />
      </div>
      <div>
        <h4 className="text-sm font-black text-slate-900 mb-1">{title}</h4>
        <p className="text-xs font-medium text-slate-500 max-w-[200px] mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      {action && (
        <div className="mt-2 w-full">
          {action}
        </div>
      )}
    </div>
  );
}
