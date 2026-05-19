import { LogOut } from 'lucide-react';

interface SettingsDangerActionProps {
  label: string;
  onClick?: () => void;
}

export function SettingsDangerAction({ label, onClick }: SettingsDangerActionProps) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 p-5 bg-red-50 text-red-600 rounded-3xl border border-red-100 font-black text-sm shadow-sm hover:bg-red-100 transition-colors group"
    >
      <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
      {label}
    </button>
  );
}
