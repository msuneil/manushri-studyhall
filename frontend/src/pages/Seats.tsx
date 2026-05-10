import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import { 
  Armchair, 
  Search, 
  UserPlus, 
  Phone, 
  AlertTriangle,
  History,
  Calendar,
  IndianRupee,
  MessageCircle,
  FileText,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { seats, occupants, rooms } from '../data/mockData';

export default function Seats() {
  const { showToast } = useToast();
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeat, setSelectedSeat] = useState<any>(null);
  
  // Assignment state
  const [assignStep, setAssignStep] = useState<'search' | 'details' | 'summary'>('search');
  const [selectedOccupant, setSelectedOccupant] = useState<any>(null);
  const [assignmentData, setAssignmentData] = useState({
    plan: 'Full Day',
    joinDate: new Date().toISOString().split('T')[0],
    collectFee: false,
    notes: ''
  });

  const filteredSeats = useMemo(() => {
    return seats.filter(seat => 
      seat.roomId === selectedRoomId && 
      seat.number.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedRoomId, searchQuery]);

  const stats = useMemo(() => {
    const currentRoomSeats = seats.filter(s => s.roomId === selectedRoomId);
    return {
      total: currentRoomSeats.length,
      occupied: currentRoomSeats.filter(s => s.isOccupied).length,
      vacant: currentRoomSeats.filter(s => !s.isOccupied).length,
      overdue: currentRoomSeats.filter(s => s.isOverdue).length,
    };
  }, [selectedRoomId]);

  const handleSeatClick = (seat: any) => {
    if (seat.isOccupied) {
      const occupant = occupants.find(o => o.id === seat.occupantId);
      setSelectedSeat({ ...seat, occupant });
    } else {
      setSelectedSeat({ ...seat, isAssigning: true });
      setAssignStep('search');
    }
  };

  const handleAssignSubmit = () => {
    showToast(`Seat ${selectedSeat.number} assigned to ${selectedOccupant.name}`, 'success');
    setSelectedSeat(null);
    setSelectedOccupant(null);
    setAssignStep('search');
  };

  const closeModal = () => {
    setSelectedSeat(null);
    setSelectedOccupant(null);
    setAssignStep('search');
  };

  return (
    <div className="flex flex-col min-h-full">
      <Header 
        title="Seat Management" 
        subtitle={`${rooms.find(r => r.id === selectedRoomId)?.name} Hall`}
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Room Selection & Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm flex-1">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  selectedRoomId === room.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {room.name}
              </button>
            ))}
          </div>
          
          <div className="relative flex-[1.5]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search seat number..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm outline-none text-sm font-medium"
            />
          </div>
        </div>

        {/* Stats Strip */}
        <div className="flex items-center justify-around bg-slate-900 rounded-2xl p-4 shadow-xl">
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase">Vacant</p>
            <p className="text-lg font-black text-emerald-400">{stats.vacant}</p>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase">Occupied</p>
            <p className="text-lg font-black text-indigo-400">{stats.occupied}</p>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase">Overdue</p>
            <p className="text-lg font-black text-red-400">{stats.overdue}</p>
          </div>
        </div>

        {/* Seat Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
          {filteredSeats.map((seat) => (
            <button
              key={seat.id}
              onClick={() => handleSeatClick(seat)}
              className={`
                aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all active:scale-90
                ${seat.isOverdue 
                  ? 'bg-red-50 border-red-500 text-red-700 shadow-lg shadow-red-500/10' 
                  : seat.isOccupied 
                  ? 'bg-white border-indigo-600 text-indigo-700 shadow-lg shadow-indigo-600/10' 
                  : 'bg-emerald-50/30 border-emerald-100 text-emerald-300 hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-50'}
              `}
            >
              <Armchair size={24} strokeWidth={seat.isOccupied ? 2.5 : 2} />
              <span className="text-[10px] font-black tracking-tighter">{seat.number}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Detail Modals */}
      <Modal 
        isOpen={!!selectedSeat} 
        onClose={closeModal} 
        title={selectedSeat?.isAssigning ? 'Assign Seat' : 'Seat Details'}
        actions={
          selectedSeat?.isAssigning ? (
            <div className="flex flex-col gap-3 w-full">
              {assignStep === 'search' && (
                <button 
                  disabled={!selectedOccupant}
                  onClick={() => setAssignStep('details')}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Continue <ArrowRight size={18} />
                </button>
              )}
              {assignStep === 'details' && (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setAssignStep('search')} className="py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm">Back</button>
                  <button onClick={() => setAssignStep('summary')} className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm">Review</button>
                </div>
              )}
              {assignStep === 'summary' && (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setAssignStep('details')} className="py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm">Edit</button>
                  <button onClick={handleAssignSubmit} className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm">Assign Seat</button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 w-full">
              <button className="py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm">Vacate Seat</button>
              <button className="py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/20">Edit Details</button>
            </div>
          )
        }
      >
        {selectedSeat?.isAssigning ? (
          <div className="space-y-6">
            <div className="p-4 bg-indigo-50 rounded-3xl flex items-center justify-between border border-indigo-100">
              <div>
                <p className="text-[10px] font-black text-indigo-600 uppercase">Assigning Seat</p>
                <p className="text-2xl font-black text-slate-900">{selectedSeat.number}</p>
              </div>
              <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
                <Armchair size={32} strokeWidth={2.5} />
              </div>
            </div>

            {assignStep === 'search' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Select Occupant</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search existing or type new..." 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                  {occupants.filter(o => !o.seatId).map(occ => (
                    <button 
                      key={occ.id}
                      onClick={() => setSelectedOccupant(occ)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        selectedOccupant?.id === occ.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${selectedOccupant?.id === occ.id ? 'bg-white/20' : 'bg-slate-100'}`}>
                          {occ.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{occ.name}</p>
                          <p className={`text-[10px] ${selectedOccupant?.id === occ.id ? 'text-indigo-100' : 'text-slate-400'}`}>{occ.phone}</p>
                        </div>
                      </div>
                      <UserPlus size={18} opacity={0.5} />
                    </button>
                  ))}
                  <button className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 font-bold text-sm flex items-center justify-center gap-2">
                    <Plus size={18} /> Add New Occupant
                  </button>
                </div>
              </div>
            )}

            {assignStep === 'details' && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-lg">
                    {selectedOccupant.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Assigning To</p>
                    <p className="text-base font-black text-slate-900">{selectedOccupant.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Plan Type</label>
                    <select 
                      value={assignmentData.plan}
                      onChange={(e) => setAssignmentData({...assignmentData, plan: e.target.value})}
                      className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                    >
                      <option>Full Day</option>
                      <option>Half Day</option>
                      <option>Morning</option>
                      <option>Evening</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Joining Date</label>
                    <input 
                      type="date" 
                      value={assignmentData.joinDate}
                      onChange={(e) => setAssignmentData({...assignmentData, joinDate: e.target.value})}
                      className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Notes (Optional)</label>
                  <textarea 
                    placeholder="Add any specific instructions..."
                    value={assignmentData.notes}
                    onChange={(e) => setAssignmentData({...assignmentData, notes: e.target.value})}
                    className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium h-24 resize-none"
                  />
                </div>

                <label className="flex items-center gap-3 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl cursor-pointer active:scale-[0.98] transition-all">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${assignmentData.collectFee ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200'}`}>
                    {assignmentData.collectFee && <Check size={16} strokeWidth={3} />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={assignmentData.collectFee}
                    onChange={(e) => setAssignmentData({...assignmentData, collectFee: e.target.checked})}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-emerald-900">Collect first month fee now</p>
                    <p className="text-[10px] font-medium text-emerald-600">₹{selectedOccupant.monthlyFee} will be marked as paid</p>
                  </div>
                  <IndianRupee size={20} className="text-emerald-600 opacity-30" />
                </label>
              </div>
            )}

            {assignStep === 'summary' && (
              <div className="space-y-5">
                <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Seat</span>
                    <span className="text-xl font-black">{selectedSeat.number}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Occupant</span>
                    <span className="text-xl font-black">{selectedOccupant.name}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Plan</span>
                    <span className="text-xl font-black">{assignmentData.plan}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly Fee</span>
                    <span className="text-xl font-black text-emerald-400">₹{selectedOccupant.monthlyFee}</span>
                  </div>
                </div>

                {assignmentData.collectFee && (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800">
                    <CheckCircle2 size={24} />
                    <span className="text-sm font-bold">First month fee (₹{selectedOccupant.monthlyFee}) will be collected</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : selectedSeat?.occupant && (
          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-3xl font-black shadow-xl">
                {selectedSeat.occupant.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-2xl font-black text-slate-900 leading-none mb-2">{selectedSeat.occupant.name}</h4>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${selectedSeat.isOverdue ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {selectedSeat.number}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                    {selectedSeat.occupant.planType || 'Full Day'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-1 text-left active:scale-95 transition-all">
                <p className="text-[10px] font-black text-slate-400 uppercase">Personal Contact</p>
                <div className="flex items-center gap-2 text-slate-900">
                  <Phone size={14} className="text-indigo-600" />
                  <span className="text-sm font-bold">{selectedSeat.occupant.phone}</span>
                </div>
              </button>
              <button className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-1 text-left active:scale-95 transition-all">
                <p className="text-[10px] font-black text-slate-400 uppercase">Emergency Contact</p>
                <div className="flex items-center gap-2 text-slate-900">
                  <ShieldAlert size={14} className="text-red-600" />
                  <span className="text-sm font-bold">{selectedSeat.occupant.emergencyContact || 'Not Added'}</span>
                </div>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50/50 border-b border-slate-50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Occupancy Metrics</p>
              </div>
              <div className="p-4 grid grid-cols-2 gap-y-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Joining Date</p>
                  <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" /> {selectedSeat.occupant.joinDate}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Attendance</p>
                  <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <History size={16} className="text-indigo-600" /> {selectedSeat.occupant.attendanceRate}%
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Next Due</p>
                  <p className={`text-sm font-black flex items-center gap-2 ${selectedSeat.isOverdue ? 'text-red-600' : 'text-slate-900'}`}>
                    <AlertTriangle size={16} /> 05 May 2026
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Monthly Fee</p>
                  <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <IndianRupee size={16} className="text-emerald-600" /> ₹{selectedSeat.occupant.monthlyFee}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Actions</h5>
                <button className="text-[10px] font-black text-indigo-600 uppercase">View All</button>
              </div>
              <div className="bg-slate-50 rounded-2xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                  <MessageCircle size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-900 leading-tight">Fee reminder sent via WhatsApp</p>
                  <p className="text-[10px] font-medium text-slate-400">Today, 10:30 AM</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Notes</label>
              <div className="p-4 bg-slate-50 rounded-2xl text-xs font-medium text-slate-600 border border-dashed border-slate-200">
                {selectedSeat.occupant.notes || 'No notes added for this occupant.'}
              </div>
            </div>
            
            <button className="w-full py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-sm flex items-center justify-center gap-2">
              <FileText size={18} /> View Full Profile
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

// Sub-components used
function Plus({ size }: any) { return <span style={{ fontSize: size }}>+</span>; }
function Check({ size, strokeWidth }: any) { 
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function CheckCircle2({ size }: any) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
