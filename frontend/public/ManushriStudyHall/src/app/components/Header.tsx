import { Search, Bell, User } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 md:px-8 py-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg md:text-2xl font-semibold text-slate-900 truncate flex-1">{title}</h2>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <button className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors active:scale-95">
            <Search size={20} className="text-slate-600" />
          </button>

          <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors active:scale-95">
            <Bell size={20} className="text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <User size={18} className="text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
