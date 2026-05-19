import type { ReactNode } from 'react';

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
        {title}
      </h3>
      {children}
    </div>
  );
}
