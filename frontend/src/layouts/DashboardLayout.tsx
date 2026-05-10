import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { BottomNav } from '../components/BottomNav';
import { MoreDrawer } from '../components/MoreDrawer';

export default function DashboardLayout() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMoreOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 shrink-0">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 md:ml-0 overflow-x-hidden pb-24 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Navigation */}
      <BottomNav onMoreClick={() => setIsMoreOpen(!isMoreOpen)} isMoreActive={isMoreOpen} />
      <MoreDrawer isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
    </div>
  );
}
