import { BottomSheet } from '../../../components/common/BottomSheet';
import { StickyActionFooter } from '../../../components/common/StickyActionFooter';
import { FormSection } from '../../../components/common/FormAtoms';
import { CancelButton } from '../../../components/common/CancelButton';
import { Users, IndianRupee, Tag, CheckCircle2, PauseCircle, Ban, RefreshCw } from 'lucide-react';
import type { Room, RoomStatus } from '../types';
import { isValidTransition } from '../types';

interface RoomDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  onEdit: (room: Room) => void;
  onStatusTransition: (room: Room, newStatus: RoomStatus) => void;
}

export function RoomDetailsSheet({ isOpen, onClose, room, onEdit, onStatusTransition }: RoomDetailsSheetProps) {
  if (!room) return null;

  const displayStatus = room.status;

  const getStatusColor = () => {
    switch (displayStatus) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Maintenance': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Inactive': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStatusIcon = () => {
    switch (displayStatus) {
      case 'Active': return <CheckCircle2 size={12} />;
      case 'Maintenance': return <PauseCircle size={12} />;
      case 'Inactive': return <Ban size={12} />;
      default: return null;
    }
  };

  return (
    <BottomSheet 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Room Details"
      size="scroll"
      footer={
        <StickyActionFooter>
          <CancelButton onClick={onClose} />
          {room.status !== 'Inactive' && (
            <button 
              onClick={() => { onClose(); onEdit(room); }}
              className="flex-1 py-4 bg-indigo-600 text-white rounded-[1.25rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-500/30 active:scale-[0.98] transition-all"
            >
              Edit Room
            </button>
          )}
        </StickyActionFooter>
      }
    >
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">{room.name}</h2>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{room.type}</p>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${getStatusColor()}`}>
          {getStatusIcon()}
          <span>{displayStatus}</span>
        </div>
      </div>

      {/* Room Status Section */}
      <FormSection title="Room Lifecycle & Status">
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-4">
          {displayStatus === 'Active' && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-4">
                Active rooms are fully operational and open for new seat assignments.
              </p>
              <div className="flex gap-3">
                {isValidTransition('Active', 'Maintenance') && (
                  <button 
                    onClick={() => onStatusTransition(room, 'Maintenance')}
                    className="flex-1 py-3 px-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-amber-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <PauseCircle size={14} />
                    Maintenance
                  </button>
                )}
                {isValidTransition('Active', 'Inactive') && (
                  <button 
                    onClick={() => onStatusTransition(room, 'Inactive')}
                    className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Ban size={14} />
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          )}

          {displayStatus === 'Maintenance' && (
            <div>
              <p className="text-xs font-bold text-amber-700 leading-relaxed mb-4">
                New seat assignments are temporarily blocked while existing occupants continue normally.
              </p>
              {isValidTransition('Maintenance', 'Active') && (
                <button 
                  onClick={() => onStatusTransition(room, 'Active')}
                  className="w-full py-3 px-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  Mark Room Active
                </button>
              )}
            </div>
          )}

          {displayStatus === 'Inactive' && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-4">
                Deactivated rooms block all new allocations and are hidden from normal lists.
              </p>
              {isValidTransition('Inactive', 'Active') && (
                <button 
                  onClick={() => onStatusTransition(room, 'Active')}
                  className="w-full py-3 px-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw size={14} />
                  Reactivate Room
                </button>
              )}
            </div>
          )}
        </div>
      </FormSection>

      <FormSection title="Current Analytics">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Occupancy</p>
              <p className="text-sm font-black text-slate-900">{room.occupiedSeats} / {room.totalSeats}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <IndianRupee size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Revenue</p>
              <p className="text-sm font-black text-slate-900">₹{room.revenueCollected.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="Configuration">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-500">Seat Prefix</span>
            <span className="text-sm font-black text-slate-900">{room.seatPrefix}</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-500">Gender Restriction</span>
            <span className="text-sm font-black text-slate-900">{room.genderRestriction}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs font-bold text-slate-500 mb-2">Room Rules</p>
            <div className="flex flex-wrap gap-2">
              {room.rulesPreview.map(rule => (
                <span key={rule} className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  <Tag size={10} />
                  {rule}
                </span>
              ))}
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="Operational Notes">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 min-h-[100px]">
          <p className="text-sm font-medium text-slate-700 leading-relaxed">
            {room.notes || "No notes available for this room."}
          </p>
        </div>
      </FormSection>
    </BottomSheet>
  );
}
