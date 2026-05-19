import type { LucideIcon } from 'lucide-react';

interface SettingsIconTileProps {
  icon: LucideIcon;
  color: string;
  bg: string;
  size?: number;
}

export function SettingsIconTile({ icon: Icon, color, bg, size = 20 }: SettingsIconTileProps) {
  return (
    <div className={`p-3 rounded-2xl shrink-0 ${bg} ${color}`}>
      <Icon size={size} />
    </div>
  );
}
