import { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, Info, Loader2 } from 'lucide-react';
import { useToast } from './Toast';

export type ConfirmationSeverity = 'low' | 'medium' | 'high' | 'destructive';
export type ConfirmationType = 'sheet' | 'dialog';

export interface ConfirmationOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: ConfirmationSeverity;
  type?: ConfirmationType;
  onConfirm?: () => Promise<void> | void;
  onCancel?: () => void;
  checkConflict?: () => Promise<boolean> | boolean; // Hook for stale state conflict check
}

interface ConfirmationContextType {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmationOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmationOptions) => {
    setOptions(opts);
    setError(null);
    setLoading(false);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  // Standard generic parser to sanitize error messages for operator safety
  const sanitizeErrorMessage = (err: any): string => {
    if (!err) return "An unexpected operational conflict occurred. Please try again.";
    
    const message = err.message || "";
    // Intercept technical stack traces, Firebase raw errors, and internal system errors
    const technicalKeywords = [
      'firebase', 'permission-denied', 'auth/', 'sql', 'exception', 'stack', 'undefined', 'null', 'internal server error'
    ];
    const isTechnical = technicalKeywords.some(kw => message.toLowerCase().includes(kw));

    if (isTechnical) {
      return "Unable to complete the action due to a temporary system conflict. Please try again.";
    }

    return message || "An unexpected operational conflict occurred. Please try again.";
  };

  const handleConfirm = async () => {
    if (loading) return;
    setError(null);
    try {
      setLoading(true);
      
      // Perform future-ready conflict check
      if (options?.checkConflict) {
        const hasConflict = await options.checkConflict();
        if (hasConflict) {
          throw new Error("This action can no longer be completed as the record's operational state has changed.");
        }
      }

      if (options?.onConfirm) {
        await options.onConfirm();
      }
      if (resolveRef.current) resolveRef.current(true);
      setOptions(null);
    } catch (err: any) {
      console.error("Confirmation action failed:", err);
      const errMsg = sanitizeErrorMessage(err);
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (loading) return;
    if (resolveRef.current) resolveRef.current(false);
    if (options?.onCancel) options.onCancel();
    setOptions(null);
  };

  const severity = options?.severity || 'medium';
  const type = options?.type || (severity === 'low' || severity === 'medium' ? 'sheet' : 'dialog');
  const confirmLabel = options?.confirmLabel || (severity === 'destructive' ? 'Delete' : 'Confirm');
  const cancelLabel = options?.cancelLabel || 'Cancel';

  const getSeverityColors = () => {
    switch (severity) {
      case 'low':
        return {
          iconBg: 'bg-indigo-50 text-indigo-600',
          confirmBtn: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/10',
        };
      case 'medium':
        return {
          iconBg: 'bg-emerald-50 text-emerald-600',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/10',
        };
      case 'high':
        return {
          iconBg: 'bg-amber-50 text-amber-600',
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/10',
        };
      case 'destructive':
        return {
          iconBg: 'bg-rose-50 text-rose-600',
          confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/10',
        };
    }
  };

  const getSeverityIcon = () => {
    switch (severity) {
      case 'low':
        return <Info size={24} strokeWidth={2.5} />;
      case 'medium':
        return <CheckCircle2 size={24} strokeWidth={2.5} />;
      case 'high':
        return <AlertTriangle size={24} strokeWidth={2.5} />;
      case 'destructive':
        return <ShieldAlert size={24} strokeWidth={2.5} />;
    }
  };

  const colors = getSeverityColors();

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      {options && (
        <div className={`fixed inset-0 z-[160] flex ${type === 'sheet' ? 'items-end justify-center' : 'items-center justify-center p-6'}`}>
          {/* Backdrop */}
          <div 
            className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 ${
              loading ? 'pointer-events-none' : 'cursor-pointer'
            }`}
            onClick={handleCancel}
          />

          {/* Card wrapper */}
          <div 
            className={`
              relative bg-white shadow-2xl transition-all duration-300
              ${type === 'sheet' 
                ? 'w-full max-w-md rounded-t-[2rem] rounded-b-none p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-300' 
                : 'w-full max-w-sm rounded-[2.5rem] p-6 animate-in zoom-in-95 duration-200'}
            `}
          >
            <div className="flex flex-col items-center text-center gap-4">
              {/* Header Icon */}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${colors.iconBg}`}>
                {getSeverityIcon()}
              </div>

              {/* Title & Desc */}
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight">{options.title}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed px-1">
                  {options.description}
                </p>
              </div>

              {/* High Risk explanation banner */}
              {(severity === 'high' || severity === 'destructive') && !error && (
                <div className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-left flex gap-2.5 items-start mt-1">
                  <div className="text-amber-500 shrink-0 mt-0.5">
                    <AlertTriangle size={15} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 leading-normal">
                    This is an operationally sensitive change. Approving this will immediately update records across the dashboard.
                  </p>
                </div>
              )}

              {/* Lightweight inline error banner */}
              {error && (
                <div 
                  className="w-full p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-left flex gap-2.5 items-start mt-1 animate-in fade-in duration-200"
                  aria-live="polite"
                >
                  <div className="text-rose-500 shrink-0 mt-0.5">
                    <AlertTriangle size={15} className="animate-pulse" />
                  </div>
                  <p className="text-[10px] font-bold text-rose-600 leading-normal">
                    {error}
                  </p>
                </div>
              )}

              {/* Actions Grid */}
              <div className="w-full flex flex-col gap-2.5 mt-2">
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  aria-busy={loading}
                  aria-disabled={loading}
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
                    loading ? 'opacity-85 cursor-not-allowed' : ''
                  } ${colors.confirmBtn}`}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                      Processing...
                    </>
                  ) : (
                    confirmLabel
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  aria-disabled={loading}
                  className={`w-full py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-200 ${
                    loading 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-slate-100 active:scale-[0.98] cursor-pointer'
                  }`}
                >
                  {cancelLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmationContext.Provider>
  );
}

export function useConfirmation() {
  const context = useContext(ConfirmationContext);
  if (!context) throw new Error('useConfirmation must be used within a ConfirmationProvider');
  return context;
}
