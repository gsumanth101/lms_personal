import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  CheckCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
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
import type { ScheduleSession, Course } from '../../types';

interface CalendarViewProps {
  sessions: ScheduleSession[];
  courses?: Course[];
  onToggleSessionComplete: (id: string) => void;
  onAddSession?: (session: Partial<ScheduleSession>) => void;
  onDeleteSession?: (id: string) => void;
}

const DAYS_NAME = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  sessions,
  courses = [],
  onToggleSessionComplete,
  onAddSession,
  onDeleteSession,
}) => {
  // Week navigation offset (0 = current week, -1 = previous, 1 = next)
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Modal State
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDate, setNewDate] = useState<string>(() => selectedDateStr);
  const [newStartTime, setNewStartTime] = useState<string>('18:00');
  const [newEndTime, setNewEndTime] = useState<string>('18:45');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [sessionType, setSessionType] = useState<string>('Video Lesson');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState<string>('');

  // Calculate the 7 days of the currently navigated week
  const getWeekDays = () => {
    const now = new Date();
    // Monday of current week
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMonday + weekOffset * 7);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayNum = d.getDate();
      const monthShort = d.toLocaleString('en-US', { month: 'short' });
      days.push({
        name: DAYS_NAME[i],
        dayNum,
        monthShort,
        dateStr,
        isToday: dateStr === new Date().toISOString().split('T')[0],
      });
    }
    return days;
  };

  const weekDays = getWeekDays();
  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];

  const handleOpenAddModal = (dateToUse?: string) => {
    setNewDate(dateToUse || selectedDateStr);
    setOpenModal(true);
  };

  const handleSaveSession = () => {
    if (!newTitle.trim() || !onAddSession) return;

    const courseObj = courses.find((c) => c.id === selectedCourseId);

    // Calculate duration in minutes
    let dur = 45;
    try {
      const [sh, sm] = newStartTime.split(':').map(Number);
      const [eh, em] = newEndTime.split(':').map(Number);
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      if (diff > 0) dur = diff;
    } catch {}

    onAddSession({
      title: newTitle.trim(),
      date: newDate || selectedDateStr,
      startTime: newStartTime,
      endTime: newEndTime,
      durationMinutes: dur,
      courseId: selectedCourseId || undefined,
      courseTitle: courseObj?.title || undefined,
      type: sessionType,
      priority,
      notes: notes.trim() || undefined,
      completed: false,
    });

    setNewTitle('');
    setNotes('');
    setOpenModal(false);
  };

  // Filter sessions for selected date
  const filteredSessions = sessions.filter((s) => s.date === selectedDateStr);

  return (
    <div className="space-y-6">
      {/* Calendar Header: Week Navigation & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Study Schedule Planner
            </h3>
            <p className="text-xs text-slate-500">
              {weekStart.monthShort} {weekStart.dayNum} – {weekEnd.monthShort} {weekEnd.dayNum}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Week Navigation Arrows */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition"
            >
              This Week
            </button>
            <button
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="contained"
            size="small"
            onClick={() => handleOpenAddModal(selectedDateStr)}
            startIcon={<Plus className="w-4 h-4" />}
          >
            Add Study Session
          </Button>
        </div>
      </div>

      {/* Week Day Selector Pills */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const isSelected = selectedDateStr === day.dateStr;
          const daySessionsCount = sessions.filter((s) => s.date === day.dateStr).length;

          return (
            <button
              key={day.dateStr}
              onClick={() => setSelectedDateStr(day.dateStr)}
              className={`p-3 rounded-2xl border text-center transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 text-slate-700 dark:text-slate-300'
              }`}
            >
              <p
                className={`text-[11px] uppercase font-bold tracking-wider ${
                  isSelected ? 'text-indigo-100' : day.isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                }`}
              >
                {day.name} {day.isToday && '•'}
              </p>
              <p className="text-base font-extrabold mt-0.5">{day.dayNum}</p>
              <div className="mt-1 flex justify-center gap-1">
                {daySessionsCount > 0 && (
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {daySessionsCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Day Timetable & Sessions List */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Schedule for {selectedDateStr}
            </h4>
            <p className="text-xs text-slate-500">
              {filteredSessions.length} {filteredSessions.length === 1 ? 'session' : 'sessions'} scheduled
            </p>
          </div>

          <Button
            size="small"
            variant="outlined"
            onClick={() => handleOpenAddModal(selectedDateStr)}
            startIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add for this day
          </Button>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <CalendarIcon className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              No study sessions scheduled for {selectedDateStr}.
            </p>
            <Button
              size="small"
              variant="contained"
              onClick={() => handleOpenAddModal(selectedDateStr)}
              startIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Plan Study Session
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((sess) => (
              <div
                key={sess.id}
                className={`p-4 rounded-xl border transition flex items-center justify-between gap-4 ${
                  sess.completed
                    ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/40 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => onToggleSessionComplete(sess.id)}
                    className={`p-1.5 rounded-lg border transition ${
                      sess.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-700 text-slate-400 hover:text-emerald-500'
                    }`}
                    title="Toggle Complete"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>

                  <div className="min-w-0">
                    <h5
                      className={`text-sm font-bold text-slate-900 dark:text-slate-100 truncate ${
                        sess.completed ? 'line-through' : ''
                      }`}
                    >
                      {sess.title}
                    </h5>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 font-mono font-medium">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        {sess.startTime} - {sess.endTime} ({sess.durationMinutes || 45}m)
                      </span>
                      {sess.courseTitle && (
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> {sess.courseTitle}
                        </span>
                      )}
                      {sess.notes && (
                        <span className="text-slate-400 truncate max-w-[200px]">
                          Note: {sess.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/40">
                    {sess.type || 'Lecture'}
                  </span>

                  {onDeleteSession && (
                    <button
                      onClick={() => onDeleteSession(sess.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Session Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Schedule Study Session</DialogTitle>
        <DialogContent sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            autoFocus
            label="Session Title"
            placeholder="e.g., Watch Module 2: Advanced Hooks"
            fullWidth
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            size="small"
            required
          />

          <div className="grid grid-cols-3 gap-2">
            <TextField
              label="Date"
              type="date"
              fullWidth
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="Start Time"
              type="time"
              fullWidth
              value={newStartTime}
              onChange={(e) => setNewStartTime(e.target.value)}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="End Time"
              type="time"
              fullWidth
              value={newEndTime}
              onChange={(e) => setNewEndTime(e.target.value)}
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <FormControl fullWidth size="small">
              <InputLabel>Session Type</InputLabel>
              <Select
                value={sessionType}
                label="Session Type"
                onChange={(e) => setSessionType(e.target.value)}
              >
                <MenuItem value="Video Lesson">Video Lesson</MenuItem>
                <MenuItem value="Coding Practice">Coding Practice</MenuItem>
                <MenuItem value="Concept Quiz">Concept Quiz</MenuItem>
                <MenuItem value="Project Work">Project Work</MenuItem>
                <MenuItem value="Curriculum Review">Curriculum Review</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                label="Priority"
                onChange={(e) => setPriority(e.target.value as any)}
              >
                <MenuItem value="low">Low Priority</MenuItem>
                <MenuItem value="medium">Medium Priority</MenuItem>
                <MenuItem value="high">High Priority</MenuItem>
              </Select>
            </FormControl>
          </div>

          {courses.length > 0 && (
            <FormControl fullWidth size="small">
              <InputLabel>Associated Course (Optional)</InputLabel>
              <Select
                value={selectedCourseId}
                label="Associated Course (Optional)"
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                <MenuItem value="">None / General Study</MenuItem>
                {courses.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            label="Notes / Focus Topics (Optional)"
            placeholder="Specific functions or concepts to master..."
            multiline
            rows={2}
            fullWidth
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveSession}>
            Save to Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
