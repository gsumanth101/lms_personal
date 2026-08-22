import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Button,
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
  subscribeToUserTasks,
  saveUserTask,
  deleteUserTask,
} from '../../services/firebase/firestoreService';
import { KanbanBoard } from '../../components/productivity/KanbanBoard';
import type { Task, TaskStatus } from '../../types';

export const TasksPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { courses } = useLearning();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [estMinutes, setEstMinutes] = useState('30');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [dueDate, setDueDate] = useState('Today');

  useEffect(() => {
    if (!userProfile?.uid) return;

    const unsubscribe = subscribeToUserTasks(userProfile.uid, (data) => {
      setTasks(data);
    });

    return () => unsubscribe();
  }, [userProfile?.uid]);

  const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
    const target = tasks.find((t) => t.id === taskId);
    if (target && userProfile?.uid) {
      await saveUserTask(userProfile.uid, {
        ...target,
        status: newStatus,
      });
    }
  };

  const handleAddTask = async () => {
    if (newTitle.trim() && userProfile?.uid) {
      const courseObj = courses.find((c) => c.id === selectedCourseId);

      await saveUserTask(userProfile.uid, {
        title: newTitle.trim(),
        status: 'todo',
        priority,
        estimatedMinutes: parseInt(estMinutes, 10) || 30,
        dueDate: dueDate.trim() || 'Today',
        courseId: selectedCourseId || undefined,
        courseTitle: courseObj?.title || undefined,
      });

      setNewTitle('');
      setSelectedCourseId('');
      setOpenModal(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (userProfile?.uid) {
      await deleteUserTask(userProfile.uid, taskId);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Learning Tasks Board
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Real-time Kanban task management synced to Firestore. Track hands-on exercises and assignments.
          </p>
        </div>

        <Button
          variant="contained"
          onClick={() => setOpenModal(true)}
          startIcon={<Plus className="w-4 h-4" />}
        >
          Add Task
        </Button>
      </div>

      <KanbanBoard
        tasks={tasks}
        onUpdateStatus={handleUpdateStatus}
        onAddTask={() => setOpenModal(true)}
        onDeleteTask={handleDeleteTask}
      />

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Learning Task</DialogTitle>
        <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            autoFocus
            label="Task Name"
            placeholder="e.g., Build Custom Authentication Middleware"
            fullWidth
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            size="small"
            required
          />

          <div className="grid grid-cols-2 gap-2">
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                label="Priority"
                onChange={(e) => setPriority(e.target.value as any)}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Est. Minutes"
              fullWidth
              type="number"
              value={estMinutes}
              onChange={(e) => setEstMinutes(e.target.value)}
              size="small"
            />
          </div>

          <TextField
            label="Due Date / Milestone"
            fullWidth
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            size="small"
            placeholder="Today, Tomorrow, or Specific Date"
          />

          {courses.length > 0 && (
            <FormControl fullWidth size="small">
              <InputLabel>Associated Course (Optional)</InputLabel>
              <Select
                value={selectedCourseId}
                label="Associated Course (Optional)"
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                <MenuItem value="">None / General Task</MenuItem>
                {courses.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddTask}>
            Add Task
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
