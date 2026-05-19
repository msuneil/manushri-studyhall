import { Wind, Thermometer, Armchair, MoreVertical, LayoutGrid, CheckCircle2, PauseCircle, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Room, RoomStatus } from '../types';
import { useState, useRef, useEffect } from 'react';

interface RoomCardProps {
  room: Room;
  onEdit: (room: Room) => void;
  onViewDetails: (room: Room) => void;
  onStatusTransition: (room: Room, newStatus: RoomStatus) => void;
}

export function RoomCard({ room, onEdit, onViewDetails, onStatusTransition }: RoomCardProps) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const occupancyRate = room.totalSeats > 0 ? Math.round((room.occupiedSeats / room.totalSeats) * 100) : 0;
  
  // Derived state for Full status
  const isFull = room.occupiedSeats >= room.totalSeats;
  const displayStatus = isFull && room.status === 'Active' ? 'Full' : room.status;

  const getStatusColor = () => {
    switch (displayStatus) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Full': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Maintenance': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Inactive': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusIcon = () => {
    switch (displayStatus) {
      case 'Active': return <CheckCircle2 size={12} />;
      case 'Full': return <Ban size={12} />;
      case 'Maintenance': return <PauseCircle size={12} />;
      case 'Inactive': return <Ban size={12} />;
      default: return null;
    }
  };

  const getOccupancyLabel = () => {
    if (occupancyRate >= 100) return 'Waitlist';
    if (occupancyRate >= 90) return 'Almost Full';
    if (occupancyRate >= 60) return 'Moderate';
    return 'Seats Available';
  };

  const isAC = room.seatPrefix.includes('AC') && !room.seatPrefix.includes('NAC');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Soft visual deprioritization for Inactive rooms
  const isInactive = room.status === 'Inactive';
  const cardBgClass = isInactive ? 'bg-slate-50/50 border-slate-200/60' : 'bg-white border-slate-200';
  const iconOpacityClass = isInactive ? 'opacity-45' : 'opacity-100';

  return (
    <div className={`rounded-3xl border overflow-hidden shadow-sm hover:shadow-xl transition-all group ${cardBgClass}`}>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl shrink-0 ${iconOpacityClass} ${isAC ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {isAC ? <Wind size={32} /> : <Thermometer size={32} />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-black text-slate-900 leading-none">{room.name}</h3>
                <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusColor()}`}>
                  {getStatusIcon()}
                  <span>{displayStatus}</span>
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{room.type}</p>
            </div>
          </div>
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-3 -mr-3 -mt-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
              aria-label="Room Actions"
            >
              <MoreVertical size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 w-52 bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                {/* 1. Passive / Informational First */}
                <button 
                  onClick={() => { setShowMenu(false); onViewDetails(room); }}
                  className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  View Details
                </button>
                
                {/* 2. Editing Second */}
                {room.status !== 'Inactive' && (
                  <button 
                    onClick={() => { setShowMenu(false); onEdit(room); }}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Edit Room
                  </button>
                )}

                <div className="h-px bg-slate-100 my-1" />

                {/* 3. Operational Lifecycle Actions Last (Dynamic based on state) */}
                {room.status === 'Active' && (
                  <>
                    <button 
                      onClick={() => { setShowMenu(false); onStatusTransition(room, 'Maintenance'); }}
                      className="w-full text-left px-4 py-3 text-sm font-bold text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      Set Maintenance Mode
                    </button>
                    <button 
                      onClick={() => { setShowMenu(false); onStatusTransition(room, 'Inactive'); }}
                      className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Deactivate Room
                    </button>
                  </>
                )}

                {room.status === 'Maintenance' && (
                  <button 
                    onClick={() => { setShowMenu(false); onStatusTransition(room, 'Active'); }}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors"
                  >
                    Mark Active
                  </button>
                )}

                {room.status === 'Inactive' && (
                  <button 
                    onClick={() => { setShowMenu(false); onStatusTransition(room, 'Active'); }}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors"
                  >
                    Reactivate Room
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Metadata Row */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
            {room.pricingPreview}
          </span>
          {room.rulesPreview.map(rule => (
            <span key={rule} className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
              {rule}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 p-4 rounded-2xl">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Capacity</p>
            <div className="flex items-center gap-2">
              <Armchair size={16} className={`text-slate-400 ${iconOpacityClass}`} />
              <span className="text-lg font-black text-slate-900">{room.totalSeats} Seats</span>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Revenue</p>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-slate-900">₹{room.revenueCollected.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-slate-400">/ ₹{room.revenueExpected.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-bold text-slate-500">{getOccupancyLabel()}</span>
            <span className="text-xs font-black text-slate-900">{room.occupiedSeats}/{room.totalSeats} Occupied</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                occupancyRate > 90 ? 'bg-red-500' : occupancyRate > 70 ? 'bg-amber-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50/50 border-t border-slate-100">
        <button 
          onClick={() => navigate('/seats', { state: { roomId: room.id } })}
          className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-[1.25rem] text-sm font-black uppercase tracking-wider hover:bg-indigo-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <LayoutGrid size={18} />
          Open Seats
        </button>
      </div>
    </div>
  );
}
