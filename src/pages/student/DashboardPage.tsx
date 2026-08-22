import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Play,
  Flame,
  BookOpen,
  Calendar,
  Award,
  Clock,
  ArrowRight,
  CheckCircle,
  FileText,
  Plus,
} from 'lucide-react';
import { Button, LinearProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useLearning } from '../../contexts/LearningContext';
import { getUserNotes, getUserSchedule } from '../../services/firebase/firestoreService';
import type { Note, ScheduleSession } from '../../types';

export const DashboardPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { courses, enrollments } = useLearning();
  const navigate = useNavigate();

  const [notes, setNotes] = useState<Note[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSession[]>([]);

  useEffect(() => {
    if (userProfile?.uid) {
      getUserNotes(userProfile.uid).then(setNotes);
      getUserSchedule(userProfile.uid).then(setSchedule);
    }
  }, [userProfile?.uid]);

  // Find user's enrolled courses with real progress
  const enrolledCourses = courses.filter((c) => enrollments[c.id]);
  const activeCourse = enrolledCourses[0] || (courses.length > 0 ? courses[0] : null);
  const activeEnrollment = activeCourse ? enrollments[activeCourse.id] : null;

  const totalCompletedLessons = Object.values(enrollments).reduce(
    (acc, e) => acc + (e.completedLessons?.length || 0),
    0
  );

  const completedCoursesCount = Object.values(enrollments).filter((e) => e.completed).length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Welcome Hero Banner */}
      <div className="relative p-6 md:p-8 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10">
              <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
              <span>LearnOS Platform</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Welcome back, {userProfile?.displayName || 'Learner'}! 👋
            </h1>
            <p className="text-xs md:text-sm text-indigo-200 leading-relaxed">
              {userProfile?.currentStreak && userProfile.currentStreak > 0 ? (
                <>
                  You’re on a <strong className="text-amber-300 font-bold">{userProfile.currentStreak}-day streak</strong>! Keep learning to maintain your momentum.
                </>
              ) : (
                'Start watching video lessons from your shared Drive curriculum to build your learning streak.'
              )}
            </p>
          </div>

          {activeCourse && (
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-4 w-full sm:w-auto">
              {activeCourse.thumbnail ? (
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 relative">
                  <img
                    src={activeCourse.thumbnail}
                    alt={activeCourse.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl bg-indigo-700/60 flex items-center justify-center flex-shrink-0 text-white font-bold">
                  <BookOpen className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0 pr-2">
                <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">
                  {activeEnrollment ? 'Continue Learning' : 'Available Course'}
                </span>
                <h4 className="text-sm font-bold truncate max-w-[180px]">{activeCourse.title}</h4>
                <div className="w-28 mt-1">
                  <LinearProgress
                    variant="determinate"
                    value={activeEnrollment?.progress || 0}
                    sx={{ height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)' }}
                  />
                </div>
              </div>
              <Button
                variant="contained"
                size="small"
                onClick={() => navigate(`/learning/${activeCourse.id}`)}
                sx={{
                  bgcolor: '#ffffff',
                  color: '#4648d4',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#f1f5f9' },
                }}
              >
                {activeEnrollment ? 'Resume' : 'Start'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Real Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Enrolled Courses</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {enrolledCourses.length}
            </h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Lessons Completed</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {totalCompletedLessons}
            </h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Active Streak</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {userProfile?.currentStreak || 0} {userProfile?.currentStreak === 1 ? 'Day' : 'Days'}
            </h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Completed Courses</span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {completedCoursesCount}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* In-Progress Courses */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {enrolledCourses.length > 0 ? 'Continue Learning' : 'Course Catalog'}
              </h3>
              <p className="text-xs text-slate-500">
                {enrolledCourses.length > 0 ? 'Your active courses in progress' : 'Courses available in your Google Drive'}
              </p>
            </div>
            <NavLink
              to="/courses"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View all ({courses.length}) <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          {courses.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">No courses available yet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Courses will appear here once synchronized into the platform repository. Check back soon or explore your productivity workspace.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(enrolledCourses.length > 0 ? enrolledCourses : courses.slice(0, 4)).map((c) => {
                const enroll = enrollments[c.id];
                const pct = enroll?.progress || 0;

                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition space-y-3"
                  >
                    <div className="h-32 rounded-xl overflow-hidden relative bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {c.thumbnail ? (
                        <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-8 h-8 text-slate-400" />
                      )}
                      <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white">
                        {c.category}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {c.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{c.description}</p>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                        <span>{pct}% Complete</span>
                        <span>{c.totalLessons} Lessons</span>
                      </div>
                      <LinearProgress variant="determinate" value={pct} sx={{ height: 6, borderRadius: 3 }} />
                    </div>

                    <Button
                      fullWidth
                      variant="contained"
                      size="small"
                      onClick={() => navigate(`/learning/${c.id}`)}
                      startIcon={<Play className="w-3.5 h-3.5 fill-white" />}
                    >
                      {enroll ? 'Resume Course' : 'Start Course'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar: Schedule & Notes */}
        <div className="space-y-6">
          {/* Study Schedule Widget */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Scheduled Study Sessions</span>
              </h4>
              <NavLink to="/schedule" className="text-xs font-semibold text-indigo-600 hover:underline">
                View All
              </NavLink>
            </div>

            {schedule.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 text-center space-y-2">
                <p className="text-xs text-slate-500">No learning sessions scheduled yet.</p>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate('/schedule')}
                  startIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Schedule Session
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {schedule.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {s.title}
                      </p>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-500" /> {s.date} • {s.startTime} - {s.endTime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Notes Widget */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>Recent Notes</span>
              </h4>
              <NavLink to="/notes" className="text-xs font-semibold text-indigo-600 hover:underline">
                Open Notes
              </NavLink>
            </div>

            {notes.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 text-center space-y-2">
                <p className="text-xs text-slate-500">No notes created yet.</p>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate('/notes')}
                  startIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Create Note
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {notes.slice(0, 3).map((n) => (
                  <NavLink
                    key={n.id}
                    to="/notes"
                    className="block p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition no-underline"
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {n.title}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {n.content.replace(/[#*`_]/g, '')}
                    </p>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
