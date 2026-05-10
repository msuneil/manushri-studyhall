import { Header } from '../components/Header';
import { 
  Building2, 
  DoorOpen, 
  IndianRupee, 
  Bell, 
  CheckCircle2, 
  CreditCard,
  ShieldCheck,
  User,
  Download,
  Database,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useToast } from '../components/Toast';

export default function Settings() {
  const { showToast } = useToast();

  const handleExport = () => {
    showToast('Data exported successfully', 'success');
  };

  const handleBackup = () => {
    showToast('Cloud backup completed', 'success');
  };

  const sections = [
    {
      title: 'Study Hall Setup',
      items: [
        { icon: Building2, label: 'Hall Details', sub: 'Name, Address, Registration', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { icon: DoorOpen, label: 'Room Defaults', sub: 'Default room types, common rules', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { icon: IndianRupee, label: 'Seat Pricing', sub: 'Set default pricing for plans', color: 'text-blue-600', bg: 'bg-blue-50' },
      ]
    },
    {
      title: 'Operations',
      items: [
        { icon: CheckCircle2, label: 'Attendance Settings', sub: 'Marking window, holiday setup', color: 'text-green-600', bg: 'bg-green-50' },
        { icon: Bell, label: 'Reminder Settings', sub: 'WhatsApp message templates', color: 'text-amber-600', bg: 'bg-amber-50' },
        { icon: CreditCard, label: 'Fee Settings', sub: 'Due dates, fine policies', color: 'text-purple-600', bg: 'bg-purple-50' },
      ]
    },
    {
      title: 'System & Security',
      items: [
        { icon: ShieldCheck, label: 'Admin Access', sub: 'Manage passwords, login activity', color: 'text-slate-600', bg: 'bg-slate-50' },
        { icon: User, label: 'Owner Profile', sub: 'Contact details, email', color: 'text-slate-600', bg: 'bg-slate-50' },
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Settings" subtitle="Manage Operations" showBack />

      <div className="p-4 md:p-8 max-w-3xl mx-auto w-full space-y-8 pb-32">
        {/* Study Hall Hero Card */}
        <div className="bg-slate-900 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
            <Building2 size={120} />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500 flex items-center justify-center text-3xl font-black shadow-lg">
                M
              </div>
              <div>
                <h3 className="text-xl font-black">Manushri Study Hall</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Premium Plan • Active</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleExport} className="flex items-center justify-center gap-2 py-3 bg-white/10 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-white/20 transition-all border border-white/5">
                <Download size={16} /> Export
              </button>
              <button onClick={handleBackup} className="flex items-center justify-center gap-2 py-3 bg-indigo-600 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">
                <Database size={16} /> Backup
              </button>
            </div>
          </div>
        </div>

        {/* Setting Sections */}
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                {section.title}
              </h3>
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="divide-y divide-slate-50">
                  {section.items.map((item) => (
                    <button 
                      key={item.label}
                      className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group text-left"
                    >
                      <div className={`p-3 rounded-2xl shrink-0 ${item.bg} ${item.color}`}>
                        <item.icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-none mb-1">
                          {item.label}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400">
                          {item.sub}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 transition-all group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full flex items-center justify-center gap-3 p-5 bg-red-50 text-red-600 rounded-3xl border border-red-100 font-black text-sm shadow-sm hover:bg-red-100 transition-colors group">
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          Sign Out of Account
        </button>

        <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-4">
          Version 1.2.0 • Build 2026.05
        </p>
      </div>
    </div>
  );
}
