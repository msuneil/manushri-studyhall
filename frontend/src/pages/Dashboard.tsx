import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { runProductionCleanup } from '../services/cleanupService';
import { Header } from '../components/Header';
import { useToast } from '../components/Toast';
import { useConfirmation } from '../components/Confirmation';
import { useSettings } from '../features/settings/SettingsContext';
import { useData } from '../contexts/DataContext';
import { dashboardService, getActiveBillingMonth } from '../services/dashboardService';
import { SkeletonStats, SkeletonCards, SkeletonRows } from '../components/common/SkeletonLoader';

// Import clean, modular, scalable subcomponents
import { BusinessOverview } from '../components/dashboard/BusinessOverview';
import { OccupancyOverview } from '../components/dashboard/OccupancyOverview';
import { QuickActions } from '../components/dashboard/QuickActions';
import { DefaultersList } from '../components/dashboard/DefaultersList';
import { PriorityQueue } from '../components/dashboard/PriorityQueue';
import { TasksWidget } from '../components/dashboard/TasksWidget';

export default function Dashboard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { confirm } = useConfirmation();
  const { settings } = useSettings();
  const { hallId } = useAuth();
  
  // Silently trigger background production cleanup migration pass to remove duplicate demo records
  useEffect(() => {
    if (hallId) {
      runProductionCleanup(hallId);
    }
  }, [hallId]);
  
  // Connect to the lightweight live orchestrator context
  const {
    rooms,
    seats,
    occupants,
    payments,
    attendanceSessions,
    tasks,
    expenses,
    loading,
    updateTask
  } = useData();

  // Local state to manage exiting task check animations
  const [completingTasks, setCompletingTasks] = useState<string[]>([]);

  // Dynamically retrieve the timezone-safe active billing month format (e.g., "May 2026")
  const activeMonth = useMemo(() => {
    return getActiveBillingMonth();
  }, []);

  // Compute a single cohesive monthly dashboard snapshot reactively
  const dashboardSnapshot = useMemo(() => {
    return dashboardService.getMonthlyDashboardMetrics(
      payments,
      expenses,
      occupants,
      seats,
      rooms,
      settings,
      activeMonth
    );
  }, [payments, expenses, occupants, seats, rooms, settings, activeMonth]);

  // Reactively calculate priority queue rankings from the snapshot
  const priorityQueue = useMemo(() => {
    return dashboardService.derivePriorityQueue(
      dashboardSnapshot.defaulters.length,
      dashboardSnapshot.pendingDues,
      dashboardSnapshot.occupancy,
      tasks,
      attendanceSessions,
      occupants
    );
  }, [dashboardSnapshot, tasks, attendanceSessions, occupants]);

  // Filter tasks to show active ones or those currently undergoing completion fade-out
  const activeTasks = useMemo(() => {
    return tasks.filter(t => !t.isCompleted || completingTasks.includes(t.id));
  }, [tasks, completingTasks]);

  // Inline WhatsApp Reminder dispatcher using templates
  const handleSendReminder = async (p: any) => {
    const confirmed = await confirm({
      title: "Send Fee Reminder?",
      description: `This will draft and dispatch a WhatsApp payment reminder message to ${p.occupantName} for the pending amount of ₹${p.amount.toLocaleString()}.`,
      severity: "low",
      confirmLabel: "Send Reminder",
      cancelLabel: "Cancel"
    });

    if (!confirmed) return;

    const reminderText = settings.paymentSettings.reminderTemplate
      .replace(/{name}/g, p.occupantName)
      .replace(/{seatNumber}/g, p.seatNumber)
      .replace(/{month}/g, p.month)
      .replace(/{amount}/g, p.amount.toLocaleString())
      .replace(/{dueDate}/g, p.dueDate);

    let phone = p.phone || '';
    phone = phone.replace(/[^0-9]/g, '');
    if (phone.length === 10) phone = `91${phone}`;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(reminderText)}`, '_blank');
    showToast(`WhatsApp reminder opened for ${p.occupantName}!`, 'success');
  };

  // Perform live Firestore update with temporary completion fade state
  const handleCompleteTask = async (taskId: string, title: string) => {
    if (completingTasks.includes(taskId)) return;

    setCompletingTasks(prev => [...prev, taskId]);

    try {
      await updateTask(taskId, { isCompleted: true });
      showToast(`Completed: "${title}"`, 'success');
    } catch (error) {
      console.error('Task complete error:', error);
      showToast('Failed to complete task.', 'error');
    } finally {
      setTimeout(() => {
        setCompletingTasks(prev => prev.filter(id => id !== taskId));
      }, 300);
    }
  };

  // Click on priority queue row to seamlessly transition to relevant view
  const handlePriorityClick = (item: any) => {
    navigate(item.actionPath);
  };

  // Premium parchment loading skeleton matching aesthetics
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAF8F5]">
        <Header title={settings.hallDetails.name || "Manushri Study Hall"} subtitle="Syncing command surface..." />
        <div className="p-4 md:p-6.5 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
          <SkeletonStats />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="w-24 h-4 bg-slate-200 rounded-lg animate-pulse" />
              <SkeletonRows count={3} />
            </div>
            <div className="space-y-4">
              <div className="w-24 h-4 bg-slate-200 rounded-lg animate-pulse" />
              <SkeletonCards count={2} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-[#FAF8F5]">
      <Header title={settings.hallDetails.name} subtitle="Business Command Center" />

      <div className="p-4 md:p-6.5 max-w-7xl mx-auto w-full space-y-7.5 animate-in fade-in duration-200">
        
        {/* 1. Occupancy & Seat Utilization */}
        <OccupancyOverview 
          totalSeats={dashboardSnapshot.occupancy.totalSeats}
          occupiedSeats={dashboardSnapshot.occupancy.occupiedSeats}
          availableSeats={dashboardSnapshot.occupancy.availableSeats}
          acRate={dashboardSnapshot.occupancy.acRate}
          nonAcRate={dashboardSnapshot.occupancy.nonAcRate}
          acOccupied={dashboardSnapshot.occupancy.acOccupied}
          acTotal={dashboardSnapshot.occupancy.acTotal}
          nonAcOccupied={dashboardSnapshot.occupancy.nonAcOccupied}
          nonAcTotal={dashboardSnapshot.occupancy.nonAcTotal}
          onNavigateToSeats={() => navigate('/seats')}
        />

        {/* 2. Operational Priorities */}
        <PriorityQueue 
          priorityQueue={priorityQueue}
          onPriorityClick={handlePriorityClick}
          onActionClick={navigate}
        />

        {/* 3. Quick Actions */}
        <QuickActions onNavigate={navigate} />

        {/* 4. Actionable Defaulters List */}
        <DefaultersList 
          defaulters={dashboardSnapshot.defaulters}
          onSendReminder={handleSendReminder}
          onNavigateToPayments={() => navigate('/payments')}
        />

        {/* 5. Tasks Checklist */}
        <TasksWidget 
          tasks={activeTasks}
          completingTasks={completingTasks}
          onCompleteTask={handleCompleteTask}
          onNavigateToTasks={() => navigate('/tasks')}
        />

        {/* 6. Monthly Business Snapshot */}
        <BusinessOverview 
          expectedIncome={dashboardSnapshot.expectedIncome}
          collectedRevenue={dashboardSnapshot.collectedRevenue}
          pendingDues={dashboardSnapshot.pendingDues}
          monthlyExpenses={dashboardSnapshot.monthlyExpenses}
          estimatedProfit={dashboardSnapshot.estimatedNetProfit}
          onNavigateToPayments={() => navigate('/payments')}
        />

      </div>
    </div>
  );
}

