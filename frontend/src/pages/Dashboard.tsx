import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { 
  Armchair, 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  MessageCircle,
  PlusCircle,
  Sparkles,
  Lock,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tasks as mockTasks, payments as mockPayments, occupants, seats } from '../data/mockData';
import { Avatar } from '../components/common/Avatar';
import { useToast } from '../components/Toast';
import { useConfirmation } from '../components/Confirmation';
import { useSettings } from '../features/settings/SettingsContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { confirm } = useConfirmation();
  const { settings } = useSettings();

  // Local state to support interactive completions on Dashboard
  const [taskList, setTaskList] = useState(mockTasks);
  const [paymentList, setPaymentList] = useState(mockPayments);

  const occupancyRate = Math.round((seats.filter(s => s.isOccupied).length / seats.length) * 100);
  const pendingPayments = paymentList.filter(p => p.status !== 'Paid').length;
  const todayTasks = taskList.filter(t => !t.isCompleted).length;

  const quickActions = [
    { label: 'Attendance', icon: CheckCircle2, color: 'bg-green-600', path: '/attendance' },
    { label: 'Payments', icon: IndianRupee, color: 'bg-indigo-600', path: '/payments' },
    { label: 'Occupants', icon: PlusCircle, color: 'bg-indigo-500', path: '/occupants' },
    { label: 'Seats & Halls', icon: Armchair, color: 'bg-slate-900', path: '/seats' },
  ];

  const stats = [
    { label: 'Dues Pending', value: pendingPayments.toString(), icon: AlertCircle, subValue: 'Action Required', alert: true, path: '/payments' },
    { label: 'Today\'s Tasks', value: todayTasks.toString(), icon: Clock, subValue: 'Pending items', alert: false, path: '/tasks' },
    { label: 'Occupancy', value: `${occupancyRate}%`, icon: Armchair, subValue: `${seats.filter(s => s.isOccupied).length}/${seats.length} Seats`, alert: false, path: '/seats' },
  ];

  // Inline WhatsApp Reminder dispatch
  const handleSendReminder = async (p: any) => {
    const confirmed = await confirm({
      title: "Send Fee Reminder?",
      description: `This will draft and dispatch a WhatsApp payment reminder message to ${p.occupantName} for the pending amount of ₹${p.amount.toLocaleString()}.`,
      severity: "low",
      confirmLabel: "Send Reminder",
      cancelLabel: "Cancel"
    });

    if (!confirmed) return;

    const reminderText = settings.paymentSettings.reminderTemplate
      .replace(/{name}/g, p.occupantName)
      .replace(/{seatNumber}/g, p.seatNumber)
      .replace(/{month}/g, p.month)
      .replace(/{amount}/g, p.amount.toLocaleString())
      .replace(/{dueDate}/g, p.dueDate);

    let phone = p.phone || '';
    phone = phone.replace(/[^0-9]/g, '');
    if (phone.length === 10) phone = `91${phone}`;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(reminderText)}`, '_blank');
    showToast(`WhatsApp reminder opened for ${p.occupantName}!`, 'success');
  };

  // Inline task completion simulation
  const handleCompleteTask = (taskId: string, title: string) => {
    setTaskList(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: true } : t));
    showToast(`Completed: "${title}"`, 'success');
  };

  const enrichedOverduePayments = useMemo(() => {
    return paymentList
      .filter(p => p.status === 'Overdue')
      .map(p => {
        const occupant = occupants.find(o => o.id === p.occupantId);
        const seat = seats.find(s => s.id === occupant?.seatId);
        return {
          ...p,
          occupantName: occupant?.name || 'Unknown',
          seatNumber: seat?.number || 'N/A',
          phone: occupant?.phone || '',
        };
      });
  }, [paymentList]);

  const activeTasks = useMemo(() => {
    return taskList.filter(t => !t.isCompleted);
  }, [taskList]);

  return (
    <div className="flex flex-col min-h-full">
      <Header title={settings.hallDetails.name} subtitle="Study Hall Management" />

      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* 1. Branded Operational Snapshot */}
        <div className="bg-indigo-50/70 border border-indigo-150/40 rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in fade-in duration-200">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[9px] font-black text-indigo-900 bg-indigo-100/60 px-2 py-0.5 rounded uppercase tracking-wider">Focus</span>
            
            <div className="flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-100 rounded text-[10px] font-bold text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{enrichedOverduePayments.length} Overdue Dues</span>
            </div>
            
            <div className="flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-100 rounded text-[10px] font-bold text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span>{todayTasks} Pending Tasks</span>
            </div>

            <div className="flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-100 rounded text-[10px] font-bold text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 animate-pulse" />
              <span>Attendance in Draft</span>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/attendance')}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm cursor-pointer self-start sm:self-center flex items-center gap-1"
          >
            <Calendar size={11} />
            Review
          </button>
        </div>

        {/* 2. Refined Quick Actions - Compact Horizontal Strip */}
        <section>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">Quick Actions</h3>
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="flex items-center gap-2.5 px-4.5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95 shrink-0 cursor-pointer hover:border-indigo-100"
              >
                <div className={`p-1.5 rounded-lg ${action.color} text-white`}>
                  <action.icon size={14} />
                </div>
                <span className="text-xs font-bold text-slate-700">{action.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 3. Clickable Operational Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div 
              key={stat.label} 
              onClick={() => navigate(stat.path)}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md hover:border-indigo-100 transition-all active:scale-[0.98] cursor-pointer group"
            >
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{stat.value}</p>
                <p className={`text-[10px] font-bold ${stat.alert ? 'text-red-500' : 'text-slate-400'}`}>{stat.subValue}</p>
              </div>
              <div className={`p-4 rounded-2xl transition-all ${stat.alert ? 'bg-red-50 text-red-600 group-hover:bg-red-100' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                <stat.icon size={24} />
              </div>
            </div>
          ))}
        </section>

        {/* 4. Dynamic Alerts & Lists with Empty States */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Immediate Dues (Actionable List) */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Immediate Overdue Dues</h3>
              <button onClick={() => navigate('/payments')} className="text-xs font-black text-indigo-600 uppercase hover:underline tracking-wider">View All</button>
            </div>
            
            <div className="divide-y divide-slate-100 flex-1 flex flex-col justify-center">
              {enrichedOverduePayments.length > 0 ? (
                enrichedOverduePayments.slice(0, 3).map((payment) => (
                  <div key={payment.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar name={payment.occupantName} size="sm" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{payment.occupantName}</p>
                        <p className="text-[10px] font-semibold text-slate-400">
                          Seat {payment.seatNumber} • <span className="text-rose-600 font-extrabold">₹{payment.amount.toLocaleString()}</span> overdue since {payment.dueDate}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleSendReminder(payment)}
                      className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl transition-all active:scale-90 cursor-pointer"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageCircle size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center space-y-2 animate-in fade-in duration-200">
                  <span className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-full">
                    <CheckCircle2 size={24} />
                  </span>
                  <p className="text-xs font-bold text-slate-800">No overdue dues today!</p>
                  <p className="text-[10px] font-medium text-slate-400">All student ledger cycles are in perfect order.</p>
                </div>
              )}
            </div>
          </section>

          {/* Today's Tasks (Actionable List) */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Today's Pending Tasks</h3>
              <button onClick={() => navigate('/tasks')} className="text-xs font-black text-indigo-600 uppercase tracking-wider hover:underline">View All</button>
            </div>
            
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-center">
              {activeTasks.length > 0 ? (
                activeTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100/50 rounded-2xl border border-slate-200/60 transition-colors">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${task.priority === 'High' ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <span className="text-xs font-bold text-slate-700 flex-1">{task.title}</span>
                    <button 
                      onClick={() => handleCompleteTask(task.id, task.title)}
                      className="text-[9px] font-black uppercase text-indigo-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-indigo-50 hover:border-indigo-150 transition-all active:scale-95 cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center space-y-2 animate-in fade-in duration-200">
                  <span className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-full">
                    <Sparkles size={24} />
                  </span>
                  <p className="text-xs font-bold text-slate-800">All tasks checked off!</p>
                  <p className="text-[10px] font-medium text-slate-400">Your daily operational queue is fully cleared.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
