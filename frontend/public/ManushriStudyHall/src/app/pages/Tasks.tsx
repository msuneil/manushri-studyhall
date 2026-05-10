import { Header } from '../components/Header';
import { Modal } from '../components/Modal';
import { Plus, CheckSquare, Square, AlertCircle, Clock } from 'lucide-react';
import { useState } from 'react';

export function Tasks() {
  const [showAddTask, setShowAddTask] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, task: 'Send fee reminders to pending members', priority: 'High', completed: true, date: '2026-05-09' },
    { id: 2, task: 'Check AC maintenance schedule', priority: 'Medium', completed: false, date: '2026-05-09' },
    { id: 3, task: 'Update attendance records', priority: 'High', completed: true, date: '2026-05-09' },
    { id: 4, task: 'Review pending payments', priority: 'High', completed: false, date: '2026-05-09' },
    { id: 5, task: 'Order cleaning supplies', priority: 'Low', completed: false, date: '2026-05-09' },
    { id: 6, task: 'Follow up with overdue payments', priority: 'High', completed: false, date: '2026-05-09' },
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const priorityColors: Record<string, string> = {
    High: 'bg-red-100 text-red-700',
    Medium: 'bg-amber-100 text-amber-700',
    Low: 'bg-green-100 text-green-700',
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <div className="min-h-screen">
      <Header title="Tasks" />

      <div className="p-4 md:p-8">
        <div className="mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 md:mb-6">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-slate-900">Daily Tasks</h3>
              <p className="text-sm text-slate-600 mt-1">Manage your daily operations</p>
            </div>
            <button
              onClick={() => setShowAddTask(true)}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm active:scale-95"
            >
              <Plus size={18} />
              Add Task
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-green-100 rounded-xl">
                  <CheckSquare size={32} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Completed Tasks</p>
                  <p className="text-3xl font-semibold text-slate-900">{completedCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-amber-100 rounded-xl">
                  <Clock size={32} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Pending Tasks</p>
                  <p className="text-3xl font-semibold text-slate-900">{pendingCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-200">
            <h3 className="text-base md:text-lg font-semibold text-slate-900">Today's Tasks</h3>
          </div>

          <div className="divide-y divide-slate-200">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 md:p-6 hover:bg-slate-50 transition-colors ${task.completed ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex-shrink-0 mt-1"
                  >
                    {task.completed ? (
                      <CheckSquare className="text-green-600" size={24} />
                    ) : (
                      <Square className="text-slate-400 hover:text-indigo-600 transition-colors" size={24} />
                    )}
                  </button>

                  <div className="flex-1">
                    <p className={`text-base font-medium ${task.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                      {task.task}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                        <AlertCircle size={12} />
                        {task.priority} Priority
                      </span>
                      <span className="text-xs text-slate-600">{task.date}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-auto">
                    <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium active:scale-95">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium active:scale-95">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        title="Add New Task"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Task Description</label>
            <input
              type="text"
              placeholder="Enter task description"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
            <select className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
              <option>Select priority</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
            <input
              type="date"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowAddTask(false)}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
              Add Task
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
