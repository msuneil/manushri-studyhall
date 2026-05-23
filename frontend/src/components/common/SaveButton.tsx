import { Save, Loader2, Check } from "lucide-react";

interface SaveButtonProps {
  onClick: () => void;
  label?: string;
  isSaving?: boolean;
  isSuccess?: boolean;
}

export function SaveButton({
  onClick,
  label = "Save Changes",
  isSaving,
  isSuccess,
}: SaveButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isSaving || isSuccess}
      className={`flex-1 py-4 text-white rounded-[1.25rem] font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2
        ${
          isSuccess
            ? "bg-emerald-500 shadow-emerald-500/30 cursor-default"
            : "bg-indigo-600 shadow-indigo-500/30 hover:bg-indigo-700 active:scale-[0.98]"
        }
        ${isSaving ? "opacity-90 cursor-not-allowed" : ""}
      `}
    >
      {isSaving ? (
        <>
          <Loader2 size={18} strokeWidth={3} className="animate-spin" />
          Saving...
        </>
      ) : isSuccess ? (
        <>
          <Check size={18} strokeWidth={3} />
          Changes Saved
        </>
      ) : (
        <>
          <Save size={18} strokeWidth={3} />
          {label}
        </>
      )}
    </button>
  );
}
