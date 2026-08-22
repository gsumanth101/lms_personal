import React, { useEffect, useState } from 'react';
import { Target, Plus, CheckCircle2, Calendar, Trash2, BookOpen } from 'lucide-react';
import {
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useLearning } from '../../contexts/LearningContext';
import {
  subscribeToUserGoals,
  saveUserGoal,
  deleteUserGoal,
} from '../../services/firebase/firestoreService';
import type { Goal } from '../../types';

export const GoalsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { courses, enrollments } = useLearning();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [goalType, setGoalType] = useState<Goal['type']>('skill');
  const [targetDate, setTargetDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [milestonesInput, setMilestonesInput] = useState<string>(
    'Complete first 3 lessons\nPass practice assessment'
  );

  useEffect(() => {
    if (!userProfile?.uid) return;

    setLoading(true);
    const unsubscribe = subscribeToUserGoals(userProfile.uid, (data) => {
      setGoals(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile?.uid]);

  const handleCreateGoal = async () => {
    if (!newTitle.trim() || !userProfile?.uid) return;

    const courseObj = courses.find((c) => c.id === selectedCourseId);

    const existingEnroll = selectedCourseId ? enrollments[selectedCourseId] : null;
    const initialProgress = existingEnroll?.progress || 0;

    const parsedMilestones = milestonesInput
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((title, idx) => ({
        id: `m_${Date.now()}_${idx}`,
        title,
        completed: false,
      }));

    const saved = await saveUserGoal(userProfile.uid, {
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      type: goalType,
      courseId: selectedCourseId || undefined,
      courseTitle: courseObj?.title || undefined,
      targetDate,
      progress: initialProgress,
      completed: initialProgress >= 100,
      milestones: parsedMilestones,
    });

    setGoals((prev) => [saved, ...prev]);
    setNewTitle('');
    setNewDesc('');
    setSelectedCourseId('');
    setOpenModal(false);
  };

  const handleToggleMilestone = async (goalId: string, milestoneId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal || !userProfile?.uid) return;

    const milestones = goal.milestones || [];
    const updatedMilestones = milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    const completedCount = updatedMilestones.filter((m) => m.completed).length;
    const progress =
      updatedMilestones.length > 0
        ? Math.round((completedCount / updatedMilestones.length) * 100)
        : goal.progress;

    const updated = await saveUserGoal(userProfile.uid, {
      ...goal,
      type: goal.type || 'skill',
      milestones: updatedMilestones,
      progress,
      completed: progress >= 100,
    });

    setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (userProfile?.uid) {
      await deleteUserGoal(userProfile.uid, goalId);
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Goals & Milestones
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Track your high-level skill objectives, target deadlines, and automated curriculum milestones.
          </p>
        </div>

        <Button
          variant="contained"
          onClick={() => setOpenModal(true)}
          startIcon={<Plus className="w-4 h-4" />}
        >
          Set Learning Goal
        </Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-slate-500">Loading learning goals...</div>
      ) : goals.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No learning goals yet
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Create your first learning goal to stay focused on your curriculum outcomes.
            </p>
          </div>
          <Button
            variant="contained"
            onClick={() => setOpenModal(true)}
            startIcon={<Plus className="w-4 h-4" />}
          >
            Create Your First Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((g) => (
            <div
              key={g.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <Target className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {g.targetDate || g.deadline || 'Ongoing'}
                    </span>
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{g.title}</h3>
                  {g.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{g.description}</p>
                  )}
                  {g.courseTitle && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                      <BookOpen className="w-3 h-3" /> {g.courseTitle}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                    <span>Progress</span>
                    <span>{g.progress}%</span>
                  </div>
                  <LinearProgress
                    variant="determinate"
                    value={g.progress}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </div>
              </div>

              {/* Milestones List */}
              {g.milestones && g.milestones.length > 0 && (
                <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Milestones ({g.milestones.filter((m) => m.completed).length}/{g.milestones.length})
                  </span>
                  {g.milestones.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleToggleMilestone(g.id, m.id)}
                      className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer transition text-xs text-slate-700 dark:text-slate-300"
                    >
                      <button
                        className={`p-1 rounded-md border ${
                          m.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 dark:border-slate-700 text-slate-400'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <span className={m.completed ? 'line-through opacity-60' : 'font-medium'}>
                        {m.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Goal Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Set Learning Goal</DialogTitle>
        <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            autoFocus
            label="Goal Objective"
            placeholder="e.g., Master Linux Systems & Shell Scripting"
            fullWidth
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            size="small"
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <FormControl fullWidth size="small">
              <InputLabel>Goal Type</InputLabel>
              <Select
                value={goalType}
                label="Goal Type"
                onChange={(e) => setGoalType(e.target.value as any)}
              >
                <MenuItem value="skill">Skill Mastery</MenuItem>
                <MenuItem value="course">Course Completion</MenuItem>
                <MenuItem value="daily">Daily Target</MenuItem>
                <MenuItem value="weekly">Weekly Target</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Target Deadline"
              type="date"
              fullWidth
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </div>

          {courses.length > 0 && (
            <FormControl fullWidth size="small">
              <InputLabel>Linked Course (Auto-Syncs Progress)</InputLabel>
              <Select
                value={selectedCourseId}
                label="Linked Course (Auto-Syncs Progress)"
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                <MenuItem value="">None / Custom Goal</MenuItem>
                {courses.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            label="Description & Outcomes"
            placeholder="Build hands-on commands confidence and solve practical labs..."
            fullWidth
            multiline
            rows={2}
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            size="small"
          />

          <TextField
            label="Milestones (One per line)"
            placeholder="Complete first 3 lessons&#10;Pass practice lab assessment"
            fullWidth
            multiline
            rows={3}
            value={milestonesInput}
            onChange={(e) => setMilestonesInput(e.target.value)}
            size="small"
            helperText="Checkboxes will be generated for each milestone"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateGoal}>
            Create Goal
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
