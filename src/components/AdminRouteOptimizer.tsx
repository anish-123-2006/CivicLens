import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, Polyline, useJsApiLoader } from '@react-google-maps/api';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import RoomIcon from '@mui/icons-material/Room';
import RouteIcon from '@mui/icons-material/Route';
import ClearIcon from '@mui/icons-material/Clear';
import { db } from '../config/firebaseConfig';

interface Report {
  id: string;
  location: { lat: number; lng: number };
  severity: string;
  status: string;
}

// Default HQ fallback; will be replaced by geolocation or closest report cluster
const MUNICIPAL_OFFICE = { lat: 40.7128, lng: -74.006 };
const mapContainerStyle = { width: '100%', height: '420px' };

const AdminRouteOptimizer: React.FC = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
  });

  const [reports, setReports] = useState<Report[]>([]);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [animatedPath, setAnimatedPath] = useState<google.maps.LatLngLiteral[]>([]);
  const [animProgress, setAnimProgress] = useState(0);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'info' | 'success' | 'error',
  });
  const [userCenter, setUserCenter] = useState(MUNICIPAL_OFFICE);
  const [hqPoint, setHqPoint] = useState(MUNICIPAL_OFFICE);
  const [lastFetchCount, setLastFetchCount] = useState(0);
  const mapRef = useRef<google.maps.Map | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const center = useMemo(() => {
    if (reports.length > 0) {
      return { lat: reports[0].location.lat, lng: reports[0].location.lng };
    }
    return userCenter;
  }, [reports, userCenter]);

  const distanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLon = ((b.lng - a.lng) * Math.PI) / 180;
    const lat1 = (a.lat * Math.PI) / 180;
    const lat2 = (b.lat * Math.PI) / 180;
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const aVal = sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
    return R * c;
  };

  // Try to center map to admin's current location for convenience
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCenter(current);
        setHqPoint(current);
      },
      (err) => {
        console.warn('Geolocation unavailable, using HQ as center.', err);
      }
    );
  }, []);

  const fetchHighPriorityReports = useCallback(async () => {
    // Fetch up to 25 high-severity docs (case-insensitive via 'in'), then filter to pending-like statuses and keep top 10
    const reportsQuery = query(
      collection(db, 'reports'),
      where('severity', 'in', ['High', 'high', 'HIGH']),
      limit(25)
    );

    const snapshot = await getDocs(reportsQuery);
    const items: Report[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data() as Omit<Report, 'id'>;
      return {
        id: docSnap.id,
        ...data,
      };
    });

    const filtered = items
      .filter((item) => {
        const status = (item.status || '').toLowerCase();
        // Treat missing status as pending to support seeded data
        if (!item.status) return true;
        return status === 'pending' || status === 'todo';
      })
      .slice(0, 10);

    setReports(filtered);
    setLastFetchCount(filtered.length);

    if (filtered.length > 0) {
      const first = filtered[0].location;
      // If default HQ is far away, move HQ to the report cluster; otherwise use geolocation/default
      if (distanceKm(userCenter, first) > 200) {
        setHqPoint(first);
      } else {
        setHqPoint(userCenter);
      }
    }

    return filtered;
  }, [userCenter]);

  useEffect(() => {
    fetchHighPriorityReports().catch((error) => {
      console.error('Failed to load high-priority reports', error);
      setSnackbar({ open: true, message: 'Could not load reports.', severity: 'error' });
    });
  }, [fetchHighPriorityReports]);

  const handleOptimizeRoute = useCallback(async () => {
    if (!isLoaded || !window.google) {
      setSnackbar({ open: true, message: 'Map not ready yet. Please retry.', severity: 'error' });
      return;
    }

    setLoadingRoute(true);
    try {
      const latestReports = await fetchHighPriorityReports();

      if (latestReports.length === 0) {
        setDirections(null);
        setSnackbar({ open: true, message: 'No urgent repairs needed.', severity: 'info' });
        return;
      }

      // If HQ is thousands of km away from the reports, start from the first report instead.
      const baseOrigin = hqPoint;

      const waypoints = latestReports.map((report) => ({
        location: { lat: report.location.lat, lng: report.location.lng },
        stopover: true,
      }));

      const service = new google.maps.DirectionsService();
      service.route(
        {
          origin: baseOrigin,
          destination: baseOrigin,
          waypoints,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            setDirections(result);
            setSnackbar({ open: true, message: 'Route optimized for repair crew.', severity: 'success' });
          } else if (status === 'ZERO_RESULTS') {
            setDirections(null);
            setSnackbar({ open: true, message: 'No drivable route between points (distance too far).', severity: 'error' });
          } else {
            console.error('Directions request failed', status);
            setSnackbar({ open: true, message: 'Could not generate route.', severity: 'error' });
          }
          setLoadingRoute(false);
        }
      );
    } catch (error) {
      console.error('Error optimizing route', error);
      setSnackbar({ open: true, message: 'Could not generate route.', severity: 'error' });
      setLoadingRoute(false);
    }
  }, [fetchHighPriorityReports, isLoaded, hqPoint]);

  const handleClearRoute = () => {
    setDirections(null);
    setSnackbar({ open: true, message: 'Route cleared.', severity: 'info' });
  };

  const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  const buildPathFromDirections = useCallback((dir: google.maps.DirectionsResult | null) => {
    if (!dir?.routes?.[0]?.legs) return [] as google.maps.LatLngLiteral[];
    const path: google.maps.LatLngLiteral[] = [];
    dir.routes[0].legs.forEach((leg) => {
      leg.steps?.forEach((step) => {
        step.path?.forEach((pt) => path.push({ lat: pt.lat(), lng: pt.lng() }));
      });
    });
    return path;
  }, []);

  const fitMapToContent = useCallback(() => {
    if (!mapRef.current || !window.google) return;

    const bounds = new google.maps.LatLngBounds();

    bounds.extend(new google.maps.LatLng(hqPoint.lat, hqPoint.lng));

    reports.forEach((report) => {
      bounds.extend(new google.maps.LatLng(report.location.lat, report.location.lng));
    });

    if (directions?.routes?.[0]?.legs) {
      directions.routes[0].legs.forEach((leg) => {
        bounds.extend(leg.start_location);
        bounds.extend(leg.end_location);
      });
    }

    if (bounds.isEmpty()) return;
    mapRef.current.fitBounds(bounds, 64);
  }, [reports, directions, hqPoint]);

  useEffect(() => {
    if (isLoaded) {
      fitMapToContent();
    }
  }, [isLoaded, fitMapToContent]);

  // Animate the route polyline from HQ and back
  useEffect(() => {
    if (!directions) {
      setAnimatedPath([]);
      setAnimProgress(0);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const path = buildPathFromDirections(directions);
    setAnimatedPath(path);
    setAnimProgress(0);

    const durationMs = 2600;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      setAnimProgress(t);
      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [directions, buildPathFromDirections]);

  return (
    <Paper
      sx={{
        p: 3,
        mb: 4,
        borderRadius: 3,
        border: (theme) =>
          theme.palette.mode === 'dark'
            ? '1px solid rgba(124, 143, 240, 0.2)'
            : '1px solid rgba(102, 126, 234, 0.15)',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(124, 143, 240, 0.04) 0%, rgba(176, 140, 245, 0.04) 100%)'
            : 'linear-gradient(135deg, rgba(102, 126, 234, 0.04) 0%, rgba(118, 75, 162, 0.04) 100%)',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 20px 40px rgba(10, 14, 39, 0.5)'
            : '0 20px 40px rgba(15, 23, 42, 0.08)',
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
            🚑 Smart Routing for Repair Crew
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Optimizes the drive sequence for the top 10 pending, high-severity reports.
          </Typography>
          <Box
            sx={{
              mt: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1.25,
              pr: 1.5,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(124, 143, 240, 0.12)'
                  : 'rgba(25, 118, 210, 0.08)',
            }}
          >
            <RoomIcon fontSize="small" color="primary" />
            <Typography variant="caption" color="text.primary" sx={{ fontWeight: 600 }}>
              HQ set to city center; directions start and end here. Waypoints are optimized for shortest drive.
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RouteIcon />}
            onClick={handleOptimizeRoute}
            disabled={loadingRoute || !isLoaded}
          >
            {loadingRoute ? 'Optimizing...' : 'Dispatch Repair Crew (Optimize Route)'}
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ClearIcon />}
            onClick={handleClearRoute}
            disabled={!directions && reports.length === 0}
          >
            Clear Route
          </Button>
        </Stack>
      </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          Fetched {lastFetchCount} high-priority pending/todo reports.
        </Typography>

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load Google Maps. Please check your API key.
        </Alert>
      )}

      {!isLoaded ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: mapContainerStyle.height }}>
          <CircularProgress />
        </Box>
      ) : (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={12}
          onLoad={(map) => {
            mapRef.current = map;
            fitMapToContent();
          }}
          options={{
            streetViewControl: false,
            fullscreenControl: false,
            mapTypeControl: false,
          }}
        >
          {reports.map((report) => (
            <Marker
              key={report.id}
              position={{ lat: report.location.lat, lng: report.location.lng }}
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
              }}
            />
          ))}

          <Marker
            position={hqPoint}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            }}
            label={{ text: 'HQ', fontWeight: 'bold' }}
          />

          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeOpacity: 0.15,
                  strokeColor: '#90caf9',
                  strokeWeight: 6,
                },
              }}
            />
          )}

          {animatedPath.length > 1 && (
            <Polyline
              path={animatedPath.slice(0, Math.max(2, Math.ceil(animatedPath.length * animProgress)))}
              options={{
                strokeColor: '#1e88e5',
                strokeOpacity: 0.9,
                strokeWeight: 6,
                geodesic: true,
              }}
            />
          )}
        </GoogleMap>
      )}

      {reports.length === 0 && isLoaded && !loadingRoute && !loadError && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No urgent repairs needed. If you seeded data, missing status defaults to pending.
        </Alert>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AdminRouteOptimizer;
