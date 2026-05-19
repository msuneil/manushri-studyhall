import { useState } from 'react';
import { Bell, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from './common/Avatar';
import { notifications } from '../data/mockData';
import { useSettings } from '../features/settings/SettingsContext';
import { BottomSheet } from './common/BottomSheet';
import { useToast } from './Toast';
import { OwnerProfileSheet } from '../features/settings/sheets/OwnerProfileSheet';
import { HallDetailsSheet } from '../features/settings/sheets/HallDetailsSheet';
import { AdminAccessSheet } from '../features/settings/sheets/AdminAccessSheet';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  showBack?: boolean;
}

export function Header({ title, subtitle, action, showBack }: HeaderProps) {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { showToast } = useToast();
  const hasUnread = notifications.some(n => !n.isRead);

  // Bottom sheets triggers
  const [isAccountSheetOpen, setIsAccountSheetOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHallOpen, setIsHallOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const handleLogout = () => {
    setIsAccountSheetOpen(false);
    showToast('Signed out successfully!', 'success');
    navigate('/login');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 md:left-64 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 md:px-8 md:py-4">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            {showBack && (
              <button 
                onClick={() => navigate(-1)}
                className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            {settings.hallDetails.logo && (
              <img 
                src={settings.hallDetails.logo} 
                alt="Logo" 
                className="w-8 h-8 rounded-lg object-cover border border-slate-100 shadow-sm shrink-0 animate-in fade-in duration-300" 
              />
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs md:text-sm text-slate-500 font-medium leading-none">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {action}
            <button 
              onClick={() => navigate('/notifications')}
              className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {hasUnread && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>
              )}
            </button>
            
            <button 
              onClick={() => setIsAccountSheetOpen(true)}
              className="focus:outline-none cursor-pointer active:scale-95 transition-all"
              aria-label="Account Settings"
            >
              <Avatar name={settings.ownerDetails.name || "Manushri Studyhall"} size="sm" />
            </button>
          </div>
        </div>
      </header>
      {/* Spacer to prevent content from jumping under the fixed header */}
      <div className="h-[65px] md:h-[81px]" />

      {/* 1. Global Account Options Sheet */}
      <BottomSheet 
        isOpen={isAccountSheetOpen} 
        onClose={() => setIsAccountSheetOpen(false)} 
        title="Account & Operations"
        size="scroll"
      >
        <div className="flex flex-col items-center text-center p-6 bg-slate-50 border border-slate-150/40 rounded-3xl mb-6">
          {settings.hallDetails.logo ? (
            <img 
              src={settings.hallDetails.logo} 
              alt="Logo" 
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0 mb-3" 
            />
          ) : (
            <Avatar name={settings.ownerDetails.name || "Admin"} size="lg" />
          )}
          <h3 className="text-sm font-bold text-slate-900 mt-2">{settings.ownerDetails.name || "Owner Profile"}</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{settings.hallDetails.name || "Study Hall"} • Admin</p>
        </div>

        <div className="space-y-2 mb-4">
          <button 
            onClick={() => {
              setIsAccountSheetOpen(false);
              setIsProfileOpen(true);
            }}
            className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 hover:bg-slate-50/50 rounded-2xl active:scale-[0.99] transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Owner Profile</p>
                <p className="text-[10px] font-medium text-slate-400">Manage contact information</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => {
              setIsAccountSheetOpen(false);
              setIsHallOpen(true);
            }}
            className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 hover:bg-slate-50/50 rounded-2xl active:scale-[0.99] transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Hall Settings</p>
                <p className="text-[10px] font-medium text-slate-400">Update branding & details</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => {
              setIsAccountSheetOpen(false);
              setIsAdminOpen(true);
            }}
            className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 hover:bg-slate-50/50 rounded-2xl active:scale-[0.99] transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Admin Access</p>
                <p className="text-[10px] font-medium text-slate-400">Change password & credentials</p>
              </div>
            </div>
          </button>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 hover:bg-rose-50/30 rounded-2xl active:scale-[0.99] transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl group-hover:bg-rose-100">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors">Logout</p>
                <p className="text-[10px] font-medium text-slate-400">Sign out of operational terminal</p>
              </div>
            </div>
          </button>
        </div>
      </BottomSheet>

      {/* 2. Settings Subsheets */}
      <OwnerProfileSheet 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        onSave={() => setIsProfileOpen(false)} 
      />

      <HallDetailsSheet 
        isOpen={isHallOpen} 
        onClose={() => setIsHallOpen(false)} 
        onSave={() => setIsHallOpen(false)} 
      />

      <AdminAccessSheet 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        onSave={() => setIsAdminOpen(false)} 
      />
    </>
  );
}
