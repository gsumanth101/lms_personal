import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { FolderSearch, BookOpen, FileText, CheckCircle2, Award } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'courses' | 'notes' | 'tasks' | 'goals' | 'achievements' | 'search';
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'courses',
  title,
  description,
  actionText,
  onAction,
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'notes':
        return <FileText className="w-12 h-12 text-indigo-400" />;
      case 'tasks':
        return <CheckCircle2 className="w-12 h-12 text-emerald-400" />;
      case 'achievements':
        return <Award className="w-12 h-12 text-amber-400" />;
      case 'search':
        return <FolderSearch className="w-12 h-12 text-blue-400" />;
      default:
        return <BookOpen className="w-12 h-12 text-indigo-500" />;
    }
  };

  return (
    <Box
      sx={{
        py: 8,
        px: 4,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        border: '1px dashed',
        borderColor: 'divider',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(248, 250, 252, 0.6)'),
      }}
    >
      <Box
        sx={{
          w: 20,
          h: 20,
          p: 2.5,
          mb: 2.5,
          borderRadius: '50%',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(70, 72, 212, 0.15)' : 'rgba(70, 72, 212, 0.08)'),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {getIcon()}
      </Box>

      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420, mb: 3 }}>
        {description}
      </Typography>

      {actionText && onAction && (
        <Button variant="contained" color="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Box>
  );
};
