import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { analyzeImage, CivicIssue } from '../services/geminiService';
import { compressAndConvertToBase64 } from '../utils/imageUtils';
import { VoiceReportService } from '../services/voiceService';
import { ScanningAnimation } from '../components/SkeletonLoaders';
import {
  Container,
  Paper,
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  Chip,
  IconButton,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';

const ReportComponent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const voiceServiceRef = useRef<VoiceReportService | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');

  const [issueData, setIssueData] = useState<CivicIssue | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize voice service
  React.useEffect(() => {
    try {
      voiceServiceRef.current = new VoiceReportService();
    } catch (error) {
      console.warn('Voice recognition not supported:', error);
    }
  }, []);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
    setIssueData(null);

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setError('Unable to get your location. Please enable location services.');
          console.error('Location error:', error);
        }
      );
    }

    // Analyze with Gemini
    setAnalyzing(true);
    try {
      const analysis = await analyzeImage(file);
      if (analysis) {
        setIssueData(analysis);
      } else {
        setError('This image does not appear to show a civic issue. Please try another image.');
        setSelectedFile(null);
        setPreviewUrl('');
      }
    } catch (error) {
      setError('Failed to analyze image. Please try again.');
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleVoiceInput = async () => {
    if (!voiceServiceRef.current) {
      setError('Voice recognition not supported in your browser');
      return;
    }

    if (isListening) {
      const transcript = voiceServiceRef.current.stopListening();
      setVoiceTranscript(transcript);
      setIsListening(false);
    } else {
      try {
        setIsListening(true);
        setError('');
        setVoiceTranscript('');

        await voiceServiceRef.current.startListening((result) => {
          setVoiceTranscript(result.text);
        });
      } catch (error) {
        setError('Voice input failed. Please try again.');
        console.error(error);
        setIsListening(false);
      }
    }
  };

  const useVoiceAsDescription = () => {
    if (issueData && voiceTranscript) {
      const updatedIssueData = {
        ...issueData,
        description: voiceTranscript,
      };
      setIssueData(updatedIssueData);
      setVoiceTranscript('');
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !issueData || !location || !user) {
      setError('Please complete all fields before submitting.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Compress and convert image to base64
      const imageUrl = await compressAndConvertToBase64(selectedFile);

      // Save report to Firestore with base64 image
      const docRef = await addDoc(collection(db, 'reports'), {
        imageUrl,
        location,
        category: issueData.type,
        severity: issueData.severity,
        description: issueData.description,
        timestamp: serverTimestamp(),
        userId: user.uid,
        upvotes: [],
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/success', {
          state: {
            report: {
              id: docRef.id,
              imageUrl,
              location,
              category: issueData.type,
              severity: issueData.severity,
              description: issueData.description,
            },
          },
        });
      }, 1500);
    } catch (error) {
      setError('Failed to submit report. Please try again.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setIssueData(null);
    setError('');
    setLocation(null);
  };

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
      <Container maxWidth="md">
        <Box sx={{ animation: 'fadeInUp 0.8s ease-out' }}>
          <Paper
            elevation={8}
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
                  ? '1px solid rgba(124, 143, 240, 0.15)'
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
                mb: 1,
              }}
            >
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 800 }}>
                📸 Report a Civic Issue
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: '1.05rem' }}>
              Capture or upload a photo of a civic issue, and our AI will analyze it automatically.
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  animation: 'slideInRight 0.3s ease-out',
                  borderRadius: 2,
                }}
              >
                {error}
              </Alert>
            )}

            {success && (
              <Alert
                severity="success"
                sx={{
                  mb: 2,
                  animation: 'slideInRight 0.3s ease-out',
                  borderRadius: 2,
                }}
              >
                Report submitted successfully! Redirecting to map...
              </Alert>
            )}

            {!selectedFile && (
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Button
                  variant="contained"
                  startIcon={<CameraAltIcon />}
                  onClick={() => cameraInputRef.current?.click()}
                  fullWidth
                  size="large"
                  sx={{
                    background: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, #7c8ff0 0%, #b08cf5 100%)'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    fontWeight: 700,
                    py: 1.8,
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    color: '#fff',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: (theme) =>
                        theme.palette.mode === 'dark'
                          ? '0 15px 35px rgba(124, 143, 240, 0.4)'
                          : '0 15px 35px rgba(102, 126, 234, 0.4)',
                    },
                  }}
                >
                  Take Photo
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PhotoLibraryIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  fullWidth
                  size="large"
                  sx={{
                    borderColor: (theme) =>
                      theme.palette.mode === 'dark' ? '#7c8ff0' : '#667eea',
                    color: (theme) =>
                      theme.palette.mode === 'dark' ? '#7c8ff0' : '#667eea',
                    fontWeight: 700,
                    py: 1.8,
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(124, 143, 240, 0.08)'
                          : 'rgba(102, 126, 234, 0.05)',
                      borderColor: (theme) =>
                        theme.palette.mode === 'dark' ? '#b08cf5' : '#764ba2',
                      color: (theme) =>
                        theme.palette.mode === 'dark' ? '#b08cf5' : '#764ba2',
                      transform: 'translateY(-3px)',
                    },
                  }}
                >
                  Upload Photo
                </Button>
              </Box>
            )}

        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCameraCapture}
          style={{ display: 'none' }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        {previewUrl && (
          <Card
            sx={{
              mt: 3,
              position: 'relative',
              animation: 'fadeInUp 0.5s ease-out',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            }}
          >
            <IconButton
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(4px)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 1)',
                  transform: 'rotate(90deg)',
                },
              }}
              onClick={handleClear}
              disabled={uploading}
            >
              <CloseIcon />
            </IconButton>
            <CardMedia
              component="img"
              image={previewUrl}
              alt="Preview"
              sx={{
                maxHeight: 400,
                objectFit: 'contain',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            />
          </Card>
        )}

        {analyzing && (
          <Box sx={{ mt: 3, animation: 'fadeInUp 0.5s ease-out' }}>
            <ScanningAnimation />
          </Box>
        )}

        {issueData && !analyzing && (
          <Box
            sx={{
              mt: 3,
              animation: 'fadeInUp 0.5s ease-out',
              p: 3,
              background: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(124, 143, 240, 0.1) 0%, rgba(176, 140, 245, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
              borderRadius: 2,
              border: (theme) =>
                theme.palette.mode === 'dark'
                  ? '1px solid rgba(124, 143, 240, 0.25)'
                  : '1px solid rgba(102, 126, 234, 0.2)',
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #7c8ff0 0%, #b08cf5 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              🤖 AI Analysis Results
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip
                label={issueData.severity}
                color={
                  issueData.severity === 'High'
                    ? 'error'
                    : issueData.severity === 'Medium'
                    ? 'warning'
                    : 'info'
                }
              />
              <Chip label={issueData.type} variant="outlined" />
            </Box>

            {/* Voice Input Section */}
            {voiceServiceRef.current && (
              <Box
                sx={{
                  mb: 2,
                  p: 2.5,
                  background: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(22, 27, 53, 0.9)'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(240, 240, 240, 0.8) 100%)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 1.5,
                  border: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '1px solid rgba(124, 143, 240, 0.2)'
                      : '1px solid rgba(102, 126, 234, 0.15)',
                }}
              >
                <Button
                  variant={isListening ? 'contained' : 'outlined'}
                  color={isListening ? 'error' : 'primary'}
                  startIcon={isListening ? <StopIcon /> : <MicIcon />}
                  onClick={handleVoiceInput}
                  fullWidth
                  sx={{
                    mb: 1,
                    fontWeight: 700,
                    py: 1.3,
                    animation: isListening ? 'pulse 1.5s infinite' : 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {isListening ? 'Stop Recording' : '🎤 Record Voice Description'}
                </Button>
                {voiceTranscript && (
                  <Box sx={{ mt: 1, animation: 'fadeInUp 0.3s ease-out' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Transcribed: {voiceTranscript}
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={useVoiceAsDescription}
                      sx={{
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(76, 175, 80, 0.3)',
                        },
                      }}
                    >
                      Use as Description
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            <TextField
              fullWidth
              label="Description"
              value={issueData.description}
              onChange={(e) =>
                setIssueData({ ...issueData, description: e.target.value })
              }
              multiline
              rows={3}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              label="Category"
              value={issueData.type}
              onChange={(e) => setIssueData({ ...issueData, type: e.target.value })}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                  },
                },
              }}
            />
            <TextField
              fullWidth
              select
              label="Severity"
              value={issueData.severity}
              onChange={(e) =>
                setIssueData({
                  ...issueData,
                  severity: e.target.value as 'High' | 'Medium' | 'Low',
                })
              }
              SelectProps={{
                native: true,
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#667eea',
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                  },
                },
              }}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </TextField>

            {location && (
              <Alert
                severity="info"
                sx={{
                  mb: 2,
                  animation: 'slideInRight 0.3s ease-out',
                  borderRadius: 1.5,
                }}
              >
                📍 Location captured: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </Alert>
            )}

            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              onClick={handleSubmit}
              disabled={uploading || !location}
              sx={{
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #7c8ff0 0%, #b08cf5 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontWeight: 700,
                py: 1.8,
                fontSize: '1.1rem',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                color: '#fff',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                '&:hover:not(:disabled)': {
                  transform: 'translateY(-3px)',
                  boxShadow: (theme) =>
                    theme.palette.mode === 'dark'
                      ? '0 15px 40px rgba(124, 143, 240, 0.4)'
                      : '0 15px 40px rgba(102, 126, 234, 0.4)',
                },
                '&:active:not(:disabled)': {
                  transform: 'translateY(-1px)',
                },
              }}
            >
              {uploading ? 'Submitting...' : '✅ Submit Report'}
            </Button>
          </Box>
        )}
        </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default ReportComponent;
