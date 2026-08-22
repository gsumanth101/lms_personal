import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, CheckCircle2, BookOpen } from 'lucide-react';
import { Button } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { getUserQuizAttempts } from '../../services/firebase/firestoreService';
import type { QuizAttempt } from '../../types';

export interface QuizDef {
  id: string;
  title: string;
  course: string;
  courseId?: string;
  questionCount: number;
  timeLimitMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  passingScore: number;
  tags: string[];
  description: string;
}

export const QUIZ_CATALOG: QuizDef[] = [
  {
    id: 'quiz_linux',
    title: 'Linux CLI & Administration Mastery',
    course: 'Linux Operating Systems',
    questionCount: 5,
    timeLimitMinutes: 10,
    difficulty: 'Intermediate',
    passingScore: 80,
    tags: ['Permissions', 'Pipes & Redirection', 'Process Management'],
    description: 'Test your understanding of Linux core utilities, file system permissions, and shell scripting concepts.',
  },
  {
    id: 'quiz_sql',
    title: 'SQL & Database Engineering Diagnostics',
    course: 'Oracle / SQL & PLSQL',
    questionCount: 5,
    timeLimitMinutes: 10,
    difficulty: 'Intermediate',
    passingScore: 80,
    tags: ['JOINs', 'Indexing', 'Transactions', 'Aggregate Queries'],
    description: 'Evaluate relational database normalization, index optimization, and SQL transaction isolation.',
  },
  {
    id: 'quiz_react',
    title: 'Modern Web Architecture & React Patterns',
    course: 'Software Engineering Curriculum',
    questionCount: 5,
    timeLimitMinutes: 10,
    difficulty: 'Advanced',
    passingScore: 80,
    tags: ['State Management', 'Async Actions', 'Component Lifecycle'],
    description: 'Validate key principles of declarative UI architecture, hook synchronization, and browser rendering.',
  },
  {
    id: 'quiz_comm',
    title: 'Professional Communication & Soft Skills',
    course: 'Spoken English & Communication',
    questionCount: 5,
    timeLimitMinutes: 10,
    difficulty: 'Beginner',
    passingScore: 75,
    tags: ['Tone & Clarity', 'Active Listening', 'Technical Presentations'],
    description: 'Assess business communication clarity, email etiquette, and presentation effectiveness.',
  },
];

export const QuizzesPage: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (userProfile?.uid) {
      setLoading(true);
      getUserQuizAttempts(userProfile.uid)
        .then(setAttempts)
        .finally(() => setLoading(false));
    }
  }, [userProfile?.uid]);

  const attemptsByQuiz = attempts.reduce<Record<string, QuizAttempt>>((acc, att) => {
    if (!acc[att.quizId] || att.score > acc[att.quizId].score) {
      acc[att.quizId] = att;
    }
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Concept Quizzes & Knowledge Checks
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Validate your understanding of curriculum topics, identify weak areas, and earn XP.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-slate-500">Loading quiz diagnostics and attempts...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {QUIZ_CATALOG.map((quiz) => {
          const bestAttempt = attemptsByQuiz[quiz.id];
          const hasPassed = bestAttempt?.passed;

          return (
            <div
              key={quiz.id}
              className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-indigo-500/40 transition flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    {quiz.difficulty}
                  </span>

                  <div className="flex items-center gap-2">
                    {hasPassed && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Passed ({bestAttempt.percentage}%)
                      </span>
                    )}
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {quiz.timeLimitMinutes} mins
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {quiz.title}
                </h3>

                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Curriculum: <strong>{quiz.course}</strong></span>
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {quiz.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {quiz.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {quiz.questionCount} Questions • {quiz.passingScore}% to pass (+80 XP)
                </span>
                <Button
                  size="small"
                  variant={hasPassed ? 'outlined' : 'contained'}
                  onClick={() => navigate(`/quiz/${quiz.id}`)}
                  endIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  {hasPassed ? 'Retake Quiz' : 'Start Quiz'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
