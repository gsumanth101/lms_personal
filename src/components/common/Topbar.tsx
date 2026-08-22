import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  Flame,
  Zap,
  Bell,
  Sun,
  Moon,
  Menu,
  Users,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLearning } from '../../contexts/LearningContext';
import { subscribeToActiveLearners } from '../../services/firebase/firestoreService';
import type { UserProfile } from '../../types';
import {
  IconButton,
  Menu as MuiMenu,
  MenuItem,
  Badge,
  Avatar,
  Box,
  Typography,
  Divider,
} from '@mui/material';

interface TopbarProps {
  onToggleMobileSidebar?: () => void;
  onOpenSearch?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onToggleMobileSidebar, onOpenSearch }) => {
  const { userProfile, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { enrollments, courses } = useLearning();
  const navigate = useNavigate();

  const [activeLearners, setActiveLearners] = useState<UserProfile[]>([]);
  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToActiveLearners((learners) => {
      setActiveLearners(learners);
    });
    return () => unsubscribe();
  }, []);

  // Compute real notifications based on actual user progress & state
  const realNotifications = [];
  const completedCount = Object.values(enrollments).filter((e) => e.completed).length;

  if (userProfile?.currentStreak && userProfile.currentStreak > 0) {
    realNotifications.push({
      id: 'notif_streak',
      title: `${userProfile.currentStreak}-Day Streak Active! 🔥`,
      desc: 'Keep learning daily in your timezone to maintain momentum.',
      time: 'Today',
      read: false,
    });
  }

  if (completedCount > 0) {
    realNotifications.push({
      id: 'notif_cert',
      title: 'Course Certificate Earned 🏆',
      desc: `You have completed ${completedCount} course${completedCount > 1 ? 's' : ''}. Verified certificate issued.`,
      time: 'Recent',
      read: false,
    });
  }

  if (courses.length > 0) {
    realNotifications.push({
      id: 'notif_catalog',
      title: 'Drive Curriculum Active 📂',
      desc: `${courses.length} courses loaded from Google Drive.`,
      time: 'Ready',
      read: true,
    });
  }

  return (
    <header className="h-16 px-4 md:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Menu Toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Trigger (Ctrl+K) */}
        <button
          onClick={onOpenSearch}
          className="flex-1 flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 text-sm hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-800 transition shadow-inner group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition" />
            <span className="text-xs md:text-sm font-normal">Search courses, lessons, notes...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 rounded-md shadow-xs">
            <span>Ctrl</span><span>K</span>
          </kbd>
        </button>
      </div>

      {/* Right: Real Metrics & Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Real Presence Indicator */}
        {activeLearners.length > 0 && (
          <div
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/50 shadow-xs"
            title="Real-time Active Learners Online"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{activeLearners.length} Active</span>
          </div>
        )}

        {/* Streak Pill */}
        <NavLink
          to="/schedule"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/70 dark:border-amber-800/40 hover:scale-105 transition no-underline shadow-xs"
        >
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{userProfile?.currentStreak || 0}d</span>
        </NavLink>

        {/* XP Level Pill */}
        <NavLink
          to="/achievements"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/70 dark:border-indigo-800/40 hover:scale-105 transition no-underline shadow-xs"
        >
          <Zap className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
          <span>Lv. {userProfile?.level || 1} • {userProfile?.xp?.toLocaleString() || '0'} XP</span>
        </NavLink>

        {/* Theme Toggle */}
        <IconButton
          onClick={toggleTheme}
          size="small"
          sx={{
            p: 1,
            color: (theme) => (theme.palette.mode === 'dark' ? '#f59e0b' : '#64748b'),
            '&:hover': { bgcolor: 'action.hover' },
          }}
          title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </IconButton>

        {/* Notifications */}
        <IconButton
          onClick={(e) => setNotificationAnchor(e.currentTarget)}
          size="small"
          sx={{ p: 1, color: 'text.secondary' }}
        >
          <Badge badgeContent={realNotifications.filter((n) => !n.read).length} color="primary">
            <Bell className="w-4 h-4" />
          </Badge>
        </IconButton>

        {/* Notification Menu */}
        <MuiMenu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={() => setNotificationAnchor(null)}
          slotProps={{
            paper: {
              sx: {
                width: 320,
                borderRadius: 3,
                mt: 1.5,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              },
            },
          }}
        >
          <Box sx={{ p: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Notifications</Typography>
            <Typography variant="caption" color="text.secondary">
              {realNotifications.length} updates
            </Typography>
          </Box>
          <Divider />
          {realNotifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">No new notifications</Typography>
            </Box>
          ) : (
            realNotifications.map((n) => (
              <MenuItem
                key={n.id}
                onClick={() => setNotificationAnchor(null)}
                sx={{ py: 1.5, px: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{n.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{n.time}</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">{n.desc}</Typography>
              </MenuItem>
            ))
          )}
        </MuiMenu>

        {/* User Avatar Menu Trigger */}
        <IconButton onClick={(e) => setProfileAnchor(e.currentTarget)} sx={{ p: 0.5 }}>
          <Avatar
            src={userProfile?.photoURL}
            alt={userProfile?.displayName}
            sx={{ width: 32, height: 32, bgcolor: '#4648d4', fontSize: '0.85rem', fontWeight: 600 }}
          >
            {userProfile?.displayName?.charAt(0) || 'U'}
          </Avatar>
        </IconButton>

        {/* Profile Menu */}
        <MuiMenu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={() => setProfileAnchor(null)}
          slotProps={{
            paper: {
              sx: {
                width: 220,
                borderRadius: 3,
                mt: 1.5,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              },
            },
          }}
        >
          <Box sx={{ p: 2, pb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>{userProfile?.displayName || 'Learner'}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{userProfile?.email || 'learner@learnos.ai'}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { setProfileAnchor(null); navigate('/profile'); }}>View Profile</MenuItem>
          <MenuItem onClick={() => { setProfileAnchor(null); navigate('/settings'); }}>Account Settings</MenuItem>
          <MenuItem onClick={() => { setProfileAnchor(null); navigate('/certificates'); }}>My Certificates</MenuItem>
          <Divider />
          <MenuItem onClick={() => { setProfileAnchor(null); logout().then(() => navigate('/login')); }} sx={{ color: 'error.main' }}>Sign Out</MenuItem>
        </MuiMenu>
      </div>
    </header>
  );
};
