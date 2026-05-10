import { Header } from '../components/Header';
import { Modal } from '../components/Modal';
import { Armchair, Check, AlertTriangle, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'react-router';

export function Seats() {
  const location = useLocation();
  const initialRoom = location.state?.roomType || 'AC';
  const [selectedRoom, setSelectedRoom] = useState<'AC' | 'Non-AC'>(initialRoom);
  const [selectedSeat, setSelectedSeat] = useState<any>(null);
  const [assignModal, setAssignModal] = useState<any>(null);

  const generateSeats = (prefix: string, total: number, occupiedCount: number, overdueCount: number) => {
    const seats = [];
    const occupiedIndices = new Set(
      Array.from({ length: occupiedCount }, (_, i) => i)
    );
    const overdueIndices = new Set(
      Array.from({ length: overdueCount }, (_, i) => occupiedCount + i)
    );

    for (let i = 1; i <= total; i++) {
      const isOccupied = occupiedIndices.has(i - 1);
      const isOverdue = overdueIndices.has(i - 1);
      seats.push({
        number: `${prefix}-${String(i).padStart(2, '0')}`,
        isOccupied: isOccupied || isOverdue,
        isOverdue,
        occupant: isOccupied || isOverdue ? {
          name: `Student ${i}`,
          phone: `+91 98765 432${String(i).padStart(2, '0')}`,
          joinDate: '2026-01-15',
          feeStatus: isOverdue ? 'Overdue' : 'Paid',
          attendance: 85 + Math.floor(Math.random() * 15)
        } : null,
      });
    }
    return seats;
  };

  const acSeats = generateSeats('AC', 50, 35, 3);
  const nonAcSeats = generateSeats('NAC', 50, 26, 3);

  const currentSeats = selectedRoom === 'AC' ? acSeats : nonAcSeats;
  const occupiedCount = currentSeats.filter(s => s.isOccupied).length;
  const vacantCount = currentSeats.length - occupiedCount;

  return (
    <div className="min-h-screen">
      <Header title="Seats" />

      <div className="p-4 md:p-8">
        <div className="mb-4 md:mb-6 flex gap-2 md:gap-4">
          <button
            onClick={() => setSelectedRoom('AC')}
            className={`flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl font-medium transition-all ${
              selectedRoom === 'AC'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
            }`}
          >
            AC Hall
          </button>
          <button
            onClick={() => setSelectedRoom('Non-AC')}
            className={`flex-1 md:flex-none px-4 md:px-6 py-3 rounded-xl font-medium transition-all ${
              selectedRoom === 'Non-AC'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
            }`}
          >
            Non-AC Hall
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200 mb-4 md:mb-6">
          <div className="flex flex-wrap items-center gap-4 md:gap-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-slate-700">Vacant ({vacantCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-indigo-600 rounded"></div>
              <span className="text-sm text-slate-700">Occupied ({occupiedCount})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-slate-700">Overdue Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 md:gap-4">
          {currentSeats.map((seat) => (
            <button
              key={seat.number}
              onClick={() => seat.isOccupied ? setSelectedSeat(seat) : setAssignModal(seat)}
              className={`relative rounded-xl md:rounded-2xl p-3 md:p-4 border-2 transition-all duration-200 active:scale-95 ${
                seat.isOverdue
                  ? 'bg-red-50 border-red-500 hover:shadow-lg hover:shadow-red-500/20'
                  : seat.isOccupied
                  ? 'bg-indigo-50 border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20'
                  : 'bg-green-50 border-green-500 hover:shadow-lg hover:shadow-green-500/20'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <Armchair
                  size={24}
                  className={seat.isOverdue ? 'text-red-600' : seat.isOccupied ? 'text-indigo-600' : 'text-green-600'}
                />
                <span className={`text-xs md:text-sm font-semibold ${
                  seat.isOverdue ? 'text-red-900' : seat.isOccupied ? 'text-indigo-900' : 'text-green-900'
                }`}>
                  {seat.number}
                </span>
                {seat.isOccupied && (
                  <div className={`absolute top-1 right-1 w-5 h-5 md:w-6 md:h-6 ${seat.isOverdue ? 'bg-red-600' : 'bg-indigo-600'} rounded-full flex items-center justify-center`}>
                    {seat.isOverdue ? <AlertTriangle size={12} className="text-white" /> : <Check size={12} className="text-white" />}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <Modal
        isOpen={!!selectedSeat}
        onClose={() => setSelectedSeat(null)}
        title="Occupied Seat Details"
        actions={
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">
              Edit Details
            </button>
            <button className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors">
              Vacate Seat
            </button>
          </div>
        }
      >
        {selectedSeat && selectedSeat.occupant && (
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl md:text-2xl font-semibold flex-shrink-0">
                {selectedSeat.occupant.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-lg md:text-xl font-semibold text-slate-900">{selectedSeat.occupant.name}</h4>
                <p className="text-sm text-slate-600 mt-1">{selectedSeat.occupant.phone}</p>
                <span className={`inline-flex mt-2 px-2.5 py-1 ${selectedSeat.isOverdue ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'} rounded-full text-xs font-medium`}>
                  {selectedSeat.number}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="p-3 md:p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-600 mb-1">Join Date</p>
                <p className="text-sm font-semibold text-slate-900">{selectedSeat.occupant.joinDate}</p>
              </div>
              <div className="p-3 md:p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-600 mb-1">Fee Status</p>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                  selectedSeat.isOverdue ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {selectedSeat.occupant.feeStatus}
                </span>
              </div>
            </div>

            <div className="p-3 md:p-4 bg-indigo-50 rounded-xl">
              <p className="text-xs text-slate-600 mb-2">Attendance Rate</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white rounded-full h-2.5 overflow-hidden">
                  <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${selectedSeat.occupant.attendance}%` }}></div>
                </div>
                <span className="text-sm font-semibold text-slate-900">{selectedSeat.occupant.attendance}%</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!assignModal}
        onClose={() => setAssignModal(null)}
        title="Assign Occupant"
        actions={
          <div className="flex gap-3">
            <button
              onClick={() => setAssignModal(null)}
              className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">
              Assign Occupant
            </button>
          </div>
        }
      >
        {assignModal && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-xl">
              <p className="text-sm font-semibold text-slate-900">Seat: {assignModal.number}</p>
              <p className="text-xs text-slate-600 mt-1">This seat is currently vacant</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Upload Photo</label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer">
                <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                <p className="text-sm text-slate-600">Click to upload photo</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Occupant Name</label>
              <input
                type="text"
                placeholder="Enter full name"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="email@example.com"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Fee</label>
              <input
                type="number"
                defaultValue={selectedRoom === 'AC' ? 2000 : 1500}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
