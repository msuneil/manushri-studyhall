import { Outlet } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { BottomNav } from '../components/BottomNav';
import { MoreDrawer } from '../components/MoreDrawer';
import { useState } from 'react';

export function DashboardLayout() {
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <main className="flex-1 pb-24 md:pb-0">
        <Outlet />
      </main>

      <BottomNav onMoreClick={() => setIsMoreDrawerOpen(true)} />
      <MoreDrawer isOpen={isMoreDrawerOpen} onClose={() => setIsMoreDrawerOpen(false)} />
    </div>
  );
}
