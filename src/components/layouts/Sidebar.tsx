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
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigationItems = [
  {
    text: 'Dashboard',
    icon: <DashboardIcon />,
    href: '/dashboard',
  },
  {
    text: 'Return Filing',
    icon: <FilingIcon />,
    href: '/filing',
    children: [
      { text: 'GSTR-1', href: '/filing/gstr-1' },
      { text: 'GSTR-3B', href: '/filing/gstr-3b' },
      { text: 'GSTR-9', href: '/filing/gstr-9' },
    ],
  },
  {
    text: 'ITC Reconciliation',
    icon: <ReconciliationIcon />,
    href: '/reconciliation',
  },
  {
    text: 'Invoice Management',
    icon: <InvoiceIcon />,
    href: '/invoices',
  },
  {
    text: 'Analytics',
    icon: <AnalyticsIcon />,
    href: '/analytics',
  },
  {
    text: 'Notifications',
    icon: <NotificationIcon />,
    href: '/notifications',
  },
  {
    text: 'Settings',
    icon: <SettingsIcon />,
    href: '/settings',
  },
];

const DRAWER_WIDTH = 280;

export function Sidebar({ open, onClose }: SidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleItemClick = (item: typeof navigationItems[0]) => {
    if (item.children) {
      setExpandedItems((prev) =>
        prev.includes(item.text)
          ? prev.filter((i) => i !== item.text)
          : [...prev, item.text]
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
            <Box key={item.text}>
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={item.children ? 'div' : Link}
                  href={item.children ? undefined : item.href}
                  onClick={() => handleItemClick(item)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
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
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive(item.href) ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>

              {/* Submenu items */}
              {item.children && expandedItems.includes(item.text) && (
                <List sx={{ pl: 2 }}>
                  {item.children.map((child) => (
                    <ListItem key={child.text} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        component={Link}
                        href={child.href}
                        onClick={() => isMobile && onClose()}
                        sx={{
                          borderRadius: 1.5,
                          minHeight: 40,
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
                          primary={child.text}
                          primaryTypographyProps={{
                            fontSize: '0.8125rem',
                            fontWeight: isActive(child.href) ? 600 : 400,
                          }}
                        />
                      </ListItemButton>
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