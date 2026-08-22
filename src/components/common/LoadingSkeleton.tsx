import React from 'react';
import { Box, Skeleton } from '@mui/material';

export const LoadingSkeleton: React.FC<{ type?: 'courses' | 'dashboard' | 'player' }> = ({
  type = 'courses',
}) => {
  if (type === 'courses') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Box
            key={i}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Skeleton variant="rounded" height={180} sx={{ borderRadius: 2, mb: 2 }} />
            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="90%" height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="70%" height={20} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton variant="rounded" width={100} height={36} sx={{ borderRadius: 2 }} />
            </Box>
          </Box>
        ))}
      </div>
    );
  }

  if (type === 'dashboard') {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={100} sx={{ borderRadius: 3 }} />
          ))}
        </div>
        <Skeleton variant="rounded" height={260} sx={{ borderRadius: 3 }} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: 3 }} className="lg:col-span-2" />
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: 3 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full p-4 gap-4">
      <Skeleton variant="rounded" width="30%" height="100%" sx={{ borderRadius: 3 }} />
      <Skeleton variant="rounded" width="70%" height="100%" sx={{ borderRadius: 3 }} />
    </div>
  );
};
