import { Header } from '../components/Header';
import { Modal } from '../components/Modal';
import { DoorOpen, Wind, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export function Rooms() {
  const [showAddRoom, setShowAddRoom] = useState(false);
  const navigate = useNavigate();

  const rooms = [
    {
      id: 1,
      type: 'AC',
      capacity: 50,
      occupied: 38,
      vacant: 12,
      icon: Wind,
      color: 'indigo',
    },
    {
      id: 2,
      type: 'Non-AC',
      capacity: 50,
      occupied: 29,
      vacant: 21,
      icon: DoorOpen,
      color: 'emerald',
    },
  ];

  const handleViewSeats = (roomType: string) => {
    navigate('/seats', { state: { roomType } });
  };

  return (
    <div className="min-h-screen">
      <Header title="Rooms" />

      <div className="p-4 md:p-8">
        <div className="mb-4 md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-slate-900">All Rooms</h3>
            <p className="text-sm text-slate-600 mt-1">Manage study hall rooms</p>
          </div>
          <button
            onClick={() => setShowAddRoom(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm active:scale-95"
          >
            <Plus size={18} />
            Add Room
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                    {room.type} Hall
                  </h3>
                  <p className="text-sm text-slate-600">
                    Total Capacity: {room.capacity} seats
                  </p>
                </div>
                <div className={`bg-${room.color}-100 p-4 rounded-xl`}>
                  <room.icon size={32} className={`text-${room.color}-600`} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-600 mb-1">Total</p>
                  <p className="text-2xl font-semibold text-slate-900">{room.capacity}</p>
                </div>
                <div className={`bg-${room.color}-50 rounded-xl p-4`}>
                  <p className="text-xs text-slate-600 mb-1">Occupied</p>
                  <p className={`text-2xl font-semibold text-${room.color}-600`}>{room.occupied}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-xs text-slate-600 mb-1">Vacant</p>
                  <p className="text-2xl font-semibold text-green-600">{room.vacant}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700">Occupancy Rate</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {Math.round((room.occupied / room.capacity) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`bg-${room.color}-600 h-3 rounded-full transition-all duration-500`}
                    style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => handleViewSeats(room.type)}
                className={`w-full bg-${room.color}-600 hover:bg-${room.color}-700 text-white px-4 py-3 rounded-xl font-medium transition-colors shadow-sm active:scale-95`}
              >
                View Seats
              </button>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={showAddRoom}
        onClose={() => setShowAddRoom(false)}
        title="Add New Room"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Room Type</label>
            <select className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
              <option>AC</option>
              <option>Non-AC</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Room Name</label>
            <input
              type="text"
              placeholder="e.g., AC Hall 1"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Number of Seats</label>
            <input
              type="number"
              placeholder="50"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Price Per Seat</label>
            <input
              type="number"
              placeholder="2000"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Rules</label>
            <textarea
              rows={4}
              placeholder="Enter room rules and guidelines..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowAddRoom(false)}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
              Add Room
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
