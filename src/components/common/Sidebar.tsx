import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  GraduationCap,
  CalendarDays,
  Target,
  CheckSquare,
  FileText,
  BarChart3,
  Award,
  ShieldCheck,
  HelpCircle,
  FolderGit2,
  Terminal,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '@mui/material';

interface SidebarProps {
  collapsed?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { userProfile, logout } = useAuth();
  const location = useLocation();

  const navGroups: NavGroup[] = [
    {
      title: 'LEARNING OS',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Course Catalog', path: '/courses', icon: Compass },
        { label: 'Quizzes & Diagnostics', path: '/quizzes', icon: HelpCircle },
        { label: 'Project Assignments', path: '/assignments', icon: FolderGit2 },
        { label: 'Practice Sandbox', path: '/practice', icon: Terminal },
      ],
    },
    {
      title: 'PRODUCTIVITY',
      items: [
        { label: 'Schedule & Calendar', path: '/schedule', icon: CalendarDays },
        { label: 'Goals & Targets', path: '/goals', icon: Target },
        { label: 'Tasks Board', path: '/tasks', icon: CheckSquare },
        { label: 'Notes', path: '/notes', icon: FileText },
      ],
    },
    {
      title: 'PROGRESS & MASTERY',
      items: [
        { label: 'Analytics', path: '/analytics', icon: BarChart3 },
        { label: 'Achievements', path: '/achievements', icon: Award },
        { label: 'Certificates', path: '/certificates', icon: ShieldCheck },
      ],
    },
  ];

  return (
    <aside className="w-64 h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 select-none">
      {/* Brand Logo Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">LearnOS</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium tracking-tight -mt-0.5">Your Personal Learning OS</p>
          </div>
        </NavLink>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 subtle-scroll">
        {navGroups.map((group) => (
          <div key={group.title}>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300">
              {group.title}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(`${item.path}/`));

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100/80 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Profile & Logout */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <NavLink to="/profile" className="flex items-center gap-2.5 min-w-0 no-underline">
            <Avatar
              src={userProfile?.photoURL || undefined}
              sx={{ width: 32, height: 32, bgcolor: '#4648d4', fontSize: 13, fontWeight: 700 }}
            >
              {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                {userProfile?.displayName || 'Learner'}
              </p>
              <span className="text-[10px] text-slate-500 font-medium">Student</span>
            </div>
          </NavLink>

          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
