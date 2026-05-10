import {
  LayoutDashboard,
  DoorOpen,
  Armchair,
  CreditCard,
  MoreHorizontal
} from 'lucide-react';
import { NavLink } from 'react-router';

interface BottomNavProps {
  onMoreClick: () => void;
}

export function BottomNav({ onMoreClick }: BottomNavProps) {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: DoorOpen, label: 'Rooms', path: '/rooms' },
    { icon: CreditCard, label: 'Payments', path: '/payments' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="px-4 pb-6 safe-area-bottom">
        <nav className="bg-white rounded-2xl shadow-2xl border border-slate-200 pointer-events-auto">
          <div className="flex items-center justify-around px-2 py-3 relative">
            {navItems.slice(0, 2).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[64px] ${
                    isActive ? 'text-indigo-600' : 'text-slate-500'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}

            <NavLink
              to="/seats"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-16 h-16 -mt-8 rounded-2xl shadow-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white scale-110 shadow-indigo-500/50'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Armchair size={28} strokeWidth={2.5} />
                  <span className="text-[10px] font-bold mt-0.5">SEATS</span>
                </>
              )}
            </NavLink>

            {navItems.slice(2).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[64px] ${
                    isActive ? 'text-indigo-600' : 'text-slate-500'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            ))}

            <button
              onClick={onMoreClick}
              className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 text-slate-500 min-w-[64px]"
            >
              <MoreHorizontal size={20} strokeWidth={2} />
              <span className="text-xs font-medium">More</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
