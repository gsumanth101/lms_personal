import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import {
  Play,
  Clock,
  Video,
  HardDrive,
  ChevronRight,
} from 'lucide-react';
import { Button, Avatar, LinearProgress } from '@mui/material';
import { useLearning } from '../../contexts/LearningContext';
import { getLessonsForCourse } from '../../services/firebase/firestoreService';
import type { Lesson } from '../../types';

export const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { courses, enrollments, enrollCourse } = useLearning();
  const navigate = useNavigate();

  const course = courses.find((c) => c.id === id);
  const enrollment = id ? enrollments[id] : null;
  const isEnrolled = Boolean(enrollment);

  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    const fetchLessons = async () => {
      if (id) {
        try {
          const l = await getLessonsForCourse(id);
          setLessons(l);
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchLessons();
  }, [id]);

  if (!course) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Course Not Found</h2>
        <Button variant="contained" onClick={() => navigate('/courses')} sx={{ mt: 2 }}>
          Back to Courses
        </Button>
      </div>
    );
  }

  const handleStartOrResume = async () => {
    if (!isEnrolled && id) {
      await enrollCourse(id);
    }
    navigate(`/learning/${course.id}`);
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins} mins`;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <NavLink to="/courses" className="hover:text-indigo-600 dark:hover:text-indigo-400">Courses</NavLink>
        <ChevronRight className="w-3.5 h-3.5" />
        <span>{course.category}</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{course.title}</span>
      </div>

      {/* Hero Overview Header */}
      <div className="p-6 md:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md flex flex-col lg:flex-row gap-8 items-start">
        {/* Left: Thumbnail Preview */}
        <div className="w-full lg:w-96 aspect-video rounded-2xl overflow-hidden relative shadow-lg flex-shrink-0 bg-slate-900">
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <button
              onClick={handleStartOrResume}
              className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
            >
              <Play className="w-6 h-6 fill-white ml-0.5" />
            </button>
          </div>
        </div>

        {/* Right: Info & CTA */}
        <div className="flex-1 space-y-4 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
              {course.category}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {course.level}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              {formatDuration(course.totalDuration)}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">
            {course.title}
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {course.description}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Avatar src={course.instructor.avatar} alt={course.instructor.name} sx={{ width: 36, height: 36 }} />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{course.instructor.name}</p>
              <p className="text-[11px] text-slate-500">{course.instructor.title || 'Senior Engineering Instructor'}</p>
            </div>
          </div>

          {/* Progress / Enroll Bar */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Button
              variant="contained"
              size="large"
              onClick={handleStartOrResume}
              startIcon={<Play className="w-4 h-4 fill-white" />}
              sx={{ px: 4, py: 1.5 }}
            >
              {isEnrolled ? (enrollment?.completed ? 'Review All Lessons' : 'Resume Course') : 'Enroll & Start Learning'}
            </Button>

            {isEnrolled && (
              <div className="flex-1 max-w-xs">
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>Progress</span>
                  <span>{enrollment?.progress || 0}%</span>
                </div>
                <LinearProgress variant="determinate" value={enrollment?.progress || 0} sx={{ height: 6, borderRadius: 3 }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum Syllabus Breakdown */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Curriculum & Lesson Modules
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lessons.length} video lessons • Discovered from Google Drive shared folder
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <HardDrive className="w-4 h-4" />
            <span>Drive Synced</span>
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-3">
          {lessons.map((lesson, idx) => (
            <div
              key={lesson.id}
              onClick={() => navigate(`/learning/${course.id}`)}
              className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-500/40 hover:bg-white dark:hover:bg-slate-800 transition flex items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition">
                  {idx + 1}
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {lesson.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {lesson.summary || 'Covers core mechanics, patterns, and practical code implementation.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-slate-400" />
                  {formatDuration(lesson.duration || 1200)}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
