import type { LucideIcon } from 'lucide-react';

export interface SettingsItem {
  id: string;
  icon: LucideIcon;
  label: string;
  sub: string;
  color: string;
  bg: string;
  path?: string;
}

export interface SettingsSectionData {
  title: string;
  items: SettingsItem[];
}
