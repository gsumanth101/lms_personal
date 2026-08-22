import React, { useState } from 'react';
import {
  CheckCircle,
  Circle,
  Video,
  FileText,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { LinearProgress } from '@mui/material';
import type { Course, Lesson, Enrollment } from '../../types';

interface CurriculumSidebarProps {
  course: Course;
  lessons: Lesson[];
  activeLesson: Lesson | null;
  enrollment?: Enrollment;
  progressMap?: Record<string, any>;
  onSelectLesson: (lesson: Lesson) => void;
  onMarkLessonComplete: (lesson: Lesson) => void;
}

export const CurriculumSidebar: React.FC<CurriculumSidebarProps> = ({
  course,
  lessons,
  activeLesson,
  enrollment,
  progressMap = {},
  onSelectLesson,
  onMarkLessonComplete,
}) => {
  const completedLessonIds = enrollment?.completedLessons || [];
  const progress = enrollment?.progress || 0;


  // Group lessons by moduleName
  const moduleMap: Record<string, Lesson[]> = {};
  lessons.forEach((l) => {
    const mod = l.moduleName || 'Core Curriculum';
    if (!moduleMap[mod]) moduleMap[mod] = [];
    moduleMap[mod].push(l);
  });

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    Object.keys(moduleMap).forEach((m) => (init[m] = true));
    return init;
  });

  const toggleModule = (modName: string) => {
    setExpandedModules((prev) => ({ ...prev, [modName]: !prev[modName] }));
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '20:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Header Info */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
          Curriculum Overview
        </span>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
          {course.title}
        </h3>

        <div className="mt-3">
          <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            <span>{enrollment?.completed ? lessons.length : completedLessonIds.length} of {lessons.length} Completed</span>
            <span>{enrollment?.completed ? 100 : progress}%</span>
          </div>
          <LinearProgress
            variant="determinate"
            value={enrollment?.completed ? 100 : progress}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </div>
      </div>

      {/* Modules & Lessons List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3 subtle-scroll">
        {Object.entries(moduleMap).map(([modName, modLessons]) => {
          const isExpanded = expandedModules[modName] !== false;
          const completedInMod = modLessons.filter((l) => completedLessonIds.includes(l.id)).length;

          return (
            <div key={modName} className="rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-950/20">
              {/* Module Header Toggle */}
              <button
                onClick={() => toggleModule(modName)}
                className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-slate-100/80 dark:hover:bg-slate-800/50 transition"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {modName}
                    </p>
                    <span className="text-[10px] text-slate-500">
                      {completedInMod}/{modLessons.length} Done
                    </span>
                  </div>
                </div>
              </button>

              {/* Module Lessons */}
              {isExpanded && (
                <div className="p-1 space-y-1 border-t border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900">
                  {modLessons.map((lesson) => {
                    const isActive = activeLesson?.id === lesson.id;
                    const isCompleted = completedLessonIds.includes(lesson.id) || Boolean(progressMap[lesson.id]?.completed);

                    return (

                      <div
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson)}
                        className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition ${
                          isActive
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm'
                            : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Completion Checkmark */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkLessonComplete(lesson);
                            }}
                            className="flex-shrink-0 text-slate-300 hover:text-emerald-500 dark:text-slate-600 dark:hover:text-emerald-400 transition"
                            title={isCompleted ? 'Completed (Click to toggle)' : 'Mark as complete'}
                          >
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>

                          <div className="min-w-0">
                            <p className={`text-xs truncate ${isActive ? 'font-bold' : 'font-medium'}`}>
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                              <span className="flex items-center gap-0.5">
                                <Video className="w-3 h-3" />
                                {formatDuration(lesson.duration)}
                              </span>
                              {lesson.resources && lesson.resources.length > 0 && (
                                <span className="flex items-center gap-0.5 text-indigo-500 font-semibold">
                                  <FileText className="w-3 h-3" />
                                  Resource
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {isActive && (
                          <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse flex-shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
