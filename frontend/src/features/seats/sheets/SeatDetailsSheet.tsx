import { useState } from 'react';
import { BottomSheet } from '../../../components/common/BottomSheet';
import { StickyActionFooter } from '../../../components/common/StickyActionFooter';
import { FormSection } from '../../../components/common/FormAtoms';
import { CancelButton } from '../../../components/common/CancelButton';
import { Avatar } from '../../../components/common/Avatar';
import { 
  Users, 
  Calendar, 
  History, 
  IndianRupee, 
  ShieldAlert, 
  MessageSquare, 
  CheckCircle,
  Clock
} from 'lucide-react';
import type { Seat, Occupant, ActivityEvent } from '../types';

interface SeatDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  seat: Seat | null;
  occupant: Occupant | null;
  timeline: ActivityEvent[];
  onVacate: (seatId: string) => void;
  onMarkAttendance: (occupantId: string) => void;
  onSendReminder: (occupantId: string) => void;
  onUpdateNotes: (occupantId: string, notes: string) => void;
}

export function SeatDetailsSheet({
  isOpen,
  onClose,
  seat,
  occupant,
  timeline,
  onVacate,
  onMarkAttendance,
  onSendReminder,
  onUpdateNotes
}: SeatDetailsSheetProps) {
  const [showVacateConfirm, setShowVacateConfirm] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Sync internal notes text when sheet opens
  useState(() => {
    if (occupant) {
      setNotesText(occupant.notes || '');
    }
  });

  if (!seat) return null;

  const handleNotesSave = () => {
    if (occupant) {
      onUpdateNotes(occupant.id, notesText);
      setIsEditingNotes(false);
    }
  };


  const getPaymentBadgeColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Overdue': return 'bg-red-50 text-red-700 border-red-200';
      case 'Pending':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={() => {
        setShowVacateConfirm(false);
        onClose();
      }}
      title="Seat Details"
      size="scroll"
      footer={
        <StickyActionFooter>
          {showVacateConfirm ? (
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setShowVacateConfirm(false)}
                className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-[1.25rem] font-bold text-sm uppercase tracking-wider active:scale-[0.98] transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onVacate(seat.id);
                  setShowVacateConfirm(false);
                  onClose();
                }}
                className="flex-1 py-4 bg-red-600 text-white rounded-[1.25rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-red-500/30 active:scale-[0.98] transition-all"
              >
                Confirm Vacate
              </button>
            </div>
          ) : (
            <div className="flex gap-4 w-full pb-safe-bottom">
              <CancelButton onClick={onClose} />
              {occupant && (
                <button 
                  onClick={() => setShowVacateConfirm(true)}
                  className="flex-1 py-4 bg-red-50 text-red-600 rounded-[1.25rem] font-black text-sm uppercase tracking-wider hover:bg-red-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  Vacate Seat
                </button>
              )}
            </div>
          )}
        </StickyActionFooter>
      }
    >
      <div className="space-y-6 pb-12">
        {/* Dynamic header cards */}
        {occupant ? (
          <div className="flex items-center gap-4 p-1">
            <Avatar name={occupant.name} size="lg" />
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-black text-slate-900 leading-none mb-2">{occupant.name}</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
                  {seat.number}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                  {occupant.planType || 'Full Day'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-slate-50 border border-slate-200/60 rounded-3xl text-center space-y-2">
            <Users size={32} className="text-slate-400 mx-auto" />
            <h4 className="text-base font-black text-slate-900">Seat is currently Vacant</h4>
            <p className="text-xs text-slate-500 font-medium">Ready for allocation check-in.</p>
          </div>
        )}

        {/* 1. OCCUPANT QUICK ACTIONS SHORTCUTS */}
        {occupant && !showVacateConfirm && (
          <FormSection title="Operational Shortcuts">
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onMarkAttendance(occupant.id)}
                className="py-3 px-4 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
              >
                <History size={14} />
                Mark Attendance
              </button>
              <button 
                onClick={() => onSendReminder(occupant.id)}
                className="py-3 px-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
              >
                <MessageSquare size={14} />
                Send Reminder
              </button>
            </div>
          </FormSection>
        )}

        {/* 2. VACATE WARNING BOX */}
        {showVacateConfirm && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-3xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <ShieldAlert size={22} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-black text-red-900 mb-1">Are you absolutely sure?</h5>
              <p className="text-xs font-medium text-red-700 leading-relaxed">
                Vacating will instantly open this seat for other candidates. Payment records and attendance history will remain archived for safety.
              </p>
            </div>
          </div>
        )}

        {occupant && !showVacateConfirm && (
          <>
            {/* 3. PAYMENT VISIBILITY snapshot */}
            <FormSection title="Financial Snapshot">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/60">
                  <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Fee</p>
                  <p className="text-sm font-black text-slate-900 flex items-center gap-0.5">
                    <IndianRupee size={12} className="text-emerald-600" />
                    {occupant.monthlyFee}
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/60">
                  <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Paid On</p>
                  <p className="text-[10px] font-black text-slate-800 leading-tight">
                    {occupant.lastPaymentDate !== 'None' ? occupant.lastPaymentDate : 'Never'}
                  </p>
                </div>
                <div className={`p-3 rounded-2xl border flex flex-col justify-between ${getPaymentBadgeColor(occupant.paymentStatus)}`}>
                  <p className="text-[9px] font-black uppercase leading-none mb-1">Status</p>
                  <p className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    {occupant.paymentStatus}
                    {occupant.paymentStatus === 'Overdue' && ` (${occupant.overdueDays}d)`}
                  </p>
                </div>
              </div>
            </FormSection>

            {/* 4. ATTENDANCE VISIBILITY trend */}
            <FormSection title="Attendance Metrics">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Last Marked</p>
                    <p className="text-xs font-black text-slate-950">{occupant.lastAttendanceDate}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <CheckCircle size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Attendance Tracker</p>
                    <p className="text-xs font-black text-slate-950 flex items-center gap-1">
                      {occupant.attendanceRate}% 
                      <span className="text-[9px] font-bold text-slate-400">(Attendance Rate)</span>
                    </p>
                  </div>
                </div>
              </div>
            </FormSection>

            {/* 5. CONTACT & VERIFICATIONS */}
            <FormSection title="Candidate Verification">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <span className="font-bold text-slate-500">Contact Mobile</span>
                  <span className="font-black text-slate-900">{occupant.phone}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <span className="font-bold text-slate-500">Aadhaar (ID Verified)</span>
                  <span className="font-black text-slate-900">{occupant.aadhaarPlaceholder || 'Pending'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <span className="font-bold text-slate-500">Joining Date</span>
                  <span className="font-black text-slate-900 flex items-center gap-1">
                    <Calendar size={14} className="text-slate-400" />
                    {occupant.joinDate}
                  </span>
                </div>
              </div>
            </FormSection>

            {/* 6. RECENT ACTIVITY TIMELINE */}
            <FormSection title="Activity Logs">
              <div className="space-y-4">
                {timeline.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No recent activity logged.</p>
                ) : (
                  <div className="space-y-3 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                    {timeline.map(event => (
                      <div key={event.id} className="flex gap-4 items-start relative pl-1">
                        <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border z-10 ${
                          event.type === 'Payment' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : event.type === 'Attendance' 
                            ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                            : event.type === 'Reminder'
                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                            : 'bg-slate-50 text-slate-600 border-slate-100'
                        }`}>
                          {event.type === 'Payment' ? <IndianRupee size={14} /> : <Clock size={14} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex flex-col gap-1 items-start">
                              <h6 className="text-xs font-black text-slate-800 leading-tight">{event.title}</h6>
                              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider leading-none shrink-0 ${
                                event.type === 'Payment' 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                  : event.type === 'Attendance' 
                                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                  : event.type === 'Reminder'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-800 border border-slate-200'
                              }`}>
                                {event.type}
                              </span>
                            </div>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mt-0.5">
                              {event.timestamp}
                            </span>
                          </div>
                          {event.details && (
                            <p className="text-[10px] font-medium text-slate-400 leading-normal mt-0.5">{event.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormSection>

            {/* 7. ADMIN NOTES with expandable state */}
            <FormSection title="Operational Notes">
              <div className="space-y-3">
                {isEditingNotes ? (
                  <div className="space-y-2">
                    <textarea
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 h-28 resize-none leading-relaxed"
                    />
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => setIsEditingNotes(false)}
                        className="py-2 px-4 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleNotesSave}
                        className="py-2 px-4 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => {
                      setNotesText(occupant.notes || '');
                      setIsEditingNotes(true);
                    }}
                    className="p-4 bg-slate-50 rounded-2xl text-xs font-medium text-slate-600 border border-dashed border-slate-200 cursor-pointer hover:border-slate-400 hover:bg-slate-100/50 transition-all min-h-[60px]"
                  >
                    {occupant.notes || 'No notes added for this occupant. Tap here to add notes.'}
                  </div>
                )}
              </div>
            </FormSection>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
