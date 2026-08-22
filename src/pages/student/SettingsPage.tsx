import React, { useState } from 'react';
import {
  HardDrive,
  Sun,
  Moon,
  FolderCheck,
  RefreshCw,
  Sparkles,
  Lock,
  LogOut,
  KeyRound,
} from 'lucide-react';
import { Button, Alert, TextField } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { clearDriveCache } from '../../services/googleDrive/driveCache';
import { changeUserPassword } from '../../services/firebase/authService';

export const SettingsPage: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [cacheCleared, setCacheCleared] = useState<boolean>(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);

  const handleClearCache = () => {
    clearDriveCache();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2500);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters' });
      return;
    }

    setPasswordLoading(true);
    setPasswordStatus(null);

    const res = await changeUserPassword(currentPassword, newPassword);
    setPasswordLoading(false);

    if (res.success) {
      setPasswordStatus({ type: 'success', message: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordStatus({ type: 'error', message: res.error || 'Failed to update password' });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          System Settings & Preferences
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1">
          Manage your account security, interface theme, and local learning cache.
        </p>
      </div>

      {cacheCleared && (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          Local learning cache cleared successfully.
        </Alert>
      )}

      {/* Account Info Box */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Active Account
              </h3>
              <p className="text-xs text-slate-500">{userProfile?.email || 'Learner Account'}</p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
            <FolderCheck className="w-4 h-4" /> Active
          </span>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <Button
            size="small"
            variant="outlined"
            onClick={handleClearCache}
            startIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Clear Local Cache
          </Button>

          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            startIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <KeyRound className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Security & Change Password
          </h3>
        </div>

        {passwordStatus && (
          <Alert severity={passwordStatus.type} sx={{ borderRadius: 2 }}>
            {passwordStatus.message}
          </Alert>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
          <TextField
            fullWidth
            size="small"
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <TextField
            fullWidth
            size="small"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            helperText="Minimum 6 characters"
          />

          <TextField
            fullWidth
            size="small"
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="contained"
            disabled={passwordLoading}
            startIcon={<Lock className="w-4 h-4" />}
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </div>

      {/* Theme Appearance Box */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Theme & Appearance
        </h3>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
              theme === 'light'
                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sun className="w-5 h-5" />
            <span className="text-xs">Light Mode</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
              theme === 'dark'
                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Moon className="w-5 h-5" />
            <span className="text-xs">Dark Mode</span>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`p-4 rounded-2xl border text-center transition flex flex-col items-center gap-2 ${
              theme === 'system'
                ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-xs">System Auto</span>
          </button>
        </div>
      </div>
    </div>
  );
};
