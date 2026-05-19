import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { useToast } from '../components/Toast';
import { useConfirmation } from '../components/Confirmation';
import { 
  Check, 
  X, 
  Search, 
  Filter, 
  Calendar,
  ArrowLeft,
  ArrowRight,
  Lock,
  Unlock,
  Clock,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { occupants, seats } from '../data/mockData';
import { Avatar } from '../components/common/Avatar';
import { BottomSheet } from '../components/common/BottomSheet';

interface AttendanceSession {
  status: 'draft' | 'submitted' | 'edited';
  submittedAt?: string;
  editedAt?: string;
  records: Record<string, 'present' | 'absent'>;
}

export default function Attendance() {
  const { showToast } = useToast();
  const { confirm } = useConfirmation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Present' | 'Absent' | 'Unmarked'>('All');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isBulkSheetOpen, setIsBulkSheetOpen] = useState(false);

  // Prepopulate historical sessions dynamically so calendar traversal works instantly
  const [sessions, setSessions] = useState<Record<string, AttendanceSession>>(() => {
    const yesterdayRecords: Record<string, 'present' | 'absent'> = {};
    occupants.forEach((occ, idx) => {
      if (idx % 7 === 0) {
        yesterdayRecords[occ.id] = 'absent';
      } else if (idx % 7 !== 6) {
        yesterdayRecords[occ.id] = 'present';
      }
    });

    const twoDaysAgoRecords: Record<string, 'present' | 'absent'> = {};
    occupants.forEach((occ, idx) => {
      if (idx % 8 === 0) {
        twoDaysAgoRecords[occ.id] = 'absent';
      } else if (idx % 8 !== 7) {
        twoDaysAgoRecords[occ.id] = 'present';
      }
    });

    const yStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const tdaStr = new Date(Date.now() - 172800000).toISOString().split('T')[0];

    return {
      [yStr]: {
        status: 'submitted',
        submittedAt: 'Yesterday, 09:12 AM',
        records: yesterdayRecords
      },
      [tdaStr]: {
        status: 'submitted',
        submittedAt: '2 days ago, 09:05 AM',
        records: twoDaysAgoRecords
      }
    };
  });

  // Load selected date session or fallback to draft
  const activeSession = useMemo((): AttendanceSession => {
    return sessions[selectedDate] || {
      status: 'draft',
      records: {}
    };
  }, [sessions, selectedDate]);

  // Enriched search results
  const enrichedOccupants = useMemo(() => {
    return occupants.map(occ => {
      const seat = seats.find(s => s.id === occ.seatId);
      return {
        ...occ,
        seatNumber: seat?.number || 'N/A'
      };
    }).filter(occ => 
      occ.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      occ.seatNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Recalculated states explicitly separating Unmarked
  const stats = useMemo(() => {
    const total = enrichedOccupants.length;
    let present = 0;
    let absent = 0;

    enrichedOccupants.forEach(occ => {
      const record = activeSession.records[occ.id];
      if (record === 'present') present++;
      else if (record === 'absent') absent++;
    });

    const unmarked = total - (present + absent);
    return { present, absent, unmarked, total };
  }, [activeSession, enrichedOccupants]);

  // Rapid operational attendance marking (Present -> Unmarked, Absent -> Present)
  const handleMarkAttendance = (id: string, state: 'present' | 'absent') => {
    if (activeSession.status === 'submitted') {
      showToast("Attendance is locked. Tap 'Unlock Session' to modify.", "info");
      return;
    }

    setSessions(prev => {
      const current = prev[selectedDate] || { status: 'draft', records: {} };
      const currentVal = current.records[id];
      
      const newRecords = { ...current.records };
      if (currentVal === state) {
        delete newRecords[id]; // quick undo
      } else {
        newRecords[id] = state;
      }

      const updatedSession: AttendanceSession = {
        ...current,
        records: newRecords
      };

      // If already in edited status, preserve it
      if (current.status === 'submitted') {
        updatedSession.status = 'edited';
      }

      return {
        ...prev,
        [selectedDate]: updatedSession
      };
    });
  };

  // Day Traversal callbacks
  const handlePreviousDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - 1);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + 1);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleResetToToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    showToast("Returned to today's date", "info");
  };

  // Safe Bulk Actions
  const handleBulkMarkAll = async (type: 'present' | 'absent') => {
    setIsBulkSheetOpen(false);

    if (activeSession.status === 'submitted') {
      showToast("Cannot modify locked session!", "error");
      return;
    }

    const label = type === 'present' ? 'PRESENT' : 'ABSENT';
    const confirmed = await confirm({
      title: `Mark All ${label}?`,
      description: `Are you sure you want to mark all ${enrichedOccupants.length} filtered occupants as ${label}?`,
      severity: "medium",
      confirmLabel: "Mark All",
      cancelLabel: "Cancel"
    });

    if (!confirmed) return;

    setSessions(prev => {
      const current = prev[selectedDate] || { status: 'draft', records: {} };
      const newRecords = { ...current.records };
      enrichedOccupants.forEach(occ => {
        newRecords[occ.id] = type;
      });

      return {
        ...prev,
        [selectedDate]: {
          ...current,
          records: newRecords
        }
      };
    });

    showToast(`All filtered occupants marked as ${type}.`, "success");
  };

  const handleBulkReset = async () => {
    setIsBulkSheetOpen(false);

    if (activeSession.status === 'submitted') {
      showToast("Cannot reset locked session!", "error");
      return;
    }

    const confirmed = await confirm({
      title: "Reset Daily Session?",
      description: "Are you sure you want to clear all marked attendance records for this date? This cannot be undone.",
      severity: "high",
      confirmLabel: "Reset All",
      cancelLabel: "Cancel"
    });

    if (!confirmed) return;

    setSessions(prev => {
      const current = prev[selectedDate] || { status: 'draft', records: {} };
      return {
        ...prev,
        [selectedDate]: {
          ...current,
          records: {}
        }
      };
    });

    showToast("Active attendance session cleared.", "info");
  };

  // Submission workflows
  const handleSubmitSession = async () => {
    if (activeSession.status === 'submitted') return;

    const confirmed = await confirm({
      title: "Submit Daily Attendance?",
      description: `Are you sure you want to submit today's active session for ${selectedDate}? This locks the record for audit integrity.`,
      severity: "low",
      confirmLabel: "Submit & Lock",
      cancelLabel: "Cancel"
    });

    if (!confirmed) return;

    const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setSessions(prev => {
      const current = prev[selectedDate] || { status: 'draft', records: {} };
      return {
        ...prev,
        [selectedDate]: {
          ...current,
          status: 'submitted',
          submittedAt: `Today, ${nowStr}`
        }
      };
    });

    showToast("Daily attendance submitted and locked.", "success");
  };

  const handleUnlockSession = () => {
    setSessions(prev => {
      const current = prev[selectedDate] || { status: 'submitted', records: {} };
      const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      return {
        ...prev,
        [selectedDate]: {
          ...current,
          status: 'edited',
          editedAt: `Today, ${nowStr}`
        }
      };
    });

    showToast("Session unlocked. Re-submit to re-lock.", "info");
  };

  // Combined filters (Search Query + Present/Absent/Unmarked filters)
  const filteredOccupants = useMemo(() => {
    return enrichedOccupants.filter(occ => {
      const record = activeSession.records[occ.id];
      if (filterStatus === 'All') return true;
      if (filterStatus === 'Present') return record === 'present';
      if (filterStatus === 'Absent') return record === 'absent';
      if (filterStatus === 'Unmarked') return !record;
      return true;
    });
  }, [enrichedOccupants, activeSession, filterStatus]);

  return (
    <div className="flex flex-col min-h-full">
      <Header 
        title="Attendance" 
        subtitle="Daily Presence Tracking"
        showBack
        action={undefined}
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Floating Content Banners with safe spacing rhythm */}
        {activeSession.status === 'submitted' && (
          <div className="bg-indigo-50/80 backdrop-blur-sm border border-indigo-100/80 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                <Lock size={15} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-black text-indigo-950">Attendance Session Locked</p>
                {activeSession.submittedAt && (
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">Submitted: {activeSession.submittedAt}</p>
                )}
              </div>
            </div>
            <button 
              onClick={handleUnlockSession}
              className="px-3 py-1.5 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
            >
              <Unlock size={11} /> Unlock
            </button>
          </div>
        )}

        {activeSession.status === 'edited' && (
          <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-100/80 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <Clock size={15} className="text-amber-600 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-black text-amber-950">Editing Submitted Session</p>
                {activeSession.editedAt && (
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">Last revised: {activeSession.editedAt}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-amber-500/10 px-2 py-1 rounded-lg shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
              <span className="text-[9px] font-black text-amber-800 uppercase tracking-wider">Unsaved</span>
            </div>
          </div>
        )}

        {/* Date Selector & Summary Header */}
        <div className="bg-slate-900 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={handlePreviousDay}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer active:scale-90"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2.5">
              <Calendar className="text-indigo-400 shrink-0" size={20} />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white font-black text-base outline-none cursor-pointer focus:ring-1 focus:ring-indigo-500 rounded px-1"
              />
              {selectedDate !== new Date().toISOString().split('T')[0] && (
                <button
                  onClick={handleResetToToday}
                  className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-white/95 rounded-md text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Today
                </button>
              )}
            </div>
            <button 
              onClick={handleNextDay}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer active:scale-90"
            >
              <ArrowRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-white/10">
            <div className="text-center border-r border-white/5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Total</p>
              <p className="text-lg font-black text-white mt-0.5">{stats.total}</p>
            </div>
            <div className="text-center border-r border-white/5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider text-emerald-400">Present</p>
              <p className="text-lg font-black text-white mt-0.5">{stats.present}</p>
            </div>
            <div className="text-center border-r border-white/5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider text-rose-400">Absent</p>
              <p className="text-lg font-black text-white mt-0.5">{stats.absent}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider text-slate-400">Unmarked</p>
              <p className="text-lg font-black text-white mt-0.5">{stats.unmarked}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search occupant by name or seat..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsFilterSheetOpen(true)}
            className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            title="Filter and Actions"
          >
            <Filter size={18} />
            {filterStatus !== 'All' && (
              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
            )}
          </button>
        </div>

        {/* Active Filter Indicators */}
        {filterStatus !== 'All' && (
          <div className="flex items-center gap-1.5 px-1 animate-in fade-in duration-200">
            <span className="text-[10px] font-bold text-slate-400">Filtered:</span>
            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-wider rounded-md">
              {filterStatus}
            </span>
            <button 
              onClick={() => setFilterStatus('All')}
              className="text-[9px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider underline cursor-pointer"
            >
              Clear Filter
            </button>
          </div>
        )}

        {/* Occupant Attendance List */}
        <div className="space-y-3">
          {filteredOccupants.length > 0 ? (
            filteredOccupants.map((occ) => {
              const record = activeSession.records[occ.id];
              const isPresent = record === 'present';
              const isAbsent = record === 'absent';
              const isUnmarked = !record;
              const isLocked = activeSession.status === 'submitted';

              return (
                <div 
                  key={occ.id}
                  className={`
                    bg-white rounded-3xl border p-4 shadow-sm flex items-center justify-between transition-all duration-200
                    ${isPresent ? 'border-emerald-200 bg-emerald-50/10' : ''}
                    ${isAbsent ? 'border-rose-200 bg-rose-50/10' : ''}
                    ${isUnmarked ? 'border-slate-100 bg-white' : ''}
                    ${isLocked ? 'opacity-75' : ''}
                  `}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0 pr-2">
                    <Avatar 
                      name={occ.name} 
                      size="md" 
                      className={`
                        transition-all duration-200 shrink-0
                        ${isPresent ? 'ring-4 ring-emerald-500/25 border-emerald-500' : ''}
                        ${isAbsent ? 'ring-4 ring-rose-500/25 border-rose-500' : ''}
                      `} 
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-slate-900 leading-tight truncate flex items-center gap-1.5">
                        {occ.name}
                        {isLocked && isPresent && (
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                        )}
                        {isLocked && isAbsent && (
                          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full shrink-0" />
                        )}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                          {occ.seatNumber}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">
                          {occ.planType || 'Full Day'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contextual Card controls */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleMarkAttendance(occ.id, 'present')}
                      disabled={isLocked}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-150 ${
                        isPresent 
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-105 border-0 font-bold' 
                          : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 border border-slate-100/50'
                      } ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer active:scale-95'}`}
                      title="Present"
                    >
                      <Check size={18} strokeWidth={3} />
                    </button>
                    <button
                      onClick={() => handleMarkAttendance(occ.id, 'absent')}
                      disabled={isLocked}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-150 ${
                        isAbsent 
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25 scale-105 border-0 font-bold' 
                          : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 border border-slate-100/50'
                      } ${isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer active:scale-95'}`}
                      title="Absent"
                    >
                      <X size={18} strokeWidth={3} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-slate-50 rounded-3xl p-8 text-center border border-slate-100">
              <AlertTriangle className="text-slate-400 mx-auto mb-2" size={24} />
              <p className="text-xs font-black text-slate-500">No occupants found</p>
              <p className="text-[10px] font-medium text-slate-400 mt-1">Refine active search filters or check different controls.</p>
            </div>
          )}
        </div>

        {/* Submit Attendance Sticky Action Footer */}
        <div className="pb-24 pt-4 space-y-3">
          {activeSession.status === 'submitted' ? (
            <div className="w-full py-4 bg-slate-100 text-slate-500 rounded-3xl border border-slate-200/50 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
              <Lock size={14} className="text-slate-400" />
              Attendance Session Submitted & Locked
            </div>
          ) : (
            <>
              <button 
                onClick={handleSubmitSession}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black text-sm uppercase tracking-wider shadow-lg shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {activeSession.status === 'edited' ? 'Submit Revisions' : 'Submit Attendance'}
              </button>
              <button 
                onClick={() => setIsBulkSheetOpen(true)}
                className="w-full text-center text-xs font-black text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider cursor-pointer py-2 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Sparkles size={13} className="text-indigo-500" />
                Session Bulk Actions
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Attendance Sheet */}
      <BottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title="Filter Attendance"
        size="scroll"
      >
        <div className="space-y-4 py-2 animate-in fade-in duration-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Filter List By Status</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { id: 'All', label: 'All Occupants', count: stats.total, color: 'hover:bg-slate-50 border-slate-100 text-slate-700' },
              { id: 'Present', label: 'Present Only', count: stats.present, color: 'bg-emerald-50/20 hover:bg-emerald-50/50 border-emerald-100/50 text-emerald-700' },
              { id: 'Absent', label: 'Absent Only', count: stats.absent, color: 'bg-rose-50/20 hover:bg-rose-50/50 border-rose-100/50 text-rose-700' },
              { id: 'Unmarked', label: 'Unmarked Only', count: stats.unmarked, color: 'hover:bg-slate-50 border-slate-100 text-slate-600' }
            ].map((item) => {
              const isSelected = filterStatus === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setFilterStatus(item.id as any);
                    setIsFilterSheetOpen(false); // Quick action transition on mobile
                  }}
                  className={`p-4 border rounded-2xl text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col gap-0.5 ${
                    isSelected 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                      : `${item.color} bg-white`
                  }`}
                >
                  <span className="text-xs font-black">{item.label}</span>
                  <span className={`text-[10px] font-bold ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                    {item.count} Occupants
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </BottomSheet>

      {/* Session Bulk Actions Sheet */}
      <BottomSheet
        isOpen={isBulkSheetOpen}
        onClose={() => setIsBulkSheetOpen(false)}
        title="Session Bulk Actions"
        size="scroll"
      >
        <div className="space-y-4 py-2 animate-in fade-in duration-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Choose Batch Operation</p>
          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={() => handleBulkMarkAll('present')}
              disabled={activeSession.status === 'submitted'}
              className={`w-full p-4 border rounded-2xl text-left transition-all active:scale-[0.98] flex flex-col gap-0.5 ${
                activeSession.status === 'submitted'
                  ? 'bg-slate-50 border-slate-100 cursor-not-allowed opacity-50'
                  : 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-100/50 cursor-pointer'
              }`}
            >
              <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <Check size={14} className="text-emerald-600 font-bold" /> Mark All Filtered Present
              </span>
              <span className="text-[9px] font-bold text-emerald-600/80">Batch update active list to present state</span>
            </button>

            <button
              onClick={() => handleBulkMarkAll('absent')}
              disabled={activeSession.status === 'submitted'}
              className={`w-full p-4 border rounded-2xl text-left transition-all active:scale-[0.98] flex flex-col gap-0.5 ${
                activeSession.status === 'submitted'
                  ? 'bg-slate-50 border-slate-100 cursor-not-allowed opacity-50'
                  : 'bg-rose-50 hover:bg-rose-100/70 border-rose-100/50 cursor-pointer'
              }`}
            >
              <span className="text-xs font-black text-rose-950 flex items-center gap-1.5">
                <X size={14} className="text-rose-600 font-bold" /> Mark All Filtered Absent
              </span>
              <span className="text-[9px] font-bold text-rose-600/80">Batch update active list to absent state</span>
            </button>

            <button
              onClick={handleBulkReset}
              disabled={activeSession.status === 'submitted'}
              className={`w-full p-4 border rounded-2xl text-left transition-all active:scale-[0.98] flex flex-col gap-0.5 ${
                activeSession.status === 'submitted'
                  ? 'bg-slate-50 border-slate-100 cursor-not-allowed opacity-50'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-100 cursor-pointer'
              }`}
            >
              <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-slate-500" /> Reset Attendance Session
              </span>
              <span className="text-[9px] font-bold text-slate-400">Clear all records back to unmarked neutral draft</span>
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
