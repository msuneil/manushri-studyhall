import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { Modal } from '../components/Modal';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Calendar, 
  AlertCircle,
  Trash2,
  ClipboardList,
  MessageCircle,
  Clock,
  ArrowRight,
  IndianRupee
} from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { useData } from '../contexts/DataContext';
import { useToast } from '../components/Toast';
import { useSettings } from '../features/settings/SettingsContext';
import { useConfirmation } from '../components/Confirmation';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../components/common/Avatar';
import { taskService } from '../services/taskService';

export default function Tasks() {
  const { 
    tasks, 
    loading, 
    createTask, 
    updateTask, 
    softDeleteTask,
    occupants,
    payments,
    attendanceSessions
  } = useData();
  const { showToast } = useToast();
  const { confirm } = useConfirmation();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  // Controlled form state
  const [formTitle, setFormTitle] = useState('');
  const [formPriority, setFormPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [formDueDate, setFormDueDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Compile, deduplicate, aggregate, and order Operational System Priorities
  const systemPriorities = useMemo(() => {
    const alertsList: any[] = [];

    // 1. Daily Attendance Alert
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysSession = (attendanceSessions ?? []).find(s => s.date === todayStr);
    const isSubmitted = todaysSession ? todaysSession.isSubmitted : false;

    if (!isSubmitted) {
      const markedCount = todaysSession ? Object.keys(todaysSession.records).length : 0;
      const activeOccupantsCount = occupants.filter(o => o.isActive && o.status === 'Active' && o.seatId && o.seatId !== 'N/A').length;
      const unmarkedCount = Math.max(0, activeOccupantsCount - markedCount);

      alertsList.push({
        id: 'attendance-pending',
        type: 'attendance',
        priorityValue: 1,
        title: "Daily attendance still pending today",
        description: todaysSession 
          ? `Daily attendance is in draft. ${unmarkedCount} unmarked occupants remaining.`
          : `Daily attendance for today has not been started yet.`,
        actionLabel: "Complete Attendance",
        actionPath: "/attendance"
      });
    }

    // 2. Overdue Fee Alerts
    const gracePeriod = settings?.paymentSettings?.gracePeriodDays ?? 3;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rawOverduePayments = (payments ?? [])
      .filter(p => {
        if (!p.isActive || p.status === 'Paid') return false;
        if (p.status === 'Overdue') return true;

        const dueDate = new Date(p.dueDate);
        if (isNaN(dueDate.getTime())) return false;
        
        const overdueThreshold = new Date(dueDate);
        overdueThreshold.setDate(overdueThreshold.getDate() + gracePeriod);
        overdueThreshold.setHours(0, 0, 0, 0);

        return today > overdueThreshold;
      })
      .map(p => {
        const occupant = (occupants ?? []).find(o => o.id === p.occupantId);
        return {
          id: p.id,
          occupantName: occupant?.name || 'Unknown Occupant',
          phone: occupant?.phone || '',
          amount: p.amount,
          month: p.month,
          dueDate: p.dueDate
        };
      });

    // Run payments through the aggregation engine (aggregates if more than 3 payments are overdue)
    const aggregatedPaymentAlerts = taskService.aggregateOverduePayments(rawOverduePayments, 3);
    alertsList.push(...aggregatedPaymentAlerts);

    // 3. Deduplicate and order alerts reactively
    const dedupedAlerts = taskService.dedupeOperationalAlerts(alertsList);
    return taskService.orderOperationalAlerts(dedupedAlerts);
  }, [attendanceSessions, payments, occupants, settings]);

  const handleSendReminder = async (p: any) => {
    const confirmed = await confirm({
      title: "Send Fee Reminder?",
      description: `This will draft and open a WhatsApp payment reminder chat for ${p.occupantName} for the pending amount of ₹${p.amount.toLocaleString()}.`,
      severity: "low",
      confirmLabel: "Send Reminder",
      cancelLabel: "Cancel"
    });

    if (!confirmed) return;

    const reminderText = settings.paymentSettings.reminderTemplate
      .replace(/{name}/g, p.occupantName)
      .replace(/{seatNumber}/g, 'Seat')
      .replace(/{month}/g, p.month)
      .replace(/{amount}/g, p.amount.toLocaleString())
      .replace(/{dueDate}/g, p.dueDate);

    let phone = p.phone || '';
    phone = phone.replace(/[^0-9]/g, '');
    if (phone.length === 10) phone = `91${phone}`;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(reminderText)}`, '_blank');
    showToast(`WhatsApp reminder opened for ${p.occupantName}!`, 'success');
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => 
      activeTab === 'pending' ? !t.isCompleted : t.isCompleted
    );
  }, [tasks, activeTab]);

  // Enrich manually created tasks with occupant Avatar matching
  const enrichedTasks = useMemo(() => {
    return filteredTasks.map(task => {
      const matchedOccupant = occupants.find(occ => 
        task.title.toLowerCase().includes(occ.name.toLowerCase())
      );
      return {
        ...task,
        occupant: matchedOccupant
      };
    });
  }, [filteredTasks, occupants]);

  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    try {
      await updateTask(taskId, { isCompleted: !currentCompleted });
      showToast(currentCompleted ? 'Task marked as pending' : 'Task marked as completed', 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to update task', 'error');
    }
  };

  const handleDeleteTask = async (taskId: string, title: string) => {
    try {
      await softDeleteTask(taskId);
      showToast(`Task "${title}" deleted successfully`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to delete task', 'error');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Please enter a task title', 'error');
      return;
    }

    try {
      await createTask(formTitle, formPriority, formDueDate);
      showToast('Task created successfully', 'success');
      setShowAdd(false);
      
      // Reset form
      setFormTitle('');
      setFormPriority('Medium');
      setFormDueDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error(error);
      showToast('Failed to create task', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 bg-[#FAF8F5]">
        <div className="w-12 h-12 border-4 border-amber-600/20 border-t-amber-600 rounded-full animate-spin"></div>
        <p className="text-amber-800/60 font-bold text-xs uppercase tracking-widest animate-pulse">Loading Operational Tasks...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header 
        title="Daily Tasks" 
        subtitle="Manage Operations"
        showBack
        action={
          <button 
            onClick={() => setShowAdd(true)}
            className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-transform"
          >
            <Plus size={20} />
          </button>
        }
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Tabs */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'pending' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Pending ({tasks.filter(t => !t.isCompleted).length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'completed' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Completed ({tasks.filter(t => t.isCompleted).length})
          </button>
        </div>

        {/* System Priorities (Only visible on pending tab) */}
        {activeTab === 'pending' && systemPriorities.length > 0 && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">System Priorities</h5>
            
            {systemPriorities.map((priority) => {
              const isAttendance = priority.type === 'attendance';
              const isPayment = priority.type === 'payment';

              return (
                <div 
                  key={priority.id} 
                  className={`
                    rounded-2xl border p-4 shadow-sm flex items-center gap-4 transition-colors
                    ${isAttendance ? 'bg-[#FFFDFB] border-amber-200 hover:border-amber-300' : ''}
                    ${isPayment ? 'bg-[#FAF6F6] border-rose-200 hover:border-rose-300' : ''}
                  `}
                >
                  <div 
                    className={`
                      w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border
                      ${isAttendance ? 'bg-amber-50 text-amber-600 border-amber-100' : ''}
                      ${isPayment ? 'bg-rose-50 text-rose-600 border-rose-100' : ''}
                    `}
                  >
                    {isAttendance ? (
                      <Clock size={20} className="animate-pulse" />
                    ) : (
                      <IndianRupee size={18} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-slate-900 leading-tight">
                      {priority.title}
                    </h4>
                    <p className="text-[11px] font-medium text-slate-500 mt-1">
                      {priority.description}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 shrink-0">
                    {isPayment && !priority.isAggregate && (
                      <button
                        onClick={() => handleSendReminder(priority.paymentData)}
                        className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/50 rounded-xl transition-all cursor-pointer active:scale-95"
                        title="Send WhatsApp reminder alert"
                      >
                        <MessageCircle size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => navigate(priority.actionPath || '/')}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                    >
                      {priority.actionLabel || 'Action'} <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Task List */}
        <div className="space-y-3">
          {activeTab === 'pending' && enrichedTasks.length > 0 && (
            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mt-4">My Checklist</h5>
          )}

          {enrichedTasks.map((task) => (
            <div 
              key={task.id} 
              className={`
                bg-white rounded-2xl border p-4 shadow-sm flex items-center gap-4 transition-all
                ${task.isCompleted ? 'opacity-60 border-slate-100' : 'border-slate-200 hover:border-indigo-200'}
              `}
            >
              <button 
                onClick={() => handleToggleTask(task.id, task.isCompleted)}
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                  ${task.isCompleted ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'}
                `}
              >
                {task.isCompleted ? <CheckSquare size={20} /> : <Square size={20} />}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {task.occupant && (
                    <Avatar name={task.occupant.name} size="xs" className="shrink-0" />
                  )}
                  <h4 className={`text-sm font-bold truncate ${task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                    {task.title}
                  </h4>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`flex items-center gap-1 text-[10px] font-bold uppercase ${
                    task.priority === 'High' ? 'text-red-500' : task.priority === 'Medium' ? 'text-amber-500' : 'text-slate-500'
                  }`}>
                    <AlertCircle size={12} /> {task.priority} Priority
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                    <Calendar size={12} /> Due {task.dueDate}
                  </span>
                </div>
              </div>

              {task.occupant && !task.isCompleted && (
                <button 
                  onClick={async (e) => {
                    e.stopPropagation();
                    const confirmed = await confirm({
                      title: "Contact Occupant?",
                      description: `Would you like to open a direct WhatsApp chat window with ${task.occupant?.name}?`,
                      severity: "low",
                      confirmLabel: "Open Chat",
                      cancelLabel: "Cancel"
                    });
                    if (confirmed) {
                      window.open(`https://wa.me/${(task.occupant?.phone || '').replace(/\D/g, '')}`, '_blank');
                    }
                  }}
                  className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer shrink-0"
                  title="WhatsApp Chat"
                >
                  <MessageCircle size={18} />
                </button>
              )}

              <button 
                onClick={() => handleDeleteTask(task.id, task.title)}
                className="p-2 text-slate-300 hover:text-rose-650 transition-colors shrink-0"
                title="Delete Task"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {enrichedTasks.length === 0 && (
            <EmptyState 
              icon={ClipboardList}
              title="No tasks here"
              description="You're all caught up! Enjoy the quiet while it lasts."
              action={{
                label: "Create Task",
                onClick: () => setShowAdd(true)
              }}
            />
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      <Modal 
        isOpen={showAdd} 
        onClose={() => setShowAdd(false)} 
        title="New Task"
        actions={
          <div className="grid grid-cols-2 gap-3 w-full">
            <button 
              type="button"
              onClick={() => setShowAdd(false)}
              className="py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              form="add-task-form"
              className="py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/20"
            >
              Create Task
            </button>
          </div>
        }
      >
        <form id="add-task-form" onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Task Title</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Call Rahul for fee" 
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Priority</label>
              <select 
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as any)}
                className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold mt-1"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Due Date</label>
              <input 
                type="date" 
                required
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold mt-1"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
