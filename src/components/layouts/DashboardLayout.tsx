'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import { Sidebar } from './Sidebar';
import { TopNavigation } from './TopNavigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <TopNavigation onMenuClick={handleSidebarToggle} />

      <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { xs: 0, md: 0 }, // No margin on desktop, no margin on mobile
          mt: '64px', // AppBar height
          backgroundColor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}