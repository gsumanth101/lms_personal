import React from 'react';
import { Flame, Sparkles, Trophy } from 'lucide-react';
import { Tooltip } from '@mui/material';

interface StreakHeatmapProps {
  activityMap?: Record<string, number>;
  currentStreak?: number;
  longestStreak?: number;
  totalActiveDays?: number;
}

export const StreakHeatmap: React.FC<StreakHeatmapProps> = ({
  activityMap = {},
  currentStreak = 0,
  longestStreak = 0,
  totalActiveDays = 0,
}) => {
  // Generate 52 weeks (364 days) ending on today
  const weeks = 52;
  const daysPerWeek = 7;
  const matrix: Array<Array<{ date: string; displayDate: string; count: number; level: number }>> = [];

  const today = new Date();
  const totalDays = weeks * daysPerWeek;
  const startDate = new Date(today.getTime() - (totalDays - 1) * 24 * 60 * 60 * 1000);

  let currentDay = new Date(startDate);

  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < daysPerWeek; d++) {
      const dateStr = currentDay.toISOString().split('T')[0];
      const count = activityMap[dateStr] || 0;
      const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : count === 3 ? 3 : 4;

      col.push({
        date: dateStr,
        displayDate: currentDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        count,
        level,
      });

      currentDay.setDate(currentDay.getDate() + 1);
    }
    matrix.push(col);
  }

  const getColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-indigo-200 dark:bg-indigo-950/80';
      case 2:
        return 'bg-indigo-400 dark:bg-indigo-800';
      case 3:
        return 'bg-indigo-500 dark:bg-indigo-600';
      case 4:
        return 'bg-indigo-600 dark:bg-indigo-400';
      default:
        return 'bg-slate-100 dark:bg-slate-800/80';
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30">
          <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-xs">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Current Streak
            </p>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">
              {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-900/30">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Longest Streak
            </p>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">
              {longestStreak} {longestStreak === 1 ? 'Day' : 'Days'}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/30">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Total Active Days
            </p>
            <h4 className="text-xl font-black text-slate-900 dark:text-white">
              {totalActiveDays} {totalActiveDays === 1 ? 'Day' : 'Days'}
            </h4>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            365-Day Study Activity Matrix
          </h4>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Less</span>
            <span className="w-3 h-3 rounded-xs bg-slate-100 dark:bg-slate-800" />
            <span className="w-3 h-3 rounded-xs bg-indigo-200 dark:bg-indigo-950" />
            <span className="w-3 h-3 rounded-xs bg-indigo-400 dark:bg-indigo-800" />
            <span className="w-3 h-3 rounded-xs bg-indigo-600 dark:bg-indigo-400" />
            <span>More</span>
          </div>
        </div>

        {totalActiveDays === 0 && (
          <p className="text-xs text-slate-500 mb-2">
            Start learning today to build your streak and light up your activity matrix!
          </p>
        )}

        {/* Scrolling Grid */}
        <div className="overflow-x-auto pb-2 subtle-scroll">
          <div className="flex gap-1 min-w-[720px]">
            {matrix.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((day, dIdx) => (
                  <Tooltip
                    key={dIdx}
                    title={`${day.displayDate}: ${day.count} activities logged`}
                    arrow
                  >
                    <div
                      className={`w-3 h-3 rounded-xs transition-all hover:scale-125 cursor-pointer ${getColor(
                        day.level
                      )}`}
                    />
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
