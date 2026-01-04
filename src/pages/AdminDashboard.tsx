import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../config/firebaseConfig';
import { collection, query, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import {
  Container,
  Paper,
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AdminRouteOptimizer from '../components/AdminRouteOptimizer';

interface Report {
  id: string;
  imageUrl: string;
  location: { lat: number; lng: number };
  category: string;
  severity: string;
  description: string;
  timestamp: any;
  userId: string;
  status: 'todo' | 'in-progress' | 'done';
}

const AdminDashboard: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<'todo' | 'in-progress' | 'done'>('todo');

  const ADMIN_EMAIL = 'admin@gov.in';
  const ADMIN_PASSWORD = 'CivicLens2024Admin';

  const handleLogin = () => {
    setError('');
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      loadReports();
    } else {
      setError('Invalid admin credentials');
    }
  };

  const loadReports = () => {
    const q = query(collection(db, 'reports'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reportsData: Report[] = [];
      querySnapshot.forEach((docSnap) => {
        reportsData.push({
          id: docSnap.id,
          ...docSnap.data(),
          status: docSnap.data().status || 'todo',
        } as Report);
      });
      // Sort by severity and timestamp
      reportsData.sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        const aSeverity = severityOrder[a.severity.toLowerCase() as keyof typeof severityOrder] || 3;
        const bSeverity = severityOrder[b.severity.toLowerCase() as keyof typeof severityOrder] || 3;
        return aSeverity - bSeverity;
      });
      setReports(reportsData);
    });
    return unsubscribe;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAuthenticated(false);
      setEmail('');
      setPassword('');
      setReports([]);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedReport) return;

    try {
      const reportRef = doc(db, 'reports', selectedReport.id);
      await updateDoc(reportRef, { status: newStatus });
      setStatusDialog(false);
      setSelectedReport(null);
    } catch (error) {
      setError('Failed to update status');
      console.error(error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'error';
      case 'in-progress':
        return 'warning';
      case 'done':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'in-progress':
        return 'In Progress';
      case 'done':
        return 'Resolved ✓';
      default:
        return status;
    }
  };

  if (!authenticated) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1a1f4f 0%, #2a1a4f 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 15s ease infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '200%',
            height: '200%',
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'radial-gradient(circle, rgba(124,143,240,0.05) 1px, transparent 1px)'
                : 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Paper
            elevation={12}
            sx={{
              p: 4,
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(17, 24, 53, 0.95)'
                  : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              border: (theme) =>
                theme.palette.mode === 'dark'
                  ? '1px solid rgba(124, 143, 240, 0.2)'
                  : '1px solid rgba(255, 255, 255, 0.3)',
              animation: 'fadeInUp 0.8s ease-out',
            }}
          >
            <Box
              sx={{
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #7c8ff0 0%, #b08cf5 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 3,
                textAlign: 'center',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                🏛️ Municipal Admin
              </Typography>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  animation: 'slideInRight 0.3s ease-out',
                  borderRadius: 2,
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(239, 83, 80, 0.1)'
                      : 'rgba(244, 67, 54, 0.1)',
                }}
              >
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              placeholder="admin@gov.in"
              sx={{
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: (theme) =>
                      theme.palette.mode === 'dark' ? '#7c8ff0' : '#667eea',
                  },
                  '&.Mui-focused': {
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? '0 0 0 3px rgba(124, 143, 240, 0.2)'
                        : '0 0 0 3px rgba(102, 126, 234, 0.1)',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              sx={{
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: (theme) =>
                      theme.palette.mode === 'dark' ? '#7c8ff0' : '#667eea',
                  },
                  '&.Mui-focused': {
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? '0 0 0 3px rgba(124, 143, 240, 0.2)'
                        : '0 0 0 3px rgba(102, 126, 234, 0.1)',
                  },
                },
              }}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              onClick={handleLogin}
              sx={{
                mt: 3,
                mb: 2,
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #7c8ff0 0%, #b08cf5 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontWeight: 700,
                py: 1.5,
                fontSize: '1rem',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 15px 40px rgba(124, 143, 240, 0.4)'
                      : '0 15px 40px rgba(102, 126, 234, 0.4)',
                },
              }}
            >
              Login as Admin
            </Button>

            <Alert
              severity="info"
              sx={{
                borderRadius: 2,
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(124, 143, 240, 0.08)'
                    : 'rgba(25, 118, 210, 0.08)',
                border: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '1px solid rgba(124, 143, 240, 0.2)'
                    : '1px solid rgba(25, 118, 210, 0.2)',
              }}
            >
              <strong>Demo Credentials:</strong>
              <br />
              Email: admin@gov.in
              <br />
              Password: CivicLens2024Admin
            </Alert>
          </Paper>
        </Container>
      </Box>
    );
  }

  const todoReports = reports.filter((r) => r.status === 'todo');
  const inProgressReports = reports.filter((r) => r.status === 'in-progress');
  const doneReports = reports.filter((r) => r.status === 'done');

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
      <Container maxWidth="xl" sx={{ animation: 'fadeInUp 0.8s ease-out' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
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
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              🏛️ Civic Issues Management Dashboard
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            color="error"
            sx={{
              fontWeight: 700,
              py: 1.2,
              px: 2,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 25px rgba(244, 67, 54, 0.3)',
              },
            }}
          >
            Logout
          </Button>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              animation: 'slideInRight 0.3s ease-out',
              borderRadius: 2,
            }}
          />
        )}

        <AdminRouteOptimizer />

        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(239, 83, 80, 0.1) 0%, rgba(229, 57, 53, 0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(229, 57, 53, 0.1) 100%)',
                border: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '1px solid rgba(239, 83, 80, 0.2)'
                    : '1px solid rgba(244, 67, 54, 0.2)',
                borderRadius: 2.5,
                animation: 'fadeInUp 0.6s ease-out',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 15px 40px rgba(239, 83, 80, 0.2)'
                      : '0 15px 40px rgba(244, 67, 54, 0.2)',
                },
              }}
            >
              <Typography variant="h4" color="error" sx={{ fontWeight: 700, mb: 1 }}>
                {todoReports.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                New Reports
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 112, 67, 0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 112, 67, 0.1) 100%)',
                border: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '1px solid rgba(255, 152, 0, 0.2)'
                    : '1px solid rgba(255, 152, 0, 0.2)',
                borderRadius: 2.5,
                animation: 'fadeInUp 0.7s ease-out',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 15px 40px rgba(255, 152, 0, 0.2)'
                      : '0 15px 40px rgba(255, 152, 0, 0.2)',
                },
              }}
            >
              <Typography variant="h4" sx={{ color: '#f57c00', fontWeight: 700, mb: 1 }}>
                {inProgressReports.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                In Progress
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(56, 142, 60, 0.1) 100%)',
                border: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '1px solid rgba(76, 175, 80, 0.2)'
                    : '1px solid rgba(76, 175, 80, 0.2)',
                borderRadius: 2.5,
                animation: 'fadeInUp 0.8s ease-out',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 15px 40px rgba(76, 175, 80, 0.2)'
                      : '0 15px 40px rgba(76, 175, 80, 0.2)',
                },
              }}
            >
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 700, mb: 1 }}>
                {doneReports.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Resolved
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(66, 165, 245, 0.1) 0%, rgba(33, 150, 243, 0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(33, 150, 243, 0.1) 100%)',
                border: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '1px solid rgba(66, 165, 245, 0.2)'
                    : '1px solid rgba(25, 118, 210, 0.2)',
                borderRadius: 2.5,
                animation: 'fadeInUp 0.9s ease-out',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 15px 40px rgba(66, 165, 245, 0.2)'
                      : '0 15px 40px rgba(25, 118, 210, 0.2)',
                },
              }}
            >
              <Typography variant="h4" color="primary" sx={{ fontWeight: 700, mb: 1 }}>
                {reports.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                Total Issues
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Kanban Board */}
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* To Do Column */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              sx={{
                p: 2,
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(239, 83, 80, 0.05) 0%, rgba(229, 57, 53, 0.03) 100%)'
                    : 'linear-gradient(135deg, rgba(244, 67, 54, 0.05) 0%, rgba(229, 57, 53, 0.05) 100%)',
                border: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '1px solid rgba(239, 83, 80, 0.2)'
                    : '1px solid rgba(244, 67, 54, 0.2)',
                minHeight: 600,
                borderRadius: 2.5,
                animation: 'fadeInUp 0.8s ease-out',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  color: '#d32f2f',
                  fontSize: '1.1rem',
                  letterSpacing: 0.5,
                }}
              >
                📋 To Do ({todoReports.length})
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {todoReports.map((report) => (
                  <Card
                    key={report.id}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 2,
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      border: (theme) =>
                        theme.palette.mode === 'dark'
                          ? '1px solid rgba(239, 83, 80, 0.2)'
                          : '1px solid rgba(244, 67, 54, 0.2)',
                      '&:hover': {
                        boxShadow: (theme) =>
                          theme.palette.mode === 'dark'
                            ? '0 12px 30px rgba(239, 83, 80, 0.3)'
                            : '0 12px 30px rgba(244, 67, 54, 0.3)',
                        transform: 'translateY(-4px)',
                      },
                    }}
                    onClick={() => {
                      setSelectedReport(report);
                      setNewStatus('in-progress');
                      setStatusDialog(true);
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="120"
                      image={report.imageUrl}
                      alt={report.category}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                        <Chip
                          label={report.severity}
                          color={getSeverityColor(report.severity) as any}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                        <Chip label={report.category} size="small" variant="outlined" />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {report.description.substring(0, 60)}...
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
                {todoReports.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No new reports
                </Typography>
              )}
            </Box>
            </Paper>
          </Grid>

          {/* In Progress Column */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              sx={{
                p: 2,
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(255, 112, 67, 0.03) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(255, 112, 67, 0.05) 100%)',
                border: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '1px solid rgba(255, 152, 0, 0.2)'
                    : '1px solid rgba(255, 152, 0, 0.2)',
                minHeight: 600,
                borderRadius: 2.5,
                animation: 'fadeInUp 0.9s ease-out',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  color: '#f57c00',
                  fontSize: '1.1rem',
                  letterSpacing: 0.5,
                }}
              >
                🔧 In Progress ({inProgressReports.length})
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {inProgressReports.map((report) => (
                  <Card
                    key={report.id}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 2,
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      border: (theme) =>
                        theme.palette.mode === 'dark'
                          ? '1px solid rgba(255, 152, 0, 0.2)'
                          : '1px solid rgba(255, 152, 0, 0.2)',
                      '&:hover': {
                        boxShadow: (theme) =>
                          theme.palette.mode === 'dark'
                            ? '0 12px 30px rgba(255, 152, 0, 0.3)'
                            : '0 12px 30px rgba(255, 152, 0, 0.3)',
                        transform: 'translateY(-4px)',
                      },
                    }}
                    onClick={() => {
                      setSelectedReport(report);
                      setNewStatus('done');
                      setStatusDialog(true);
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="120"
                      image={report.imageUrl}
                      alt={report.category}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                        <Chip
                          label={report.severity}
                          color={getSeverityColor(report.severity) as any}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                        <Chip label={report.category} size="small" variant="outlined" />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {report.description.substring(0, 60)}...
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
                {inProgressReports.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No issues in progress
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Done Column */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              sx={{
                p: 2,
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(56, 142, 60, 0.03) 100%)'
                    : 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(56, 142, 60, 0.05) 100%)',
                border: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '1px solid rgba(76, 175, 80, 0.2)'
                    : '1px solid rgba(76, 175, 80, 0.2)',
                minHeight: 600,
                borderRadius: 2.5,
                animation: 'fadeInUp 1s ease-out',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  color: '#388e3c',
                  fontSize: '1.1rem',
                  letterSpacing: 0.5,
                }}
              >
                ✅ Resolved ({doneReports.length})
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {doneReports.map((report) => (
                  <Card
                    key={report.id}
                    sx={{
                      opacity: 0.85,
                      borderRadius: 2,
                      border: (theme) =>
                        theme.palette.mode === 'dark'
                          ? '1px solid rgba(76, 175, 80, 0.2)'
                          : '1px solid rgba(76, 175, 80, 0.2)',
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="120"
                      image={report.imageUrl}
                      alt={report.category}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                        <Chip
                          label={report.severity}
                          color={getSeverityColor(report.severity) as any}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                        <Chip label={report.category} size="small" variant="outlined" />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        <Typography variant="caption" color="text.secondary">
                          Resolved
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
                {doneReports.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No resolved issues yet
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Status Update Dialog */}
        <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Issue Status</DialogTitle>
          <DialogContent>
            {selectedReport && (
              <Box sx={{ py: 2 }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={selectedReport.imageUrl}
                  alt={selectedReport.category}
                  sx={{ objectFit: 'cover', mb: 2, borderRadius: 1 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <strong>{selectedReport.category}</strong> - {selectedReport.description}
                </Typography>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Change status to:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {(['todo', 'in-progress', 'done'] as const).map((status) => (
                    <Chip
                      key={status}
                      label={getStatusLabel(status)}
                      color={getStatusColor(status) as any}
                      onClick={() => setNewStatus(status)}
                      variant={newStatus === status ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
            <Button
              onClick={handleStatusChange}
              variant="contained"
              color="primary"
            >
              Update Status
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
