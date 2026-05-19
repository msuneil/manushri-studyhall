import { 
  Building2, 
  DoorOpen, 
  IndianRupee, 
  Bell, 
  CheckCircle2, 
  CreditCard,
  ShieldCheck,
  User,
  BellRing
} from 'lucide-react';
import type { SettingsSectionData } from '../types';

export const settingsSections: SettingsSectionData[] = [
  {
    title: 'Study Hall Setup',
    items: [
      { id: 'hall-details', icon: Building2, label: 'Hall Details', sub: 'Name, Address, Registration', color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { id: 'room-defaults', icon: DoorOpen, label: 'Room Defaults', sub: 'Default room types, common rules', color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { id: 'seat-pricing', icon: IndianRupee, label: 'Seat Pricing', sub: 'Set default pricing for plans', color: 'text-blue-600', bg: 'bg-blue-50' },
    ]
  },
  {
    title: 'Operations',
    items: [
      { id: 'attendance-settings', icon: CheckCircle2, label: 'Attendance Settings', sub: 'Marking window, holiday setup', color: 'text-green-600', bg: 'bg-green-50' },
      { id: 'reminder-settings', icon: Bell, label: 'Reminder Settings', sub: 'WhatsApp message templates', color: 'text-amber-600', bg: 'bg-amber-50' },
      { id: 'fee-settings', icon: CreditCard, label: 'Fee Settings', sub: 'Due dates, fine policies', color: 'text-purple-600', bg: 'bg-purple-50' },
    ]
  },
  {
    title: 'System & Security',
    items: [
      { id: 'notification-preferences', icon: BellRing, label: 'Notification Preferences', sub: 'Alerts, triggers, reports', color: 'text-pink-600', bg: 'bg-pink-50' },
      { id: 'admin-access', icon: ShieldCheck, label: 'Admin Access', sub: 'Manage passwords, login activity', color: 'text-slate-600', bg: 'bg-slate-50' },
      { id: 'owner-profile', icon: User, label: 'Owner Profile', sub: 'Contact details, email', color: 'text-slate-600', bg: 'bg-slate-50' },
    ]
  }
];
