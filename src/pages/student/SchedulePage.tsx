import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLearning } from '../../contexts/LearningContext';
import {
  subscribeToUserSchedule,
  saveScheduleSession,
  deleteScheduleSession,
} from '../../services/firebase/firestoreService';
import { CalendarView } from '../../components/productivity/CalendarView';
import type { ScheduleSession } from '../../types';

export const SchedulePage: React.FC = () => {
  const { userProfile } = useAuth();
  const { courses } = useLearning();
  const [sessions, setSessions] = useState<ScheduleSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userProfile?.uid) return;

    setLoading(true);
    const unsubscribe = subscribeToUserSchedule(userProfile.uid, (data) => {
      setSessions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile?.uid]);

  const handleToggleComplete = async (id: string) => {
    const target = sessions.find((s) => s.id === id);
    if (target && userProfile?.uid) {
      await saveScheduleSession(userProfile.uid, {
        ...target,
        completed: !target.completed,
      });
    }
  };

  const handleAddSession = async (newSess: Partial<ScheduleSession>) => {
    if (userProfile?.uid && newSess.title) {
      await saveScheduleSession(userProfile.uid, {
        title: newSess.title,
        date: newSess.date || new Date().toISOString().split('T')[0],
        startTime: newSess.startTime || '18:00',
        endTime: newSess.endTime || '18:45',
        durationMinutes: newSess.durationMinutes || 45,
        courseId: newSess.courseId,
        courseTitle: newSess.courseTitle,
        type: newSess.type || 'Video Lesson',
        priority: newSess.priority || 'medium',
        notes: newSess.notes,
        completed: false,
      });
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (userProfile?.uid) {
      await deleteScheduleSession(userProfile.uid, id);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Learning Schedule Planner
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Real-time study planner synchronized with Firestore. Organize study blocks, video lessons, and milestones.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-slate-500">Loading schedule from Firestore...</div>
      ) : (
        <CalendarView
          sessions={sessions}
          courses={courses}
          onToggleSessionComplete={handleToggleComplete}
          onAddSession={handleAddSession}
          onDeleteSession={handleDeleteSession}
        />
      )}
    </div>
  );
};
