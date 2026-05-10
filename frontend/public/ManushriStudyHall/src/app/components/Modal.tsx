import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: string;
  actions?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl', actions }: ModalProps) {
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
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity hidden md:flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className={`bg-white rounded-2xl shadow-2xl ${maxWidth} w-full max-h-[90vh] overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {children}
          </div>
        </div>
      </div>

      <div
        className="md:hidden fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      <div className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl animate-slide-up max-h-[90vh] flex flex-col safe-area-bottom">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-3xl flex-shrink-0">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-4"></div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors -mr-2"
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {actions && (
          <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </>
  );
}
