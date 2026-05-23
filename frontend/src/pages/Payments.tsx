import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { Modal } from '../components/Modal';
import { PaymentCard } from '../components/OperationalCard';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { useConfirmation } from '../components/Confirmation';
import { Avatar } from '../components/common/Avatar';
import { BottomSheet } from '../components/common/BottomSheet';
import { 
  Search, 
  Filter, 
  Download, 
  MessageCircle,
  TrendingUp,
  AlertCircle,
  CreditCard,
  CheckCircle2,
  FileText,
  Settings,
  Coins,
  Copy,
  Printer,
  Mail
} from 'lucide-react';
import { useData } from '../contexts/DataContext';

export default function Payments() {
  const { showToast } = useToast();
  const { confirm } = useConfirmation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  // Bottom Sheet Visibility States
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isExportSheetOpen, setIsExportSheetOpen] = useState(false);
  const [isNoteSheetOpen, setIsNoteSheetOpen] = useState(false);
  const [isReceiptSheetOpen, setIsReceiptSheetOpen] = useState(false);
  const [isReminderSheetOpen, setIsReminderSheetOpen] = useState(false);
  const [selectedReminderActivity, setSelectedReminderActivity] = useState<any>(null);
  const [noteText, setNoteText] = useState('');
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const { payments, occupants, seats, updatePayment, loading } = useData();

  // Filter active occupants only
  const activeOccupants = useMemo(() => {
    return occupants.filter(o => o.isActive && o.status === 'Active');
  }, [occupants]);

  // Derived note state mapped from live Firestore Payment.notes field
  const paymentNotes = useMemo(() => {
    const notesMap: Record<string, any[]> = {};
    payments.forEach(p => {
      if (p.notes) {
        notesMap[p.id] = [
          {
            id: `note_${p.id}`,
            content: p.notes,
            timestamp: p.updatedAt 
              ? new Date(p.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
              : 'Recently',
            createdBy: 'Admin'
          }
        ];
      } else {
        notesMap[p.id] = [];
      }
    });
    return notesMap;
  }, [payments]);

  // Derived interactive activities log
  const [localActivities, setLocalActivities] = useState<Record<string, any[]>>({});

  const paymentActivities = useMemo(() => {
    const activitiesMap: Record<string, any[]> = {};
    payments.forEach(p => {
      const liveAct = localActivities[p.id] || [];
      const defaultActs: any[] = [];
      
      // Auto-insert a note activity if there is a note in the payment document
      if (p.notes) {
        defaultActs.push({
          id: `act_note_${p.id}`,
          title: 'Note added',
          timestamp: p.updatedAt 
            ? new Date(p.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
            : 'Recently',
          type: 'note',
          relatedNoteId: `note_${p.id}`
        });
      }
      
      if (p.status === 'Paid') {
        defaultActs.push({
          id: `act_paid_${p.id}`,
          title: 'Paid Confirmation',
          timestamp: p.paidDate 
            ? new Date(p.paidDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
            : 'Recently',
          type: 'success'
        });
      }
      
      activitiesMap[p.id] = [...liveAct, ...defaultActs];
    });
    return activitiesMap;
  }, [payments, localActivities]);

  const enrichedPayments = useMemo(() => {
    return payments.map(payment => {
      const occupant = activeOccupants.find(o => o.id === payment.occupantId);
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
  }, [payments, activeOccupants, seats, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const totalCollected = enrichedPayments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
    const totalPending = enrichedPayments.filter(p => p.status !== 'Paid').reduce((sum, p) => sum + p.amount, 0);
    return {
      collected: totalCollected,
      pending: totalPending,
      count: enrichedPayments.length
    };
  }, [enrichedPayments]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <span className="px-3 py-1 text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full uppercase tracking-wider animate-in fade-in duration-200">Paid</span>;
      case 'Pending':
        return <span className="px-3 py-1 text-xs font-black text-amber-700 bg-amber-50 border border-amber-100 rounded-full uppercase tracking-wider animate-in fade-in duration-200">Pending</span>;
      case 'Overdue':
        return <span className="px-3 py-1 text-xs font-black text-rose-700 bg-rose-50 border border-rose-100 rounded-full uppercase tracking-wider animate-in fade-in duration-200">Overdue</span>;
      case 'Partial':
        return <span className="px-3 py-1 text-xs font-black text-blue-700 bg-blue-50 border border-blue-100 rounded-full uppercase tracking-wider animate-in fade-in duration-200">Partial</span>;
      default:
        return null;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return { icon: <Coins size={14} />, bg: 'bg-emerald-50 text-emerald-600' };
      case 'reminder':
        return { icon: <MessageCircle size={14} />, bg: 'bg-indigo-50 text-indigo-600' };
      case 'success':
        return { icon: <CheckCircle2 size={14} />, bg: 'bg-emerald-50 text-emerald-600' };
      case 'warning':
        return { icon: <AlertCircle size={14} />, bg: 'bg-rose-50 text-rose-600' };
      case 'adjustment':
        return { icon: <Settings size={14} />, bg: 'bg-amber-50 text-amber-600' };
      case 'note':
        return { icon: <FileText size={14} />, bg: 'bg-blue-50 text-blue-600' };
      default:
        return { icon: <FileText size={14} />, bg: 'bg-slate-50 text-slate-600' };
    }
  };

  const handleUpdateStatus = async (paymentId: string, status: string) => {
    const p = payments.find(x => x.id === paymentId);
    if (!p) return;

    const occupant = activeOccupants.find(o => o.id === p.occupantId);
    const occupantName = occupant ? occupant.name : 'this member';
    const isPaid = status === 'Paid';
    const isPending = status === 'Pending';

    const confirmed = await confirm({
      title: isPaid ? "Mark Payment as Paid?" : isPending ? "Remove Overdue Status?" : "Mark Balance as Overdue?",
      description: isPaid
        ? `Are you sure you want to mark this ₹${p.amount.toLocaleString()} payment from ${occupantName} as Paid?`
        : isPending
        ? `Are you sure you want to remove the Overdue status and mark ${occupantName}'s payment as Pending?`
        : `Are you sure you want to change the status of ${occupantName}'s payment to ${status}?`,
      severity: isPaid ? "medium" : "high",
      confirmLabel: isPaid ? "Confirm Payment" : isPending ? "Remove Overdue" : "Change Status",
      cancelLabel: "Cancel"
    });

    if (!confirmed) return;

    try {
      await updatePayment(paymentId, {
        status: status as any,
        paidDate: isPaid ? new Date().toISOString().split('T')[0] : undefined
      });

      // Add a local activity log
      const timestamp = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });

      const newActivity = {
        id: `act_${Date.now()}`,
        title: `Status changed to ${status}`,
        timestamp,
        type: isPaid ? 'success' : 'warning'
      };

      setLocalActivities(prev => ({
        ...prev,
        [paymentId]: [newActivity, ...(prev[paymentId] || [])]
      }));

      // Update selectedPayment context if active
      if (selectedPayment && selectedPayment.id === paymentId) {
        setSelectedPayment((prev: any) => ({
          ...prev,
          status,
          paidDate: isPaid ? new Date().toISOString().split('T')[0] : undefined
        }));
      }

      showToast(`Payment successfully marked as ${status}!`, 'success');
    } catch (e) {
      console.error(e);
      showToast("Failed to update payment status.", "error");
    }
  };

  const handleSendReminder = async (p: any) => {
    const confirmed = await confirm({
      title: "Send Fee Reminder?",
      description: `This will draft and dispatch a WhatsApp payment reminder message to ${p.occupantName} for the pending amount of ₹${p.amount.toLocaleString()}.`,
      severity: "low",
      confirmLabel: "Send Reminder",
      cancelLabel: "Cancel"
    });

    if (!confirmed) return;

    const timestamp = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    const reminderText = `*MANUSHRI STUDY HALL - FEE REMINDER* 🎓\n` +
      `-----------------------------------------\n` +
      `👤 *Occupant:* ${p.occupantName}\n` +
      `💺 *Seat Number:* ${p.seatNumber}\n` +
      `📅 *Month:* ${p.month}\n` +
      `💰 *Pending Amount:* ₹${p.amount.toLocaleString()}\n` +
      `🗓️ *Due Date:* ${p.dueDate}\n` +
      `⚠️ *Status:* ${p.status.toUpperCase()}\n` +
      `-----------------------------------------\n` +
      `Please settle your dues at the earliest. Thank you! 🙏`;

    const newActivity = {
      id: `act_${Date.now()}`,
      title: 'WhatsApp Payment Reminder sent',
      timestamp,
      type: 'reminder',
      message: reminderText,
      recipientName: p.occupantName,
      recipientPhone: p.phone || ''
    };

    setLocalActivities(prev => ({
      ...prev,
      [p.id]: [newActivity, ...(prev[p.id] || [])]
    }));

    // Launch WhatsApp wa.me redirect in new tab
    let phone = p.phone || '';
    phone = phone.replace(/[^0-9]/g, '');
    if (phone.length === 10) phone = `91${phone}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(reminderText)}`;
    window.open(url, '_blank');
    showToast(`WhatsApp reminder dispatched to ${p.occupantName}!`, 'success');
  };

  const handleActivityTap = (activity: any) => {
    if (activity.type === 'note' && activity.relatedNoteId) {
      setActiveNoteId(activity.relatedNoteId);
      const el = document.getElementById(activity.relatedNoteId);
      if (el) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
      }
      setTimeout(() => {
        setActiveNoteId(null);
      }, 1500);
    } else if (activity.type === 'success') {
      setIsReceiptSheetOpen(true);
    } else if (activity.type === 'reminder') {
      setSelectedReminderActivity(activity);
      setIsReminderSheetOpen(true);
    } else if (activity.type === 'warning' || activity.type === 'adjustment') {
      showToast(`Activity Log: ${activity.title} (${activity.timestamp})`, 'info');
    }
  };

  const getReceiptText = (payment: any) => {
    if (!payment) return '';
    const formattedPaidDate = payment.paidDate 
      ? new Date(payment.paidDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      
    const ref = `SH-${payment.id.toUpperCase()}-${payment.month.replace(' ', '-').toUpperCase()}`;
    
    return `*MANUSHRI STUDY HALL - FEE RECEIPT* 🎓\n` +
           `-----------------------------------------\n` +
           `👤 *Occupant:* ${payment.occupantName}\n` +
           `💺 *Seat Number:* ${payment.seatNumber}\n` +
           `📅 *Month:* ${payment.month}\n` +
           `💰 *Amount Paid:* ₹${payment.amount.toLocaleString()}\n` +
           `🗓️ *Paid Date:* ${formattedPaidDate}\n` +
           `✅ *Status:* ${payment.status.toUpperCase()}\n` +
           `-----------------------------------------\n` +
           `🎫 *Receipt Ref:* ${ref}\n` +
           `Thank you for your payment! 🙏`;
  };

  const handleShareWhatsApp = (payment: any) => {
    if (!payment) return;
    const text = getReceiptText(payment);
    let phone = payment.phone || '';
    phone = phone.replace(/[^0-9]/g, '');
    if (phone.length === 10) {
      phone = `91${phone}`;
    }
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    showToast("Opening WhatsApp with prefilled receipt message...", "success");
  };

  const handleCopySummary = (payment: any) => {
    if (!payment) return;
    const text = getReceiptText(payment);
    navigator.clipboard.writeText(text)
      .then(() => {
        showToast("Receipt copied!", "success");
      })
      .catch(() => {
        showToast("Failed to copy receipt summary.", "error");
      });
  };

  const handleDownloadPDF = () => {
    showToast("PDF Receipt download integration is planned for the next release.", "info");
  };

  const handleSendEmail = () => {
    showToast("Email receipt delivery is planned for the next release.", "info");
  };

  const handleExport = (format: string) => {
    setIsExportSheetOpen(false);
    showToast(`Generating and downloading ${format} report...`, "info");
    setTimeout(() => {
      showToast(`${format} report successfully downloaded!`, "success");
    }, 1500);
  };

  const handleSaveNote = async () => {
    if (!selectedPayment || !noteText.trim()) return;

    setIsNoteSheetOpen(false);

    const confirmed = await confirm({
      title: editingNoteId ? "Update Payment Note?" : "Save Payment Note?",
      description: editingNoteId ? "Do you want to update this note in the operational history?" : "Do you want to save this note to the operational history?",
      severity: "low",
      confirmLabel: editingNoteId ? "Update Note" : "Save Note",
      cancelLabel: "Cancel"
    });

    if (!confirmed) {
      setIsNoteSheetOpen(true);
      return;
    }

    try {
      await updatePayment(selectedPayment.id, {
        notes: noteText
      });

      // Update selectedPayment context notes so modal updates immediately
      setSelectedPayment((prev: any) => ({
        ...prev,
        notes: noteText
      }));

      setNoteText('');
      setEditingNoteId(null);
      showToast(editingNoteId ? "Payment note updated successfully!" : "Payment note saved successfully!", "success");
    } catch (e) {
      console.error(e);
      showToast("Failed to save note.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
        <Header 
          title="Payments" 
          subtitle="Fee Tracking & Dues"
          showBack
          action={undefined}
        />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-[#C8A261] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[11px] font-black text-amber-900/60 mt-4 tracking-wider uppercase">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      <Header 
        title="Payments" 
        subtitle="Fee Tracking & Dues"
        showBack
        action={
          <button 
            onClick={() => setIsExportSheetOpen(true)}
            className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
          >
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
        <div className="flex gap-3">
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
          <button 
            onClick={() => setIsFilterSheetOpen(true)}
            className="p-3.5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-slate-800 hover:border-slate-300 shadow-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            title="Filter Payments"
          >
            <Filter size={18} />
            {filterStatus !== 'All' && (
              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
            )}
          </button>
        </div>

        {/* Active Filter Indicators */}
        {filterStatus !== 'All' && (
          <div className="flex items-center gap-1.5 px-1 animate-in fade-in duration-200">
            <span className="text-[10px] font-bold text-slate-400">Filtered:</span>
            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-black uppercase tracking-wider rounded-md">
              {filterStatus}
            </span>
            <button 
              onClick={() => setFilterStatus('All')}
              className="text-[9px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider underline cursor-pointer"
            >
              Clear Filter
            </button>
          </div>
        )}

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
                          <Avatar name={payment.occupantName} size="sm" />
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
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                          <button 
                            onClick={() => setSelectedPayment(payment)}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                          >
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
          selectedPayment ? (
            <div className="flex flex-col gap-2.5 w-full pb-20">
              {selectedPayment.status !== 'Paid' ? (
                <>
                  <button 
                    onClick={() => handleUpdateStatus(selectedPayment.id, 'Paid')}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Mark as Paid
                  </button>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button 
                      onClick={() => handleSendReminder(selectedPayment)}
                      className="py-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <MessageCircle size={16} /> Remind
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedPayment.id, selectedPayment.status === 'Overdue' ? 'Pending' : 'Overdue')}
                      className="py-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      {selectedPayment.status === 'Overdue' ? 'Remove Overdue' : 'Mark Overdue'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <button 
                    onClick={() => {
                      setIsReceiptSheetOpen(true);
                    }}
                    className="py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    View Receipt
                  </button>
                  <button 
                    onClick={() => {
                      setNoteText(selectedPayment.notes || '');
                      setIsNoteSheetOpen(true);
                    }}
                    className="py-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Adjustment Note
                  </button>
                </div>
              )}
            </div>
          ) : null
        }
      >
        {selectedPayment && (
          <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-1">
            {/* Header info & clear status badges */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-3">
                <Avatar name={selectedPayment.occupantName} size="md" />
                <div>
                  <h4 className="text-sm font-black text-slate-900 leading-none mb-1">{selectedPayment.occupantName}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {selectedPayment.seatNumber}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">{selectedPayment.phone}</span>
                  </div>
                </div>
              </div>
              {getStatusBadge(selectedPayment.status)}
            </div>

            {/* Overdue operational warnings */}
            {selectedPayment.status === 'Overdue' && (
              <div className="w-full p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-2.5 items-start animate-in fade-in duration-200">
                <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-black text-rose-700 leading-tight">Payment Overdue</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-0.5 leading-normal">
                    This balance is overdue by 5 days. Consider sending a WhatsApp reminder or discussing adjustment details.
                  </p>
                </div>
              </div>
            )}

            {/* Payment Summary Box */}
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

            {/* Payment Activity Dynamic Timeline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Activity</h5>
                <span className="text-[10px] font-black text-slate-400 uppercase">
                  Total: {(paymentActivities[selectedPayment.id] || []).length}
                </span>
              </div>
              <div className="space-y-2">
                {(paymentActivities[selectedPayment.id] || []).length > 0 ? (
                  (paymentActivities[selectedPayment.id] || []).map((act) => {
                    const cfg = getActivityIcon(act.type);
                    const isNavigable = 
                      (act.type === 'note' && act.relatedNoteId) ||
                      act.type === 'success' ||
                      act.type === 'reminder';
                    return (
                      <div 
                        key={act.id} 
                        onClick={() => isNavigable && handleActivityTap(act)}
                        className={`bg-slate-50 border border-slate-100/50 rounded-2xl p-3 flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-200 ${isNavigable ? 'cursor-pointer hover:bg-indigo-50/40 hover:border-indigo-100 active:scale-[0.98] transition-all' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                          {cfg.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-slate-900 leading-tight truncate">{act.title}</p>
                          <p className="text-[10px] font-medium text-slate-400">{act.timestamp}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[10px] font-bold text-slate-400 text-center py-2">No activity events recorded.</p>
                )}
              </div>
            </div>

            {/* Payment Notes Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational History</label>
                <button
                  onClick={() => {
                    setEditingNoteId(null);
                    setNoteText('');
                    setIsNoteSheetOpen(true);
                  }}
                  className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase cursor-pointer flex items-center gap-1"
                >
                  <FileText size={12} /> Add Note
                </button>
              </div>
              <div className="space-y-2 pb-6">
                {(paymentNotes[selectedPayment.id] || []).length > 0 ? (
                  (paymentNotes[selectedPayment.id] || []).map((note, index) => (
                    <div 
                      key={note.id} 
                      id={note.id}
                      className={`p-4 rounded-2xl border animate-in slide-in-from-bottom-2 duration-300 transition-all ${
                        activeNoteId === note.id 
                          ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-200 shadow-md' 
                          : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className={`text-xs font-bold whitespace-pre-wrap leading-relaxed ${activeNoteId === note.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                          {note.content}
                        </p>
                        {index === 0 && (
                          <button
                            onClick={() => {
                              setEditingNoteId(note.id);
                              setNoteText(note.content);
                              setIsNoteSheetOpen(true);
                            }}
                            className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 uppercase shrink-0 transition-colors"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      <p className={`text-[10px] font-medium mt-2 tracking-wide ${activeNoteId === note.id ? 'text-indigo-500' : 'text-slate-400'}`}>
                        {note.timestamp} · {note.createdBy} {note.editedAt && <span className="opacity-75 italic">(edited)</span>}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-400 text-center border border-dashed border-slate-200 min-h-[60px] flex items-center justify-center">
                    No operational notes recorded.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 3. Custom Bottom Sheet for Filter Drawer */}
      <BottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title="Filter Payments"
        size="scroll"
      >
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Status</p>
          <div className="grid grid-cols-1 gap-2.5">
            {['All', 'Paid', 'Pending', 'Overdue'].map((status) => {
              const isSelected = filterStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => {
                    setFilterStatus(status);
                    setIsFilterSheetOpen(false);
                  }}
                  className={`w-full p-4 rounded-2xl text-left text-sm font-black transition-all flex items-center justify-between active:scale-[0.98] cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-600 border-2 border-indigo-600/20 font-black'
                      : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100/80 font-bold'
                  }`}
                >
                  <span>{status === 'All' ? 'All Payments' : status}</span>
                  {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />}
                </button>
              );
            })}
          </div>
        </div>
      </BottomSheet>

      {/* 4. Export Options Sheet - Friction-free immediate simulations */}
      <BottomSheet
        isOpen={isExportSheetOpen}
        onClose={() => setIsExportSheetOpen(false)}
        title="Export Reports"
        size="scroll"
      >
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Export Format</p>
          <div className="grid grid-cols-1 gap-2.5">
            {[
              { label: "Export as PDF", type: "PDF", desc: "Download high-fidelity printable statement" },
              { label: "Export as CSV", type: "CSV", desc: "Download raw spreadsheet for custom processing" },
              { label: "Monthly Report", type: "Monthly", desc: "Overview of fees collected this month" },
              { label: "Outstanding Dues Report", type: "Dues", desc: "List of all pending and overdue balances" }
            ].map((option) => (
              <button
                key={option.type}
                onClick={() => handleExport(option.label)}
                className="w-full p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 rounded-2xl text-left transition-all active:scale-[0.98] cursor-pointer flex flex-col gap-0.5"
              >
                <span className="text-sm font-black text-slate-900">{option.label}</span>
                <span className="text-[10px] font-bold text-slate-400">{option.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* 5. Note Sheet - Lightweight simple notes capture */}
      <BottomSheet
        isOpen={isNoteSheetOpen}
        onClose={() => setIsNoteSheetOpen(false)}
        title={selectedPayment?.notes ? "Edit Payment Note" : "Add Payment Note"}
        size="scroll"
        footer={
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSaveNote}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider active:scale-[0.98] transition-all cursor-pointer"
            >
              Save Note
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
            Notes are saved in the system timeline to track partial payments or adjustments.
          </p>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Type your transaction note here..."
            className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </BottomSheet>

      {/* 6. Receipt Preview Sheet */}
      <BottomSheet
        isOpen={isReceiptSheetOpen}
        onClose={() => setIsReceiptSheetOpen(false)}
        title="Receipt Preview"
        size="scroll"
      >
        {selectedPayment && (
          <div className="space-y-6">
            {/* Ticket Card Container */}
            <div className="relative bg-white rounded-3xl border border-slate-200 p-6 shadow-md overflow-hidden animate-in fade-in duration-300">
              {/* Rounded cutouts on left and right for physical receipt feel */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-6 h-6 rounded-full bg-slate-100 border-r border-slate-200" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-6 h-6 rounded-full bg-slate-100 border-l border-slate-200" />
              
              {/* Header inside ticket */}
              <div className="text-center pb-6 border-b border-dashed border-slate-200/80">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full mb-3">
                  <CheckCircle2 size={24} className="stroke-[2.5]" />
                </div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none mb-1">Fee Receipt</h4>
                <p className="text-[10px] font-bold text-slate-400">MANUSHRI STUDY HALL</p>
              </div>

              {/* Receipt Detail Fields */}
              <div className="py-6 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Occupant</span>
                  <span className="font-black text-slate-900">{selectedPayment.occupantName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Seat Number</span>
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md font-black">
                    {selectedPayment.seatNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Payment Month</span>
                  <span className="font-bold text-slate-700">{selectedPayment.month}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Paid Date</span>
                  <span className="font-bold text-slate-700">
                    {selectedPayment.paidDate ? new Date(selectedPayment.paidDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400 uppercase tracking-wider">Status</span>
                  {getStatusBadge(selectedPayment.status)}
                </div>
                
                <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Amount Paid</span>
                  <span className="text-xl font-black text-emerald-600">₹{selectedPayment.amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Branded Reference placeholder at the bottom */}
              <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Receipt Reference</p>
                <p className="text-xs font-mono font-bold text-slate-700 tracking-wider">
                  {`SH-${selectedPayment.id.toUpperCase()}-${selectedPayment.month.replace(' ', '-').toUpperCase()}`}
                </p>
              </div>
            </div>

            {/* Actions Grid */}
            <div className="space-y-2.5">
              <button 
                onClick={() => handleShareWhatsApp(selectedPayment)}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <MessageCircle size={18} />
                Share via WhatsApp
              </button>
              
              <div className="grid grid-cols-3 gap-2.5">
                <button 
                  onClick={() => handleCopySummary(selectedPayment)}
                  className="py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer border border-slate-100"
                >
                  <Copy size={16} />
                  <span>Copy Text</span>
                </button>
                <button 
                  onClick={handleDownloadPDF}
                  className="py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer border border-slate-100/50 opacity-70"
                >
                  <Printer size={16} />
                  <span>PDF Receipt</span>
                </button>
                <button 
                  onClick={handleSendEmail}
                  className="py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer border border-slate-100/50 opacity-70"
                >
                  <Mail size={16} />
                  <span>Email</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </BottomSheet>

      {/* 7. Reminder Preview Sheet */}
      <BottomSheet
        isOpen={isReminderSheetOpen}
        onClose={() => setIsReminderSheetOpen(false)}
        title="Reminder Preview"
        size="scroll"
      >
        {selectedPayment && selectedReminderActivity && (
          <div className="space-y-6">
            {/* Meta Info */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 space-y-3 text-xs shadow-inner">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Recipient</span>
                <span className="font-black text-slate-900">{selectedReminderActivity.recipientName || selectedPayment.occupantName}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100/50 pt-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Phone Number</span>
                <span className="font-black text-slate-700">{selectedReminderActivity.recipientPhone || selectedPayment.phone}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100/50 pt-2">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Sent Timestamp</span>
                <span className="font-black text-slate-500">{selectedReminderActivity.timestamp}</span>
              </div>
            </div>

            {/* Message Preview Block */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Reminder Message</h5>
              <div className="bg-emerald-50 border border-emerald-100/60 rounded-3xl p-5 whitespace-pre-wrap font-mono text-xs text-slate-800 leading-relaxed relative overflow-hidden shadow-sm">
                <div className="absolute top-4 right-4 text-emerald-600">
                  <MessageCircle size={18} />
                </div>
                {selectedReminderActivity.message || (
                  `*MANUSHRI STUDY HALL - FEE REMINDER* 🎓\n` +
                  `-----------------------------------------\n` +
                  `👤 *Occupant:* ${selectedPayment.occupantName}\n` +
                  `💺 *Seat Number:* ${selectedPayment.seatNumber}\n` +
                  `📅 *Month:* ${selectedPayment.month}\n` +
                  `💰 *Pending Amount:* ₹${selectedPayment.amount.toLocaleString()}\n` +
                  `🗓️ *Due Date:* ${selectedPayment.dueDate}\n` +
                  `⚠️ *Status:* ${selectedPayment.status.toUpperCase()}\n` +
                  `-----------------------------------------\n` +
                  `Please settle your dues at the earliest. Thank you! 🙏`
                )}
              </div>
            </div>
            
            {/* Primary manual trigger to resend */}
            <button 
              onClick={() => {
                const messageText = selectedReminderActivity.message || (
                  `*MANUSHRI STUDY HALL - FEE REMINDER* 🎓\n` +
                  `-----------------------------------------\n` +
                  `👤 *Occupant:* ${selectedPayment.occupantName}\n` +
                  `💺 *Seat Number:* ${selectedPayment.seatNumber}\n` +
                  `📅 *Month:* ${selectedPayment.month}\n` +
                  `💰 *Pending Amount:* ₹${selectedPayment.amount.toLocaleString()}\n` +
                  `🗓️ *Due Date:* ${selectedPayment.dueDate}\n` +
                  `⚠️ *Status:* ${selectedPayment.status.toUpperCase()}\n` +
                  `-----------------------------------------\n` +
                  `Please settle your dues at the earliest. Thank you! 🙏`
                );
                
                let phone = selectedReminderActivity.recipientPhone || selectedPayment.phone || '';
                phone = phone.replace(/[^0-9]/g, '');
                if (phone.length === 10) phone = `91${phone}`;
                const url = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;
                window.open(url, '_blank');
                showToast("Re-opening WhatsApp reminder...", "success");
              }}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <MessageCircle size={18} />
              Resend on WhatsApp
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
