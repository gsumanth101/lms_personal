import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  FileText,
  Download,
  BookOpen,
  Menu,
  CheckCircle,
} from 'lucide-react';
import { Tabs, Tab, Button, Drawer } from '@mui/material';
import { useLearning } from '../../contexts/LearningContext';
import { VideoPlayer } from '../../components/learning/VideoPlayer';
import { CurriculumSidebar } from '../../components/course/CurriculumSidebar';
import { LessonNotesTab } from '../../components/learning/LessonNotesTab';
import { LessonResourcesTab } from '../../components/learning/LessonResourcesTab';
import { LessonTranscriptTab } from '../../components/learning/LessonTranscriptTab';
import { CompletionModal } from '../../components/learning/CompletionModal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import type { Lesson } from '../../types';

export const CoursePlayerPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const {
    courses,
    activeCourse,
    activeLesson,
    courseLessons,
    enrollments,
    progressMap,
    recentCompletedCertificate,
    showCompletionModal,
    setShowCompletionModal,
    loadCourse,
    selectLesson,
    recordProgress,
  } = useLearning();

  const [activeTab, setActiveTab] = useState<number>(0);
  const [mobileCurriculumOpen, setMobileCurriculumOpen] = useState<boolean>(false);
  const [insertTimestamp, setInsertTimestamp] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      loadCourse(courseId);
    } else if (courses.length > 0) {
      loadCourse(courses[0].id);
    }
  }, [courseId, courses]);

  if (!activeCourse || !activeLesson) {
    return <LoadingSkeleton type="player" />;
  }

  const enrollment = enrollments[activeCourse.id];
  const lessonProgress = progressMap[activeLesson.id];

  const currentLessonIndex = courseLessons.findIndex((l) => l.id === activeLesson.id);
  const hasPrevious = currentLessonIndex > 0;
  const hasNext = currentLessonIndex < courseLessons.length - 1;

  const handlePreviousLesson = () => {
    if (hasPrevious) {
      selectLesson(courseLessons[currentLessonIndex - 1]);
    }
  };

  const handleNextLesson = () => {
    if (hasNext) {
      selectLesson(courseLessons[currentLessonIndex + 1]);
    }
  };

  const handleProgressUpdate = async (
    lessonId: string,
    watchTime: number,
    duration: number,
    forceComplete?: boolean,
    forceUncomplete?: boolean
  ) => {
    await recordProgress(activeCourse.id, lessonId, watchTime, duration, forceComplete, forceUncomplete);
  };


  const handleToggleLessonComplete = async (lesson: Lesson) => {
    const isAlreadyDone = Boolean(enrollment?.completedLessons?.includes(lesson.id));
    if (isAlreadyDone) {
      await recordProgress(activeCourse.id, lesson.id, 0, lesson.duration || 1800, false, true);
    } else {
      await recordProgress(activeCourse.id, lesson.id, lesson.duration || 1800, lesson.duration || 1800, true, false);
    }
  };

  const handleInsertTimestampToNotes = (timeFormatted: string) => {
    setActiveTab(0); // Switch to Notes tab
    setInsertTimestamp(timeFormatted);
    setTimeout(() => setInsertTimestamp(null), 1000);
  };

  const isCurrentLessonDone = Boolean(
    enrollment?.completedLessons?.includes(activeLesson.id) ||
    lessonProgress?.completed
  );

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-white dark:bg-slate-950">
      {/* Desktop Curriculum Sidebar */}
      <div className="hidden lg:block w-80 h-full flex-shrink-0">
        <CurriculumSidebar
          course={activeCourse}
          lessons={courseLessons}
          activeLesson={activeLesson}
          enrollment={enrollment}
          progressMap={progressMap}
          onSelectLesson={selectLesson}
          onMarkLessonComplete={handleToggleLessonComplete}
        />
      </div>

      {/* Mobile Curriculum Drawer */}
      <Drawer
        anchor="left"
        open={mobileCurriculumOpen}
        onClose={() => setMobileCurriculumOpen(false)}
      >
        <div className="w-80 h-full">
          <CurriculumSidebar
            course={activeCourse}
            lessons={courseLessons}
            activeLesson={activeLesson}
            enrollment={enrollment}
            progressMap={progressMap}
            onSelectLesson={(lesson) => {
              selectLesson(lesson);
              setMobileCurriculumOpen(false);
            }}
            onMarkLessonComplete={handleToggleLessonComplete}
          />
        </div>
      </Drawer>


      {/* Main Player & Workspace Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto subtle-scroll p-0 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {/* Video Player Canvas */}
        <div className="max-w-5xl mx-auto w-full">
          <VideoPlayer
            lesson={activeLesson}
            initialWatchTime={lessonProgress?.watchTime || 0}
            isCompleted={isCurrentLessonDone}
            onProgressUpdate={handleProgressUpdate}
            onPreviousLesson={handlePreviousLesson}
            onNextLesson={handleNextLesson}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            onInsertTimestampToNotes={handleInsertTimestampToNotes}
          />
        </div>

        {/* Lesson Details & Workspace Tabs */}
        <div className="max-w-5xl mx-auto w-full space-y-4 sm:space-y-6 px-3 sm:px-0 pb-16">
          {/* YouTube-style Lesson Header Card */}
          <div className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded-md">
                  {activeCourse.title}
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-xs text-slate-500 font-medium">{activeLesson.moduleName || 'Curriculum'}</span>
              </div>
              <h1 className="text-base sm:text-xl md:text-2xl font-bold text-slate-900 dark:text-white line-clamp-2">
                {activeLesson.title}
              </h1>
            </div>

            {/* Mobile / Desktop Curriculum Trigger */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setMobileCurriculumOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition border border-slate-200 dark:border-slate-700"
              >
                <Menu className="w-3.5 h-3.5" />
                <span>Lessons ({courseLessons.length})</span>
              </button>

              <Button
                variant={isCurrentLessonDone ? 'outlined' : 'contained'}
                color={isCurrentLessonDone ? 'success' : 'primary'}
                onClick={() => handleToggleLessonComplete(activeLesson)}
                startIcon={<CheckCircle className="w-4 h-4" />}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  borderRadius: 2,
                  px: 2,
                  py: 0.6,
                }}
              >
                {isCurrentLessonDone ? 'Completed ✓' : 'Mark Complete'}
              </Button>
            </div>
          </div>


          {/* Workspace Tabs */}
          <div>
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', minHeight: 48 },
              }}
            >
              <Tab icon={<FileText className="w-4 h-4 mr-2" />} iconPosition="start" label="Lesson Notes" />
              <Tab icon={<Download className="w-4 h-4 mr-2" />} iconPosition="start" label="Drive Resources" />
              <Tab icon={<BookOpen className="w-4 h-4 mr-2" />} iconPosition="start" label="Overview & Details" />
            </Tabs>
          </div>

          {/* Tab Content Panels */}
          <div className="pt-2">
            {activeTab === 0 && (
              <LessonNotesTab
                lesson={activeLesson}
                courseTitle={activeCourse.title}
                externalTimestamp={insertTimestamp}
              />
            )}

            {activeTab === 1 && <LessonResourcesTab lesson={activeLesson} />}

            {activeTab === 2 && <LessonTranscriptTab lesson={activeLesson} />}
          </div>
        </div>
      </div>

      {/* Course Completion Celebratory Modal */}
      <CompletionModal
        open={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        certificate={recentCompletedCertificate}
        course={activeCourse}
      />
    </div>
  );
};
