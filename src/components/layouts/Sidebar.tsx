'use client';

import { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as FilingIcon,
  AccountBalance as ReconciliationIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Receipt as InvoiceIcon,
  Notifications as NotificationIcon,
  QrCode as EInvoiceIcon,
  LocalShipping as EWayBillIcon,
  SmartToy as AIAssistantIcon,
} from '@mui/icons-material';
import { Link, usePathname } from '@/i18n';
import { useTranslations } from 'next-intl';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const getNavigationItems = (t: any) => [
  {
    textKey: 'nav.dashboard',
    icon: <DashboardIcon />,
    href: '/dashboard',
  },
  {
    textKey: 'nav.filing',
    icon: <FilingIcon />,
    href: '/filing',
    children: [
      { textKey: 'GSTR-1', href: '/filing/gstr-1' },
      { textKey: 'GSTR-3B', href: '/filing/gstr-3b' },
      { textKey: 'GSTR-9', href: '/filing/gstr-9' },
    ],
  },
  {
    textKey: 'nav.reconciliation',
    icon: <ReconciliationIcon />,
    href: '/reconciliation',
  },
  {
    textKey: 'nav.invoices',
    icon: <InvoiceIcon />,
    href: '/invoices',
  },
  {
    textKey: 'nav.e_invoice',
    icon: <EInvoiceIcon />,
    href: '/e-invoice',
  },
  {
    textKey: 'nav.e_way_bill',
    icon: <EWayBillIcon />,
    href: '/e-way-bill',
  },
  {
    textKey: 'nav.analytics',
    icon: <AnalyticsIcon />,
    href: '/analytics',
  },
  {
    textKey: 'nav.ai_assistant',
    icon: <AIAssistantIcon />,
    href: '/ai-assistant',
  },
  {
    textKey: 'nav.notifications',
    icon: <NotificationIcon />,
    href: '/notifications',
  },
  {
    textKey: 'nav.settings',
    icon: <SettingsIcon />,
    href: '/settings',
  },
];

const DRAWER_WIDTH = 280;

export function Sidebar({ open, onClose }: SidebarProps) {
  const t = useTranslations('common');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const navigationItems = getNavigationItems(t);

  const handleItemClick = (item: typeof navigationItems[0]) => {
    if (item.children) {
      setExpandedItems((prev) =>
        prev.includes(item.textKey)
          ? prev.filter((i) => i !== item.textKey)
          : [...prev, item.textKey]
      );
    } else if (isMobile) {
      onClose();
    }
  };

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href !== '/dashboard' && pathname.startsWith(href)) return true;
    return false;
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" component="div" fontWeight="bold" color="primary">
          GST Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Compliance Made Simple
        </Typography>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <List sx={{ px: 2, py: 1 }}>
          {navigationItems.map((item) => (
            <Box key={item.textKey}>
              {item.children ? (
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => handleItemClick(item)}
                    sx={{
                      borderRadius: 2,
                      minHeight: 48,
                      width: '100%',
                      backgroundColor: isActive(item.href)
                        ? 'primary.main'
                        : 'transparent',
                      color: isActive(item.href) ? 'white' : 'text.primary',
                      '&:hover': {
                        backgroundColor: isActive(item.href)
                          ? 'primary.dark'
                          : 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isActive(item.href) ? 'white' : 'text.secondary',
                        minWidth: 40,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={t(item.textKey)}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: isActive(item.href) ? 600 : 400,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ) : (
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <Link href={item.href as Parameters<typeof Link>[0]['href']} style={{ textDecoration: 'none', width: '100%' }}>
                    <ListItemButton
                      onClick={() => handleItemClick(item)}
                      sx={{
                        borderRadius: 2,
                        minHeight: 48,
                        width: '100%',
                        backgroundColor: isActive(item.href)
                          ? 'primary.main'
                          : 'transparent',
                        color: isActive(item.href) ? 'white' : 'text.primary',
                        '&:hover': {
                          backgroundColor: isActive(item.href)
                            ? 'primary.dark'
                            : 'action.hover',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: isActive(item.href) ? 'white' : 'text.secondary',
                          minWidth: 40,
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={t(item.textKey)}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: isActive(item.href) ? 600 : 400,
                        }}
                      />
                    </ListItemButton>
                  </Link>
                </ListItem>
              )}

              {/* Submenu items */}
              {item.children && expandedItems.includes(item.textKey) && (
                <List sx={{ pl: 2 }}>
                  {item.children.map((child) => (
                    <ListItem key={child.textKey} disablePadding sx={{ mb: 0.5 }}>
                      <Link href={child.href as Parameters<typeof Link>[0]['href']} style={{ textDecoration: 'none', width: '100%' }}>
                        <ListItemButton
                          onClick={() => isMobile && onClose()}
                          sx={{
                            borderRadius: 1.5,
                            minHeight: 40,
                            width: '100%',
                            backgroundColor: isActive(child.href)
                              ? 'primary.main'
                              : 'transparent',
                            color: isActive(child.href) ? 'white' : 'text.primary',
                            '&:hover': {
                              backgroundColor: isActive(child.href)
                                ? 'primary.dark'
                                : 'action.hover',
                            },
                          }}
                        >
                          <ListItemText
                            primary={child.textKey}
                            primaryTypographyProps={{
                              fontSize: '0.8125rem',
                              fontWeight: isActive(child.href) ? 600 : 400,
                            }}
                          />
                        </ListItemButton>
                      </Link>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          ))}
        </List>
      </Box>

      {/* User Info Section */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            U
          </Box>
          <Box>
            <Typography variant="body2" fontWeight="medium">
              Demo User
            </Typography>
            <Typography variant="caption" color="text.secondary">
              27AAAAA0000A1Z5
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  if (isMobile) {
    // Mobile: Temporary drawer (overlay)
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            marginTop: '55px', // AppBar height offset
            height: 'calc(100vh - 55px)', // Adjust height accordingly
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  // Desktop: Permanent drawer (always visible)
  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          position: 'fixed',
          top: '64px', // AppBar height offset
          height: 'calc(100vh - 64px)', // Adjust height accordingly
          zIndex: theme.zIndex.drawer,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}