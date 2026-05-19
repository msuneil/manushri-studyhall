import { Building2, Download, Database } from 'lucide-react';
import { SettingsActionButton } from './SettingsActionButton';
import { useSettings } from '../SettingsContext';

interface SettingsHeroCardProps {
  onExport: () => void;
  onBackup: () => void;
}

export function SettingsHeroCard({ onExport, onBackup }: SettingsHeroCardProps) {
  const { settings } = useSettings();
  const name = settings.hallDetails.name || 'Manushri Study Hall';
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden text-white">
      <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
        <Building2 size={120} />
      </div>
      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-5">
          {settings.hallDetails.logo ? (
            <img 
              src={settings.hallDetails.logo} 
              alt={name} 
              className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shadow-lg shrink-0" 
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center text-3xl font-black shadow-lg shrink-0">
              {initial}
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold tracking-tight">{name}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Premium Plan • Active</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SettingsActionButton 
            icon={Download} 
            label="Export" 
            onClick={onExport} 
          />
          <SettingsActionButton 
            icon={Database} 
            label="Backup" 
            onClick={onBackup} 
            variant="primary"
          />
        </div>
      </div>
    </div>
  );
}
