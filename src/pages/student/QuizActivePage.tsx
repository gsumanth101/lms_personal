import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Award,
  ChevronLeft,
} from 'lucide-react';
import { Button, LinearProgress } from '@mui/material';
import confetti from 'canvas-confetti';
import { useAuth } from '../../contexts/AuthContext';
import { saveQuizAttempt } from '../../services/firebase/firestoreService';
import type { QuizQuestion } from '../../types';

const QUIZ_DATA: Record<string, { title: string; course: string; passingScore: number; questions: QuizQuestion[] }> = {
  quiz_linux: {
    title: 'Linux CLI & Administration Mastery',
    course: 'Linux Operating Systems',
    passingScore: 80,
    questions: [
      {
        id: 'l1',
        question: 'Which command is used to recursively change the ownership of a directory and all its contents in Linux?',
        options: ['chmod -R user:group dir', 'chown -R user:group dir', 'setfacl -R dir', 'attrib -R dir'],
        correctIndex: 1,
        explanation: 'chown -R changes file ownership recursively through directory hierarchies.',
        topic: 'File Permissions & Ownership',
      },
      {
        id: 'l2',
        question: 'What does the standard file descriptor 2 represent in POSIX environments?',
        options: ['Standard Input (stdin)', 'Standard Output (stdout)', 'Standard Error (stderr)', 'Standard Log (stdlog)'],
        correctIndex: 2,
        explanation: 'File descriptor 0 is stdin, 1 is stdout, and 2 is stderr.',
        topic: 'Streams & I/O Redirection',
      },
      {
        id: 'l3',
        question: 'How do you send a process to background upon execution in a shell session?',
        options: ['Append & at the end of the command', 'Prepend async to the command', 'Press Ctrl+C', 'Use the nohup keyword only'],
        correctIndex: 0,
        explanation: 'Appending & executes the command asynchronously in the background subshell.',
        topic: 'Job & Process Control',
      },
      {
        id: 'l4',
        question: 'Which signal is sent by default when running "kill <PID>" without flags?',
        options: ['SIGKILL (9)', 'SIGTERM (15)', 'SIGSTOP (19)', 'SIGHUP (1)'],
        correctIndex: 1,
        explanation: 'kill sends SIGTERM (15) by default to request a graceful process shutdown.',
        topic: 'Signal Management',
      },
      {
        id: 'l5',
        question: 'What utility displays real-time socket connections and listening ports in modern Linux?',
        options: ['ss', 'ping', 'traceroute', 'curl'],
        correctIndex: 0,
        explanation: 'ss (socket statistics) is the modern replacement for netstat to dump socket statistics.',
        topic: 'Networking Utilities',
      },
    ],
  },
  quiz_sql: {
    title: 'SQL & Database Engineering Diagnostics',
    course: 'Oracle / SQL & PLSQL',
    passingScore: 80,
    questions: [
      {
        id: 's1',
        question: 'What is the primary difference between WHERE and HAVING clauses in SQL?',
        options: [
          'WHERE filters rows before aggregation; HAVING filters groups after aggregation',
          'HAVING only works with string types',
          'WHERE is deprecated in ANSI SQL',
          'HAVING cannot use aggregate functions',
        ],
        correctIndex: 0,
        explanation: 'WHERE filters rows before GROUP BY aggregation; HAVING filters grouped result sets.',
        topic: 'Aggregate Query Filtering',
      },
      {
        id: 's2',
        question: 'Which ACID property guarantees that all operations within a transaction succeed or none do?',
        options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
        correctIndex: 0,
        explanation: 'Atomicity ensures that all statements in a transaction are executed as a single indivisible unit.',
        topic: 'ACID Transaction Fundamentals',
      },
      {
        id: 's3',
        question: 'What type of index is generally preferred for columns with low cardinality (few distinct values like gender/status)?',
        options: ['B-Tree Index', 'Bitmap Index', 'Hash Index', 'Spatial Index'],
        correctIndex: 1,
        explanation: 'Bitmap indexes are highly optimized for low-cardinality columns in data warehousing and read-heavy systems.',
        topic: 'Database Indexing Strategies',
      },
      {
        id: 's4',
        question: 'In relational database design, what does Third Normal Form (3NF) eliminate?',
        options: ['Repeating groups', 'Partial key dependencies', 'Transitive dependencies', 'Foreign key constraints'],
        correctIndex: 2,
        explanation: '3NF requires that every non-prime attribute is non-transitively dependent on every candidate key.',
        topic: 'Schema Normalization',
      },
      {
        id: 's5',
        question: 'Which SQL join returns all rows from both tables, filling nulls where no match exists?',
        options: ['INNER JOIN', 'LEFT JOIN', 'FULL OUTER JOIN', 'CROSS JOIN'],
        correctIndex: 2,
        explanation: 'FULL OUTER JOIN combines the results of both LEFT and RIGHT outer joins.',
        topic: 'Relational Joins',
      },
    ],
  },
  quiz_react: {
    title: 'Modern Web Architecture & React Patterns',
    course: 'Software Engineering Curriculum',
    passingScore: 80,
    questions: [
      {
        id: 'r1',
        question: 'What is the primary goal of React 19 Actions and useActionState?',
        options: [
          'Directly connect to database sockets',
          'Coordinate asynchronous state, pending transitions, and server response handling declaratively',
          'Compile TypeScript to WebAssembly',
          'Replace all useEffect hooks globally',
        ],
        correctIndex: 1,
        explanation: 'useActionState handles async form actions and automatically tracks pending status and errors.',
        topic: 'React 19 Actions & Transitions',
      },
      {
        id: 'r2',
        question: 'When should useLayoutEffect be chosen instead of useEffect?',
        options: [
          'For polling external APIs on timers',
          'For synchronous DOM measurements before browser paint to prevent visual jumps',
          'For logging analytics events',
          'For local storage persistence',
        ],
        correctIndex: 1,
        explanation: 'useLayoutEffect runs synchronously immediately after DOM mutations before paint.',
        topic: 'DOM Synchronization Lifecycle',
      },
      {
        id: 'r3',
        question: 'What mechanism prevents prop drilling in deep component hierarchies in standard React?',
        options: ['React Context API', 'CSS Variables', 'Micro-tasks', 'Service Workers'],
        correctIndex: 0,
        explanation: 'React Context provides a way to pass data through the component tree without passing props manually.',
        topic: 'State Sharing & Context',
      },
      {
        id: 'r4',
        question: 'What does the React compiler optimize automatically at build time?',
        options: [
          'Automatic fine-grained memoization without requiring manual useMemo/useCallback',
          'Database indexing',
          'Server hardware allocation',
          'HTTP/3 compression algorithms',
        ],
        correctIndex: 0,
        explanation: 'The React Compiler analyzes JavaScript semantics to memoize values and components automatically.',
        topic: 'React Compiler & Memoization',
      },
      {
        id: 'r5',
        question: 'How should cleanup functions in useEffect handle asynchronous subscriptions or timers?',
        options: [
          'By throwing an Error',
          'By clearing intervals/timeouts and unsubscribing from event listeners when the effect re-runs or unmounts',
          'By reloading the browser window',
          'Cleanup is not needed in React',
        ],
        correctIndex: 1,
        explanation: 'Returning a cleanup function ensures subscriptions and timers are cleared to prevent memory leaks.',
        topic: 'Effect Cleanup & Resource Safety',
      },
    ],
  },
  quiz_comm: {
    title: 'Professional Communication & Soft Skills',
    course: 'Spoken English & Communication',
    passingScore: 75,
    questions: [
      {
        id: 'c1',
        question: 'What is the most effective approach when delivering critical technical feedback in a code review?',
        options: [
          'Criticize the developer personally',
          'Focus objectively on the code behavior, maintainability, and provide constructive alternative suggestions',
          'Reject the pull request without comments',
          'Avoid mentioning bugs to be polite',
        ],
        correctIndex: 1,
        explanation: 'Constructive, code-focused feedback fosters psychological safety and engineering quality.',
        topic: 'Constructive Peer Feedback',
      },
      {
        id: 'c2',
        question: 'What is active listening in a collaborative technical discussion?',
        options: [
          'Thinking about your rebuttal while the other person speaks',
          'Summarizing the speaker’s points to confirm understanding before responding',
          'Interrupting immediately when you disagree',
          'Remaining silent throughout without acknowledgement',
        ],
        correctIndex: 1,
        explanation: 'Active listening involves paraphrasing and validating the speaker’s intent to avoid miscommunication.',
        topic: 'Active Listening & Alignment',
      },
      {
        id: 'c3',
        question: 'In written engineering documentation, what makes an explanation most effective?',
        options: [
          'Using convoluted jargon to sound authoritative',
          'Clear structure, concise explanations, visual diagrams, and reproducible examples',
          'Single long unformatted paragraphs',
          'Omitting prerequisites',
        ],
        correctIndex: 1,
        explanation: 'Clear structure, actionable steps, and examples enable readers to comprehend and apply concepts rapidly.',
        topic: 'Technical Writing Clarity',
      },
      {
        id: 'c4',
        question: 'What is the recommended opening for a professional email requesting urgent support?',
        options: [
          'Clear subject line stating severity + brief context + exact question or expected action',
          'Hey look at this now',
          'A blank subject with 5 attachments',
          'Forwarding the error log without explanation',
        ],
        correctIndex: 0,
        explanation: 'Clear subject lines and explicit ask requirements enable stakeholders to prioritize effectively.',
        topic: 'Professional Email Etiquette',
      },
      {
        id: 'c5',
        question: 'When presenting technical architecture to non-technical stakeholders, what is the best strategy?',
        options: [
          'Show raw assembly code',
          'Focus on business impact, high-level user flow, security reliability, and measurable outcomes',
          'Use exclusively internal abbreviations without definitions',
          'Skip questions entirely',
        ],
        correctIndex: 1,
        explanation: 'Mapping technical architecture to business value and user outcomes builds stakeholder confidence.',
        topic: 'Stakeholder Communication',
      },
    ],
  },
};

