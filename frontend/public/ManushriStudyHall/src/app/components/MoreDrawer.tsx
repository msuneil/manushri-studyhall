import { X, Users, TrendingDown, CheckSquare, Bell, Settings } from 'lucide-react';
import { NavLink } from 'react-router';

interface MoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MoreDrawer({ isOpen, onClose }: MoreDrawerProps) {
  const moreItems = [
    { icon: Users, label: 'Occupants', path: '/occupants' },
    { icon: TrendingDown, label: 'Expenses', path: '/expenses' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div
        className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 animate-slide-up max-h-[70vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">More Options</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>
        </div>

        <div className="px-4 py-4 space-y-2 overflow-y-auto max-h-[calc(70vh-80px)]">
          {moreItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                    <item.icon size={20} />
                  </div>
                  <span className="text-base font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-semibold text-white">
              AD
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Admin</p>
              <p className="text-xs text-slate-600">admin@studyhall.com</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
