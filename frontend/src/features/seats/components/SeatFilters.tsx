import { Search } from 'lucide-react';

interface SeatFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  blockedLabel?: string;
}

export function SeatFilters({ searchQuery, onSearchChange, activeFilter, onFilterChange, blockedLabel }: SeatFiltersProps) {
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'vacant', label: 'Vacant' },
    { id: 'occupied', label: 'Occupied' },
    { id: 'overdue', label: 'Overdue' },
    ...(blockedLabel ? [{ id: 'blocked', label: blockedLabel }] : [])
  ];

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search seat number (e.g. AC-05)..." 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm outline-none text-sm font-medium"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide shrink-0">
        <div className="p-1 bg-slate-100/80 rounded-2xl border border-slate-200/50 flex w-full">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                activeFilter === f.id 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
