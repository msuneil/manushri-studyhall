import { Header } from '../components/Header';
import { StatsCard } from '../components/StatsCard';
import { Modal } from '../components/Modal';
import {
  Users,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  MessageCircle,
  CheckSquare,
  Square,
  Phone
} from 'lucide-react';
import { useState } from 'react';

export function Dashboard() {
  const [selectedOccupant, setSelectedOccupant] = useState<any>(null);
  const [reminderModal, setReminderModal] = useState<any>(null);

  const stats = [
    { title: 'Present Today', value: '63', icon: Users },
    { title: 'Monthly Revenue', value: '₹1,67,500', icon: IndianRupee },
    { title: 'Collected Revenue', value: '₹1,34,000', icon: CheckCircle2 },
    { title: 'Due Revenue', value: '₹33,500', icon: AlertCircle },
    { title: 'Monthly Expenses', value: '₹45,200', icon: TrendingDown },
  ];

  const members = [
    { name: 'Rahul Sharma', seat: 'AC-12', feeStatus: 'Paid', dueDate: '2026-05-01', isPresent: true, isPaid: true, phone: '+91 98765 43210' },
    { name: 'Priya Patel', seat: 'NAC-23', feeStatus: 'Paid', dueDate: '2026-05-02', isPresent: true, isPaid: true, phone: '+91 98765 43211' },
    { name: 'Amit Kumar', seat: 'AC-05', feeStatus: 'Pending', dueDate: '2026-05-10', isPresent: false, isPaid: false, phone: '+91 98765 43212' },
    { name: 'Sneha Reddy', seat: 'AC-34', feeStatus: 'Pending', dueDate: '2026-05-11', isPresent: true, isPaid: false, phone: '+91 98765 43213' },
    { name: 'Vikram Singh', seat: 'NAC-45', feeStatus: 'Paid', dueDate: '2026-05-03', isPresent: true, isPaid: true, phone: '+91 98765 43214' },
    { name: 'Anjali Mehta', seat: 'AC-28', feeStatus: 'Paid', dueDate: '2026-05-04', isPresent: false, isPaid: true, phone: '+91 98765 43215' },
  ];

  const paymentsSummary = {
    expectedMonthly: 167500,
    collectedMonth: 134000,
    expenses: 45200,
    expectedProfit: 122300,
    collectedProfit: 88800,
    collectedCount: 55
  };

  const recentExpenses = [
    { category: 'Electricity', amount: '₹18,500', date: '2026-05-05' },
    { category: 'Rent', amount: '₹20,000', date: '2026-05-01' },
    { category: 'Cleaning', amount: '₹6,700', date: '2026-05-07' },
  ];

  const dailyTasks = [
    { id: 1, task: 'Send fee reminders', completed: true },
    { id: 2, task: 'Check AC maintenance', completed: false },
    { id: 3, task: 'Update attendance records', completed: true },
    { id: 4, task: 'Review pending payments', completed: false },
  ];

  return (
    <div className="min-h-screen">
      <Header title="Dashboard" />

      <div className="p-4 md:p-8 space-y-6 md:space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-6">
          {stats.map((stat) => (
            <StatsCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-200">
            <h3 className="text-base md:text-lg font-semibold text-slate-900">Members & Attendance</h3>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Occupant Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Seat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Fee Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Attendance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {members.map((member, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedOccupant(member)}
                        className="flex items-center hover:text-indigo-600 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-700">
                          {member.name.charAt(0)}
                        </div>
                        <span className="ml-3 text-sm font-medium text-slate-900">{member.name}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                      {member.seat}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          member.isPaid
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {member.feeStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {member.dueDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          member.isPresent
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {member.isPresent ? 'Present' : 'Absent'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!member.isPaid && (
                        <button
                          onClick={() => setReminderModal(member)}
                          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                        >
                          Send Reminder
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-slate-200">
            {members.map((member, idx) => (
              <div key={idx} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900">{member.name}</h4>
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                          member.isPaid
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {member.feeStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                      <span className="font-medium text-indigo-600">{member.seat}</span>
                      <span>•</span>
                      <span>Due: {member.dueDate}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      member.isPresent
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {member.isPresent ? 'Present' : 'Absent'}
                  </button>
                  {!member.isPaid && (
                    <button
                      onClick={() => setReminderModal(member)}
                      className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={16} />
                      Remind
                    </button>
                  )}
                  {member.isPaid && (
                    <button
                      onClick={() => setSelectedOccupant(member)}
                      className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium"
                    >
                      View
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200">
            <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4 md:mb-6">Payments Summary</h3>
            <div className="space-y-3 md:space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-600">Expected Monthly Fees</span>
                <span className="text-sm font-semibold text-slate-900">₹{paymentsSummary.expectedMonthly.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-600">Collected This Month</span>
                <span className="text-sm font-semibold text-green-600">₹{paymentsSummary.collectedMonth.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-600">Expenses Logged</span>
                <span className="text-sm font-semibold text-red-600">₹{paymentsSummary.expenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-600">Expected Profit</span>
                <span className="text-sm font-semibold text-slate-900">₹{paymentsSummary.expectedProfit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-600">Collected Profit</span>
                <span className="text-sm font-semibold text-indigo-600">₹{paymentsSummary.collectedProfit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Collected Entries</span>
                <span className="text-sm font-semibold text-slate-900">{paymentsSummary.collectedCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200">
            <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4 md:mb-6">Recent Expenses</h3>
            <div className="space-y-3 md:space-y-4">
              {recentExpenses.map((expense, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{expense.category}</p>
                    <p className="text-xs text-slate-600">{expense.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{expense.amount}</span>
                </div>
              ))}
              <button className="w-full text-sm font-medium text-indigo-600 hover:text-indigo-700 pt-2">
                View All Expenses
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200">
            <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4 md:mb-6">Daily Tasks</h3>
            <div className="space-y-2 md:space-y-3">
              {dailyTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                  {task.completed ? (
                    <CheckSquare className="text-green-600 flex-shrink-0" size={20} />
                  ) : (
                    <Square className="text-slate-400 flex-shrink-0" size={20} />
                  )}
                  <span className={`text-sm ${task.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                    {task.task}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 pt-2 border-t border-slate-200">
              View All Tasks
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedOccupant}
        onClose={() => setSelectedOccupant(null)}
        title="Occupant Details"
        actions={
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors">
              Edit Details
            </button>
            <button className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">
              View Full Profile
            </button>
          </div>
        }
      >
        {selectedOccupant && (
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl md:text-2xl font-semibold">
                {selectedOccupant.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div>
                <h4 className="text-lg md:text-xl font-semibold text-slate-900">{selectedOccupant.name}</h4>
                <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                  <Phone size={14} />
                  {selectedOccupant.phone}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="p-3 md:p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Seat Number</p>
                <p className="text-base md:text-lg font-semibold text-slate-900">{selectedOccupant.seat}</p>
              </div>
              <div className="p-3 md:p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Fee Status</p>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                  selectedOccupant.isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {selectedOccupant.feeStatus}
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!reminderModal}
        onClose={() => setReminderModal(null)}
        title="Send WhatsApp Reminder"
        maxWidth="max-w-md"
        actions={
          <button className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
            <MessageCircle size={18} />
            Send via WhatsApp
          </button>
        }
      >
        {reminderModal && (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-slate-900">
                <span className="font-semibold">{reminderModal.name}</span>
              </p>
              <p className="text-xs text-slate-600 mt-1">{reminderModal.phone}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
              <textarea
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                rows={4}
                defaultValue={`Hi ${reminderModal.name.split(' ')[0]}, this is a reminder that your payment of ${reminderModal.feeStatus === 'Pending' ? '₹2,000' : ''} is due on ${reminderModal.dueDate}. Please make the payment at your earliest convenience.`}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
