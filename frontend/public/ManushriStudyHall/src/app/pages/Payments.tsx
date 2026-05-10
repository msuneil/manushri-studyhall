import { Header } from '../components/Header';
import { Modal } from '../components/Modal';
import { Download, Filter, MessageCircle } from 'lucide-react';
import { useState } from 'react';

export function Payments() {
  const [selectedMonth, setSelectedMonth] = useState('May 2026');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [reminderModal, setReminderModal] = useState<any>(null);

  const payments = [
    { id: 1, name: 'Rahul Sharma', seat: 'AC-12', amount: '₹2,000', status: 'Paid', date: '2026-05-01', month: 'May 2026', isPaid: true, phone: '+91 98765 43210' },
    { id: 2, name: 'Priya Patel', seat: 'NAC-23', amount: '₹1,500', status: 'Paid', date: '2026-05-02', month: 'May 2026', isPaid: true, phone: '+91 98765 43211' },
    { id: 3, name: 'Amit Kumar', seat: 'AC-05', amount: '₹2,000', status: 'Pending', date: '2026-05-10', month: 'May 2026', isPaid: false, phone: '+91 98765 43212' },
    { id: 4, name: 'Sneha Reddy', seat: 'AC-34', amount: '₹2,000', status: 'Pending', date: '2026-05-11', month: 'May 2026', isPaid: false, phone: '+91 98765 43213' },
    { id: 5, name: 'Vikram Singh', seat: 'NAC-45', amount: '₹1,500', status: 'Paid', date: '2026-05-03', month: 'May 2026', isPaid: true, phone: '+91 98765 43214' },
    { id: 6, name: 'Anjali Mehta', seat: 'AC-28', amount: '₹2,000', status: 'Paid', date: '2026-05-04', month: 'May 2026', isPaid: true, phone: '+91 98765 43215' },
    { id: 7, name: 'Rohan Gupta', seat: 'NAC-17', amount: '₹1,500', status: 'Overdue', date: '2026-04-25', month: 'April 2026', isPaid: false, phone: '+91 98765 43216' },
    { id: 8, name: 'Kavya Nair', seat: 'AC-42', amount: '₹2,000', status: 'Pending', date: '2026-05-12', month: 'May 2026', isPaid: false, phone: '+91 98765 43217' },
    { id: 9, name: 'Arjun Rao', seat: 'NAC-08', amount: '₹1,500', status: 'Paid', date: '2026-05-05', month: 'May 2026', isPaid: true, phone: '+91 98765 43218' },
    { id: 10, name: 'Divya Iyer', seat: 'AC-19', amount: '₹2,000', status: 'Paid', date: '2026-05-06', month: 'May 2026', isPaid: true, phone: '+91 98765 43219' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-700';
      case 'Pending':
        return 'bg-amber-100 text-amber-700';
      case 'Overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredPayments = payments.filter(p => {
    if (selectedStatus !== 'All' && p.status !== selectedStatus) return false;
    if (selectedMonth !== 'All' && p.month !== selectedMonth) return false;
    return true;
  });

  return (
    <div className="min-h-screen">
      <Header title="Payments" />

      <div className="p-4 md:p-8">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-slate-900">All Payments</h3>
                <p className="text-sm text-slate-600 mt-1">Manage and track all payment records</p>
              </div>
              <div className="flex gap-2 md:gap-3">
                <button className="flex items-center gap-2 px-3 md:px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                  <Filter size={16} />
                  <span className="hidden sm:inline">Filter</span>
                </button>
                <button className="flex items-center gap-2 px-3 md:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm">
                  <Download size={16} />
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2 md:gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="flex-1 md:flex-none px-3 md:px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option>All</option>
                <option>May 2026</option>
                <option>April 2026</option>
                <option>March 2026</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex-1 md:flex-none px-3 md:px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option>All</option>
                <option>Paid</option>
                <option>Pending</option>
                <option>Overdue</option>
              </select>
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Occupant Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Seat Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-700">
                          {payment.name.charAt(0)}
                        </div>
                        <span className="ml-3 text-sm font-medium text-slate-900">{payment.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2.5 py-1 bg-slate-100 rounded-lg text-sm font-semibold text-slate-700">
                        {payment.seat}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-semibold">
                      {payment.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {payment.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        defaultValue={payment.status}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getStatusColor(payment.status)}`}
                      >
                        <option>Paid</option>
                        <option>Pending</option>
                        <option>Overdue</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {payment.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                      <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                        View
                      </button>
                      {!payment.isPaid && (
                        <button
                          onClick={() => setReminderModal(payment)}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          Remind
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-slate-200">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {payment.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 mb-1">{payment.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="font-medium text-indigo-600">{payment.seat}</span>
                        <span>•</span>
                        <span>{payment.month}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-slate-900 mb-1">{payment.amount}</p>
                    <p className="text-xs text-slate-600">{payment.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <select
                    defaultValue={payment.status}
                    className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getStatusColor(payment.status)}`}
                  >
                    <option>Paid</option>
                    <option>Pending</option>
                    <option>Overdue</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium">
                    View Details
                  </button>
                  {!payment.isPaid && (
                    <button
                      onClick={() => setReminderModal(payment)}
                      className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={16} />
                      Remind
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="px-4 md:px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Showing {filteredPayments.length} of {payments.length} payments
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!reminderModal}
        onClose={() => setReminderModal(null)}
        title="Send Payment Reminder"
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
              <p className="text-xs text-slate-600">Seat: {reminderModal.seat}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
              <textarea
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                rows={4}
                defaultValue={`Hi ${reminderModal.name.split(' ')[0]}, this is a reminder that your payment of ${reminderModal.amount} is due on ${reminderModal.date}. Please make the payment at your earliest convenience.`}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
