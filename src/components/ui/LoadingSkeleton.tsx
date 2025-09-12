'use client';

import { Box, Skeleton, Card, CardContent } from '@mui/material';

interface LoadingSkeletonProps {
  variant?: 'dashboard' | 'list' | 'form' | 'table';
  count?: number;
}

export function LoadingSkeleton({ variant = 'dashboard', count = 1 }: LoadingSkeletonProps) {
  const renderDashboardSkeleton = () => (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
      
      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" height={32} sx={{ my: 1 }} />
              <Skeleton variant="text" width="30%" />
            </CardContent>
          </Card>
        ))}
      </Box>
      
      {/* Chart area */}
      <Card>
        <CardContent>
          <Skeleton variant="text" width="30%" sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={300} />
        </CardContent>
      </Card>
    </Box>
  );

  const renderListSkeleton = () => (
    <Box sx={{ p: 3 }}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} sx={{ mb: 2 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </Box>
            <Skeleton variant="text" width="20%" />
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  const renderFormSkeleton = () => (
    <Card sx={{ p: 3 }}>
      <CardContent>
        <Skeleton variant="text" width="40%" height={32} sx={{ mb: 3 }} />
        {Array.from({ length: count || 5 }).map((_, index) => (
          <Box key={index} sx={{ mb: 3 }}>
            <Skeleton variant="text" width="30%" sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" height={56} />
          </Box>
        ))}
        <Skeleton variant="rectangular" width={120} height={36} />
      </CardContent>
    </Card>
  );

  const renderTableSkeleton = () => (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="30%" sx={{ mb: 2 }} />
        {/* Table header */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} variant="text" width="25%" />
          ))}
        </Box>
        {/* Table rows */}
        {Array.from({ length: count || 8 }).map((_, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1 }}>
            {Array.from({ length: 4 }).map((_, cellIndex) => (
              <Skeleton key={cellIndex} variant="text" width="25%" />
            ))}
          </Box>
        ))}
      </CardContent>
    </Card>
  );

  switch (variant) {
    case 'dashboard':
      return renderDashboardSkeleton();
    case 'list':
      return renderListSkeleton();
    case 'form':
      return renderFormSkeleton();
    case 'table':
      return renderTableSkeleton();
    default:
      return renderDashboardSkeleton();
  }
}