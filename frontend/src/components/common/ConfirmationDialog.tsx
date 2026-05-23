import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  useEffect(() => {
    // If the dialog opens over an already open bottom sheet,
    // we want to ensure we don't accidentally enable body scroll.
    // The bottom sheet already handles body overflow hidden.
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center px-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />

      {/* Dialog Card */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
            <AlertTriangle size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
            <p className="text-sm font-medium text-slate-500 leading-relaxed">
              {description}
            </p>
          </div>

          <div className="w-full flex flex-col gap-3 mt-2">
            <button
              onClick={onConfirm}
              className="w-full py-3.5 bg-red-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-all"
            >
              {confirmLabel}
            </button>
            <button
              onClick={onCancel}
              className="w-full py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-all"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
