import type { LucideIcon } from 'lucide-react';

interface SettingsActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function SettingsActionButton({ icon: Icon, label, onClick, variant = 'secondary' }: SettingsActionButtonProps) {
  if (variant === 'primary') {
    return (
      <button 
        onClick={onClick} 
        className="flex items-center justify-center gap-2 py-3 bg-indigo-600 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-500/20 active:scale-95 transition-all w-full"
      >
        <Icon size={16} /> {label}
      </button>
    );
  }

  return (
    <button 
      onClick={onClick} 
      className="flex items-center justify-center gap-2 py-3 bg-white/10 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-white/20 transition-all border border-white/5 w-full"
    >
      <Icon size={16} /> {label}
    </button>
  );
}
