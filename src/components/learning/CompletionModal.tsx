import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
} from '@mui/material';
import {
  Award,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Flame,
} from 'lucide-react';
import type { Certificate, Course } from '../../types';

interface CompletionModalProps {
  open: boolean;
  onClose: () => void;
  certificate: Certificate | null;
  course: Course | null;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  open,
  onClose,
  certificate,
  course,
}) => {
  const navigate = useNavigate();

  if (!course) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            p: 2,
            textAlign: 'center',
            bgcolor: (theme: any) => (theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff'),
            backgroundImage: 'none',
            boxShadow: '0 25px 50px -12px rgba(70, 72, 212, 0.35)',
          },
        },
      }}
    >
      <DialogContent sx={{ p: 2 }}>
        {/* Animated Trophy Header */}
        <div className="relative inline-block mb-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30 animate-bounce">
            <Award className="w-10 h-10" />
          </div>
          <div className="absolute -top-1 -right-1 p-1.5 rounded-full bg-indigo-600 text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
          Course Complete • 100% Mastery
        </span>

        <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, mb: 1 }}>
          Congratulations! 🎉
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440, mx: 'auto', mb: 3 }}>
          You have successfully finished all modules and lessons for <strong>{course.title}</strong>.
        </Typography>

        {/* XP & Streak Unlock Summary Card */}
        <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
          <div className="flex items-center gap-2.5 p-2 bg-white dark:bg-slate-900 rounded-xl">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400">XP Earned</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">+500 XP</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 bg-white dark:bg-slate-900 rounded-xl">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400">Streak Boost</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Maintained 🔥</p>
            </div>
          </div>
        </div>

        {/* Certificate Teaser Card */}
        {certificate && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/10 via-purple-900/5 to-slate-900/10 border border-indigo-200 dark:border-indigo-800/40 text-left mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Certificate Issued</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{certificate.certificateNumber}</span>
            </div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Issued to {certificate.userName} • {certificate.issueDate}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
          <Button
            variant="contained"
            fullWidth
            onClick={() => {
              onClose();
              navigate('/certificates');
            }}
            startIcon={<ShieldCheck className="w-4 h-4" />}
          >
            View & Download Certificate
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              onClose();
              navigate('/dashboard');
            }}
            endIcon={<ArrowRight className="w-4 h-4" />}
          >
            Return to Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
