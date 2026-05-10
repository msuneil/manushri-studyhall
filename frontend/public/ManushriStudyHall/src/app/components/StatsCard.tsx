import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconBgColor?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  iconBgColor = 'bg-indigo-100'
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm text-slate-600 mb-1 md:mb-2">{title}</p>
          <p className="text-xl md:text-3xl font-semibold text-slate-900">{value}</p>
          {trend && (
            <p className={`text-xs md:text-sm mt-1 md:mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value}
            </p>
          )}
        </div>
        <div className={`${iconBgColor} p-2 md:p-3 rounded-xl flex-shrink-0`}>
          <Icon size={20} className="text-indigo-600 md:w-6 md:h-6" />
        </div>
      </div>
    </div>
  );
}
