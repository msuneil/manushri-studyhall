import { Armchair, PauseCircle, Lock } from 'lucide-react';
import type { Seat } from '../types';
import type { RoomStatus } from '../../rooms/types';
import { getSeatState } from '../types';

interface SeatCardProps {
  seat: Seat;
  roomStatus: RoomStatus;
  onClick: (seat: Seat) => void;
}

export function SeatCard({ seat, roomStatus, onClick }: SeatCardProps) {
  const state = getSeatState(seat, roomStatus);

  const getStyleClass = () => {
    switch (state) {
      case 'Overdue':
        // Strong visual red alert focus
        return 'bg-red-50/70 border-red-500 text-red-700 shadow-md shadow-red-500/10 active:scale-95 ring-2 ring-red-100 ring-offset-1';
      case 'Occupied':
        return 'bg-white border-indigo-600 text-indigo-700 shadow-sm shadow-indigo-600/10 active:scale-95';
      case 'Maintenance':
        return 'bg-amber-50/40 border-amber-300 text-amber-600 cursor-pointer active:scale-95';
      case 'Inactive':
        return 'bg-slate-50 border-slate-300 text-slate-400 cursor-pointer active:scale-95';
      case 'Reserved':
        return 'bg-purple-50/50 border-purple-400 text-purple-700 cursor-pointer active:scale-95';
      case 'Vacant':
      default:
        return 'bg-emerald-50/30 border-emerald-200 text-emerald-600 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 active:scale-90';
    }
  };

  const getIcon = () => {
    switch (state) {
      case 'Overdue':
        return (
          <div className="relative">
            <Armchair size={22} strokeWidth={2.5} />
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center border border-white text-[8px] font-black text-white leading-none">
              !
            </span>
          </div>
        );
      case 'Maintenance':
        return <PauseCircle size={22} className="text-amber-500" />;
      case 'Inactive':
        return <Lock size={22} className="text-slate-400" />;
      case 'Occupied':
        return <Armchair size={22} strokeWidth={2.5} />;
      default:
        return <Armchair size={22} strokeWidth={1.75} />;
    }
  };

  return (
    <button
      onClick={() => onClick(seat)}
      className={`relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 p-2 transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${getStyleClass()}`}
      aria-label={`Seat ${seat.number} - ${state}`}
    >
      {getIcon()}
      <span className="text-[10px] font-black tracking-tighter leading-none">{seat.number}</span>
      
      {state === 'Overdue' && (
        <span className="absolute -bottom-1 px-1.5 py-0.5 bg-red-600 text-white rounded-md text-[7px] font-black uppercase tracking-wider scale-95 shadow-sm leading-none border border-red-500">
          Due
        </span>
      )}
    </button>
  );
}
