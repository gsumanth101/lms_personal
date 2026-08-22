import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something Went Wrong',
  message,
  onRetry,
}) => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        py: 8,
        px: 4,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          p: 2.5,
          mb: 2.5,
          borderRadius: '50%',
          bgcolor: 'error.container',
          color: 'error.main',
        }}
      >
        <AlertTriangle className="w-10 h-10" />
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mb: 3 }}>
        {message}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2 }}>
        {onRetry && (
          <Button variant="contained" color="primary" startIcon={<RefreshCw className="w-4 h-4" />} onClick={onRetry}>
            Try Again
          </Button>
        )}
        <Button variant="outlined" startIcon={<Home className="w-4 h-4" />} onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    </Box>
  );
};
