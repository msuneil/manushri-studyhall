import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '../../components/Header';
import { useToast } from '../../components/Toast';
import { SeatCard } from './components/SeatCard';
import { SeatFilters } from './components/SeatFilters';
import { SeatDetailsSheet } from './sheets/SeatDetailsSheet';
import { AssignSeatSheet } from './sheets/AssignSeatSheet';
import { NewOccupantSheet } from './sheets/NewOccupantSheet';
import { useConfirmation } from '../../components/Confirmation';
import { useData } from '../../contexts/DataContext';
import type { Seat, Occupant, ActivityEvent } from './types';

const isAllocationBlocked = (status: string): boolean => {
  return status === 'Maintenance' || status === 'Inactive';
};

export function SeatsView() {
  const location = useLocation();
  const { showToast } = useToast();
  const { confirm } = useConfirmation();

  // Connect to live repository subscriptions orchestrator
  const { 
    rooms: dbRooms, 
    seats: dbSeats, 
    occupants: dbOccupants, 
    payments,
    attendanceSessions,
    updateSeat, 
    updateOccupant, 
    createOccupant, 
    saveAttendanceSession,
    loading 
  } = useData();

  // Enriched rooms computed from DB
  const rooms = useMemo(() => {
    return dbRooms.map(room => {
      const isAC = room.type.toLowerCase().includes('ac') && !room.type.toLowerCase().includes('non-ac');
      const status = (room as any).status || 'Active';
      const seatPrefix = (room as any).seatPrefix || (isAC ? 'AC' : 'NAC');
      
      return {
        id: room.id,
        name: room.name,
        type: room.type,
        status,
        seatPrefix,
      };
    });
  }, [dbRooms]);

  // Pre-filter room if navigated with state context (from RoomCard click)
  const initialRoomId = useMemo(() => {
    if (location.state?.roomId) {
      const exists = rooms.some(r => r.id === location.state.roomId);
      if (exists) return location.state.roomId;
    }
    return rooms[0]?.id || '';
  }, [location.state, rooms]);

  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [roomTypeFilter, setRoomTypeFilter] = useState<'All' | 'AC' | 'Non-AC' | 'Premium'>('All');

  // Sync selectedRoomId if the list updates and selectedRoomId is empty
  useEffect(() => {
    if (rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

  // Filter rooms based on type for scalable room navigation
  const filteredRooms = useMemo(() => {
    if (roomTypeFilter === 'All') return rooms;
    if (roomTypeFilter === 'AC') {
      return rooms.filter(r => r.seatPrefix === 'AC' || (r.type.includes('AC') && !r.type.includes('Non-AC')));
    }
    if (roomTypeFilter === 'Non-AC') {
      return rooms.filter(r => r.seatPrefix === 'NAC' || r.type.includes('Non-AC'));
    }
    if (roomTypeFilter === 'Premium') {
      return rooms.filter(r => r.seatPrefix === 'PRM' || r.type.includes('Premium'));
    }
    return rooms;
  }, [rooms, roomTypeFilter]);

  // If filtered rooms changes and current room is hidden, auto-select first visible room
  useEffect(() => {
    if (filteredRooms.length > 0 && !filteredRooms.some(r => r.id === selectedRoomId)) {
      setSelectedRoomId(filteredRooms[0].id);
    }
  }, [filteredRooms, selectedRoomId]);

  // Enriched active occupants with dynamic billing/attendance details
  const occupants = useMemo(() => {
    return dbOccupants.map(o => {
      const occPayments = payments.filter(p => p.occupantId === o.id);
      const activeMonthPayment = occPayments.find(p => p.month === 'May 2026');
      
      const paymentStatus = activeMonthPayment ? (activeMonthPayment.status as any) : 'Pending';
      const lastPaymentDate = occPayments.filter(p => p.status === 'Paid')[0]?.paidDate || 'N/A';

      const occSessions = attendanceSessions.filter(s => s.records[o.id]?.status === 'Present');
      const lastAttendanceDate = occSessions[0]?.date || 'N/A';

      return {
        ...o,
        paymentStatus: paymentStatus === 'Paid' ? 'Paid' : paymentStatus === 'Overdue' ? 'Overdue' : 'Pending',
        lastPaymentDate,
        lastAttendanceDate,
        attendanceTrend: 'Stable' as const
      } as Occupant;
    });
  }, [dbOccupants, payments, attendanceSessions]);

  // Map database seats to types
  const seats = useMemo(() => {
    return dbSeats.map(s => ({
      id: s.id,
      number: s.number,
      roomId: s.roomId,
      isOccupied: s.isOccupied,
      isOverdue: s.isOverdue,
      isReserved: s.isReserved,
      occupantId: s.occupantId
    } as Seat));
  }, [dbSeats]);

  // Interactive local activity events for session timeline
  const [timelineEvents, setTimelineEvents] = useState<Record<string, ActivityEvent[]>>({});

  // Active sheets overlays
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNewOccupantOpen, setIsNewOccupantOpen] = useState(false);

  // Get current room status
  const currentRoom = useMemo(() => {
    return rooms.find(r => r.id === selectedRoomId) || rooms[0];
  }, [selectedRoomId, rooms]);

  const currentRoomStatus = currentRoom?.status || 'Active';
  const isRoomBlocked = isAllocationBlocked(currentRoomStatus);

  // Synchronized seat query listing
  const filteredSeats = useMemo(() => {
    let list = seats.filter(s => s.roomId === selectedRoomId);

    // Search query
    if (searchQuery.trim()) {
      list = list.filter(s => s.number.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Advanced tab filter mapping
    if (activeFilter === 'vacant') {
      list = list.filter(s => !s.isOccupied && !isRoomBlocked);
    } else if (activeFilter === 'occupied') {
      list = list.filter(s => s.isOccupied);
    } else if (activeFilter === 'overdue') {
      list = list.filter(s => s.isOverdue);
    } else if (activeFilter === 'blocked') {
      list = list.filter(() => isRoomBlocked);
    }

    // Sort seats numerically/alphabetically
    return list.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
  }, [seats, selectedRoomId, searchQuery, activeFilter, isRoomBlocked]);

  // Statistics calculation
  const stats = useMemo(() => {
    const currentRoomSeats = seats.filter(s => s.roomId === selectedRoomId);
    return {
      total: currentRoomSeats.length,
      occupied: currentRoomSeats.filter(s => s.isOccupied).length,
      vacant: currentRoomSeats.filter(s => !s.isOccupied && !isRoomBlocked).length,
      overdue: currentRoomSeats.filter(s => s.isOverdue).length,
      blocked: isRoomBlocked ? currentRoomSeats.length : 0
    };
  }, [seats, selectedRoomId, isRoomBlocked]);

  // Handles clicking a seat
  const handleSeatClick = (seat: Seat) => {
    setSelectedSeat(seat);
    if (seat.isOccupied) {
      setIsDetailsOpen(true);
    } else {
      if (isRoomBlocked) {
        showToast(`Cannot allocate seat. ${currentRoom.name} is in ${currentRoomStatus} state.`, 'error');
      } else {
        setIsAssignOpen(true);
      }
    }
  };

  // Occupant of the currently selected seat
  const selectedOccupant = useMemo(() => {
    if (!selectedSeat || !selectedSeat.occupantId) return null;
    return occupants.find(o => o.id === selectedSeat.occupantId) || null;
  }, [selectedSeat, occupants]);

  // Activity events of the occupant
  const occupantTimeline = useMemo(() => {
    if (!selectedOccupant) return [];
    return timelineEvents[selectedOccupant.id] || [];
  }, [selectedOccupant, timelineEvents]);

  // Operational transition handlers
  const handleAssignSeat = async (occupantId: string, data: any) => {
    if (!selectedSeat) return;

    const occ = occupants.find(o => o.id === occupantId);
    const occName = occ ? occ.name : 'this member';

    const confirmed = await confirm({
      title: "Confirm Seat Assignment?",
      description: `You are assigning Seat ${selectedSeat.number} to ${occName} on a ${data.plan || 'Full Day'} plan.`,
      severity: "medium",
      confirmLabel: "Assign Seat",
      cancelLabel: "Cancel"
    });

    if (!confirmed) return;

    try {
      await updateSeat(selectedSeat.id, { 
        isOccupied: true, 
        occupantId 
      });

      await updateOccupant(occupantId, {
        seatId: selectedSeat.id,
        planType: data.plan,
        joinDate: data.joinDate,
        notes: data.notes || ''
      });

      const checkInEvent: ActivityEvent = {
        id: `ev_${Date.now()}`,
        title: `Assigned seat ${selectedSeat.number}`,
        timestamp: 'Just Now',
        type: 'System',
        details: `Plan: ${data.plan}. Joined: ${data.joinDate}.`
      };

      setTimelineEvents(prev => ({
        ...prev,
        [occupantId]: [checkInEvent, ...(prev[occupantId] || [])]
      }));

      showToast(`Seat ${selectedSeat.number} successfully assigned!`, 'success');
      setIsAssignOpen(false);
      setSelectedSeat(null);
    } catch (e) {
      console.error(e);
      showToast('Failed to assign seat.', 'error');
    }
  };

  const handleAddNewOccupant = async (newOccupant: any) => {
    const confirmed = await confirm({
      title: "Register New Member?",
      description: `Are you sure you want to create a new profile for ${newOccupant.name}?`,
      severity: "medium",
      confirmLabel: "Create Profile",
      cancelLabel: "Cancel"
    });

    if (!confirmed) return;

    try {
      const occupantData = {
        name: newOccupant.name,
        seatId: '', 
        phone: newOccupant.phone,
        email: newOccupant.email || '',
        joinDate: newOccupant.joinDate || new Date().toISOString().split('T')[0],
        status: 'Active' as const,
        attendanceRate: 100,
        monthlyFee: newOccupant.monthlyFee ? parseInt(newOccupant.monthlyFee, 10) : 2000,
        planType: newOccupant.planType || 'Full Day',
        emergencyContact: newOccupant.emergencyContact || '',
        notes: newOccupant.notes || ''
      };

      await createOccupant(occupantData);
      showToast(`Profile for ${newOccupant.name} created!`, 'success');
      setIsNewOccupantOpen(false);
    } catch (e) {
      console.error(e);
      showToast('Failed to register member.', 'error');
    }
  };

  const handleVacateSeat = async (seatId: string) => {
    const seatToVacate = seats.find(s => s.id === seatId);
    if (!seatToVacate) return;

    const occId = seatToVacate.occupantId;
    const occ = occupants.find(o => o.id === occId);
    const occName = occ ? occ.name : 'the occupant';

    const confirmed = await confirm({
      title: "Vacate Seat?",
      description: `Are you sure you want to vacate Seat ${seatToVacate.number}? This will immediately release the seat from ${occName} and make it vacant.`,
      severity: "destructive",
      confirmLabel: "Vacate Seat",
      cancelLabel: "Cancel"
    });

    if (!confirmed) return;

    try {
      await updateSeat(seatId, { 
        isOccupied: false, 
        isOverdue: false, 
        occupantId: ''
      });

      if (occId) {
        await updateOccupant(occId, {
          seatId: ''
        });

        const archiveEvent: ActivityEvent = {
          id: `ev_${Date.now()}`,
          title: `Vacated seat ${seatToVacate.number}`,
          timestamp: 'Just Now',
          type: 'System',
          details: 'Seat cleared. History preserved for safety.'
        };

        setTimelineEvents(prev => ({
          ...prev,
          [occId]: [archiveEvent, ...(prev[occId] || [])]
        }));
      }

      showToast(`Seat ${seatToVacate.number} is now Vacant`, 'success');
      setIsDetailsOpen(false);
      setSelectedSeat(null);
    } catch (e) {
      console.error(e);
      showToast('Failed to vacate seat.', 'error');
    }
  };

  const handleMarkAttendance = async (occupantId: string) => {
    const target = occupants.find(o => o.id === occupantId);
    if (!target) return;

    const confirmed = await confirm({
      title: "Mark Daily Attendance?",
      description: `This will mark daily attendance check-in for ${target.name} as PRESENT for today's active session.`,
      severity: "low",
      confirmLabel: "Mark Present",
      cancelLabel: "Cancel"
    });

    if (!confirmed) return;

    try {
      const todayDateStr = new Date().toISOString().split('T')[0];
      const todaysSession = attendanceSessions.find(s => s.date === todayDateStr);
      const currentRecords = todaysSession ? todaysSession.records : {};
      
      const updatedRecords = {
        ...currentRecords,
        [occupantId]: {
          occupantId,
          status: 'Present' as any,
          markedAt: new Date().toISOString(),
          markedBy: 'Operator'
        }
      };

      await saveAttendanceSession(todayDateStr, todaysSession?.isSubmitted || false, updatedRecords);

      const event: ActivityEvent = {
        id: `ev_${Date.now()}`,
        title: 'Attendance marked: PRESENT',
        timestamp: 'Just Now',
        type: 'Attendance',
        details: `Check-in recorded: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
      };

      setTimelineEvents(prev => ({
        ...prev,
        [occupantId]: [event, ...(prev[occupantId] || [])]
      }));

      showToast(`Attendance marked successfully for ${target.name}`, 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to record attendance.', 'error');
    }
  };

  const handleSendReminder = async (occupantId: string) => {
    const target = occupants.find(o => o.id === occupantId);
    if (!target) return;

    const confirmed = await confirm({
      title: "Send WhatsApp Reminder?",
      description: `This will draft and send a WhatsApp payment reminder message to ${target.name}.`,
      severity: "low",
      confirmLabel: "Send Reminder",
      cancelLabel: "Cancel"
    });

    if (!confirmed) return;

    // Find if there is an overdue payment
    const occPayments = payments.filter(p => p.occupantId === occupantId && p.status === 'Overdue');
    const activePayment = occPayments[0] || payments.find(p => p.occupantId === occupantId);
    
    if (activePayment) {
      const seat = seats.find(s => s.id === target.seatId);
      const reminderText = `Hi ${target.name}, this is a reminder for your study hall seat ${seat?.number || 'N/A'} for the month of ${activePayment.month}. Pending dues: ₹${activePayment.amount}. Please clear at your earliest convenience.`;
      
      let phone = target.phone || '';
      phone = phone.replace(/[^0-9]/g, '');
      if (phone.length === 10) phone = `91${phone}`;
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(reminderText)}`, '_blank');
    }

    const event: ActivityEvent = {
      id: `ev_${Date.now()}`,
      title: 'Payment reminder warning sent via WhatsApp',
      timestamp: 'Just Now',
      type: 'Reminder',
      details: `Dispatched message to registered mobile: ${target.phone}`
    };

    setTimelineEvents(prev => ({
      ...prev,
      [occupantId]: [event, ...(prev[occupantId] || [])]
    }));

    showToast(`WhatsApp reminder opened for ${target.name}!`, 'success');
  };

  const handleUpdateNotes = async (occupantId: string, notes: string) => {
    try {
      await updateOccupant(occupantId, { notes });
      showToast('Operational notes updated', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to update notes.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF8F5] space-y-4">
        <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-amber-800/60 font-serif text-sm tracking-wide">Orchestrating seat map...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header 
        title="Seat Management" 
        subtitle={`${currentRoom?.name || 'Study Hall'} - ${currentRoomStatus} Mode`}
        showBack
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6 pb-32">
        {/* Room Type Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200/60 rounded-3xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filter Halls by Type</p>
          <div className="flex bg-slate-200/50 p-1 rounded-2xl border border-slate-200/60 self-start sm:self-auto overflow-x-auto scrollbar-hide">
            {(['All', 'AC', 'Non-AC', 'Premium'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setRoomTypeFilter(type)}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  roomTypeFilter === type 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Room Selection Tabs */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto scrollbar-hide shrink-0">
          {filteredRooms.length === 0 ? (
            <div className="flex-1 text-center py-3 text-xs font-black text-slate-400 uppercase">No matching halls found</div>
          ) : (
            filteredRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => {
                  setSelectedRoomId(room.id);
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className={`flex-1 min-w-[90px] py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                  selectedRoomId === room.id 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {room.name}
              </button>
            ))
          )}
        </div>

        {/* Warning card for blocked room allocation */}
        {isRoomBlocked && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-3xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <span className="p-2 bg-amber-100 text-amber-700 rounded-xl font-bold text-lg leading-none shrink-0">⚠️</span>
            <div className="text-xs font-bold text-amber-800 leading-normal">
              {currentRoomStatus === 'Maintenance' 
                ? 'Hall C is in Maintenance Mode. New assignments are temporarily blocked while existing occupants continue normally.'
                : `This room is Inactive. Allocations and seat assignment actions are blocked.`
              }
            </div>
          </div>
        )}

        {/* Statistics Banner */}
        <div className="flex items-center justify-around bg-slate-900 rounded-3xl p-5 shadow-xl text-white">
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vacant</p>
            <p className="text-xl font-black text-emerald-400 mt-1">{stats.vacant}</p>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Occupied</p>
            <p className="text-xl font-black text-indigo-400 mt-1">{stats.occupied}</p>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overdue</p>
            <p className="text-xl font-black text-red-400 mt-1">{stats.overdue}</p>
          </div>
          {isRoomBlocked && (
            <>
              <div className="w-px h-8 bg-slate-800" />
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentRoomStatus}</p>
                <p className="text-xl font-black text-amber-400 mt-1">{stats.blocked}</p>
              </div>
            </>
          )}
        </div>

        {/* Modular Search & Filter tabs */}
        <SeatFilters 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          blockedLabel={currentRoomStatus !== 'Active' ? currentRoomStatus : undefined}
        />

        {/* Seat Cards Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 md:gap-4">
          {filteredSeats.map((seat) => (
            <SeatCard 
              key={seat.id}
              seat={seat}
              roomStatus={currentRoomStatus}
              onClick={handleSeatClick}
            />
          ))}
        </div>
      </div>

      {/* Sheets Drawers */}
      <SeatDetailsSheet 
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedSeat(null);
        }}
        seat={selectedSeat}
        occupant={selectedOccupant}
        timeline={occupantTimeline}
        onVacate={handleVacateSeat}
        onMarkAttendance={handleMarkAttendance}
        onSendReminder={handleSendReminder}
        onUpdateNotes={handleUpdateNotes}
      />

      <AssignSeatSheet 
        isOpen={isAssignOpen}
        onClose={() => {
          setIsAssignOpen(false);
          setSelectedSeat(null);
        }}
        seat={selectedSeat}
        occupants={occupants.filter(o => !seats.some(s => s.isOccupied && s.occupantId === o.id))}
        onAssign={handleAssignSeat}
        onTriggerAddNewOccupant={() => setIsNewOccupantOpen(true)}
      />

      <NewOccupantSheet 
        isOpen={isNewOccupantOpen}
        onClose={() => setIsNewOccupantOpen(false)}
        onAdd={handleAddNewOccupant}
      />
    </div>
  );
}
