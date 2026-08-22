import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  GraduationCap,
  Bot,
  FileText,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  const tabs = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Courses', path: '/courses', icon: Compass },
    { label: 'Learning', path: '/learning', icon: GraduationCap },
    { label: 'AI Tutor', path: '/ai', icon: Bot },
    { label: 'Notes', path: '/notes', icon: FileText },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 px-2 flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(`${tab.path}/`));

        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-medium transition ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-indigo-600 dark:text-indigo-400 scale-110' : ''}`} />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
