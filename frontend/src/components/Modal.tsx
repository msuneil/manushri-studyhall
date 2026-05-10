import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
  actions?: ReactNode;
  isMenu?: boolean;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-xl', actions, isMenu }: ModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in ${isMenu ? 'opacity-40' : ''}`}
        onClick={onClose}
      />

      {/* Desktop Modal / Mobile Bottom Sheet */}
      <div className={`
        relative w-full bg-white shadow-2xl transition-all duration-300
        md:rounded-2xl md:m-4 md:${maxWidth} md:max-h-[90vh]
        rounded-t-[2.5rem] max-h-[95vh] flex flex-col animate-slide-up md:animate-in
        ${isMenu ? 'mb-[88px] mx-4 rounded-3xl shadow-indigo-500/10' : 'mb-0'} md:mb-0
      `}>
        {/* Handle for mobile */}
        <div className="md:hidden flex justify-center py-2 shrink-0">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          {!isMenu && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-500" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-hide pb-20">
          {children}
        </div>

        {/* Actions */}
        {actions && (
          <div className={`px-6 pt-6 border-t border-slate-100 bg-slate-50/50 md:rounded-b-2xl shrink-0 safe-area-bottom ${!isMenu ? 'pb-12' : 'pb-6'}`}>
            <div className="mb-2">
              {actions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
