import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileBottomNav } from './MobileBottomNav';
import { SearchCommand } from './SearchCommand';
import { Drawer } from '@mui/material';

export const AppShell: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Ctrl + K key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-[100dvh] w-full max-w-full overflow-x-hidden bg-[#f9f9ff] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}

      <div className="hidden lg:block h-full flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              border: 'none',
              backgroundImage: 'none',
              bgcolor: (theme: any) => (theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff'),
            },
          },
        }}
      >
        <Sidebar onCloseMobile={() => setMobileOpen(false)} />
      </Drawer>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <Topbar
          onOpenSearch={() => setSearchOpen(true)}
          onToggleMobileSidebar={() => setMobileOpen(true)}
        />

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-8 subtle-scroll">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>

      {/* Command Palette Search Dialog */}
      <SearchCommand open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};
