import React, { useRef, useState, useEffect } from 'react';

import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle,
  RefreshCw,
  RotateCcw,
  Maximize2,
  Clock,
  FastForward,
  Rewind,
} from 'lucide-react';

import type { Lesson } from '../../types';


interface VideoPlayerProps {
  lesson: Lesson;
  initialWatchTime?: number;
  isCompleted?: boolean;
  onProgressUpdate: (lessonId: string, watchTime: number, duration: number, forceComplete?: boolean, forceUncomplete?: boolean) => void;
  onPreviousLesson?: () => void;
  onNextLesson?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onInsertTimestampToNotes?: (timeFormatted: string) => void;
}

const formatSeconds = (sec: number): string => {
  const safeSec = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(safeSec / 60);
  const s = Math.floor(safeSec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  lesson,
  initialWatchTime = 0,
  isCompleted = false,
  onProgressUpdate,
  onPreviousLesson,
  onNextLesson,
  hasPrevious = false,
  hasNext = false,
  onInsertTimestampToNotes,
}) => {
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [watchTime, setWatchTime] = useState<number>(initialWatchTime);
  const [isBuffering, setIsBuffering] = useState<boolean>(true);
  const [showResumeBanner, setShowResumeBanner] = useState<boolean>(initialWatchTime > 15 && !isCompleted);
  const [autoNextCountdown, setAutoNextCountdown] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastSavedRef = useRef<number>(initialWatchTime);

  const duration = lesson.duration && lesson.duration > 0 ? lesson.duration : 1800;

  // Sync state when lesson changes
  useEffect(() => {
    const savedTime = initialWatchTime || 0;
    setWatchTime(savedTime);
    lastSavedRef.current = savedTime;
    setIsBuffering(true);
    setAutoNextCountdown(null);
    setShowResumeBanner(Boolean(savedTime > 15 && !isCompleted && savedTime < duration * 0.95));

    const timer = setTimeout(() => {
      setIsBuffering(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [lesson.id, initialWatchTime, isCompleted, duration]);

  // 3-second auto-advance countdown timer
  useEffect(() => {
    if (autoNextCountdown === null) return;

    if (autoNextCountdown <= 0) {
      setAutoNextCountdown(null);
      if (hasNext && onNextLesson) {
        onNextLesson();
      }
      return;
    }

    const timer = setTimeout(() => {
      setAutoNextCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoNextCountdown, hasNext, onNextLesson]);

  // Extract Clean Drive File ID
  let cleanDriveId = lesson.driveFileId || '';
  if (cleanDriveId.includes('/d/')) {
    const match = cleanDriveId.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) cleanDriveId = match[1];
  }

  const streamSrc = cleanDriveId
    ? `https://drive.google.com/file/d/${cleanDriveId}/preview`
    : lesson.streamUrl || '';

  const handleStartFromBeginning = () => {
    setWatchTime(0);
    lastSavedRef.current = 0;
    setShowResumeBanner(false);
    setAutoNextCountdown(null);
    onProgressUpdate(lesson.id, 0, duration, false, false);
  };

  const handleSeek = (delta: number) => {
    setWatchTime((prev) => {
      const next = Math.max(0, Math.min(duration, prev + delta));
      lastSavedRef.current = next;
      onProgressUpdate(lesson.id, next, duration, isCompleted, false);
      return next;
    });
  };

  const handleToggleComplete = () => {
    if (isCompleted) {
      setWatchTime(0);
      lastSavedRef.current = 0;
      setAutoNextCountdown(null);
      onProgressUpdate(lesson.id, 0, duration, false, true);
    } else {
      const targetTime = duration;
      setWatchTime(targetTime);
      lastSavedRef.current = targetTime;
      onProgressUpdate(lesson.id, targetTime, duration, true, false);

      // Start 3-second countdown to next video
      if (hasNext && onNextLesson) {
        setAutoNextCountdown(3);
      }
    }
  };



  const handleReload = () => {
    setIsBuffering(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const formattedCurrentTime = formatSeconds(watchTime);
  const formattedDuration = formatSeconds(duration);
  const progressPercent = Math.min(100, Math.round((watchTime / duration) * 100));

  return (
    <div className="w-full space-y-3 select-none">
      {/* Auto-Next Video Countdown Banner */}
      {autoNextCountdown !== null && (
        <div className="p-3.5 px-4 rounded-2xl bg-emerald-950/95 border border-emerald-500/60 text-white text-xs flex flex-wrap items-center justify-between gap-3 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/40 border border-emerald-500/50 flex items-center justify-center text-emerald-300 shadow-sm">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-emerald-300 uppercase tracking-wider text-[10px]">Lesson Completed!</span>
              <p className="text-white font-medium text-xs">
                Advancing to next lesson in <strong className="text-emerald-300 font-mono text-sm font-bold">{autoNextCountdown}s</strong>...
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoNextCountdown(null)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition"
            >
              Stay on Video
            </button>
            <button
              onClick={() => {
                setAutoNextCountdown(null);
                onNextLesson?.();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md"
            >
              Play Next Now <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Resume Banner Notification (Dismissible, Non-Blocking) */}
      {showResumeBanner && (
        <div className="p-3 px-4 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 text-white text-xs flex flex-wrap items-center justify-between gap-3 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/40 flex items-center justify-center text-indigo-300">
              <Clock className="w-4 h-4" />
            </div>
            <span>
              Previously saved position at <strong className="text-indigo-200 font-mono">{formattedCurrentTime}</strong> of <span className="font-mono">{formattedDuration}</span> ({progressPercent}% completed).
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartFromBeginning}
              className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold transition flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Start Over
            </button>
            <button
              onClick={() => setShowResumeBanner(false)}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
            >
              Resume
            </button>
          </div>
        </div>
      )}


      {/* Main Video Canvas: YouTube-style full bleed on mobile, rounded on desktop */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-black rounded-none sm:rounded-3xl overflow-hidden shadow-2xl border-0 sm:border border-slate-800/80"
      >
        {/* Top-Right Click Blocker / Overlay: Completely hides and prevents popout */}
        <div className="absolute top-0 right-0 w-20 h-14 z-20 pointer-events-auto" />

        {/* Loading Progress Bar at top edge */}
        {isBuffering && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-950 z-20 overflow-hidden pointer-events-none">
            <div className="w-full h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 animate-pulse" />
          </div>
        )}

        {/* Video Stream Iframe (cropped -54px at top to eliminate Google Drive header bar & pop-out icon) */}
        {streamSrc ? (
          <iframe
            ref={iframeRef}
            key={`${cleanDriveId}_${iframeKey}`}
            src={streamSrc}
            title={lesson.title}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            onLoad={() => setIsBuffering(false)}
            className="w-full absolute left-0 right-0 -top-[54px] h-[calc(100%+54px)] border-0 bg-black"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-900 text-white">
            <p className="text-sm font-semibold text-slate-300">No video stream URL configured for this lesson.</p>
          </div>
        )}
      </div>

      {/* YouTube-style Horizontal Scrollable Action Pills Bar */}
      <div className="py-2.5 px-3 sm:px-4 rounded-none sm:rounded-2xl bg-white dark:bg-slate-900 border-b sm:border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
          {/* 1. Mark Complete / Completed Pill */}
          <button
            onClick={handleToggleComplete}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-xs ${
              isCompleted
                ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{isCompleted ? 'Completed ✓' : 'Mark Complete'}</span>
          </button>

          {/* 2. Next Lesson Pill */}
          {hasNext && onNextLesson && (
            <button
              onClick={onNextLesson}
              className="flex-shrink-0 flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
            >
              <span>Next Lesson</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          {/* 3. Previous Lesson Pill */}
          {hasPrevious && onPreviousLesson && (
            <button
              onClick={onPreviousLesson}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
          )}

          {/* 4. Timestamp Bookmark to Notes Pill */}
          {onInsertTimestampToNotes && (
            <button
              onClick={() => onInsertTimestampToNotes(formattedCurrentTime)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Note @ {formattedCurrentTime}</span>
            </button>
          )}

          {/* 5. Rewind -10s Pill */}
          <button
            onClick={() => handleSeek(-10)}
            className="flex-shrink-0 p-1.5 px-2.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1"
            title="Rewind 10s"
          >
            <Rewind className="w-3.5 h-3.5" />
            <span>-10s</span>
          </button>

          {/* 6. Forward +10s Pill */}
          <button
            onClick={() => handleSeek(10)}
            className="flex-shrink-0 p-1.5 px-2.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1"
            title="Forward 10s"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>+10s</span>
          </button>

          {/* 7. Reload Video Stream */}
          <button
            onClick={handleReload}
            className="flex-shrink-0 p-1.5 px-2.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1"
            title="Reload Video"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>

          {/* 8. Fullscreen Toggle */}
          <button
            onClick={handleToggleFullscreen}
            className="flex-shrink-0 p-1.5 px-2.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1"
            title="Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Fullscreen</span>
          </button>
        </div>
      </div>
    </div>
  );
};



