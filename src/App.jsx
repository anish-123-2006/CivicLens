import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { ColorModeContext } from './contexts/ColorModeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Report from './pages/Report';
import Success from './pages/Success';
import AdminDashboard from './pages/AdminDashboard';
import MyReports from './pages/MyReports';

function usePersistentMode() {
  const [mode, setMode] = React.useState('light');

  React.useEffect(() => {
    const saved = localStorage.getItem('civiclens-theme');
    if (saved === 'light' || saved === 'dark') {
      setMode(saved);
      return;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setMode(prefersDark ? 'dark' : 'light');
  }, []);

  React.useEffect(() => {
    localStorage.setItem('civiclens-theme', mode);
  }, [mode]);

  const toggleColorMode = React.useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return { mode, toggleColorMode };
}

function useAppTheme(mode) {
  return React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === 'dark' ? '#7c8ff0' : '#667eea',
            light: mode === 'dark' ? '#9db4ff' : '#8fa3f5',
            dark: mode === 'dark' ? '#5a5ddd' : '#4c5dd9',
          },
          secondary: {
            main: mode === 'dark' ? '#ff6b9d' : '#764ba2',
            light: mode === 'dark' ? '#ff8fb3' : '#9a6ec7',
            dark: mode === 'dark' ? '#ff4f7f' : '#5a3d7c',
          },
          background: mode === 'dark'
            ? { default: '#0a0e27', paper: '#111835' }
            : { default: '#f7f9fc', paper: '#ffffff' },
          surface: mode === 'dark'
            ? '#161b35'
            : '#f5f5f5',
          text: mode === 'dark'
            ? { primary: '#e8eef7', secondary: '#a0a9bd' }
            : { primary: '#1a1a1a', secondary: '#666666' },
          divider: mode === 'dark'
            ? 'rgba(124, 143, 240, 0.15)'
            : 'rgba(102, 126, 234, 0.15)',
          success: {
            main: mode === 'dark' ? '#66bb6a' : '#4caf50',
            light: mode === 'dark' ? '#81c784' : '#66bb6a',
          },
          warning: {
            main: mode === 'dark' ? '#ffa726' : '#ff9800',
            light: mode === 'dark' ? '#ffb74d' : '#ffb74d',
          },
          error: {
            main: mode === 'dark' ? '#ef5350' : '#f44336',
            light: mode === 'dark' ? '#e57373' : '#ef5350',
          },
          info: {
            main: mode === 'dark' ? '#42a5f5' : '#2196f3',
            light: mode === 'dark' ? '#64b5f6' : '#42a5f5',
          },
        },
        typography: {
          fontFamily: "'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
          h1: {
            fontWeight: 800,
            letterSpacing: '-0.5px',
          },
          h2: {
            fontWeight: 800,
            letterSpacing: '-0.3px',
          },
          h3: {
            fontWeight: 700,
          },
          h4: {
            fontWeight: 700,
          },
          h5: {
            fontWeight: 700,
          },
          h6: {
            fontWeight: 700,
          },
          button: {
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          },
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              },
              contained: {
                boxShadow: mode === 'dark'
                  ? '0 8px 24px rgba(124, 143, 240, 0.25)'
                  : '0 8px 24px rgba(102, 126, 234, 0.25)',
                '&:hover': {
                  boxShadow: mode === 'dark'
                    ? '0 12px 40px rgba(124, 143, 240, 0.35)'
                    : '0 12px 40px rgba(102, 126, 234, 0.35)',
                  transform: 'translateY(-2px)',
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.3s ease',
                  '&:hover fieldset': {
                    borderColor: mode === 'dark' ? '#7c8ff0' : '#667eea',
                  },
                  '&.Mui-focused fieldset': {
                    boxShadow: mode === 'dark'
                      ? '0 0 0 3px rgba(124, 143, 240, 0.15)'
                      : '0 0 0 3px rgba(102, 126, 234, 0.15)',
                  },
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                border: mode === 'dark'
                  ? '1px solid rgba(124, 143, 240, 0.1)'
                  : '1px solid rgba(102, 126, 234, 0.1)',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                fontWeight: 600,
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
      }),
    [mode]
  );
}

function App() {
  const { mode, toggleColorMode } = usePersistentMode();
  const theme = useAppTheme(mode);

  return (
    <ColorModeContext.Provider value={{ toggleColorMode, mode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          {/* Use basename so routes work when served from /CivicLens/ on GitHub Pages */}
          <Router basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/report"
                element={
                  <ProtectedRoute>
                    <Report />
                  </ProtectedRoute>
                }
              />
              <Route path="/success" element={<Success />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route
                path="/my-reports"
                element={
                  <ProtectedRoute>
                    <MyReports />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
