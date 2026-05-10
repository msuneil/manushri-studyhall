import {
  LayoutDashboard,
  DoorOpen,
  Armchair,
  CreditCard,
  Users,
  Bell,
  TrendingDown,
  CheckSquare,
  Settings
} from 'lucide-react';
import { NavLink } from 'react-router';

export function Sidebar() {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: DoorOpen, label: 'Rooms', path: '/rooms' },
    { icon: Armchair, label: 'Seats', path: '/seats' },
    { icon: CreditCard, label: 'Payments', path: '/payments' },
    { icon: Users, label: 'Occupants', path: '/occupants' },
    { icon: TrendingDown, label: 'Expenses', path: '/expenses' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-semibold tracking-tight">Study Hall</h1>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-semibold">
            AD
          </div>
          <div>
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-slate-400">admin@studyhall.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
