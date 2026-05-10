import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { useToast } from '../components/Toast';
import { 
  Check, 
  X, 
  Search, 
  Filter, 
  Calendar,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { occupants, seats } from '../data/mockData';

export default function Attendance() {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

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

  const stats = useMemo(() => {
    const present = Object.values(attendance).filter(v => v).length;
    const total = enrichedOccupants.length;
    return { present, total, absent: total - present };
  }, [attendance, enrichedOccupants]);

  const toggleAttendance = (id: string) => {
    setAttendance(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const markAllPresent = () => {
    const newAttendance: Record<string, boolean> = {};
    enrichedOccupants.forEach(occ => {
      newAttendance[occ.id] = true;
    });
    setAttendance(newAttendance);
    showToast('All occupants marked as present', 'success');
  };

  return (
    <div className="flex flex-col min-h-full">
      <Header 
        title="Attendance" 
        subtitle="Daily Presence Tracking"
        showBack
        action={
          <button 
            onClick={markAllPresent}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-indigo-500/20"
          >
            Mark All Present
          </button>
        }
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Date Selector & Summary */}
        <div className="bg-slate-900 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <button className="p-2 bg-white/10 text-white rounded-xl">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <Calendar className="text-indigo-400" size={24} />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white font-black text-xl outline-none"
              />
            </div>
            <button className="p-2 bg-white/10 text-white rounded-xl">
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase">Total</p>
              <p className="text-xl font-black text-white">{stats.total}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase text-emerald-400">Present</p>
              <p className="text-xl font-black text-white">{stats.present}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase text-red-400">Absent</p>
              <p className="text-xl font-black text-white">{stats.absent}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or seat..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium shadow-sm"
            />
          </div>
          <button className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-500 shadow-sm">
            <Filter size={18} />
          </button>
        </div>

        {/* Occupant Attendance List */}
        <div className="space-y-3">
          {enrichedOccupants.map((occ) => {
            const isPresent = attendance[occ.id];
            return (
              <div 
                key={occ.id}
                onClick={() => toggleAttendance(occ.id)}
                className={`
                  bg-white rounded-2xl border p-4 shadow-sm flex items-center justify-between transition-all cursor-pointer active:scale-[0.98]
                  ${isPresent ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-100'}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg transition-colors ${isPresent ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {occ.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 leading-tight">{occ.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                        {occ.seatNumber}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 uppercase">
                        {occ.planType || 'Full Day'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isPresent ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                  {isPresent ? <Check size={24} strokeWidth={3} /> : <X size={24} strokeWidth={3} />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pb-24 pt-4">
          <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
            Submit Attendance
          </button>
        </div>
      </div>
    </div>
  );
}
