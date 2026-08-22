import React, { useEffect, useState } from 'react';
import { Plus, Search, FileText, Pin } from 'lucide-react';
import { Button, TextField, InputAdornment } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToUserNotes, saveUserNote, deleteUserNote } from '../../services/firebase/firestoreService';
import { NotionEditor } from '../../components/productivity/NotionEditor';
import { EmptyState } from '../../components/common/EmptyState';
import type { Note } from '../../types';

export const NotesPage: React.FC = () => {
  const { userProfile } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!userProfile?.uid) return;

    const unsubscribe = subscribeToUserNotes(userProfile.uid, (data: Note[]) => {
      setNotes(data);
      if (data.length > 0) {
        setActiveNote((prev) => (prev ? data.find((n: Note) => n.id === prev.id) || data[0] : data[0]));
      } else {
        setActiveNote(null);
      }
    });

    return () => unsubscribe();
  }, [userProfile?.uid]);

  const handleCreateNewNote = async () => {
    if (!userProfile?.uid) return;

    const newNoteData = {
      title: 'Untitled Note',
      content: '# New Note\n\nStart typing ideas, code snippets, and concepts...',
      tags: ['General'],
      isPinned: false,
    };

    const saved = await saveUserNote(userProfile.uid, newNoteData);
    setActiveNote(saved);
  };


  const handleSaveNote = async (updated: Partial<Note> & { title: string; content: string }) => {
    if (!userProfile?.uid || !activeNote) return;

    const saved = await saveUserNote(userProfile.uid, {
      ...activeNote,
      ...updated,
    });

    setNotes((prev) => prev.map((n) => (n.id === saved.id ? saved : n)));
    setActiveNote(saved);
  };

  const handleDeleteNote = async (id: string) => {
    if (userProfile?.uid) {
      await deleteUserNote(userProfile.uid, id);
      const remaining = notes.filter((n) => n.id !== id);
      setNotes(remaining);
      setActiveNote(remaining[0] || null);
    }
  };

  const filtered = notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
  });

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Left Column: Notes Directory List */}
      <div className="w-80 h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>Notion Notes</span>
            </h2>
            <Button
              size="small"
              variant="contained"
              onClick={handleCreateNewNote}
              startIcon={<Plus className="w-3.5 h-3.5" />}
            >
              New Note
            </Button>
          </div>

          <TextField
            fullWidth
            size="small"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="w-4 h-4 text-slate-400" />
                  </InputAdornment>
                ),
              },
            }}
          />
        </div>

        {/* Notes Items List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 subtle-scroll">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No notes found. Click "New Note" to create one.
            </div>
          ) : (
            filtered.map((note) => {
              const isSelected = activeNote?.id === note.id;

              return (
                <div
                  key={note.id}
                  onClick={() => setActiveNote(note)}
                  className={`p-3 rounded-xl cursor-pointer transition ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-900/60 shadow-xs'
                      : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>
                      {note.title || 'Untitled Note'}
                    </h4>
                    {note.isPinned && <Pin className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-mono">
                    {note.content.replace(/[#*`_]/g, '').slice(0, 50) || 'Empty note...'}
                  </p>

                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {note.courseTitle && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 truncate max-w-[120px]">
                        {note.courseTitle}
                      </span>
                    )}
                    {note.tags?.slice(0, 2).map((t) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Active Notion Editor Canvas */}
      <div className="flex-1 h-full p-4 md:p-6 overflow-hidden">
        {activeNote ? (
          <NotionEditor
            key={activeNote.id}
            note={activeNote}
            onSave={handleSaveNote}
            onDelete={handleDeleteNote}
          />
        ) : (
          <EmptyState
            icon="notes"
            title="No Note Selected"
            description="Select an existing note from the sidebar or create a new markdown note."
            actionText="Create New Note"
            onAction={handleCreateNewNote}
          />
        )}
      </div>
    </div>
  );
};
