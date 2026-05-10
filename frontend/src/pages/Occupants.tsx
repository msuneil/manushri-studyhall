import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { Modal } from '../components/Modal';
import { MemberCard } from '../components/OperationalCard';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Users,
  Grid,
  List,
  Camera,
  Upload,
  Phone,
  Mail,
  ShieldAlert,
  CreditCard,
  MessageCircle,
  Clock
} from 'lucide-react';
import { occupants, seats, rooms } from '../data/mockData';

export default function Occupants() {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedOccupant, setSelectedOccupant] = useState<any>(null);

  const filteredOccupants = useMemo(() => {
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

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('New occupant added successfully', 'success');
    setShowAdd(false);
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
            <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}`}
              >
                <Grid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400'}`}
              >
                <List size={20} />
              </button>
            </div>
            <button className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-500 shadow-sm">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Members Display */}
        {filteredOccupants.length > 0 ? (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredOccupants.map((occ) => (
              <div key={occ.id} onClick={() => setSelectedOccupant(occ)}>
                <MemberCard 
                  name={occ.name}
                  seat={occ.seatNumber}
                  phone={occ.phone}
                  attendance={occ.attendanceRate}
                  status={occ.status}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState 
            icon={Users}
            title="No occupants found"
            description="Start by adding your first occupant or adjust your filters."
            action={{
              label: "Add Occupant",
              onClick: () => setShowAdd(true)
            }}
          />
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
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 group hover:border-indigo-300 transition-colors cursor-pointer">
                <Camera size={28} strokeWidth={1.5} />
                <span className="text-[10px] font-black uppercase mt-1">Photo</span>
              </div>
              <button type="button" className="absolute -right-2 -bottom-2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg">
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Full Name</label>
              <input type="text" required placeholder="Enter occupant name" className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Phone Number</label>
                <input type="tel" required placeholder="+91" className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Emergency Contact</label>
                <input type="tel" required placeholder="+91" className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Select Room</label>
                <select className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold">
                  {rooms.map(r => <option key={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Joining Date</label>
                <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Plan Type</label>
              <div className="grid grid-cols-2 gap-2">
                {['Full Day', 'Half Day', 'Morning', 'Evening'].map(p => (
                  <button key={p} type="button" className="py-2.5 px-4 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-transparent hover:border-indigo-100 active:bg-indigo-50 transition-all">
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">ID Proof Placeholder</label>
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center gap-3 text-slate-400 text-xs font-bold">
                <Upload size={18} /> Upload Aadhar/ID Card
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* Occupant Profile Modal */}
      <Modal 
        isOpen={!!selectedOccupant} 
        onClose={() => setSelectedOccupant(null)} 
        title="Occupant Profile"
        actions={
          <div className="grid grid-cols-2 gap-3 w-full">
            <button className="py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm">Edit Profile</button>
            <button className="py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
              <MessageCircle size={18} /> Send Reminder
            </button>
          </div>
        }
      >
        {selectedOccupant && (
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-24 h-24 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center text-4xl font-black shadow-xl">
                {selectedOccupant.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 leading-none mb-2">{selectedOccupant.name}</h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {selectedOccupant.seatNumber}
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {selectedOccupant.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="bg-slate-50 p-2 rounded-xl text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase">Attendance</p>
                <p className="text-sm font-black text-indigo-600">{selectedOccupant.attendanceRate}%</p>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase">Paid</p>
                <p className="text-sm font-black text-emerald-600">₹8K</p>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase">Dues</p>
                <p className="text-sm font-black text-red-600">₹0</p>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl text-center">
                <p className="text-[8px] font-black text-slate-400 uppercase">Joined</p>
                <p className="text-[10px] font-black text-slate-900 mt-0.5">Jan '26</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Information</h5>
              </div>
              <div className="bg-white border border-slate-100 rounded-3xl p-2 space-y-1">
                <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Phone</p>
                    <p className="text-sm font-bold text-slate-900">{selectedOccupant.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                  <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                    <ShieldAlert size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Emergency Contact</p>
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
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reminder History</h5>
                <button className="text-[10px] font-black text-indigo-600 uppercase">See All</button>
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
                <button className="text-[10px] font-black text-indigo-600 uppercase">See All</button>
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
    </div>
  );
}

function Plus({ size }: any) { return <span style={{ fontSize: size }}>+</span>; }
