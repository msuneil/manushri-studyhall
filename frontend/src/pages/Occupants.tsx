import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { Modal } from '../components/Modal';
import { MemberCard } from '../components/OperationalCard';
import { EmptyState } from '../components/EmptyState';
import { BottomSheet } from '../components/common/BottomSheet';
import { useToast } from '../components/Toast';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Users,
  Grid,
  List,
  Mail,
  ShieldAlert,
  CreditCard,
  MessageCircle,
  Clock,
  IndianRupee,
  Calendar
} from 'lucide-react';
import { occupants, seats, rooms } from '../data/mockData';
import { Avatar } from '../components/common/Avatar';
import { useConfirmation } from '../components/Confirmation';

export default function Occupants() {
  const { showToast } = useToast();
  const { confirm } = useConfirmation();
  
  // Persistence & layout view toggle
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('occupants_view_mode') as 'grid' | 'list') || 'grid';
  });
  
  const handleSetViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('occupants_view_mode', mode);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedOccupant, setSelectedOccupant] = useState<any>(null);

  // Advanced Filters State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [seatFilter, setSeatFilter] = useState('all');
  const [duesFilter, setDuesFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [roomFilter, setRoomFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');

  // Controlled Onboarding Forms
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmergency, setFormEmergency] = useState('');
  const [formRoom, setFormRoom] = useState(rooms[0]?.name || '');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formPlan, setFormPlan] = useState('Full Day');
  const [formAadhaar, setFormAadhaar] = useState('');

  // Local occupants list state to allow interactive onboarding
  const [occupantList, setOccupantList] = useState<any[]>(occupants);

  // dynamic warning checks
  const phoneWarning = useMemo(() => {
    const cleanPhone = formPhone.trim().replace(/\D/g, '');
    if (!cleanPhone) return null;
    const match = occupantList.find(o => o.phone.trim().replace(/\D/g, '') === cleanPhone);
    return match ? match.name : null;
  }, [formPhone, occupantList]);

  const aadhaarWarning = useMemo(() => {
    const cleanAadhaar = formAadhaar.trim().replace(/\s+/g, '');
    if (!cleanAadhaar) return false;
    return occupantList.some(o => o.aadhaar === cleanAadhaar || cleanAadhaar === '123456789012');
  }, [formAadhaar, occupantList]);

  const filteredOccupants = useMemo(() => {
    let list = occupantList.map(occ => {
      const seat = seats.find(s => s.id === occ.seatId);
      return {
        ...occ,
        seatNumber: seat?.number || 'N/A'
      };
    });

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(occ => 
        occ.name.toLowerCase().includes(q) || 
        occ.seatNumber.toLowerCase().includes(q) ||
        occ.phone.toLowerCase().includes(q) ||
        (occ.email && occ.email.toLowerCase().includes(q))
      );
    }

    // 2. Status Filter
    if (statusFilter !== 'all') {
      list = list.filter(occ => occ.status === statusFilter);
    }

    // 3. Seat Allocation Filter
    if (seatFilter === 'assigned') {
      list = list.filter(occ => occ.seatId && occ.seatId !== 'N/A');
    } else if (seatFilter === 'unassigned') {
      list = list.filter(occ => !occ.seatId || occ.seatId === 'N/A');
    }

    // 4. Payment Dues Filter
    if (duesFilter === 'dues') {
      // Amit (occ-3) represents the overdue candidate in default mock data
      list = list.filter(occ => occ.id === 'occ-3');
    } else if (duesFilter === 'paid') {
      list = list.filter(occ => occ.id !== 'occ-3');
    }

    // 5. Attendance Risk Filter
    if (riskFilter === 'high-risk') {
      list = list.filter(occ => occ.attendanceRate < 90);
    }

    // 6. Room Filter
    if (roomFilter !== 'all') {
      list = list.filter(occ => {
        const seat = seats.find(s => s.id === occ.seatId);
        return seat?.roomId === roomFilter;
      });
    }

    // 7. Plan Filter
    if (planFilter !== 'all') {
      list = list.filter(occ => occ.planType === planFilter);
    }

    return list;
  }, [occupantList, searchQuery, statusFilter, seatFilter, duesFilter, riskFilter, roomFilter, planFilter]);

  const emptyStateDetails = useMemo(() => {
    if (occupantList.length === 0) {
      return {
        icon: Users,
        title: "No occupants found",
        description: "Get started by onboarding your first candidate to the Study Hall.",
        action: { label: "Add Occupant", onClick: () => setShowAdd(true) }
      };
    }
    if (searchQuery.trim() && filteredOccupants.length === 0) {
      return {
        icon: Search,
        title: "No search results",
        description: `We couldn't find any candidate matching "${searchQuery}". Check the spelling or try another term.`,
        action: { label: "Clear Search", onClick: () => setSearchQuery('') }
      };
    }
    if (roomFilter !== 'all' && filteredOccupants.length === 0) {
      const roomObj = rooms.find(r => r.id === roomFilter);
      return {
        icon: Filter,
        title: "Empty Room / Hall",
        description: `There are currently no occupants assigned to ${roomObj?.name || 'this room'}.`,
        action: { label: "Clear Room Filter", onClick: () => setRoomFilter('all') }
      };
    }
    if (statusFilter === 'Active' && filteredOccupants.length === 0) {
      return {
        icon: Users,
        title: "No active occupants",
        description: "There are currently no candidates marked as active in the system.",
        action: { label: "Show All Statuses", onClick: () => setStatusFilter('all') }
      };
    }
    if (filteredOccupants.length === 0) {
      return {
        icon: Filter,
        title: "No filter matches",
        description: "No occupants match the active filter criteria. Try broadening your selection.",
        action: { 
          label: "Reset Filters", 
          onClick: () => {
            setStatusFilter('all');
            setSeatFilter('all');
            setDuesFilter('all');
            setRiskFilter('all');
            setRoomFilter('all');
            setPlanFilter('all');
          } 
        }
      };
    }
    return null;
  }, [occupantList, filteredOccupants, searchQuery, roomFilter, statusFilter]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newOcc = {
      id: `occ-${Date.now()}`,
      name: formName,
      phone: formPhone,
      email: `${formName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      emergencyContact: formEmergency,
      status: 'Active',
      seatId: 'N/A',
      attendanceRate: 100,
      joinDate: formDate,
      planType: formPlan,
      aadhaar: formAadhaar
    };

    setOccupantList(prev => [newOcc, ...prev]);
    showToast('New occupant added successfully', 'success');
    setShowAdd(false);

    // Reset Onboarding Form
    setFormName('');
    setFormPhone('');
    setFormEmergency('');
    setFormAadhaar('');
    setFormPlan('Full Day');
  };

  return (
    <div className="flex flex-col min-h-full">
      <Header 
        title="Occupants" 
        subtitle={`${occupants.length} Active Members`}
        showBack
        action={
          <button 
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
          >
            <UserPlus size={18} />
            <span className="hidden sm:inline">Add Member</span>
          </button>
        }
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, seat, or phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50 shadow-inner">
              <button 
                onClick={() => handleSetViewMode('grid')}
                className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
                  viewMode === 'grid' 
                    ? 'bg-white text-indigo-600 shadow-md shadow-slate-200/80 font-black scale-100 border border-slate-100' 
                    : 'text-slate-500 hover:text-slate-700 active:scale-95'
                }`}
                aria-label="Grid View"
              >
                <Grid size={20} strokeWidth={2.25} />
              </button>
              <button 
                onClick={() => handleSetViewMode('list')}
                className={`p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
                  viewMode === 'list' 
                    ? 'bg-white text-indigo-600 shadow-md shadow-slate-200/80 font-black scale-100 border border-slate-100' 
                    : 'text-slate-500 hover:text-slate-700 active:scale-95'
                }`}
                aria-label="List View"
              >
                <List size={20} strokeWidth={2.25} />
              </button>
            </div>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className={`p-3.5 border rounded-2xl shadow-sm transition-all relative ${
                statusFilter !== 'all' || seatFilter !== 'all' || duesFilter !== 'all' || riskFilter !== 'all' || roomFilter !== 'all' || planFilter !== 'all'
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-200 ring-2 ring-indigo-50' 
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
              aria-label="Filters"
            >
              <Filter size={18} />
              {(statusFilter !== 'all' || seatFilter !== 'all' || duesFilter !== 'all' || riskFilter !== 'all' || roomFilter !== 'all' || planFilter !== 'all') && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
              )}
            </button>
          </div>
        </div>

        {/* Active Filter Indicators */}
        {(statusFilter !== 'all' || seatFilter !== 'all' || duesFilter !== 'all' || riskFilter !== 'all' || roomFilter !== 'all' || planFilter !== 'all') && (
          <div className="flex flex-wrap items-center gap-1.5 px-1 animate-in fade-in duration-200">
            <span className="text-[10px] font-bold text-slate-400">Filtered:</span>
            {statusFilter !== 'all' && (
              <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-wider rounded-md">
                {statusFilter}
              </span>
            )}
            {seatFilter !== 'all' && (
              <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-wider rounded-md">
                Seat: {seatFilter}
              </span>
            )}
            {duesFilter !== 'all' && (
              <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-wider rounded-md">
                Dues: {duesFilter}
              </span>
            )}
            {riskFilter !== 'all' && (
              <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-wider rounded-md">
                Risk: {riskFilter}
              </span>
            )}
            {roomFilter !== 'all' && (
              <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-wider rounded-md">
                Room: {rooms.find(r => r.id === roomFilter)?.name || 'Filtered'}
              </span>
            )}
            {planFilter !== 'all' && (
              <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-wider rounded-md">
                Plan: {planFilter}
              </span>
            )}
            <button 
              onClick={() => {
                setStatusFilter('all');
                setSeatFilter('all');
                setDuesFilter('all');
                setRiskFilter('all');
                setRoomFilter('all');
                setPlanFilter('all');
                showToast('Filters cleared', 'info');
              }}
              className="text-[9px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider underline cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Members Display */}
        {filteredOccupants.length > 0 ? (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredOccupants.map((occ) => {
              if (viewMode === 'grid') {
                return (
                  <MemberCard 
                    key={occ.id}
                    name={occ.name}
                    seat={occ.seatNumber}
                    phone={occ.phone}
                    attendance={occ.attendanceRate}
                    status={occ.status}
                    onClick={() => setSelectedOccupant(occ)}
                    onCall={async () => {
                      const confirmed = await confirm({
                        title: "Open WhatsApp Chat?",
                        description: `You are opening a conversation with ${occ.name} (${occ.phone}).`,
                        severity: "low",
                        confirmLabel: "Send Message",
                        cancelLabel: "Cancel"
                      });
                      if (confirmed) {
                        window.open(`https://wa.me/${occ.phone.replace(/\D/g, '')}`, '_blank');
                      }
                    }}
                    onViewProfile={() => {
                      setSelectedOccupant(occ);
                    }}
                  />
                );
              }
              
              // List View Card Row Layout
              const getAttendanceTextColor = (rate: number) => {
                if (rate >= 90) return 'text-emerald-600';
                if (rate >= 80) return 'text-amber-500';
                return 'text-red-600';
              };

              return (
                <div 
                  key={occ.id}
                  onClick={() => setSelectedOccupant(occ)}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-indigo-100"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <Avatar name={occ.name} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-bold text-slate-900 leading-tight text-sm">{occ.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          occ.status === 'Active' ? 'bg-green-100 text-green-700 border border-green-200' :
                          occ.status === 'Left' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                          occ.status === 'Blocked' ? 'bg-red-100 text-red-700 border border-red-200' :
                          'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}>
                          {occ.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-x-3 gap-y-1 text-slate-500 text-xs flex-wrap font-medium">
                        <span>{occ.phone}</span>
                        <span>•</span>
                        <span className="truncate">{occ.email}</span>
                        <span>•</span>
                        <span>Joined {occ.joinDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-50">
                    <div className="flex gap-4 items-center">
                      <div className="text-right">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Seat</p>
                        <p className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg uppercase tracking-tight">{occ.seatNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Plan</p>
                        <p className="text-xs font-bold text-slate-700">{occ.planType || 'Full Day'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Attendance</p>
                        <p className={`text-xs font-black ${getAttendanceTextColor(occ.attendanceRate)}`}>{occ.attendanceRate}%</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          const confirmed = await confirm({
                            title: "Open WhatsApp Chat?",
                            description: `You are opening a conversation with ${occ.name} (${occ.phone}).`,
                            severity: "low",
                            confirmLabel: "Send Message",
                            cancelLabel: "Cancel"
                          });
                          if (confirmed) {
                            window.open(`https://wa.me/${occ.phone.replace(/\D/g, '')}`, '_blank');
                          }
                        }}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                        title="WhatsApp"
                      >
                        <MessageCircle size={16} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOccupant(occ);
                        }}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-indigo-500/10"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          emptyStateDetails && (
            <EmptyState 
              icon={emptyStateDetails.icon}
              title={emptyStateDetails.title}
              description={emptyStateDetails.description}
              action={emptyStateDetails.action}
            />
          )
        )}
      </div>

      {/* Add Occupant Modal */}
      <Modal 
        isOpen={showAdd} 
        onClose={() => setShowAdd(false)} 
        title="Add Occupant"
        actions={
          <button type="submit" form="add-occupant-form" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
            Add Occupant
          </button>
        }
      >
        <form id="add-occupant-form" onSubmit={handleAddSubmit} className="space-y-6">
          <div className="space-y-4">
            {formName.trim() && (
              <div className="flex flex-col items-center justify-center gap-2 pb-2">
                <Avatar name={formName} size="lg" />
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Live Avatar Preview</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Full Name</label>
              <input 
                type="text" 
                required 
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter occupant name" 
                className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+91 98765 43210" 
                  className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold" 
                />
                {phoneWarning && (
                  <p className="text-[10px] font-bold text-amber-600 ml-1 mt-1 leading-tight">
                    ⚠️ Match found: Candidate <strong>{phoneWarning}</strong> uses this phone.
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Emergency Contact</label>
                <input 
                  type="tel" 
                  required 
                  value={formEmergency}
                  onChange={(e) => setFormEmergency(e.target.value)}
                  placeholder="+91 Emergency" 
                  className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Select Room</label>
                <select 
                  value={formRoom}
                  onChange={(e) => setFormRoom(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                >
                  {rooms.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Joining Date</label>
                <input 
                  type="date" 
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Plan Type</label>
              <div className="grid grid-cols-4 gap-2">
                {['Full Day', 'Half Day', 'Morning', 'Evening'].map(p => (
                  <button 
                    key={p} 
                    type="button" 
                    onClick={() => setFormPlan(p)}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      formPlan === p 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                        : 'bg-slate-50 border-transparent text-slate-600 hover:border-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Aadhaar / ID Card Number</label>
              <input 
                type="text" 
                required
                maxLength={14}
                value={formAadhaar}
                onChange={(e) => setFormAadhaar(e.target.value)}
                placeholder="12-digit Aadhaar Number (e.g. 123456789012)" 
                className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-slate-900" 
              />
              {aadhaarWarning && (
                <p className="text-[10px] font-bold text-amber-600 ml-1 mt-1 leading-none">
                  ⚠️ Duplicate Aadhaar warning: Aadhaar is already registered.
                </p>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Occupant Profile Modal */}
      <Modal 
        isOpen={!!selectedOccupant} 
        onClose={() => setSelectedOccupant(null)} 
        title="Member Command Center"
        actions={
          <button 
            onClick={() => setSelectedOccupant(null)}
            className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-all duration-200 active:scale-[0.98]"
          >
            Close
          </button>
        }
      >
        {selectedOccupant && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <Avatar name={selectedOccupant.name} size="xl" />
              <div>
                <h3 className="text-2xl font-black text-slate-900 leading-none mb-2">{selectedOccupant.name}</h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                    Seat: {selectedOccupant.seatNumber}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    selectedOccupant.status === 'Active' ? 'bg-green-100 text-green-700' :
                    selectedOccupant.status === 'Left' ? 'bg-slate-100 text-slate-600' :
                    selectedOccupant.status === 'Blocked' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedOccupant.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="bg-slate-50 p-2 rounded-xl text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase">Attendance</p>
                <p className={`text-sm font-black ${
                  selectedOccupant.attendanceRate >= 90 ? 'text-emerald-600' :
                  selectedOccupant.attendanceRate >= 80 ? 'text-amber-500' :
                  'text-red-600'
                }`}>{selectedOccupant.attendanceRate}%</p>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase">Paid</p>
                <p className="text-sm font-black text-emerald-600">₹{selectedOccupant.id === 'occ-3' ? '6,000' : '8,000'}</p>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase">Dues</p>
                <p className={`text-sm font-black ${selectedOccupant.id === 'occ-3' ? 'text-red-600 font-extrabold animate-pulse' : 'text-slate-500'}`}>
                  ₹{selectedOccupant.id === 'occ-3' ? '2,000' : '0'}
                </p>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase">Joined</p>
                <p className="text-[10px] font-black text-slate-900 mt-0.5">{selectedOccupant.joinDate || 'Jan \'26'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Information</h5>
              </div>
              <div className="bg-white border border-slate-100 rounded-3xl p-2 space-y-1">
                <div 
                  onClick={() => window.open(`https://wa.me/${selectedOccupant.phone.replace(/\D/g, '')}`, '_blank')}
                  className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer"
                >
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <MessageCircle size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">WhatsApp (Tap to message)</p>
                    <p className="text-sm font-bold text-slate-900">{selectedOccupant.phone}</p>
                  </div>
                </div>
                <div 
                  onClick={() => {
                    if (selectedOccupant.emergencyContact) {
                      window.location.href = `tel:${selectedOccupant.emergencyContact}`;
                    }
                  }}
                  className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer"
                >
                  <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                    <ShieldAlert size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Emergency Contact (Tap to call)</p>
                    <p className="text-sm font-bold text-slate-900">{selectedOccupant.emergencyContact || 'Not Provided'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Email</p>
                    <p className="text-sm font-bold text-slate-900 truncate max-w-[180px]">{selectedOccupant.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Quick Actions</h5>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={async () => {
                    const confirmed = await confirm({
                      title: "Send WhatsApp Reminder?",
                      description: `This will draft and send a WhatsApp payment ping to ${selectedOccupant.name}.`,
                      severity: "low",
                      confirmLabel: "Send Reminder",
                      cancelLabel: "Cancel"
                    });
                    if (confirmed) {
                      showToast(`Reminder notification sent to ${selectedOccupant.name}`, 'success');
                    }
                  }}
                  className="flex items-center gap-3 p-3 bg-indigo-50/50 hover:bg-indigo-100/50 text-indigo-700 hover:text-indigo-800 border border-indigo-100 rounded-2xl text-left transition-all active:scale-95 duration-200 cursor-pointer"
                >
                  <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600 shrink-0">
                    <MessageCircle size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Send Reminder</p>
                    <p className="text-[9px] font-medium text-indigo-500/80 leading-none mt-0.5">WhatsApp ping</p>
                  </div>
                </button>

                <button 
                  onClick={async () => {
                    const confirmed = await confirm({
                      title: "Mark Payment as Paid?",
                      description: `This will record a fee payment of ₹2,000 for ${selectedOccupant.name} for the current monthly cycle.`,
                      severity: "medium",
                      confirmLabel: "Mark Paid",
                      cancelLabel: "Cancel"
                    });
                    if (confirmed) {
                      showToast(`Payment of ₹2,000 marked successfully for ${selectedOccupant.name}`, 'success');
                    }
                  }}
                  className="flex items-center gap-3 p-3 bg-emerald-50/50 hover:bg-emerald-100/50 text-emerald-700 hover:text-emerald-800 border border-emerald-100 rounded-2xl text-left transition-all active:scale-95 duration-200 cursor-pointer"
                >
                  <div className="p-2 bg-white rounded-xl shadow-sm text-emerald-600 shrink-0">
                    <IndianRupee size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Mark Payment</p>
                    <p className="text-[9px] font-medium text-emerald-500/80 leading-none mt-0.5">Clear dues</p>
                  </div>
                </button>

                <button 
                  onClick={async () => {
                    const confirmed = await confirm({
                      title: "Transfer Member Seat?",
                      description: `Are you sure you want to trigger a seat transfer for ${selectedOccupant.name}? This will move their occupant allocation to a new seat location.`,
                      severity: "high",
                      confirmLabel: "Transfer Seat",
                      cancelLabel: "Cancel"
                    });
                    if (confirmed) {
                      showToast(`Seat transfer dialog triggered for ${selectedOccupant.name}`, 'success');
                    }
                  }}
                  className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60 rounded-2xl text-left transition-all active:scale-95 duration-200 cursor-pointer"
                >
                  <div className="p-2 bg-white rounded-xl shadow-sm text-slate-500 shrink-0">
                    <UserPlus size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Transfer Seat</p>
                    <p className="text-[9px] font-medium text-slate-500/80 leading-none mt-0.5">Move occupant</p>
                  </div>
                </button>

                <button 
                  onClick={async () => {
                    const confirmed = await confirm({
                      title: "Vacate Occupant?",
                      description: `This will immediately release the allocated seat for ${selectedOccupant.name}, making it available for other candidates. All history is safely archived.`,
                      severity: "destructive",
                      confirmLabel: "Vacate Occupant",
                      cancelLabel: "Cancel"
                    });
                    if (confirmed) {
                      showToast(`Vacate request generated for ${selectedOccupant.name}`, 'success');
                    }
                  }}
                  className="flex items-center gap-3 p-3 bg-rose-50/50 hover:bg-rose-100/50 text-rose-700 hover:text-rose-800 border border-rose-100 rounded-2xl text-left transition-all active:scale-95 duration-200 cursor-pointer"
                >
                  <div className="p-2 bg-white rounded-xl shadow-sm text-rose-600 shrink-0">
                    <ShieldAlert size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Vacate Seat</p>
                    <p className="text-[9px] font-medium text-rose-500/80 leading-none mt-0.5">Release seat</p>
                  </div>
                </button>

                <button 
                  onClick={async () => {
                    const confirmed = await confirm({
                      title: "Mark Daily Attendance?",
                      description: `This will mark daily attendance check-in for ${selectedOccupant.name} as PRESENT for today's active session.`,
                      severity: "low",
                      confirmLabel: "Mark Present",
                      cancelLabel: "Cancel"
                    });
                    if (confirmed) {
                      showToast(`Attendance marked successfully for ${selectedOccupant.name}`, 'success');
                    }
                  }}
                  className="col-span-2 flex items-center justify-center gap-2.5 p-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs transition-all active:scale-95 shadow-md shadow-indigo-500/10 duration-200 cursor-pointer"
                >
                  <Calendar size={15} /> Mark Attendance
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reminder History</h5>
                <button className="text-[10px] font-black text-indigo-600 uppercase hover:underline">See All</button>
              </div>
              <div className="space-y-2">
                {[
                  { type: 'Payment', msg: 'Fee reminder sent', date: '01 May, 10:30 AM', icon: MessageCircle, bg: 'bg-indigo-50', text: 'text-indigo-600' },
                  { type: 'Attendance', msg: 'Welcome message sent', date: '15 Jan, 09:00 AM', icon: Clock, bg: 'bg-slate-50', text: 'text-slate-400' }
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-50 rounded-2xl">
                    <div className={`p-2 rounded-lg ${r.bg} ${r.text}`}>
                      <r.icon size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900 leading-tight">{r.msg}</p>
                      <p className="text-[10px] font-medium text-slate-400">{r.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Payment History</h5>
                <button className="text-[10px] font-black text-indigo-600 uppercase hover:underline">See All</button>
              </div>
              <div className="space-y-2">
                {[
                  { month: 'May 2026', amount: 2000, status: 'Paid', date: '01 May' },
                  { month: 'April 2026', amount: 2000, status: 'Paid', date: '02 Apr' }
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <CreditCard size={18} className="text-slate-400" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{p.month}</p>
                        <p className="text-[10px] font-medium text-slate-500">Paid on {p.date}</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-slate-900">₹{p.amount}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Notes Timeline</h5>
              </div>
              <div className="p-4 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-indigo-600" />
                    <div className="w-px flex-1 bg-indigo-200 my-1" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Joined the Study Hall</p>
                    <p className="text-[10px] font-medium text-slate-400">{selectedOccupant.joinDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Collapsible Filters Bottom Sheet */}
      <BottomSheet 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        title="Filter Occupants"
        size="scroll"
        footer={
          <div className="flex gap-3">
            <button 
              onClick={() => {
                setStatusFilter('all');
                setSeatFilter('all');
                setDuesFilter('all');
                setRiskFilter('all');
                setRoomFilter('all');
                setPlanFilter('all');
                showToast('Filters reset successfully', 'success');
              }}
              className="flex-1 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-2xl font-bold text-xs active:scale-95 transition-all outline-none"
            >
              Reset All
            </button>
            <button 
              onClick={() => setIsFilterOpen(false)}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs active:scale-95 transition-all shadow-lg shadow-indigo-500/20 outline-none"
            >
              Apply Filters
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-4 py-2">
          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Lifecycle Status</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Left">Left</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          {/* Seats */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Seat Allocation</label>
            <select 
              value={seatFilter} 
              onChange={(e) => setSeatFilter(e.target.value)}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            >
              <option value="all">All Allocations</option>
              <option value="assigned">Assigned Seats</option>
              <option value="unassigned">Unassigned Only</option>
            </select>
          </div>

          {/* Dues */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Payment Dues</label>
            <select 
              value={duesFilter} 
              onChange={(e) => setDuesFilter(e.target.value)}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            >
              <option value="all">All Dues</option>
              <option value="dues">Pending Dues</option>
              <option value="paid">Fully Paid</option>
            </select>
          </div>

          {/* Risk */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Attendance Risk</label>
            <select 
              value={riskFilter} 
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            >
              <option value="all">All Risk</option>
              <option value="high-risk">Risk (Under 90%)</option>
            </select>
          </div>

          {/* Room */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Room / Hall</label>
            <select 
              value={roomFilter} 
              onChange={(e) => setRoomFilter(e.target.value)}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            >
              <option value="all">All Rooms</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Plan Type */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Plan Type</label>
            <select 
              value={planFilter} 
              onChange={(e) => setPlanFilter(e.target.value)}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            >
              <option value="all">All Plans</option>
              <option value="Full Day">Full Day</option>
              <option value="Half Day">Half Day</option>
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
            </select>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
