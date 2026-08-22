import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { getMuiTheme } from '../theme/muiTheme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'learnos_theme_preference';

const getInitialTheme = (): ThemeMode => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
  } catch {}
  return 'light';
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(getInitialTheme);
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false;
  });

  // Listen to OS system color scheme changes if in 'system' mode
  useEffect(() => {
    if (!window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const resolvedTheme: 'light' | 'dark' = useMemo(() => {
    if (theme === 'system') return systemIsDark ? 'dark' : 'light';
    return theme;
  }, [theme, systemIsDark]);

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme, resolvedTheme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      const currentResolved = prev === 'system' ? (systemIsDark ? 'dark' : 'light') : prev;
      const next = currentResolved === 'dark' ? 'light' : 'dark';
      return next;
    });
  };

  const muiTheme = useMemo(() => getMuiTheme(resolvedTheme), [resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline enableColorScheme />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

