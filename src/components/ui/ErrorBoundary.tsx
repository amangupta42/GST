'use client';

import React from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { ErrorOutline as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
        p: 3,
      }}
    >
      <Card sx={{ maxWidth: 500, textAlign: 'center' }}>
        <CardContent sx={{ p: 4 }}>
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          
          <Typography variant="h5" component="h2" gutterBottom>
            Something went wrong
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
          </Typography>
          
          {process.env.NODE_ENV === 'development' && error && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                backgroundColor: 'grey.100',
                borderRadius: 1,
                textAlign: 'left',
                maxHeight: 200,
                overflow: 'auto',
              }}
            >
              <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </Typography>
            </Box>
          )}
          
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={resetError}
            sx={{ mt: 3 }}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

// Hook for functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    console.error('Error caught by error handler:', error, errorInfo);
  };
}

export { ErrorBoundary, DefaultErrorFallback };
export type { ErrorFallbackProps };