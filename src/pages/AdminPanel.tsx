import React from 'react';
import { Box, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="warning">Please sign in to access admin features</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 4,
        maxWidth: 400,
      }}
    >
      <h2>Admin Panel</h2>

      <Alert severity="info">
        Welcome to the admin panel.
      </Alert>
    </Box>
  );
};

export default AdminPanel;
