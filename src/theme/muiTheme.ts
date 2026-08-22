import { createTheme, responsiveFontSizes, type ThemeOptions } from '@mui/material/styles';

export const getMuiTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: '#4648d4',
        light: '#6366f1',
        dark: '#3b3dbf',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#645efb',
        light: '#818cf8',
        dark: '#4f46e5',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#0b0f19' : '#f9f9ff',
        paper: isDark ? '#131c2e' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f1f5f9' : '#151c27',
        secondary: isDark ? '#94a3b8' : '#64748b',
      },
      divider: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)',
      error: {
        main: '#ef4444',
      },
      warning: {
        main: '#f59e0b',
      },
      success: {
        main: '#10b981',
      },
      info: {
        main: '#06b6d4',
      },
    },
    typography: {
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.025em' },
      h2: { fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontWeight: 600, letterSpacing: '-0.02em' },
      h4: { fontWeight: 600, letterSpacing: '-0.01em' },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
      subtitle2: { fontWeight: 500 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 8,
            padding: '8px 16px',
            boxShadow: 'none',
            transition: 'all 0.18s ease-in-out',
            '&:hover': {
              boxShadow: '0 2px 8px rgba(70, 72, 212, 0.25)',
              transform: 'translateY(-1px)',
            },
          },
          contained: {
            background: 'linear-gradient(135deg, #4648d4 0%, #6063ee 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #3b3dbf 0%, #4648d4 100%)',
            },
          },
          outlined: {
            borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(70, 72, 212, 0.04)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundImage: 'none',
            border: isDark ? '1px solid rgba(51, 65, 85, 0.6)' : '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: isDark 
              ? '0 4px 12px rgba(0, 0, 0, 0.25)' 
              : '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
            backgroundColor: isDark ? '#131c2e' : '#ffffff',
            transition: 'all 0.2s ease-in-out',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            borderRadius: 6,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              backgroundColor: isDark ? '#0f172a' : '#f8fafc',
              '& fieldset': {
                borderColor: isDark ? 'rgba(51, 65, 85, 0.8)' : '#e2e8f0',
              },
              '&:hover fieldset': {
                borderColor: '#6063ee',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#4648d4',
                borderWidth: 2,
              },
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            backgroundColor: isDark ? '#131c2e' : '#ffffff',
            border: isDark ? '1px solid rgba(51, 65, 85, 0.8)' : '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
  };

  return responsiveFontSizes(createTheme(themeOptions));
};
