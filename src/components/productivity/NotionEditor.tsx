import React, { useState } from 'react';
import {
  Heading1,
  Heading2,
  List,
  CheckSquare,
  Code,
  Quote,
  Save,
  Trash2,
  Tag,
  Pin,
} from 'lucide-react';
import { Button, Chip, IconButton } from '@mui/material';
import type { Note } from '../../types';

interface NotionEditorProps {
  note: Note;
  onSave: (updated: Partial<Note> & { title: string; content: string }) => void;
  onDelete?: (id: string) => void;
}

export const NotionEditor: React.FC<NotionEditorProps> = ({
  note,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(note.tags || []);
  const [isPinned, setIsPinned] = useState(note.isPinned || false);

  const insertBlock = (prefix: string, suffix: string = '') => {
    setContent((prev) => `${prev}\n${prefix} ${suffix}`);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const updated = [...tags, tagInput.trim()];
      setTags(updated);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSave = () => {
    onSave({
      id: note.id,
      title: title.trim() || 'Untitled Note',
      content,
      tags,
      isPinned,
    });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Notion Toolbar */}
      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <IconButton
            size="small"
            onClick={() => insertBlock('#')}
            title="Heading 1"
            sx={{ p: 0.75 }}
          >
            <Heading1 className="w-4 h-4" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => insertBlock('##')}
            title="Heading 2"
            sx={{ p: 0.75 }}
          >
            <Heading2 className="w-4 h-4" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => insertBlock('-')}
            title="Bullet List"
            sx={{ p: 0.75 }}
          >
            <List className="w-4 h-4" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => insertBlock('- [ ]')}
            title="Interactive Checklist"
            sx={{ p: 0.75 }}
          >
            <CheckSquare className="w-4 h-4" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => insertBlock('```typescript\n// code here\n```')}
            title="Code Block"
            sx={{ p: 0.75 }}
          >
            <Code className="w-4 h-4" />
          </IconButton>

          <IconButton
            size="small"
            onClick={() => insertBlock('>')}
            title="Quote / Callout"
            sx={{ p: 0.75 }}
          >
            <Quote className="w-4 h-4" />
          </IconButton>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPinned(!isPinned)}
            className={`p-1.5 rounded-lg border transition ${
              isPinned
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600'
            }`}
            title="Pin note to top"
          >
            <Pin className="w-4 h-4" />
          </button>

          {onDelete && (
            <button
              onClick={() => onDelete(note.id)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition"
              title="Delete note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <Button
            size="small"
            variant="contained"
            onClick={handleSave}
            startIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save Note
          </Button>
        </div>
      </div>

      {/* Editor Main Canvas */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 subtle-scroll">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled Note..."
          className="w-full text-2xl font-black bg-transparent border-none focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 tracking-tight"
        />

        {/* Tags Bar */}
        <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <Tag className="w-3.5 h-3.5 text-slate-400" />
          {tags.map((t) => (
            <Chip
              key={t}
              size="small"
              label={t}
              onDelete={() => handleRemoveTag(t)}
              sx={{ fontSize: '0.75rem', height: 22 }}
            />
          ))}
          <input
            type="text"
            placeholder="+ Add tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            className="text-xs bg-transparent border-none focus:outline-none text-slate-500 placeholder-slate-400 py-1"
          />
        </div>

        {/* Content */}
        <textarea
          rows={18}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your markdown blocks here... Use headings (#, ##), checklists (- [ ]), and code blocks."
          className="w-full h-full min-h-[350px] bg-transparent border-none focus:outline-none text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-sans resize-none"
        />
      </div>
    </div>
  );
};
