import React from 'react';
import { MetricTile } from './MetricTile';
import { SectionHeader } from './SectionHeader';
import { formatCurrency } from '../../services/dashboardService';

interface BusinessOverviewProps {
  expectedIncome: number;
  collectedRevenue: number;
  pendingDues: number;
  monthlyExpenses: number;
  estimatedProfit: number;
  onNavigateToPayments: () => void;
}

export const BusinessOverview: React.FC<BusinessOverviewProps> = ({
  expectedIncome,
  collectedRevenue,
  pendingDues,
  monthlyExpenses,
  estimatedProfit,
  onNavigateToPayments,
}) => {
  const collectionPercent = expectedIncome > 0 ? Math.round((collectedRevenue / expectedIncome) * 100) : 0;

  return (
    <section className="space-y-3">
      <SectionHeader 
        title="Monthly Business Snapshot" 
        subtitle="May 2026 • Financial Heartbeat" 
        actionLabel="Review Ledger"
        onActionClick={onNavigateToPayments}
      />
      
      {/* 1. Main Hero Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Expected Monthly Income Card */}
        <div className="bg-[#FFFDFB] p-6 rounded-2xl border border-[#F4EFE6] shadow-[0_16px_40px_rgba(180,160,140,0.04),0_2px_8px_rgba(180,160,140,0.02)] flex flex-col justify-between space-y-4.5 transition-all duration-200 hover:border-[#EAE2D2] hover:shadow-[0_18px_48px_rgba(180,160,140,0.06)]">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expected Monthly Income</p>
            <p className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mt-1.5 leading-none">{formatCurrency(expectedIncome)}</p>
            <p className="text-xs font-medium text-slate-400 leading-snug mt-1.5">Total projected seat cycle receivables</p>
          </div>
          <div className="pt-3 border-t border-[#FAF7EE] flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            <span>Billing Target</span>
            <span className="text-amber-700 font-bold">Active Cycle</span>
          </div>
        </div>

        {/* Estimated Net Profit Highlight Card (Pastel Mint Accent - High-contrast Standout) */}
        <div className="bg-[#F5FAF6] p-6 rounded-2xl border border-emerald-500/20 shadow-[0_20px_50px_rgba(16,185,129,0.06),0_2px_12px_rgba(16,185,129,0.03)] ring-4 ring-emerald-50/30 flex flex-col justify-between space-y-4.5 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-[0_24px_60px_rgba(16,185,129,0.09)] hover:scale-[1.005]">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Estimated Net Profit</p>
              <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50/80 px-2.5 py-0.5 rounded-lg border border-emerald-200/50 shadow-[0_1px_2px_rgba(16,185,129,0.04)]">
                Healthy
              </span>
            </div>
            <p className="text-3xl sm:text-4xl font-black text-emerald-800 tracking-tight mt-1.5 leading-none">{formatCurrency(estimatedProfit)}</p>
            <p className="text-xs font-semibold text-emerald-700/85 leading-snug mt-1.5">Projected revenue minus operations overhead</p>
          </div>
          <div className="pt-3 border-t border-emerald-500/10 flex items-center justify-between text-[9px] font-bold text-emerald-700 uppercase tracking-wider">
            <span>Profit Margin</span>
            <span className="font-extrabold text-emerald-750">{expectedIncome > 0 ? Math.round((estimatedProfit / expectedIncome) * 100) : 0}% Projected</span>
          </div>
        </div>
      </div>

      {/* 2. Secondary Financial Metric Breakdown Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricTile 
          label="Amount Collected" 
          value={formatCurrency(collectedRevenue)}
          subtitle="Cleared occupant cycle fees"
          progressBarPercent={collectionPercent}
          progressBarColor="bg-amber-600"
          onClick={onNavigateToPayments}
        />
        
        <MetricTile 
          label="Pending Dues" 
          value={formatCurrency(pendingDues)}
          subtitle="Requires direct recovery follow-up"
          badge="Action Required"
          badgeColor="bg-rose-50 text-rose-700 border-rose-100/50"
          onClick={onNavigateToPayments}
        />
        
        <MetricTile 
          label="Monthly Expenses" 
          value={formatCurrency(monthlyExpenses)}
          subtitle="Fixed rent + utility operational costs"
          badge="Overhead"
          badgeColor="bg-slate-50 text-slate-600 border-slate-200/50"
        />
      </div>
    </section>
  );
};

