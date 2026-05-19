import type { LucideIcon } from 'lucide-react';
import { SettingsIconTile } from './SettingsIconTile';

interface SettingsRowProps {
  icon: LucideIcon;
  label: string;
  sub: string;
  color: string;
  bg: string;
  onClick?: () => void;
}

export function SettingsRow({ icon: Icon, label, sub, color, bg, onClick }: SettingsRowProps) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group text-left"
    >
      <SettingsIconTile icon={Icon} color={color} bg={bg} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-none mb-1">
          {label}
        </p>
        <p className="text-[10px] font-medium text-slate-400">
          {sub}
        </p>
      </div>
    </button>
  );
}
