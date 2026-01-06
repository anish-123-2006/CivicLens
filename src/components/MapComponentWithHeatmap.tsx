import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, HeatmapLayer } from '@react-google-maps/api';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { upvoteReport, getUpvoteCount, hasUserUpvoted } from '../services/upvoteService';
import {
  Box,
  CircularProgress,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LocationOffIcon from '@mui/icons-material/LocationOff';

interface Report {
  id: string;
  imageUrl: string;
  location: {
    lat: number;
    lng: number;
  };
  category: string;
  severity: string;
  description: string;
  timestamp: any;
  userId: string;
  upvotes?: string[];
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultCenter = {
  lat: 24.4755,
  lng: 72.7754,
};

const MapComponentWithHeatmap: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [loading, setLoading] = useState(true);
  const [upvotingId, setUpvotingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'heatmap'>('map');
  const [locationErrorOpen, setLocationErrorOpen] = useState(false);
  const libraries: Array<'visualization'> = ['visualization'];

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Show dialog when GeolocationPositionError occurs
          if (error.code === error.PERMISSION_DENIED || 
              error.code === error.POSITION_UNAVAILABLE || 
              error.code === error.TIMEOUT) {
            setLocationErrorOpen(true);
          }
        }
      );
    } else {
      // Geolocation not supported
      console.error('Geolocation is not supported by this browser.');
      setLocationErrorOpen(true);
    }

    // Subscribe to reports
    const q = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reportsData: Report[] = [];
      querySnapshot.forEach((doc) => {
        reportsData.push({ id: doc.id, ...doc.data() } as Report);
      });
      setReports(reportsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Keep selected report in sync with realtime updates
  useEffect(() => {
    if (!selectedReport) return;
    const updated = reports.find((r) => r.id === selectedReport.id);
    if (updated && updated !== selectedReport) {
      setSelectedReport(updated);
    }
  }, [reports, selectedReport?.id]);

  const getMarkerColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
      case 'medium':
        return 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
      case 'low':
        return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
      default:
        return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  // Offset nearby markers so they don't overlap
  const getOffsetPosition = (report: Report, allReports: Report[]) => {
    const PROXIMITY_THRESHOLD = 0.0005; // ~50 meters at equator
    const OFFSET = 0.00015; // ~15 meters

    // Find all reports near this one
    const nearbyCount = allReports.filter(
      (r) =>
        Math.abs(r.location.lat - report.location.lat) < PROXIMITY_THRESHOLD &&
        Math.abs(r.location.lng - report.location.lng) < PROXIMITY_THRESHOLD
    ).length;

    if (nearbyCount <= 1) {
      return report.location; // No offset needed
    }

    // Calculate position in grid pattern
    const nearbyIndex = allReports
      .filter(
        (r) =>
          Math.abs(r.location.lat - report.location.lat) < PROXIMITY_THRESHOLD &&
          Math.abs(r.location.lng - report.location.lng) < PROXIMITY_THRESHOLD
      )
      .findIndex((r) => r.id === report.id);

    const row = Math.floor(nearbyIndex / 2);
    const col = nearbyIndex % 2;

    return {
      lat: report.location.lat + (row * OFFSET - OFFSET / 2),
      lng: report.location.lng + (col * OFFSET - OFFSET / 2),
    };
  };

  const generateHeatmapData = () => {
    const heatmapPoints: google.maps.visualization.WeightedLocation[] = [];

    reports.forEach((report) => {
      // Weight based on severity
      let weight = 1;
      if (report.severity.toLowerCase() === 'high') {
        weight = 3;
      } else if (report.severity.toLowerCase() === 'medium') {
        weight = 2;
      }

      // Add more points for higher upvote count
      const upvoteWeight = Math.min(getUpvoteCount(report) / 5, 1); // Max 1
      const totalWeight = weight + upvoteWeight;

      heatmapPoints.push({
        location: new google.maps.LatLng(report.location.lat, report.location.lng),
        weight: totalWeight,
      });
    });

    return heatmapPoints;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const handleUpvote = async (reportId: string) => {
    if (!user) {
      alert('Please sign in to upvote');
      return;
    }

    setUpvotingId(reportId);
    try {
      await upvoteReport(reportId, user.uid);
      // Real-time listener will automatically update reports and selectedReport
    } catch (error) {
      console.error('Error upvoting:', error);
      alert('Failed to save your upvote. Please check your connection and sign-in status.');
    } finally {
      setUpvotingId(null);
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* View Mode Toggle */}
      <Paper
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 5,
          p: 1.25,
          backgroundColor: alpha(theme.palette.background.paper, 0.9),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
          backdropFilter: 'blur(12px)',
          borderRadius: 2,
          transition: 'transform 200ms ease, box-shadow 200ms ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 16px 50px rgba(0,0,0,0.35)',
          },
          '@media (max-width: 600px)': {
            top: 'max(16px, env(safe-area-inset-top))',
            left: 8,
          },
        }}
      >
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_e, newMode) => {
            if (newMode !== null) {
              setViewMode(newMode);
            }
          }}
          size="small"
        >
          <ToggleButton
            value="map"
            aria-label="map view"
            sx={{
              color: theme.palette.text.primary,
              backgroundColor: alpha(theme.palette.background.default, 0.55),
              '&.Mui-selected': {
                color: theme.palette.primary.contrastText,
                backgroundColor: theme.palette.primary.main,
              },
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.15),
              },
              px: 1.6,
              py: 0.75,
              gap: 0.5,
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: 0.4,
            }}
          >
            📍 Map View
          </ToggleButton>
          <ToggleButton
            value="heatmap"
            aria-label="heatmap view"
            sx={{
              color: theme.palette.text.primary,
              backgroundColor: alpha(theme.palette.background.default, 0.55),
              '&.Mui-selected': {
                color: theme.palette.primary.contrastText,
                backgroundColor: theme.palette.primary.main,
              },
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.15),
              },
              px: 1.6,
              py: 0.75,
              gap: 0.5,
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: 0.4,
            }}
          >
            <LocalFireDepartmentIcon sx={{ mr: 0.5 }} /> Heatmap
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {/* Info Box */}
      {viewMode === 'heatmap' && (
        <Paper
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 5,
            p: 2,
            maxWidth: 300,
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
            backdropFilter: 'blur(12px)',
            borderRadius: 2,
            '@media (max-width: 600px)': {
              top: 'max(16px, env(safe-area-inset-top))',
              right: 8,
              maxWidth: 200,
              p: 1.5,
            },
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            🔥 Heat Map Overview
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Red zones = High concentration of civic issues
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={`${reports.length} Total Issues`} size="small" variant="outlined" />
            <Chip
              label={`${reports.filter((r) => r.severity === 'High').length} High Priority`}
              color="error"
              size="small"
              variant="outlined"
            />
          </Box>
        </Paper>
      )}

      <LoadScript
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}
        libraries={libraries}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation}
          zoom={13}
          options={{
            streetViewControl: false,
            fullscreenControl: false,
          }}
        >
          {viewMode === 'heatmap' && <HeatmapLayer data={generateHeatmapData()} />}

          {viewMode === 'map' &&
            reports.map((report) => (
              <Marker
                key={report.id}
                position={getOffsetPosition(report, reports)}
                onClick={() => setSelectedReport(report)}
                icon={{
                  url: getMarkerColor(report.severity),
                }}
              />
            ))}

          {selectedReport && (
            <InfoWindow
              position={selectedReport.location}
              onCloseClick={() => setSelectedReport(null)}
            >
              <Card sx={{ maxWidth: 300, boxShadow: 'none' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={selectedReport.imageUrl}
                  alt={selectedReport.category}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={selectedReport.severity}
                      color={getSeverityColor(selectedReport.severity) as any}
                      size="small"
                    />
                    <Chip label={selectedReport.category} size="small" variant="outlined" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {selectedReport.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    {selectedReport.timestamp?.toDate().toLocaleDateString()}
                  </Typography>

                  {/* Upvote Section */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Button
                      size="small"
                      variant={
                        user && hasUserUpvoted(selectedReport, user.uid) ? 'contained' : 'outlined'
                      }
                      color="primary"
                      startIcon={<ThumbUpIcon />}
                      onClick={() => handleUpvote(selectedReport.id)}
                      disabled={upvotingId === selectedReport.id}
                    >
                      {getUpvoteCount(selectedReport)}
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                      {getUpvoteCount(selectedReport) === 1 ? 'person' : 'people'} agree
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      {/* Location Error Dialog */}
      <Dialog
        open={locationErrorOpen}
        onClose={() => setLocationErrorOpen(false)}
        aria-labelledby="location-error-dialog-title"
        aria-describedby="location-error-dialog-description"
      >
        <DialogTitle id="location-error-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationOffIcon color="error" />
          Location Access Required
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="location-error-dialog-description">
            To show your current location on the map, please enable location access in your browser settings.
            <br /><br />
            <strong>How to enable:</strong>
            <br />
            • Click the location icon in your browser's address bar
            <br />
            • Select "Allow" to grant location access
            <br />
            • Refresh the page if needed
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocationErrorOpen(false)} color="primary" variant="contained">
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MapComponentWithHeatmap;
