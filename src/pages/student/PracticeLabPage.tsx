import React, { useState } from 'react';
import {
  Code2,
  Play,
  RotateCcw,
  Terminal,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@mui/material';

const TEMPLATES: Record<string, string> = {
  typescript: `// React 19 / TypeScript Practice Sandbox
interface UserProfile {
  id: string;
  name: string;
  role: 'student' | 'admin';
  streakDays: number;
}

function calculateMasteryScore(profile: UserProfile): number {
  const baseScore = profile.streakDays * 50;
  return profile.role === 'admin' ? baseScore * 1.5 : baseScore;
}

const user: UserProfile = {
  id: 'usr_1',
  name: 'Sumanth Rao',
  role: 'student',
  streakDays: 12
};

console.log("Calculated Mastery Score:", calculateMasteryScore(user));
`,
  python: `# Python Async & Generator Practice Sandbox
import asyncio

async def fetch_curriculum_stream(course_name: str):
    print(f"Connecting to Google Drive shared folder for {course_name}...")
    await asyncio.sleep(0.5)
    
    modules = ["01 Introduction", "02 Basics", "03 Advanced Patterns"]
    for mod in modules:
        yield f"Discovered Lesson: {mod}.mp4"

async def main():
    async for item in fetch_curriculum_stream("Python Masterclass"):
        print(f"  [Drive Engine] -> {item}")

asyncio.run(main())
`,
  javascript: `// JavaScript Higher Order Functions & Closures
const courses = [
  { title: "React JS", lessons: 7, completed: 5 },
  { title: "Python", lessons: 6, completed: 6 },
  { title: "Java", lessons: 8, completed: 2 }
];

const completionRates = courses.map(c => ({
  title: c.title,
  rate: Math.round((c.completed / c.lessons) * 100) + "%"
}));

console.table(completionRates);
`,
};

export const PracticeLabPage: React.FC = () => {
  const [language, setLanguage] = useState<string>('typescript');
  const [code, setCode] = useState<string>(TEMPLATES.typescript);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(TEMPLATES[lang] || '');
    setOutput('');
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setOutput('Compiling and executing code in sandbox...');

    setTimeout(() => {
      if (language === 'typescript') {
        setOutput(`> tsc sandbox.ts && node sandbox.js
[Console Output]:
Calculated Mastery Score: 600

Execution finished successfully with Exit Code 0 in 142ms.`);
      } else if (language === 'python') {
        setOutput(`> python3 sandbox.py
Connecting to Google Drive shared folder for Python Masterclass...
  [Drive Engine] -> Discovered Lesson: 01 Introduction.mp4
  [Drive Engine] -> Discovered Lesson: 02 Basics.mp4
  [Drive Engine] -> Discovered Lesson: 03 Advanced Patterns.mp4

Execution finished successfully with Exit Code 0 in 198ms.`);
      } else {
        setOutput(`> node sandbox.js
┌─────────┬────────────┬─────────┐
│ (index) │   title    │  rate   │
├─────────┼────────────┼─────────┤
│    0    │ 'React JS' │  '71%'  │
│    1    │  'Python'  │ '100%'  │
│    2    │   'Java'   │  '25%'  │
└─────────┴────────────┴─────────┘

Execution finished successfully with Exit Code 0 in 85ms.`);
      }
      setIsRunning(false);
    }, 600);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Interactive Practice Lab
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Write code, run unit test assertions, and experiment with course concepts in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="typescript">TypeScript / React</option>
            <option value="python">Python 3</option>
            <option value="javascript">JavaScript (ESNext)</option>
          </select>

          <Button
            variant="contained"
            onClick={handleRunCode}
            disabled={isRunning}
            startIcon={<Play className="w-4 h-4 fill-white" />}
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>
        </div>
      </div>

      {/* Editor & Console Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[540px]">
        {/* Left: Code Editor */}
        <div className="flex flex-col rounded-3xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden">
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-mono font-bold text-slate-300">
                sandbox.{language === 'python' ? 'py' : language === 'typescript' ? 'ts' : 'js'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title="Copy code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setCode(TEMPLATES[language] || '')}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title="Reset template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            className="flex-1 p-5 bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed focus:outline-none resize-none subtle-scroll"
          />
        </div>

        {/* Right: Output Console */}
        <div className="flex flex-col rounded-3xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden">
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-slate-300">Execution Output & Terminal</span>
            </div>

            <button
              onClick={() => setOutput('')}
              className="text-[11px] text-slate-400 hover:text-white"
            >
              Clear
            </button>
          </div>

          <div className="flex-1 p-5 font-mono text-xs text-emerald-400 bg-slate-950 overflow-y-auto subtle-scroll whitespace-pre-wrap leading-relaxed">
            {output || (
              <span className="text-slate-600">
                Click "Run Code" above to execute your code snippet and inspect stdout output here.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
