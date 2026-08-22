import React from 'react';
import { Clock } from 'lucide-react';

interface ActivityChartProps {
  weeklyData?: Array<{ day: string; date: string; hours: number }>;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ weeklyData = [] }) => {
  const days = weeklyData.length > 0
    ? weeklyData
    : [
        { day: 'Mon', date: '', hours: 0 },
        { day: 'Tue', date: '', hours: 0 },
        { day: 'Wed', date: '', hours: 0 },
        { day: 'Thu', date: '', hours: 0 },
        { day: 'Fri', date: '', hours: 0 },
        { day: 'Sat', date: '', hours: 0 },
        { day: 'Sun', date: '', hours: 0 },
      ];

  const maxHours = Math.max(1, ...days.map((d) => d.hours));
  const totalWeeklyHours = days.reduce((acc, d) => acc + d.hours, 0).toFixed(1);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Study Hours Distribution
          </span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
            {totalWeeklyHours} hrs logged past 7 days
          </h3>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200/60 dark:border-indigo-800/40">
          <Clock className="w-3.5 h-3.5" />
          <span>Real-time Activity Log</span>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
        {days.map((d) => {
          const heightPercent = d.hours > 0 ? Math.max(8, Math.round((d.hours / maxHours) * 100)) : 4;

          return (
            <div key={d.day + d.date} className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-[11px] font-mono font-bold text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                {d.hours}h
              </span>
              <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800/80 rounded-xl h-36 flex items-end p-1 relative overflow-hidden">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-lg transition-all duration-300 shadow-xs ${
                    d.hours > 0
                      ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-indigo-300'
                      : 'bg-slate-200 dark:bg-slate-700/50'
                  }`}
                />
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
