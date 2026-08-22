import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  Search,
  BookOpen,
  Video,
  FileText,
  Calendar,
  Award,
  HelpCircle,
  FolderGit2,
  Terminal,
  Target,
} from 'lucide-react';
import { useLearning } from '../../contexts/LearningContext';

interface SearchCommandProps {
  open: boolean;
  onClose: () => void;
}

export const SearchCommand: React.FC<SearchCommandProps> = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { courses } = useLearning();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Aggregate searchable items
  const items: Array<{
    id: string;
    type: 'course' | 'lesson' | 'action' | 'notes';
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    action: () => void;
  }> = [];

  // Add Courses
  courses.forEach((c) => {
    items.push({
      id: `course_${c.id}`,
      type: 'course',
      title: c.title,
      subtitle: `${c.category} • ${c.totalLessons} Lessons`,
      icon: <BookOpen className="w-4 h-4 text-indigo-500" />,
      action: () => {
        navigate(`/courses/${c.id}`);
        onClose();
      },
    });

    // Add Lessons
    if (c.lessons) {
      c.lessons.forEach((l) => {
        items.push({
          id: `lesson_${l.id}`,
          type: 'lesson',
          title: l.title,
          subtitle: `${c.title} (Video Lesson)`,
          icon: <Video className="w-4 h-4 text-emerald-500" />,
          action: () => {
            navigate(`/learning/${c.id}`);
            onClose();
          },
        });
      });
    }
  });

  // Add Actions
  items.push(
    {
      id: 'action_quizzes',
      type: 'action',
      title: 'Quizzes & Knowledge Checks',
      subtitle: 'Test concepts and earn XP',
      icon: <HelpCircle className="w-4 h-4 text-amber-500" />,
      action: () => {
        navigate('/quizzes');
        onClose();
      },
    },
    {
      id: 'action_assignments',
      type: 'action',
      title: 'Project Assignments',
      subtitle: 'Submit portfolio capstone repositories',
      icon: <FolderGit2 className="w-4 h-4 text-indigo-500" />,
      action: () => {
        navigate('/assignments');
        onClose();
      },
    },
    {
      id: 'action_practice',
      type: 'action',
      title: 'Practice Code Sandbox',
      subtitle: 'Hands-on TypeScript, Python, and JavaScript runner',
      icon: <Terminal className="w-4 h-4 text-emerald-500" />,
      action: () => {
        navigate('/practice');
        onClose();
      },
    },
    {
      id: 'action_schedule',
      type: 'action',
      title: 'Schedule & Calendar',
      subtitle: 'Manage upcoming study sessions and calendar',
      icon: <Calendar className="w-4 h-4 text-indigo-500" />,
      action: () => {
        navigate('/schedule');
        onClose();
      },
    },
    {
      id: 'action_goals',
      type: 'action',
      title: 'Goals & Targets',
      subtitle: 'Track your learning milestones',
      icon: <Target className="w-4 h-4 text-rose-500" />,
      action: () => {
        navigate('/goals');
        onClose();
      },
    },
    {
      id: 'action_notes',
      type: 'notes',
      title: 'Notes Workspace',
      subtitle: 'View and edit personal curriculum notes',
      icon: <FileText className="w-4 h-4 text-blue-500" />,
      action: () => {
        navigate('/notes');
        onClose();
      },
    },
    {
      id: 'action_achievements',
      type: 'action',
      title: 'View Achievements',
      subtitle: 'Check XP and earned badges',
      icon: <Award className="w-4 h-4 text-purple-500" />,
      action: () => {
        navigate('/achievements');
        onClose();
      },
    }
  );

  // Filter items
  const filtered = items.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return item.title.toLowerCase().includes(q) || (item.subtitle && item.subtitle.toLowerCase().includes(q));
  }).slice(0, 8);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < filtered.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filtered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            backgroundColor: (theme: any) => (theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff'),
            backgroundImage: 'none',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0 }} onKeyDown={handleKeyDown}>
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            inputRef={inputRef}
            fullWidth
            placeholder="Search courses, lessons, notes, quizzes, or tools... (Press ESC to exit)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            variant="standard"
            slotProps={{
              input: {
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <Search className="w-5 h-5 text-indigo-500 mr-2" />
                  </InputAdornment>
                ),
                sx: { fontSize: '1.05rem', fontWeight: 500 },
              },
            }}
          />
        </Box>

        <Box sx={{ maxHeight: 380, overflowY: 'auto', p: 1 }} className="subtle-scroll">
          {filtered.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No matching results found for "{query}".
              </Typography>
            </Box>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <Box
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  sx={{
                    p: 1.5,
                    px: 2,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    backgroundColor: isSelected
                      ? (theme) => (theme.palette.mode === 'dark' ? 'rgba(70, 72, 212, 0.2)' : 'rgba(70, 72, 212, 0.08)')
                      : 'transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                        {item.title}
                      </Typography>
                      {item.subtitle && (
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {item.subtitle}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Chip
                    size="small"
                    label={item.type.toUpperCase()}
                    sx={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      height: 20,
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    }}
                  />
                </Box>
              );
            })
          )}
        </Box>

        <Box
          sx={{
            p: 1.5,
            px: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : '#f8fafc'),
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Use <kbd className="px-1.5 py-0.5 text-xs bg-slate-200 dark:bg-slate-800 rounded">↑</kbd> <kbd className="px-1.5 py-0.5 text-xs bg-slate-200 dark:bg-slate-800 rounded">↓</kbd> to navigate, <kbd className="px-1.5 py-0.5 text-xs bg-slate-200 dark:bg-slate-800 rounded">↵</kbd> to select
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Shortcut: <span className="font-semibold">Ctrl + K</span>
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
