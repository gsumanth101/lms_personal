import React from 'react';
import { Sparkles } from 'lucide-react';
import type { Lesson } from '../../types';

interface LessonTranscriptTabProps {
  lesson: Lesson;
  onSeekTo?: (seconds: number) => void;
}

export const LessonTranscriptTab: React.FC<LessonTranscriptTabProps> = ({
  lesson,
  onSeekTo,
}) => {
  const transcript =
    lesson.transcript ||
    `Welcome to ${lesson.title}. In this session, we examine the core mechanics, practical code implementations, and architectural best practices. We explore declarative state abstractions, memory efficiency, and real-world system integrations.`;

  const summary =
    lesson.summary ||
    `Comprehensive analysis of ${lesson.title} covering core patterns, optimal state lifecycles, and avoiding common production pitfalls.`;

  return (
    <div className="space-y-6">
      {/* Key Takeaways Card */}
      <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
        <div className="flex items-center gap-2 mb-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
          <Sparkles className="w-4 h-4" />
          <span>AI Lesson Synthesis</span>
        </div>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Synchronized Transcript Text */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Synchronized Audio & Video Transcript
        </h4>

        <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
          <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition">
            <button
              onClick={() => onSeekTo?.(0)}
              className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition flex-shrink-0"
            >
              00:00
            </button>
            <p>{transcript}</p>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition">
            <button
              onClick={() => onSeekTo?.(180)}
              className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition flex-shrink-0"
            >
              03:00
            </button>
            <p>
              When implementing this architecture in production environments, always ensure proper error boundaries and deterministic state resets. This prevents cascading rendering failures in downstream consumers.
            </p>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition">
            <button
              onClick={() => onSeekTo?.(480)}
              className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition flex-shrink-0"
            >
              08:00
            </button>
            <p>
              In our next exercise, we will connect this lesson directly to our interactive Practice Lab where you will write unit test assertions against these exact primitives.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
