import { 
  LayoutDashboard, 
  DoorOpen, 
  Armchair, 
  CreditCard, 
  MoreHorizontal 
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface BottomNavProps {
  onMoreClick: () => void;
  isMoreActive?: boolean;
}

export function BottomNav({ onMoreClick, isMoreActive }: BottomNavProps) {
  const primaryItems = [
    { icon: LayoutDashboard, label: 'Home', path: '/' },
    { icon: DoorOpen, label: 'Rooms', path: '/rooms' },
  ];

  const secondaryItems = [
    { icon: CreditCard, label: 'Pay', path: '/payments' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[60] px-4 pb-6 safe-area-bottom pointer-events-none">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_-8px_30px_rgb(0,0,0,0.12)] border border-slate-200/50 flex items-center justify-around p-1 pointer-events-auto">
        {primaryItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 flex-1
              ${isActive ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500'}
            `}
          >
            <item.icon size={20} strokeWidth={2} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </NavLink>
        ))}

        {/* Floating Seats Action */}
        <NavLink
          to="/seats"
          className={({ isActive }) => `
            flex flex-col items-center justify-center w-16 h-16 -mt-10 rounded-[1.75rem] shadow-2xl transition-all duration-300 ring-4 ring-slate-50
            ${isActive 
              ? 'bg-linear-to-br from-indigo-500 to-indigo-700 text-white scale-110 shadow-indigo-500/40' 
              : 'bg-slate-900 text-white hover:scale-105 active:scale-95 shadow-slate-900/20'}
          `}
        >
          <Armchair size={26} strokeWidth={3} />
          <span className="text-[10px] font-black mt-0.5 tracking-tighter">SEATS</span>
        </NavLink>

        {secondaryItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 flex-1
              ${isActive ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500'}
            `}
          >
            <item.icon size={20} strokeWidth={2} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </NavLink>
        ))}

        <button
          onClick={onMoreClick}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 flex-1 ${
            isMoreActive ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-500'
          }`}
        >
          <MoreHorizontal size={20} strokeWidth={2} />
          <span className="text-[10px] font-bold uppercase tracking-wider">More</span>
        </button>
      </div>
    </nav>
  );
}
