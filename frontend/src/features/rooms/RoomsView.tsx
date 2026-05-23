import { useState, useMemo } from 'react';
import { Header } from '../../components/Header';
import { Plus, LayoutGrid } from 'lucide-react';
import { RoomCard } from './components/RoomCard';
import { AddRoomSheet } from './sheets/AddRoomSheet';
import { RoomDetailsSheet } from './sheets/RoomDetailsSheet';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../components/Toast';
import { useConfirmation } from '../../components/Confirmation';
import { useData } from '../../contexts/DataContext';
import type { Room, RoomStatus } from './types';
import { SkeletonCards } from '../../components/common/SkeletonLoader';

export function RoomsView() {
  const { showToast } = useToast();
  const { confirm } = useConfirmation();
  
  // Connect to live repository subscriptions orchestrator
  const { rooms: dbRooms, seats, occupants, payments, updateRoom, loading } = useData();

  // Enriched rooms computed reactively from related collection states
  const rooms = useMemo(() => {
    return dbRooms.map(room => {
      const roomSeats = seats.filter(s => s.roomId === room.id);
      const totalSeats = roomSeats.length;
      const occupiedSeats = roomSeats.filter(s => s.isOccupied).length;

      const isAC = room.type.toLowerCase().includes('ac') && !room.type.toLowerCase().includes('non-ac');
      const pricingPreview = isAC ? '₹2000/month' : '₹1500/month';
      const rulesPreview = isAC ? ['Silent Zone', 'Laptop Only'] : ['Discussion Allowed'];

      const roomOccupants = occupants.filter(o => {
        const seat = seats.find(s => s.id === o.seatId);
        return seat && seat.roomId === room.id;
      });
      const roomOccupantIds = roomOccupants.map(o => o.id);
      
      const roomPayments = payments.filter(p => roomOccupantIds.includes(p.occupantId) && p.month === 'May 2026');
      const revenueCollected = roomPayments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
      const revenueExpected = roomPayments.reduce((sum, p) => sum + p.amount, 0);

      const status = (room as any).status || 'Active';
      const seatPrefix = (room as any).seatPrefix || (isAC ? 'AC' : 'NAC');
      const genderRestriction = (room as any).genderRestriction || 'Mixed';
      const notes = (room as any).notes || '';
      
      return {
        id: room.id,
        name: room.name,
        type: room.type,
        status,
        pricingPreview,
        rulesPreview,
        revenueCollected,
        revenueExpected: revenueExpected || (totalSeats * (isAC ? 2000 : 1500)),
        totalSeats,
        occupiedSeats,
        seatPrefix,
        genderRestriction,
        notes
      } as Room;
    });
  }, [dbRooms, seats, occupants, payments]);
  
  // Sheet states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeRoomDetails, setActiveRoomDetails] = useState<Room | null>(null);
  const [activeRoomEdit, setActiveRoomEdit] = useState<Room | null>(null);

  const activeRoomDetailsEnriched = useMemo(() => {
    if (!activeRoomDetails) return null;
    return rooms.find(r => r.id === activeRoomDetails.id) || null;
  }, [activeRoomDetails, rooms]);

  const handleSaveRoom = () => {
    showToast('Room saved successfully', 'success');
    setIsAddOpen(false);
    setActiveRoomEdit(null);
  };

  const handleStatusTransition = async (room: Room, newStatus: RoomStatus) => {
    if (newStatus === 'Inactive') {
      const confirmed = await confirm({
        title: "Deactivate Room?",
        description: `Are you sure you want to deactivate ${room.name}? Existing occupants continue normally, but all new seat assignments will be blocked.`,
        severity: "destructive",
        confirmLabel: "Deactivate",
        cancelLabel: "Cancel"
      });
      if (confirmed) {
        executeStatusTransition(room.id, 'Inactive');
      }
    } else if (newStatus === 'Maintenance') {
      const confirmed = await confirm({
        title: "Put Room in Maintenance?",
        description: `This will place ${room.name} in Maintenance. New seat allocations will be blocked until returned to Active.`,
        severity: "high",
        confirmLabel: "Maintenance Mode",
        cancelLabel: "Cancel"
      });
      if (confirmed) {
        executeStatusTransition(room.id, 'Maintenance');
      }
    } else {
      executeStatusTransition(room.id, newStatus);
    }
  };

  const executeStatusTransition = async (roomId: string, newStatus: RoomStatus) => {
    try {
      await updateRoom(roomId, { status: newStatus } as any);
      
      if (newStatus === 'Active') {
        showToast('Room is now Active and open for assignments', 'success');
      } else if (newStatus === 'Maintenance') {
        showToast('Room marked in Maintenance. New assignments blocked.', 'info');
      } else if (newStatus === 'Inactive') {
        showToast('Room Deactivated successfully', 'success');
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to update room status.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
        <Header title="Study Halls" subtitle="Syncing room layouts..." />
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6 animate-in fade-in duration-300">
          <SkeletonCards count={2} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header 
        title="Study Halls" 
        subtitle="Manage Room Types"
        action={
          <button 
            onClick={() => { setActiveRoomEdit(null); setIsAddOpen(true); }}
            className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
            aria-label="Add Room"
          >
            <Plus size={20} />
          </button>
        }
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6 pb-32">
        {rooms.length === 0 ? (
          <EmptyState 
            icon={LayoutGrid}
            title="No Rooms Yet"
            description="Create your first study hall room to start managing seat allocations."
            action={
              <button 
                onClick={() => { setActiveRoomEdit(null); setIsAddOpen(true); }}
                className="w-full py-4 bg-indigo-600 text-white rounded-[1.25rem] text-sm font-black uppercase tracking-wider shadow-xl shadow-indigo-500/30 active:scale-[0.98] transition-all mt-4"
              >
                Create Room
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms.map(room => (
              <RoomCard 
                key={room.id}
                room={room}
                onEdit={(r) => { setActiveRoomEdit(r); setIsAddOpen(true); }}
                onViewDetails={setActiveRoomDetails}
                onStatusTransition={handleStatusTransition}
              />
            ))}
          </div>
        )}
      </div>

      <AddRoomSheet 
        isOpen={isAddOpen} 
        onClose={() => { setIsAddOpen(false); setActiveRoomEdit(null); }}
        onSave={handleSaveRoom}
        room={activeRoomEdit}
      />

      <RoomDetailsSheet 
        isOpen={!!activeRoomDetailsEnriched}
        room={activeRoomDetailsEnriched}
        onClose={() => setActiveRoomDetails(null)}
        onEdit={(r) => {
          setActiveRoomDetails(null);
          setActiveRoomEdit(r);
          setTimeout(() => setIsAddOpen(true), 300);
        }}
        onStatusTransition={handleStatusTransition}
      />
    </div>
  );
}
