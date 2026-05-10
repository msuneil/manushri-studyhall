import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { Modal } from '../components/Modal';
import { PaymentCard } from '../components/OperationalCard';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { 
  Search, 
  Filter, 
  Download, 
  MessageCircle,
  TrendingUp,
  AlertCircle,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { payments, occupants, seats } from '../data/mockData';

export default function Payments() {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const enrichedPayments = useMemo(() => {
    return payments.map(payment => {
      const occupant = occupants.find(o => o.id === payment.occupantId);
      const seat = seats.find(s => s.id === occupant?.seatId);
      return {
        ...payment,
        occupantName: occupant?.name || 'Unknown',
        seatNumber: seat?.number || 'N/A',
        phone: occupant?.phone || '',
        emergencyContact: occupant?.emergencyContact || '',
      };
    }).filter(p => {
      const matchesSearch = p.occupantName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.seatNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const totalCollected = enrichedPayments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
    const totalPending = enrichedPayments.filter(p => p.status !== 'Paid').reduce((sum, p) => sum + p.amount, 0);
    return {
      collected: totalCollected,
      pending: totalPending,
      count: enrichedPayments.length
    };
  }, [enrichedPayments]);

  const handleUpdateStatus = (status: string) => {
    showToast(`Payment marked as ${status}`, 'success');
    setSelectedPayment(null);
  };

  const handleSendReminder = (p: any) => {
    showToast(`Reminder sent to ${p.occupantName}`, 'success');
    setSelectedPayment(null);
  };

  return (
    <div className="flex flex-col min-h-full">
      <Header 
        title="Payments" 
        subtitle="Fee Tracking & Dues"
        action={
          <button className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20">
            <Download size={20} />
          </button>
        }
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Stats Strip */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Collected</p>
              <p className="text-lg font-black text-slate-900">₹{stats.collected.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase">Pending</p>
              <p className="text-lg font-black text-slate-900">₹{stats.pending.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or seat..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-wider outline-none shadow-sm"
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
            <button className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-500 shadow-sm">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {enrichedPayments.length > 0 ? (
          <>
            {/* Mobile View: Cards */}
            <div className="md:hidden grid grid-cols-1 gap-4">
              {enrichedPayments.map((payment) => (
                <div key={payment.id} onClick={() => setSelectedPayment(payment)}>
                  <PaymentCard 
                    name={payment.occupantName}
                    seat={payment.seatNumber}
                    amount={payment.amount}
                    month={payment.month}
                    status={payment.status}
                    onRemind={(e: any) => {
                      e.stopPropagation();
                      handleSendReminder(payment);
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Occupant</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Seat</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Month</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {enrichedPayments.map((payment) => (
                    <tr 
                      key={payment.id} 
                      onClick={() => setSelectedPayment(payment)}
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                            {payment.occupantName.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-slate-900">{payment.occupantName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                          {payment.seatNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-slate-900">₹{payment.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">{payment.month}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          payment.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 
                          payment.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                          <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                            <TrendingUp size={18} />
                          </button>
                          {payment.status !== 'Paid' && (
                            <button 
                              onClick={() => handleSendReminder(payment)}
                              className="p-2 hover:bg-emerald-50 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                            >
                              <MessageCircle size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <EmptyState 
            icon={CreditCard}
            title="No payments found"
            description="Adjust your filters or search to find payments."
            action={{
              label: "Reset Filters",
              onClick: () => {
                setSearchQuery('');
                setFilterStatus('All');
              }
            }}
          />
        )}
      </div>

      {/* Detailed Payment Modal */}
      <Modal
        isOpen={!!selectedPayment}
        onClose={() => setSelectedPayment(null)}
        title="Payment Details"
        actions={
          <div className="flex flex-col gap-3 w-full">
            {selectedPayment?.status !== 'Paid' && (
              <button 
                onClick={() => handleUpdateStatus('Paid')}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-500/20"
              >
                Mark as Paid
              </button>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleSendReminder(selectedPayment)}
                className="py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} /> Remind
              </button>
              <button 
                onClick={() => handleUpdateStatus('Overdue')}
                className="py-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm"
              >
                Mark Overdue
              </button>
            </div>
          </div>
        }
      >
        {selectedPayment && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl">
                {selectedPayment.occupantName.charAt(0)}
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 leading-none mb-1">{selectedPayment.occupantName}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {selectedPayment.seatNumber}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">{selectedPayment.phone}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</span>
                <span className="text-2xl font-black text-emerald-400">₹{selectedPayment.amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Month</span>
                <span className="text-base font-black">{selectedPayment.month}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Due Date</span>
                <span className={`text-base font-black ${selectedPayment.status === 'Overdue' ? 'text-red-400' : 'text-white'}`}>
                  {selectedPayment.dueDate}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reminder History</h5>
                <span className="text-[10px] font-black text-slate-400 uppercase">Total: 2</span>
              </div>
              <div className="space-y-2">
                <div className="bg-slate-50 rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-900 leading-tight">Paid Confirmation sent</p>
                    <p className="text-[10px] font-medium text-slate-400">01 May, 11:20 AM</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                    <MessageCircle size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-900 leading-tight">Due reminder sent</p>
                    <p className="text-[10px] font-medium text-slate-400">28 April, 09:15 AM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Notes</label>
              <div className="p-4 bg-slate-50 rounded-2xl text-xs font-medium text-slate-600 border border-dashed border-slate-200 min-h-[60px]">
                {selectedPayment.notes || 'No notes for this payment.'}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
