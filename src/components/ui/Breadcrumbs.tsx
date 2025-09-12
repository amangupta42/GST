'use client';

import { usePathname } from 'next/navigation';
import { Breadcrumbs as MUIBreadcrumbs, Typography, Link as MUILink, Box } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeMap: Record<string, string> = {
  dashboard: 'Dashboard',
  filing: 'Return Filing',
  'gstr-1': 'GSTR-1',
  'gstr-3b': 'GSTR-3B',
  'gstr-9': 'GSTR-9',
  reconciliation: 'ITC Reconciliation',
  invoices: 'Invoice Management',
  analytics: 'Analytics',
  notifications: 'Notifications',
  settings: 'Settings',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  
  // Don't show breadcrumbs on the home page or dashboard root
  if (pathname === '/' || pathname === '/dashboard') {
    return null;
  }

  const pathSegments = pathname.split('/').filter(Boolean);
  
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' }
  ];

  // Build breadcrumb items from path segments
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    // Don't make the last item a link
    if (index === pathSegments.length - 1) {
      breadcrumbItems.push({ label });
    } else {
      breadcrumbItems.push({ label, href: currentPath });
    }
  });

  return (
    <Box sx={{ mb: 2 }}>
      <MUIBreadcrumbs 
        aria-label="breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-separator': {
            color: 'text.secondary',
          },
        }}
      >
        {breadcrumbItems.map((item, index) => {
          if (item.href) {
            return (
              <MUILink
                key={index}
                component={Link}
                href={item.href}
                color="inherit"
                underline="hover"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                {index === 0 && (
                  <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
                )}
                {item.label}
              </MUILink>
            );
          }

          return (
            <Typography 
              key={index}
              color="text.primary"
              sx={{ 
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {item.label}
            </Typography>
          );
        })}
      </MUIBreadcrumbs>
    </Box>
  );
}