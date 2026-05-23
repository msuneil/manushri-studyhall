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
  ClipboardList
} from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { useData } from '../contexts/DataContext';
import { useToast } from '../components/Toast';

export default function Tasks() {
  const { tasks, loading, createTask, updateTask, softDeleteTask } = useData();
  const { showToast } = useToast();

  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  // Controlled form state
  const [formTitle, setFormTitle] = useState('');
  const [formPriority, setFormPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [formDueDate, setFormDueDate] = useState(() => new Date().toISOString().split('T')[0]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => 
      activeTab === 'pending' ? !t.isCompleted : t.isCompleted
    );
  }, [tasks, activeTab]);

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

        {/* Task List */}
        <div className="space-y-3">
          {filteredTasks.map((task) => (
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
                <h4 className={`text-sm font-bold truncate ${task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                  {task.title}
                </h4>
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

              <button 
                onClick={() => handleDeleteTask(task.id, task.title)}
                className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                title="Delete Task"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          {filteredTasks.length === 0 && (
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
