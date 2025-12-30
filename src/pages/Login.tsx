import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Alert,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const Login: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError('');
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #0a0e27 0%, #1a1f4f 50%, #2a1a4f 100%)'
            : 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite',
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
              ? 'radial-gradient(circle, rgba(124, 143, 240, 0.08) 1px, transparent 1px)'
              : 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'none',
        }}
      />
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Paper
            elevation={12}
            sx={{
              p: 5,
              width: '100%',
              textAlign: 'center',
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(17, 24, 53, 0.95)'
                  : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              animation: 'fadeInUp 0.8s ease-out',
              borderRadius: 3,
              border: (theme) =>
                theme.palette.mode === 'dark'
                  ? '1px solid rgba(124, 143, 240, 0.2)'
                  : '1px solid rgba(255, 255, 255, 0.3)',
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
                mb: 2,
              }}
            >
              <Typography variant="h3" component="h1" sx={{ fontWeight: 800, fontSize: '3rem' }}>
                CivicLens
              </Typography>
            </Box>
            <Typography
              variant="h6"
              sx={{
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #7c8ff0 0%, #ff6b9d 100%)'
                    : 'linear-gradient(135deg, #1976d2 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 600,
                mb: 2,
              }}
            >
              Report Civic Issues with AI
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: 2, mb: 4, lineHeight: 1.7, fontSize: '1.05rem' }}
            >
              Help improve your community by reporting civic issues. Our AI analyzes your
              photos and maps them for everyone to see.
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
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

            <Button
              variant="contained"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleSignIn}
              disabled={isLoading}
              fullWidth
              sx={{
                mt: 3,
                mb: 2,
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #7c8ff0 0%, #b08cf5 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontWeight: 700,
                py: 1.8,
                fontSize: '1.1rem',
                textTransform: 'uppercase',
                letterSpacing: 1,
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                color: '#fff',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 20px 40px rgba(124, 143, 240, 0.4)'
                      : '0 20px 40px rgba(102, 126, 234, 0.4)',
                },
                '&:active': {
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign in with Google'}
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Secure authentication powered by Google
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
