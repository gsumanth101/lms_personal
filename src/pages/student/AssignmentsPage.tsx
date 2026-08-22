import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Send,
  Upload,
  Award,
  ExternalLink,
} from 'lucide-react';
import { Button, TextField, Alert, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useLearning } from '../../contexts/LearningContext';
import {
  getUserAssignments,
  saveAssignmentSubmission,
} from '../../services/firebase/firestoreService';
import type { AssignmentSubmission } from '../../types';

export const AssignmentsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { courses } = useLearning();

  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [demoUrl, setDemoUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (userProfile?.uid) {
      getUserAssignments(userProfile.uid).then(setSubmissions);
    }
  }, [userProfile?.uid]);

  const assignmentsList = [
    {
      id: 'asg_linux',
      title: 'Project 1: Linux Automated Backup & Stream Shell Pipeline',
      course: 'Linux Operating Systems',
      dueDate: 'Flexible / Self-Paced',
      rubric: [
        'Implements recursive folder traversal without owner permissions',
        'Includes cron-friendly bash script with error logging and status codes',
        'Handles signals cleanly with trap handlers',
      ],
    },
    {
      id: 'asg_sql',
      title: 'Project 2: Relational Schema Design & Index Optimization Benchmark',
      course: 'Oracle / SQL & PLSQL',
      dueDate: 'Flexible / Self-Paced',
      rubric: [
        'Implements 3NF normalized tables with foreign keys and cascade rules',
        'Provides EXPLAIN PLAN benchmarks comparing sequential vs indexed scans',
        'Includes stored procedures with transaction commit and rollback handling',
      ],
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl || !userProfile?.uid) return;

    setSubmitting(true);
    try {
      const saved = await saveAssignmentSubmission(userProfile.uid, {
        assignmentId: 'asg_' + Date.now(),
        courseId: selectedCourseId || undefined,
        githubUrl: githubUrl.trim(),
        demoUrl: demoUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        status: 'SUBMITTED',
        submittedAt: new Date().toISOString(),
      });

      setSubmissions((prev) => [saved, ...prev]);
      setSubmittedSuccess(true);
      setGithubUrl('');
      setDemoUrl('');
      setNotes('');
      setTimeout(() => setSubmittedSuccess(false), 4000);
    } catch (e) {
      console.warn('Submission error:', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Practical Project Assignments
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Build portfolio-ready projects and submit GitHub repositories for verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Project List & Rubrics */}
        <div className="lg:col-span-2 space-y-6">
          {assignmentsList.map((asg) => {
            const userSub = submissions.find((s) => s.courseId === asg.course || s.notes?.includes(asg.title));

            return (
              <div
                key={asg.id}
                className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {asg.course}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {asg.dueDate}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {asg.title}
                </h3>

                {userSub ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Submitted ({new Date(userSub.submittedAt).toLocaleDateString()})
                      </span>
                      <Award className="w-5 h-5 text-emerald-600" />
                    </div>
                    <a
                      href={userSub.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      {userSub.githubUrl} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Evaluation Rubric & Requirements:
                    </span>
                    <div className="space-y-2">
                      {asg.rubric.map((r, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right 1 Column: Submission Form */}
        <div>
          <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              <span>Submit Project</span>
            </h3>

            {submittedSuccess ? (
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                Project repository submitted successfully! (+150 XP awarded)
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {courses.length > 0 && (
                  <FormControl fullWidth size="small">
                    <InputLabel>Curriculum Course</InputLabel>
                    <Select
                      value={selectedCourseId}
                      label="Curriculum Course"
                      onChange={(e) => setSelectedCourseId(e.target.value)}
                    >
                      {courses.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                <TextField
                  fullWidth
                  size="small"
                  label="GitHub Repository URL"
                  placeholder="https://github.com/username/project"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  required
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Live Demo URL (Optional)"
                  placeholder="https://my-project.web.app"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Architecture Notes / Decisions"
                  multiline
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your design choices and challenges overcome..."
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={submitting}
                  startIcon={<Send className="w-4 h-4" />}
                >
                  {submitting ? 'Submitting...' : 'Submit for Evaluation'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
