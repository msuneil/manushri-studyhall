import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

type SheetSize = 'sm' | 'md' | 'lg' | 'scroll';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: SheetSize;
}

const sizeClasses: Record<SheetSize, string> = {
  sm: 'max-h-[50dvh]',
  md: 'max-h-[70dvh]',
  lg: 'max-h-[85dvh]',
  scroll: 'max-h-[90dvh]',
};

export function BottomSheet({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'scroll'
}: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className={`relative w-full bg-white rounded-t-[2.5rem] flex flex-col animate-in slide-in-from-bottom duration-300 shadow-2xl overflow-hidden ${sizeClasses[size]}`}>
        {/* Handle */}
        <div className="flex justify-center py-3 shrink-0">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 shrink-0">
          <h3 className="text-xl font-black text-slate-900">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-100 text-slate-500 rounded-full active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
            aria-label="Close"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-6 py-2 scrollbar-hide pb-[env(safe-area-inset-bottom)]">
          <div className="pb-32">
            {children}
          </div>
        </div>

        {/* Sticky Footer */}
        {footer && (
          <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-white border-t border-slate-100/80 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] shrink-0 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-20">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
