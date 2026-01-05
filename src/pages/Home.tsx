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
  Fab,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const Home: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { toggleColorMode, mode } = React.useContext(ColorModeContext);
  const [userLocation, setUserLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);

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

          <IconButton
            color="inherit"
            onClick={toggleColorMode}
            sx={{
              mr: user ? 1 : 0,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'rotate(20deg) scale(1.1)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

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
        {user && (
          <Fab
            color="primary"
            aria-label="add report"
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #7c8ff0 0%, #b08cf5 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 12px 40px rgba(124, 143, 240, 0.35)'
                  : '0 12px 40px rgba(102, 126, 234, 0.4)',
              animation: 'bounce 2s ease-in-out infinite',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              '&:hover': {
                transform: 'scale(1.15)',
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 20px 50px rgba(124, 143, 240, 0.5)'
                    : '0 20px 50px rgba(102, 126, 234, 0.6)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              },
              '@media (max-width: 600px)': {
                bottom: 80,
              },
            }}
            onClick={() => navigate('/report')}
          >
            <AddIcon sx={{ fontSize: 28 }} />
          </Fab>
        )}
      </Box>
    </Box>
  );
};

export default Home;
