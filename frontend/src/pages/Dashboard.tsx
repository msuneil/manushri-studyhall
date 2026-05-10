import { Header } from '../components/Header';
import { 
  Armchair, 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  MessageCircle,
  PlusCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tasks, payments, occupants, seats } from '../data/mockData';

export default function Dashboard() {
  const navigate = useNavigate();

  const occupancyRate = Math.round((seats.filter(s => s.isOccupied).length / seats.length) * 100);
  const pendingPayments = payments.filter(p => p.status !== 'Paid').length;
  const todayTasks = tasks.filter(t => !t.isCompleted).length;

  const quickActions = [
    { label: 'Mark Attendance', icon: CheckCircle2, color: 'bg-green-500', path: '/attendance' },
    { label: 'Collect Fee', icon: IndianRupee, color: 'bg-indigo-600', path: '/payments' },
    { label: 'New Expense', icon: PlusCircle, color: 'bg-red-500', path: '/expenses' },
    { label: 'Assign Seat', icon: Armchair, color: 'bg-slate-900', path: '/seats' },
  ];

  const stats = [
    { label: 'Occupancy', value: `${occupancyRate}%`, icon: Armchair, subValue: `${seats.filter(s => s.isOccupied).length}/${seats.length} Seats` },
    { label: 'Dues Pending', value: pendingPayments.toString(), icon: AlertCircle, subValue: 'Action Required', alert: true },
    { label: 'Today\'s Tasks', value: todayTasks.toString(), icon: Clock, subValue: 'Pending items' },
  ];

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Dashboard" subtitle="Operational Overview" />

      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Quick Actions - Primary for mobile */}
        <section>
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all active:scale-95 group"
              >
                <div className={`p-3 rounded-xl ${action.color} text-white shadow-lg shadow-${action.color.split('-')[1]}-500/20`}>
                  <action.icon size={24} />
                </div>
                <span className="text-xs font-bold text-slate-700">{action.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Operational Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                <p className={`text-[10px] font-bold ${stat.alert ? 'text-red-500' : 'text-slate-400'}`}>{stat.subValue}</p>
              </div>
              <div className={`p-4 rounded-2xl ${stat.alert ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                <stat.icon size={28} />
              </div>
            </div>
          ))}
        </section>

        {/* Dynamic Alerts / Pending Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Dues */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Immediate Dues</h3>
              <button onClick={() => navigate('/payments')} className="text-xs font-bold text-indigo-600">View All</button>
            </div>
            <div className="divide-y divide-slate-50">
              {payments.filter(p => p.status === 'Overdue').slice(0, 3).map((payment) => {
                const occupant = occupants.find(o => o.id === payment.occupantId);
                return (
                  <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                        {occupant?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{occupant?.name}</p>
                        <p className="text-[10px] font-medium text-slate-500">₹{payment.amount} • Due {payment.dueDate}</p>
                      </div>
                    </div>
                    <button className="p-2.5 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors">
                      <MessageCircle size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Critical Tasks */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Today's Tasks</h3>
              <button onClick={() => navigate('/tasks')} className="text-xs font-bold text-indigo-600">View All</button>
            </div>
            <div className="p-4 space-y-3">
              {tasks.filter(t => !t.isCompleted).slice(0, 3).map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <span className="text-xs font-bold text-slate-700 flex-1">{task.title}</span>
                  <button className="text-[10px] font-black uppercase text-indigo-600 bg-white px-2 py-1 rounded-lg border border-slate-100">Done</button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
