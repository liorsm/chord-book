import { createTheme } from '@mui/material/styles';

const chordColors = {
  major: '#60a5fa',
  minor: '#f87171',
  seventh: '#fbbf24',
  other: '#a78bfa',
};

export const getTheme = (mode) =>
  createTheme({
    direction: 'rtl',
    palette: {
      mode,
      primary: {
        main: '#7c3aed',
        light: '#a855f7',
        dark: '#5b21b6',
      },
      secondary: {
        main: mode === 'dark' ? '#a855f7' : '#6d28d9',
      },
      background: {
        default: mode === 'dark' ? '#1a0033' : '#faf5ff',
        paper: mode === 'dark' ? '#1e1b4b' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#f8fafc' : '#1e1b4b',
        secondary: mode === 'dark' ? '#c4b5fd' : '#6b7280',
      },
      divider: mode === 'dark' ? 'rgba(167, 139, 250, 0.2)' : 'rgba(124, 58, 237, 0.15)',
    },
    typography: {
      fontFamily: '"Rubik", "Assistant", sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none' },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background:
              mode === 'dark'
                ? 'linear-gradient(180deg, #1a0033 0%, #2a0a4a 100%)'
                : 'linear-gradient(180deg, #faf5ff 0%, #f3e8ff 100%)',
            minHeight: '100vh',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            border:
              mode === 'dark'
                ? '1px solid rgba(167, 139, 250, 0.15)'
                : '1px solid rgba(124, 58, 237, 0.12)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
    chordColors,
  });

export default getTheme;
