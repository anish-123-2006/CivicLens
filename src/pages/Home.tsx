import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MapComponentWithHeatmap from '../components/MapComponentWithHeatmap';
import { ColorModeContext } from '../contexts/ColorModeContext.ts';
import civicLensLogo from '../assets/civiclens-logo.svg';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const Home: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { toggleColorMode, mode } = React.useContext(ColorModeContext);

  // Location is now only requested when user clicks "Locate Me" button

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    await signOut();
    handleClose();
    navigate('/login');
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="static"
        sx={{
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1a1f4f 0%, #2a1a4f 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(124, 143, 240, 0.2)'
              : '0 8px 32px rgba(102, 126, 234, 0.3)',
          animation: 'slideInRight 0.6s ease-out',
        }}
      >
        <Toolbar>
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <img
              src={civicLensLogo}
              alt="CivicLens"
              style={{
                height: '50px',
                width: 'auto',
                filter: mode === 'dark' ? 'brightness(1.2)' : 'none',
              }}
            />
          </Box>

          {user && (
            <Button
              variant="contained"
              aria-label="report issue"
              sx={{
                mr: 2,
                px: 2,
                py: 0.8,
                borderRadius: 1.5,
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #7c8ff0 0%, #b08cf5 100%)'
                    : 'rgba(255, 255, 255, 0.25)',
                color: 'white',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, #9db4ff 0%, #c5b3ff 100%)'
                      : 'rgba(255, 255, 255, 0.35)',
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => navigate('/report')}
            >
              Report Issue
            </Button>
          )}

          {user && (
            <>
              <IconButton
                size="large"
                onClick={handleMenu}
                color="inherit"
              >
                {user.photoURL ? (
                  <Avatar src={user.photoURL} sx={{ width: 32, height: 32 }} />
                ) : (
                  <AccountCircleIcon />
                )}
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2">{user.email}</Typography>
                </MenuItem>
                <MenuItem onClick={() => { navigate('/my-reports'); handleClose(); }}>
                  My Reports
                </MenuItem>
                <MenuItem onClick={() => { navigate('/admin'); handleClose(); }}>
                  <AdminPanelSettingsIcon sx={{ mr: 1, fontSize: 18 }} /> Admin Panel
                </MenuItem>
                <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
              </Menu>
            </>
          )}
          {!user && (
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, position: 'relative' }}>
        <MapComponentWithHeatmap />
        <IconButton
          color="inherit"
          onClick={toggleColorMode}
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            size: 'large',
            width: 56,
            height: 56,
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark'
                ? '#2a2a2a'
                : '#ffffff',
            color: (theme) =>
              theme.palette.mode === 'dark'
                ? '#ffd54f'
                : '#667eea',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            border: (theme) =>
              theme.palette.mode === 'dark'
                ? '3px solid #444444'
                : '3px solid white',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            '&:hover': {
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? '#2a2a2a'
                  : '#ffffff',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            },
            '&:active': {
              transform: 'scale(0.95)',
            },
            '@media (max-width: 600px)': {
              bottom: 140,
              width: 50,
              height: 50,
            },
          }}
        >
          {mode === 'dark' ? <LightModeIcon sx={{ fontSize: 28 }} /> : <DarkModeIcon sx={{ fontSize: 28 }} />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default Home;
