interface CancelButtonProps {
  onClick: () => void;
}

export function CancelButton({ onClick }: CancelButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="px-6 py-4 bg-slate-100 text-slate-500 rounded-[1.25rem] font-black text-sm uppercase tracking-widest active:scale-[0.98] transition-all"
    >
      Cancel
    </button>
  );
}