export const QuizActivePage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { userProfile, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const quiz = QUIZ_DATA[quizId || ''] || QUIZ_DATA.quiz_linux;
  const questions = quiz.questions;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted || secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, secondsRemaining]);

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const handleSelectOption = (optIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optIndex }));
  };

  const handleSubmit = async () => {
    if (isSubmitted || !userProfile?.uid) return;
    setSaving(true);
    setIsSubmitted(true);

    let correctCount = 0;
    const weakTopics: string[] = [];

    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      } else {
        weakTopics.push(q.topic);
      }
    });

    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = percentage >= quiz.passingScore;

    const timeSpent = 600 - secondsRemaining;

    await saveQuizAttempt(userProfile.uid, {
      quizId: quizId || 'quiz_linux',
      quizTitle: quiz.title,
      answers: selectedAnswers,
      score: correctCount,
      totalQuestions,
      percentage,
      passed,
      weakTopics,
      startedAt: new Date(Date.now() - timeSpent * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      timeSpentSeconds: timeSpent,
    });

    setSaving(false);

    if (passed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4648d4', '#10b981', '#f59e0b'],
      });

      updateUserProfile({
        xp: (userProfile.xp || 0) + 80,
      });
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setCurrentIndex(0);
    setSecondsRemaining(600);
    setIsSubmitted(false);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timerFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const scoreCount = questions.filter((q, idx) => selectedAnswers[idx] === q.correctIndex).length;
  const scorePct = Math.round((scoreCount / totalQuestions) * 100);
  const isPassed = scorePct >= quiz.passingScore;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Button
          size="small"
          onClick={() => navigate('/quizzes')}
          startIcon={<ChevronLeft className="w-4 h-4" />}
        >
          Back to Quizzes
        </Button>

        {!isSubmitted && (
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 border shadow-xs ${
              secondsRemaining < 60
                ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Time Left: {timerFormatted}</span>
          </div>
        )}
      </div>

      {/* Quiz Title Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
          {quiz.course}
        </span>
        <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
          {quiz.title}
        </h1>
        <div className="pt-2">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span>{answeredCount} Answered</span>
          </div>
          <LinearProgress
            variant="determinate"
            value={((currentIndex + 1) / totalQuestions) * 100}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </div>
      </div>

      {/* Results View when submitted */}
      {isSubmitted ? (
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg bg-gradient-to-tr from-indigo-600 to-indigo-500">
            {isPassed ? <Award className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {isPassed ? 'Quiz Passed! 🎉' : 'Needs Review'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              You scored <strong>{scoreCount}/{totalQuestions}</strong> ({scorePct}%). Passing score is {quiz.passingScore}%.
            </p>
          </div>

          {/* Question Explanations List */}
          <div className="space-y-4 text-left pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Question Review & Diagnostic</h3>
            {questions.map((q, idx) => {
              const userAns = selectedAnswers[idx];
              const isCorrect = userAns === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    isCorrect
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40'
                      : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>
                      {idx + 1}. {q.question}
                    </span>
                    <span className={isCorrect ? 'text-emerald-600' : 'text-rose-600'}>
                      {isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400">
                    <strong>Correct Answer:</strong> {q.options[q.correctIndex]}
                  </p>

                  <p className="text-slate-500 italic bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl">
                    💡 {q.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <Button
              variant="outlined"
              onClick={handleRetake}
              startIcon={<RotateCcw className="w-4 h-4" />}
            >
              Retake Quiz
            </Button>
            <Button variant="contained" onClick={() => navigate('/quizzes')}>
              Return to Catalog
            </Button>
          </div>
        </div>
      ) : (
        /* Active Question Card */
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Topic: {currentQ.topic}
            </span>
            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentIndex + 1}. {currentQ.question}
            </h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = selectedAnswers[currentIndex] === optIdx;

              return (
                <div
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-900 dark:text-indigo-200 font-semibold shadow-xs'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-850 border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'border-slate-300 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    {String.fromCharCode(65 + optIdx)}
                  </div>
                  <span className="text-xs md:text-sm">{opt}</span>
                </div>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              variant="outlined"
              size="small"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
            >
              Previous
            </Button>

            {currentIndex < totalQuestions - 1 ? (
              <Button
                variant="contained"
                size="small"
                onClick={() => setCurrentIndex((prev) => prev + 1)}
              >
                Next Question
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                size="small"
                onClick={handleSubmit}
                disabled={saving}
                endIcon={<CheckCircle className="w-4 h-4" />}
              >
                Submit Quiz
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
