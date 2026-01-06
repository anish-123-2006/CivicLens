import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { getUpvoteCount } from '../services/upvoteService';
import {
  Container,
  Paper,
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Chip,
  CircularProgress,
  Button,
  Divider,
  Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface Report {
  id: string;
  imageUrl: string;
  location: { lat: number; lng: number };
  category: string;
  severity: string;
  description: string;
  timestamp: any;
  userId: string;
  upvotes?: string[];
  status?: string;
}

const MyReports: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Query reports for current user
    const q = query(
      collection(db, 'reports'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reportsData: Report[] = [];
      querySnapshot.forEach((doc) => {
        reportsData.push({ id: doc.id, ...doc.data() } as Report);
      });
      setReports(reportsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, navigate]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'success';
      case 'in-progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'done':
        return 'Resolved ✓';
      case 'in-progress':
        return 'In Progress';
      case 'todo':
        return 'Pending';
      default:
        return 'Pending';
    }
  };

  // Calculate statistics
  const totalReports = reports.length;
  const highSeverity = reports.filter((r) => r.severity.toLowerCase() === 'high').length;
  const resolvedReports = reports.filter((r) => r.status === 'done').length;
  const totalUpvotes = reports.reduce((sum, r) => sum + getUpvoteCount(r), 0);

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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0a0e27 0%, #1a1f4f 100%)'
            : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="lg" sx={{ animation: 'fadeInUp 0.8s ease-out' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{
              mb: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateX(-5px)',
              },
            }}
          >
            Back to Map
          </Button>
          <Box
            sx={{
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, #7c8ff0 0%, #b08cf5 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
              My Reports 📋
            </Typography>
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem' }}>
            Track all the civic issues you've reported
          </Typography>
        </Box>

        {/* Empty State */}
        {reports.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(124, 143, 240, 0.05)'
                  : 'rgba(102, 126, 234, 0.05)',
              border: (theme) =>
                theme.palette.mode === 'dark'
                  ? '2px dashed rgba(124, 143, 240, 0.3)'
                  : '2px dashed rgba(102, 126, 234, 0.3)',
              borderRadius: 3,
              animation: 'fadeInUp 0.6s ease-out',
            }}
          >
            <ReportProblemOutlinedIcon
              sx={{
                fontSize: 80,
                color: 'primary.main',
                opacity: 0.6,
                mb: 2,
              }}
            />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
              No Reports Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
              You haven't reported any civic issues yet. Start making a difference in your community by reporting your first issue!
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddCircleOutlineIcon />}
              onClick={() => navigate('/report')}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                fontWeight: 700,
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #7c8ff0 0%, #b08cf5 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 8px 25px rgba(124, 143, 240, 0.4)'
                      : '0 8px 25px rgba(102, 126, 234, 0.4)',
                },
              }}
            >
              Report Your First Issue
            </Button>
          </Paper>
        ) : (
          <>
            {/* Statistics Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(124, 143, 240, 0.1) 0%, rgba(176, 140, 245, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(66, 133, 244, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)',
                border: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '1px solid rgba(124, 143, 240, 0.2)'
                    : '1px solid rgba(102, 126, 234, 0.2)',
                borderRadius: 2.5,
                animation: 'fadeInUp 0.6s ease-out',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 15px 40px rgba(124, 143, 240, 0.2)'
                      : '0 15px 40px rgba(102, 126, 234, 0.2)',
                },
              }}
            >
              <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                {totalReports}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Reports
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(229, 57, 53, 0.1) 100%)',
                border: '1px solid rgba(244, 67, 54, 0.2)',
                borderRadius: 2.5,
                animation: 'fadeInUp 0.7s ease-out',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 15px 40px rgba(244, 67, 54, 0.2)',
                },
              }}
            >
              <Typography variant="h3" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                {highSeverity}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                High Priority
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.1) 100%)',
                border: '1px solid rgba(76, 175, 80, 0.2)',
                borderRadius: 2.5,
                animation: 'fadeInUp 0.8s ease-out',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 15px 40px rgba(76, 175, 80, 0.2)',
                },
              }}
            >
              <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold' }}>
                {resolvedReports}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Resolved
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 112, 67, 0.1) 100%)',
                border: '1px solid rgba(255, 152, 0, 0.2)',
                borderRadius: 2.5,
                animation: 'fadeInUp 0.9s ease-out',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 15px 40px rgba(255, 152, 0, 0.2)',
                },
              }}
            >
              <Typography variant="h3" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                {totalUpvotes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Upvotes
              </Typography>
            </Paper>
          </Grid>
        </Grid>

            <Divider sx={{ mb: 3 }} />

            {/* Reports List */}
            <Grid container spacing={3}>
              {reports.map((report) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={report.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={report.imageUrl}
                  alt={report.category}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Chips */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={report.severity}
                      color={getSeverityColor(report.severity) as any}
                      size="small"
                    />
                    <Chip label={report.category} size="small" variant="outlined" />
                    {report.status && (
                      <Chip
                        label={getStatusLabel(report.status)}
                        color={getStatusColor(report.status) as any}
                        size="small"
                      />
                    )}
                  </Box>

                  {/* Description */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {report.description.length > 100
                      ? `${report.description.substring(0, 100)}...`
                      : report.description}
                  </Typography>

                  {/* Metadata */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ThumbUpIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                      <Typography variant="caption" color="text.secondary">
                        {getUpvoteCount(report)} upvotes
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Date */}
                  <Typography variant="caption" color="text.secondary">
                    Reported: {report.timestamp?.toDate().toLocaleDateString()} at{' '}
                    {report.timestamp?.toDate().toLocaleTimeString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
              ))}
            </Grid>
          </>
        )}

      {/* Bottom Action */}
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/report')}
          sx={{
            fontWeight: 700,
            py: 1.5,
            px: 4,
            fontSize: '1rem',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: '0 15px 40px rgba(102, 126, 234, 0.4)',
            },
          }}
        >
          Report New Issue
        </Button>
      </Box>
      </Container>
    </Box>
  );
};

export default MyReports;
