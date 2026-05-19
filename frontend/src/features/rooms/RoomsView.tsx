import { useState } from 'react';
import { Header } from '../../components/Header';
import { Plus, LayoutGrid } from 'lucide-react';
import { RoomCard } from './components/RoomCard';
import { AddRoomSheet } from './sheets/AddRoomSheet';
import { RoomDetailsSheet } from './sheets/RoomDetailsSheet';
import { EmptyState } from '../../components/common/EmptyState';
import { useToast } from '../../components/Toast';
import { mockRooms } from './mock/roomsData';
import type { Room, RoomStatus } from './types';
import { useConfirmation } from '../../components/Confirmation';

export function RoomsView() {
  const { showToast } = useToast();
  const { confirm } = useConfirmation();
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  
  // Sheet states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeRoomDetails, setActiveRoomDetails] = useState<Room | null>(null);
  const [activeRoomEdit, setActiveRoomEdit] = useState<Room | null>(null);

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

  const executeStatusTransition = (roomId: string, newStatus: RoomStatus) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: newStatus } : r));
    
    // Update active details overlay if it is currently viewing the modified room
    setActiveRoomDetails(prev => prev && prev.id === roomId ? { ...prev, status: newStatus } : prev);

    if (newStatus === 'Active') {
      showToast('Room is now Active and open for assignments', 'success');
    } else if (newStatus === 'Maintenance') {
      showToast('Room marked in Maintenance. New assignments blocked.', 'info');
    } else if (newStatus === 'Inactive') {
      showToast('Room Deactivated successfully', 'success');
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <Header 
        title="Study Halls" 
        subtitle="Manage Room Types"
        action={
          <button 
            onClick={() => setIsAddOpen(true)}
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
                onClick={() => setIsAddOpen(true)}
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
        onClose={() => setIsAddOpen(false)}
        onSave={handleSaveRoom}
      />

      <RoomDetailsSheet 
        isOpen={!!activeRoomDetails}
        room={activeRoomDetails}
        onClose={() => setActiveRoomDetails(null)}
        onEdit={(r) => {
          setActiveRoomDetails(null);
          setActiveRoomEdit(r);
          setTimeout(() => setIsAddOpen(true), 300);
        }}
        onStatusTransition={handleStatusTransition}
      />
      {activeRoomEdit && <div className="hidden" aria-hidden="true">{activeRoomEdit.id}</div>}
    </div>
  );
}
