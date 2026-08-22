import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Play, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { LinearProgress, Avatar, Button } from '@mui/material';
import type { Course, Enrollment } from '../../types';

interface CourseCardProps {
  course: Course;
  enrollment?: Enrollment;
  layout?: 'grid' | 'list';
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  enrollment,
  layout = 'grid',
}) => {
  const navigate = useNavigate();
  const isEnrolled = Boolean(enrollment);
  const progress = enrollment?.progress || 0;
  const isCompleted = enrollment?.completed || progress >= 100;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins} mins`;
  };

  if (layout === 'list') {
    return (
      <div className="flex flex-col sm:flex-row items-stretch gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:shadow-lg transition-all duration-200 group">
        <div className="w-full sm:w-56 h-36 flex-shrink-0 rounded-xl overflow-hidden relative">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute top-2 left-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-sm">
              {course.level}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {course.category}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDuration(course.totalDuration)}
              </span>
            </div>

            <NavLink to={`/courses/${course.id}`} className="no-underline">
              <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                {course.title}
              </h3>
            </NavLink>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
              {course.description}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Avatar
                src={course.instructor.avatar}
                alt={course.instructor.name}
                sx={{ width: 24, height: 24 }}
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {course.instructor.name}
              </span>
            </div>

            {isEnrolled ? (
              <div className="flex items-center gap-3">
                <div className="w-24 hidden md:block">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-500 mb-0.5">
                    <span>{progress}%</span>
                  </div>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </div>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate(`/learning/${course.id}`)}
                  startIcon={<Play className="w-3.5 h-3.5 fill-white" />}
                >
                  {isCompleted ? 'Review' : 'Resume'}
                </Button>
              </div>
            ) : (
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(`/courses/${course.id}`)}
                endIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View Course
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between h-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div>
        {/* Course Thumbnail */}
        <div className="relative w-full h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-sm">
              {course.level}
            </span>
          </div>

          {isCompleted && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-md">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Completed</span>
            </div>
          )}
        </div>

        {/* Course Content Info */}
        <div className="p-5">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[11px]">
              {course.category}
            </span>
            <span className="text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(course.totalDuration)}
            </span>
          </div>

          <NavLink to={`/courses/${course.id}`} className="no-underline">
            <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition leading-snug">
              {course.title}
            </h3>
          </NavLink>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
            {course.description}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <Avatar
              src={course.instructor.avatar}
              alt={course.instructor.name}
              sx={{ width: 26, height: 26 }}
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                {course.instructor.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Progress / CTA */}
      <div className="p-5 pt-0">
        {isEnrolled && (
          <div className="mb-3">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 6, borderRadius: 3 }}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          {isEnrolled ? (
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate(`/learning/${course.id}`)}
              startIcon={<Play className="w-4 h-4 fill-white" />}
            >
              {isCompleted ? 'Review Lessons' : 'Resume Learning'}
            </Button>
          ) : (
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate(`/courses/${course.id}`)}
              endIcon={<ArrowRight className="w-4 h-4" />}
            >
              View Course Details
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
