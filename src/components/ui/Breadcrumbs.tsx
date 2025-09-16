'use client';

import { usePathname } from '@/i18n';
import { Breadcrumbs as MUIBreadcrumbs, Typography, Link as MUILink, Box } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { Link } from '@/i18n';
import { useTranslations } from 'next-intl';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const getRouteMap = (t: any) => ({
  dashboard: t('nav.dashboard'),
  filing: t('nav.filing'),
  'gstr-1': 'GSTR-1',
  'gstr-3b': 'GSTR-3B',
  'gstr-9': 'GSTR-9',
  reconciliation: t('nav.reconciliation'),
  invoices: t('nav.invoices'),
  'e-invoice': t('nav.e_invoice'),
  'e-way-bill': t('nav.e_way_bill'),
  analytics: t('nav.analytics'),
  'ai-assistant': t('nav.ai_assistant'),
  notifications: t('nav.notifications'),
  settings: t('nav.settings'),
});

export function Breadcrumbs() {
  const t = useTranslations('common');
  const pathname = usePathname();
  const routeMap = getRouteMap(t);

  // Don't show breadcrumbs on the home page or dashboard root
  if (pathname === '/' || pathname === '/dashboard') {
    return null;
  }

  const pathSegments = pathname.split('/').filter(Boolean);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: t('nav.dashboard'), href: '/dashboard' }
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