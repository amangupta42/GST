'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import { Sidebar } from './Sidebar';
import { TopNavigation } from './TopNavigation';
import { Breadcrumbs } from '@/components/ui';

const DRAWER_WIDTH = 280;

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
          ml: { xs: 0, md: 0 }, // Keep as is. Sidebar automatically accounted for in web
          mt: '64px', // AppBar height
          backgroundColor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Box sx={{ p: { xs: 2, md: 3 }, pb: 0 }}>
          <Breadcrumbs />
        </Box>
        {children}
      </Box>
    </Box>
  );
}