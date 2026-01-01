import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MapComponentWithHeatmap from '../components/MapComponentWithHeatmap';
import { seedSampleReports } from '../utils/seedData';
import { ColorModeContext } from '../contexts/ColorModeContext.ts';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  const [seeding, setSeeding] = React.useState(false);
  const { toggleColorMode, mode } = React.useContext(ColorModeContext);
  const [locationDialogOpen, setLocationDialogOpen] = React.useState(true);
  const [userLocation, setUserLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);

  // Request location permission on component mount
  React.useEffect(() => {
    // Always show the location dialog on mount
    setLocationDialogOpen(true);
  }, []);

  const handleLocationRequest = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          console.log('Location granted:', latitude, longitude);
          setLocationDialogOpen(false);
        },
        (error) => {
          console.error('Location error:', error);
          setLocationDialogOpen(false);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser');
      setLocationDialogOpen(false);
    }
  };

  const handleLocationDeny = () => {
    setLocationDialogOpen(false);
  };

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

  const handleSeedData = async () => {
    if (!user) {
      alert('Please sign in first');
      return;
    }
    setSeeding(true);
    try {
      await seedSampleReports(user.uid);
      alert('✅ Successfully seeded 30 sample reports!');
    } catch (error) {
      alert('❌ Error seeding data. Check console.');
      console.error(error);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Location Permission Dialog */}
      <Dialog
        open={locationDialogOpen}
        onClose={handleLocationDeny}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '12px',
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1a1f4f 0%, #2a1a4f 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(124, 143, 240, 0.2)'
                : '0 8px 32px rgba(102, 126, 234, 0.3)',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            fontSize: '1.25rem',
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #7c8ff0 0%, #b08cf5 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          Enable Location Services
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            CivicLens works better with your location. We'll use it to show reports near you and help you create location-based reports.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Your location is private and only used to improve your experience.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleLocationDeny}
            sx={{
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '0.5px',
            }}
          >
            Not Now
          </Button>
          <Button
            onClick={handleLocationRequest}
            variant="contained"
            sx={{
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #7c8ff0 0%, #b08cf5 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: '0.5px',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 8px 24px rgba(124, 143, 240, 0.3)'
                  : '0 8px 24px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
              },
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
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
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 800,
              fontSize: '1.5rem',
              letterSpacing: 1,
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #e8eef7 0%, #7c8ff0 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            CivicLens
          </Typography>

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
                <MenuItem onClick={handleSeedData} disabled={seeding}>
                  {seeding ? 'Seeding...' : '🌱 Seed Demo Data'}
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
