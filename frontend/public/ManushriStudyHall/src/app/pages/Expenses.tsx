import { Header } from '../components/Header';
import { Modal } from '../components/Modal';
import { Plus, TrendingDown } from 'lucide-react';
import { useState } from 'react';

export function Expenses() {
  const [showAddExpense, setShowAddExpense] = useState(false);

  const expenses = [
    { id: 1, category: 'Electricity', amount: 18500, date: '2026-05-05', description: 'Monthly electricity bill', month: 'May 2026' },
    { id: 2, category: 'Rent', amount: 20000, date: '2026-05-01', description: 'Building rent', month: 'May 2026' },
    { id: 3, category: 'Cleaning', amount: 6700, date: '2026-05-07', description: 'Cleaning service', month: 'May 2026' },
    { id: 4, category: 'Internet', amount: 2500, date: '2026-05-03', description: 'WiFi service', month: 'May 2026' },
    { id: 5, category: 'Maintenance', amount: 8500, date: '2026-05-04', description: 'AC servicing', month: 'May 2026' },
    { id: 6, category: 'Miscellaneous', amount: 3200, date: '2026-05-06', description: 'Office supplies', month: 'May 2026' },
  ];

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const categoryColors: Record<string, string> = {
    Electricity: 'bg-yellow-100 text-yellow-700',
    Rent: 'bg-purple-100 text-purple-700',
    Cleaning: 'bg-blue-100 text-blue-700',
    Internet: 'bg-green-100 text-green-700',
    Maintenance: 'bg-red-100 text-red-700',
    Miscellaneous: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="min-h-screen">
      <Header title="Expenses" />

      <div className="p-4 md:p-8">
        <div className="mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 md:mb-6">
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-slate-900">Monthly Expenses</h3>
              <p className="text-sm text-slate-600 mt-1">Track all operational expenses</p>
            </div>
            <button
              onClick={() => setShowAddExpense(true)}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm"
            >
              <Plus size={18} />
              Add Expense
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 md:p-4 bg-red-100 rounded-xl flex-shrink-0">
                <TrendingDown size={28} className="text-red-600 md:w-8 md:h-8" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Expenses (May 2026)</p>
                <p className="text-2xl md:text-3xl font-semibold text-slate-900">₹{totalExpenses.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-200">
            <h3 className="text-base md:text-lg font-semibold text-slate-900">Expense Records</h3>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {expense.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[expense.category]}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {expense.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">
                      ₹{expense.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-indigo-600 hover:text-indigo-700 font-medium mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-700 font-medium">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-slate-200">
            {expenses.map((expense) => (
              <div key={expense.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${categoryColors[expense.category]}`}>
                        {expense.category}
                      </span>
                      <span className="text-xs text-slate-600">{expense.date}</span>
                    </div>
                    <p className="text-sm text-slate-700">{expense.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-semibold text-slate-900">₹{expense.amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium">
                    Edit
                  </button>
                  <button className="flex-1 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        title="Add New Expense"
        actions={
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddExpense(false)}
              className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">
              Add Expense
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
              <option>Select category</option>
              <option>Electricity</option>
              <option>Rent</option>
              <option>Maintenance</option>
              <option>Cleaning</option>
              <option>Internet</option>
              <option>Miscellaneous</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
            <input
              type="number"
              placeholder="Enter amount"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
            <input
              type="date"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              rows={3}
              placeholder="Enter expense details..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
