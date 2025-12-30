import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';
import { keyframes } from '@mui/system';

// Scanning animation
const scanAnimation = keyframes`
  0% {
    top: 0;
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
`;

export const ImageSkeleton: React.FC = () => (
  <Stack spacing={1}>
    <Skeleton variant="rectangular" height={300} />
    <Skeleton variant="text" />
    <Skeleton variant="text" width="80%" />
    <Skeleton variant="rectangular" height={60} />
  </Stack>
);

export const AnalysisSkeleton: React.FC = () => (
  <Stack spacing={2}>
    <Skeleton variant="rectangular" height={100} />
    <Skeleton variant="text" />
    <Skeleton variant="text" width="90%" />
    <Skeleton variant="rectangular" height={150} />
  </Stack>
);

export const ScanningAnimation: React.FC = () => (
  <Box
    sx={{
      position: 'relative',
      width: '100%',
      height: 300,
      bgcolor: '#f5f5f5',
      borderRadius: 2,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      mb: 2,
    }}
  >
    {/* Scanning line */}
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 3,
        background: 'linear-gradient(90deg, transparent, #1976d2, transparent)',
        animation: `${scanAnimation} 2s infinite`,
      }}
    />

    {/* Grid pattern background */}
    <Box
      sx={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundImage:
          'linear-gradient(0deg, transparent 24%, rgba(25, 118, 210, 0.1) 25%, rgba(25, 118, 210, 0.1) 26%, transparent 27%, transparent 74%, rgba(25, 118, 210, 0.1) 75%, rgba(25, 118, 210, 0.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(25, 118, 210, 0.1) 25%, rgba(25, 118, 210, 0.1) 26%, transparent 27%, transparent 74%, rgba(25, 118, 210, 0.1) 75%, rgba(25, 118, 210, 0.1) 76%, transparent 77%, transparent)',
        backgroundSize: '50px 50px',
      }}
    />

    {/* Center text */}
    <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
      <div
        style={{
          fontSize: 48,
          marginBottom: 16,
          animation: `${scanAnimation} 2s infinite`,
        }}
      >
        🔍
      </div>
      <p
        style={{
          margin: 0,
          color: '#1976d2',
          fontWeight: 'bold',
          fontSize: 16,
        }}
      >
        Analyzing image with AI...
      </p>
      <p
        style={{
          margin: '8px 0 0 0',
          color: '#999',
          fontSize: 12,
        }}
      >
        Detecting civic issues
      </p>
    </Box>
  </Box>
);

export const LoadingPulse: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      py: 4,
    }}
  >
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: '4px solid #f0f0f0',
        borderTop: '4px solid #1976d2',
        animation: 'spin 1s linear infinite',
        '@keyframes spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      }}
    />
    <p style={{ margin: 0, color: '#999' }}>{text}</p>
  </Box>
);

export const MapSkeleton: React.FC = () => (
  <Skeleton
    variant="rectangular"
    height="100vh"
    sx={{
      backgroundColor: '#e0e0e0',
    }}
  />
);
