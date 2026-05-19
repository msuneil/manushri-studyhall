import type { ReactNode } from 'react';

interface SettingsGroupCardProps {
  children: ReactNode;
}

export function SettingsGroupCard({ children }: SettingsGroupCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="divide-y divide-slate-50">
        {children}
      </div>
    </div>
  );
}
