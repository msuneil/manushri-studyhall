import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { Modal } from '../components/Modal';
import { 
  TrendingDown, 
  Plus, 
  Search, 
  Tag, 
  ChevronRight,
  Receipt
} from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { expenses } from '../data/mockData';

export default function Expenses() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => 
      exp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const stats = useMemo(() => {
    return {
      total: expenses.reduce((sum, exp) => sum + exp.amount, 0),
      count: expenses.length
    };
  }, []);

  return (
    <div className="flex flex-col min-h-full">
      <Header 
        title="Expenses" 
        subtitle="Business Spending"
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
        {/* Stats Strip */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Total Expenses</p>
            <p className="text-lg font-black text-slate-900">₹{stats.total.toLocaleString()}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search expenses..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium shadow-sm"
          />
        </div>

        {/* Expenses List (Mobile Cards) */}
        <div className="space-y-3">
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map((exp) => (
              <div key={exp.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between group active:scale-[0.98] transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 text-slate-600 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Tag size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 leading-tight">{exp.category}</h4>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5">{exp.date} • {exp.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-slate-900">₹{exp.amount.toLocaleString()}</span>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              </div>
            ))
          ) : (
            <EmptyState 
              icon={Receipt}
              title="No expenses found"
              description="Track your electricity bills, rent, and maintenance costs here."
              action={{
                label: "Add Expense",
                onClick: () => setShowAdd(true)
              }}
            />
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      <Modal 
        isOpen={showAdd} 
        onClose={() => setShowAdd(false)} 
        title="Add Expense"
        actions={
          <div className="grid grid-cols-2 gap-3 w-full">
            <button 
              onClick={() => setShowAdd(false)}
              className="py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-sm"
            >
              Cancel
            </button>
            <button className="py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/20">
              Save Expense
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Category</label>
            <select className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold mt-1">
              <option>Electricity</option>
              <option>Rent</option>
              <option>Maintenance</option>
              <option>Cleaning</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Amount (₹)</label>
            <input 
              type="number" 
              placeholder="0.00" 
              className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-sm mt-1"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Date</label>
            <input 
              type="date" 
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold mt-1"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Description</label>
            <textarea 
              placeholder="Optional details..." 
              className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium h-24 resize-none mt-1"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
