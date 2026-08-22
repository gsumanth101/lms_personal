import React, { useState, useEffect } from 'react';
import { Save, Plus, Clock, Check } from 'lucide-react';
import { Button } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { getUserNotes, saveUserNote } from '../../services/firebase/firestoreService';
import type { Lesson, Note } from '../../types';

interface LessonNotesTabProps {
  lesson: Lesson;
  courseTitle: string;
  externalTimestamp?: string | null;
}

export const LessonNotesTab: React.FC<LessonNotesTabProps> = ({
  lesson,
  courseTitle,
  externalTimestamp,
}) => {
  const { userProfile } = useAuth();
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [savedStatus, setSavedStatus] = useState<boolean>(false);

  useEffect(() => {
    const loadNotes = async () => {
      if (!userProfile?.uid) return;
      const all = await getUserNotes(userProfile.uid);
      const lessonNotes = all.filter((n) => n.lessonId === lesson.id || n.courseId === lesson.courseId);

      if (lessonNotes.length > 0) {
        setActiveNote(lessonNotes[0]);
        setTitle(lessonNotes[0].title);
        setContent(lessonNotes[0].content);
      } else {
        const initialTitle = `Notes: ${lesson.title.replace(/^\d+[\s._-]+/, '')}`;
        const initialContent = `# ${lesson.title}\n\n- Key concept:\n- Questions:\n`;
        setTitle(initialTitle);
        setContent(initialContent);
      }
    };

    loadNotes();
  }, [lesson.id, userProfile?.uid]);

  // Insert timestamp into content if requested by player
  useEffect(() => {
    if (externalTimestamp) {
      setContent((prev) => `${prev}\n- **[${externalTimestamp}]** `);
    }
  }, [externalTimestamp]);

  const handleSave = async () => {
    if (!userProfile?.uid) return;
    const saved = await saveUserNote(userProfile.uid, {
      id: activeNote?.id,
      title: title.trim() || 'Untitled Note',
      content,
      courseId: lesson.courseId,
      courseTitle,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      tags: ['Course Note', courseTitle],
    });

    setActiveNote(saved);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleCreateNew = () => {
    setActiveNote(null);
    setTitle(`Note on ${lesson.title}`);
    setContent('');
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: Title & Save Status */}
      <div className="flex items-center justify-between gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="flex-1 text-base font-bold bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:outline-none px-1 py-1 text-slate-900 dark:text-slate-100"
        />

        <div className="flex items-center gap-2">
          <Button
            size="small"
            variant="outlined"
            onClick={handleCreateNew}
            startIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Note
          </Button>

          <Button
            size="small"
            variant="contained"
            onClick={handleSave}
            startIcon={savedStatus ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            color={savedStatus ? 'success' : 'primary'}
          >
            {savedStatus ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Markdown / Textarea Canvas */}
      <textarea
        rows={12}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your Notion-style markdown notes here... Use # for headings, - for lists, or click timestamp in player to insert timestamps."
        className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-y"
      />

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          Click the <strong className="text-indigo-600 dark:text-indigo-400 font-medium">Note [MM:SS]</strong> button in the video player to insert timestamp anchors.
        </span>
        <span>Auto-saved to your personal Learning OS</span>
      </div>
    </div>
  );
};
