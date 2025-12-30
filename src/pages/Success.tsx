import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Alert,
  Grid,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmailIcon from '@mui/icons-material/Email';
import ShareIcon from '@mui/icons-material/Share';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  generateTwitterShare,
  generateEmailShare,
  generateWhatsAppShare,
  getAddressFromCoordinates,
  ShareOptions,
} from '../services/shareService';

interface SubmittedReport {
  id: string;
  imageUrl: string;
  location: { lat: number; lng: number };
  category: string;
  severity: string;
  description: string;
}

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [report, setReport] = useState<SubmittedReport | null>(null);
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    const state = location.state as { report: SubmittedReport } | null;
    if (state?.report) {
      setReport(state.report);
      // Get address from coordinates
      if (state.report.location) {
        getAddressFromCoordinates(
          state.report.location.lat,
          state.report.location.lng,
          import.meta.env.VITE_GOOGLE_MAPS_KEY
        )
          .then(setAddress);
      }
    } else {
      // Redirect to home if no report data
      navigate('/');
    }
  }, [location, navigate]);

  if (!report) {
    return null;
  }

  const shareOptions: ShareOptions = {
    issueType: report.category,
    severity: report.severity,
    description: report.description,
    address: address || `${report.location.lat.toFixed(4)}, ${report.location.lng.toFixed(4)}`,
    lat: report.location.lat,
    lng: report.location.lng,
  };

  const handleShare = (type: 'twitter' | 'email' | 'whatsapp') => {
    let url = '';
    switch (type) {
      case 'twitter':
        url = generateTwitterShare(shareOptions);
        break;
      case 'email':
        url = generateEmailShare(shareOptions);
        break;
      case 'whatsapp':
        url = generateWhatsAppShare(shareOptions);
        break;
    }
    window.open(url, '_blank');
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

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      {/* Success Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Report Submitted Successfully! ✅
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Your civic issue has been logged and is now visible to the community on our map.
        </Typography>
      </Box>

      {/* Report Details */}
      <Card sx={{ mb: 4, boxShadow: 3 }}>
        <CardMedia
          component="img"
          height="250"
          image={report.imageUrl}
          alt={report.category}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip
              label={report.severity}
              color={getSeverityColor(report.severity) as any}
              size="small"
            />
            <Chip label={report.category} size="small" variant="outlined" />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {report.description}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            <strong>Location:</strong> {address || 'Loading...'}
          </Typography>
        </CardContent>
      </Card>

      {/* Share Section */}
      {report.severity === 'High' && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          <strong>High Priority Issue Detected!</strong> Consider sharing this with your municipal
          corporation or local government using the options below to expedite resolution.
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          🚨 Help Close the Loop - Share This Issue:
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<TwitterIcon />}
              onClick={() => handleShare('twitter')}
              sx={{
                background: 'linear-gradient(135deg, #1DA1F2 0%, #1a8cd8 100%)',
                textTransform: 'none',
                fontWeight: 'bold',
              }}
            >
              Tweet to Municipal Corp
            </Button>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<EmailIcon />}
              onClick={() => handleShare('email')}
              sx={{
                background: 'linear-gradient(135deg, #EA4335 0%, #c5221f 100%)',
                textTransform: 'none',
                fontWeight: 'bold',
              }}
            >
              Email to Government
            </Button>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ShareIcon />}
              onClick={() => handleShare('whatsapp')}
              sx={{
                textTransform: 'none',
                fontWeight: 'bold',
                borderColor: '#25D366',
                color: '#25D366',
              }}
            >
              Share on WhatsApp
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Bottom Actions */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
        >
          Back to Map
        </Button>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => navigate('/report')}
        >
          Report Another Issue
        </Button>
      </Box>

      {/* Info Box */}
      <Box sx={{ mt: 4, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>💡 Tip:</strong> Sharing your report helps increase community awareness and puts
          pressure on authorities to take action. The more people who report the same issue, the
          higher the priority!
        </Typography>
      </Box>
    </Container>
  );
};

export default SuccessPage;
