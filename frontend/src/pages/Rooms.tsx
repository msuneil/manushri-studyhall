import { Header } from '../components/Header';
import { 
  Wind, 
  Thermometer, 
  Users, 
  Armchair,
  Settings,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { rooms, seats } from '../data/mockData';

export default function Rooms() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-full">
      <Header 
        title="Study Halls" 
        subtitle="Manage Room Types"
        action={
          <button className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20">
            <Plus size={20} />
          </button>
        }
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => {
            const roomSeats = seats.filter(s => s.roomId === room.id);
            const occupied = roomSeats.filter(s => s.isOccupied).length;
            const occupancyRate = Math.round((occupied / roomSeats.length) * 100);

            return (
              <div 
                key={room.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl ${room.type === 'AC Hall' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {room.type === 'AC Hall' ? <Wind size={32} /> : <Thermometer size={32} />}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 leading-none mb-1">{room.name}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{room.type}</p>
                      </div>
                    </div>
                    <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
                      <Settings size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Capacity</p>
                      <div className="flex items-center gap-2">
                        <Armchair size={16} className="text-slate-400" />
                        <span className="text-lg font-black text-slate-900">{roomSeats.length} Seats</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Occupancy</p>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-slate-400" />
                        <span className="text-lg font-black text-slate-900">{occupancyRate}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-xs font-bold text-slate-500">Utilization</span>
                      <span className="text-xs font-black text-slate-900">{occupied}/{roomSeats.length} Seats occupied</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          occupancyRate > 90 ? 'bg-red-500' : occupancyRate > 70 ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${occupancyRate}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50/50 border-t border-slate-100 grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => navigate('/seats', { state: { roomId: room.id } })}
                    className="py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-all"
                  >
                    View Layout
                  </button>
                  <button className="py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
                    Room Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
