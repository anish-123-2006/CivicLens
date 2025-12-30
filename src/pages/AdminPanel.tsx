import React from 'react';
import { Box, Button, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { seedSampleReports } from '../utils/seedData';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSeedData = async () => {
    if (!user) {
      setError('Please sign in first');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await seedSampleReports(user.uid);
      setMessage(`✅ Successfully added ${result.count} sample reports!`);
    } catch (err) {
      setError('Failed to seed data. Check console for details.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      <h2>Admin Panel - Sample Data</h2>

      {error && <Alert severity="error">{error}</Alert>}
      {message && <Alert severity="success">{message}</Alert>}

      <Button
        variant="contained"
        color="primary"
        onClick={handleSeedData}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        {loading ? 'Seeding 30 Reports...' : 'Seed 30 Sample Reports'}
      </Button>

      <Alert severity="info">
        This will add 30 sample civic issue reports to your database for hackathon demo.
        Reports will have varied locations, categories, and severity levels.
      </Alert>
    </Box>
  );
};

export default AdminPanel;
