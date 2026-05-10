import { Bell, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  showBack?: boolean;
}

export function Header({ title, subtitle, action, showBack }: HeaderProps) {
  const navigate = useNavigate();

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
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm md:text-base border border-indigo-200">
              MS
            </div>
          </div>
        </div>
      </header>
      {/* Spacer to prevent content from jumping under the fixed header */}
      <div className="h-[65px] md:h-[81px]" />
    </>
  );
}
