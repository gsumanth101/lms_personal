import React, { useEffect, useState } from 'react';
import { Trophy, Award, Lock, CheckCircle2 } from 'lucide-react';
import { LinearProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useLearning } from '../../contexts/LearningContext';
import {
  computeUserAchievements,
  getUserQuizAttempts,
} from '../../services/firebase/firestoreService';
import type { QuizAttempt } from '../../types';

export const AchievementsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { enrollments } = useLearning();
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    if (userProfile?.uid) {
      getUserQuizAttempts(userProfile.uid).then(setQuizAttempts);
    }
  }, [userProfile?.uid]);

  const achievements = computeUserAchievements(userProfile, enrollments, quizAttempts);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const currentLevel = userProfile?.level || 1;
  const currentXP = userProfile?.xp || 0;
  const nextLevelXP = currentLevel * 500;
  const levelProgress = Math.min(100, Math.round((currentXP / nextLevelXP) * 100));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Achievements & Milestones
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Milestone badges unlocked by watching lessons, completing courses, passing quizzes, and maintaining learning streaks.
        </p>
      </div>

      {/* Real XP & Rank Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-indigo-300 shadow-inner">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-300">
              Current Rank
            </span>
            <h2 className="text-2xl font-black">Level {currentLevel}</h2>
            <p className="text-xs text-indigo-200 mt-0.5">
              {currentXP.toLocaleString()} XP • {unlockedCount}/{achievements.length} Badges Unlocked
            </p>
          </div>
        </div>

        <div className="w-full md:w-72">
          <div className="flex justify-between text-xs font-semibold text-indigo-200 mb-1.5">
            <span>Level {currentLevel} Progress</span>
            <span>
              {currentXP} / {nextLevelXP} XP
            </span>
          </div>
          <LinearProgress
            variant="determinate"
            value={levelProgress}
            sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.2)' }}
          />
        </div>
      </div>

      {/* Real Achievements Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Curriculum Badges</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-5 rounded-2xl border transition ${
                ach.unlocked
                  ? 'bg-white dark:bg-slate-900 border-indigo-200/80 dark:border-indigo-900/60 shadow-sm'
                  : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  {ach.unlocked ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    ach.unlocked
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-slate-200/80 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {ach.unlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>

              <div className="mt-3 space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ach.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{ach.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">+{ach.xp} XP</span>
                {ach.maxProgress && (
                  <span className="text-slate-500">
                    {ach.progress || 0}/{ach.maxProgress}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
