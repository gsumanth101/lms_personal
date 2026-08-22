import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLearning } from '../../contexts/LearningContext';
import {
  getUserWeeklyStudyHours,
  getUserActivityHeatmapData,
} from '../../services/firebase/firestoreService';
import { ActivityChart } from '../../components/analytics/ActivityChart';
import { StreakHeatmap } from '../../components/analytics/StreakHeatmap';

export const AnalyticsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { enrollments } = useLearning();

  const [weeklyData, setWeeklyData] = useState<Array<{ day: string; date: string; hours: number }>>([]);
  const [heatmapData, setHeatmapData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (userProfile?.uid) {
      setLoading(true);
      Promise.all([
        getUserWeeklyStudyHours(userProfile.uid, userProfile.timezone),
        getUserActivityHeatmapData(userProfile.uid),
      ])
        .then(([week, heat]) => {
          setWeeklyData(week);
          setHeatmapData(heat);
        })
        .finally(() => setLoading(false));
    }
  }, [userProfile?.uid, userProfile?.timezone]);

  const totalLessons = Object.values(enrollments).reduce(
    (acc, e) => acc + (e.completedLessons?.length || 0),
    0
  );

  const totalHours = userProfile?.totalLearningMinutes
    ? (Math.round((userProfile.totalLearningMinutes / 60) * 10) / 10).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
        <div className="p-8 text-center text-sm text-slate-500">Loading learning analytics & activity logs...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Learning Analytics & Consistency Matrix
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Track study velocity, retention rates, and long-term consistency calculated from your actual learning activity.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Total Study Time</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {totalHours} Hours
          </h3>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Lessons Completed</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {totalLessons}
          </h3>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Current Streak</span>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {userProfile?.currentStreak || 0} {userProfile?.currentStreak === 1 ? 'Day' : 'Days'}
          </h3>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Total Experience (XP)</span>
          <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {userProfile?.xp?.toLocaleString() || '0'} XP
          </h3>
        </div>
      </div>

      {/* Weekly Activity Hours Bar Chart */}
      <ActivityChart weeklyData={weeklyData} />

      {/* 365-Day Streak Heatmap */}
      <StreakHeatmap
        activityMap={heatmapData}
        currentStreak={userProfile?.currentStreak || 0}
        longestStreak={userProfile?.longestStreak || 0}
        totalActiveDays={userProfile?.totalActiveDays || 0}
      />
    </div>
  );
};
