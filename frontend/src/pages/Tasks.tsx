import { useState } from 'react';
import { Header } from '../components/Header';
import { Modal } from '../components/Modal';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Calendar, 
  AlertCircle,
  MoreVertical,
  ClipboardList
} from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { tasks } from '../data/mockData';

export default function Tasks() {
  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

  const filteredTasks = tasks.filter(t => 
    activeTab === 'pending' ? !t.isCompleted : t.isCompleted
  );

  return (
    <div className="flex flex-col min-h-full">
      <Header 
        title="Daily Tasks" 
        subtitle="Manage Operations"
        showBack
        action={
          <button 
            onClick={() => setShowAdd(true)}
            className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20"
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
              <button className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                ${task.isCompleted ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'}
              `}>
                {task.isCompleted ? <CheckSquare size={20} /> : <Square size={20} />}
              </button>
              
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-bold truncate ${task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                  {task.title}
                </h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`flex items-center gap-1 text-[10px] font-bold uppercase ${
                    task.priority === 'High' ? 'text-red-500' : 'text-amber-500'
                  }`}>
                    <AlertCircle size={12} /> {task.priority} Priority
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                    <Calendar size={12} /> Due {task.dueDate}
                  </span>
                </div>
              </div>

              <button className="p-2 text-slate-300 hover:text-slate-600">
                <MoreVertical size={18} />
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
              onClick={() => setShowAdd(false)}
              className="py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm"
            >
              Cancel
            </button>
            <button className="py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/20">
              Create Task
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Task Title</label>
            <input 
              type="text" 
              placeholder="e.g. Call Rahul for fee" 
              className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Priority</label>
              <select className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold mt-1">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Due Date</label>
              <input 
                type="date" 
                className="w-full px-4 py-3 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold mt-1"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
