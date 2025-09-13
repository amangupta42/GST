'use client';

import { ReactNode } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  Typography,
  Tooltip
} from '@mui/material';
import { 
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useState } from 'react';

export interface WidgetConfig {
  id: string;
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  visible: boolean;
  order: number;
  refreshable?: boolean;
}

interface WidgetContainerProps {
  config: WidgetConfig;
  children: ReactNode;
  onVisibilityToggle?: (id: string, visible: boolean) => void;
  onRefresh?: (id: string) => void;
  onConfigure?: (id: string) => void;
  isConfigurable?: boolean;
}

const sizeToGrid = {
  small: { xs: 12, sm: 6, lg: 3 },
  medium: { xs: 12, sm: 6, lg: 6 },
  large: { xs: 12, lg: 8 },
  full: { xs: 12 }
};

export const WidgetContainer = ({ 
  config, 
  children, 
  onVisibilityToggle,
  onRefresh,
  onConfigure,
  isConfigurable = true 
}: WidgetContainerProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleVisibilityToggle = () => {
    onVisibilityToggle?.(config.id, !config.visible);
    handleMenuClose();
  };

  const handleRefresh = () => {
    onRefresh?.(config.id);
    handleMenuClose();
  };

  const handleConfigure = () => {
    onConfigure?.(config.id);
    handleMenuClose();
  };

  if (!config.visible) {
    return null;
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={
          <Typography variant="h6" component="div">
            {config.title}
          </Typography>
        }
        action={
          isConfigurable && (
            <Box>
              <Tooltip title="Widget options">
                <IconButton
                  size="small"
                  onClick={handleMenuClick}
                  aria-label="widget options"
                >
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: { minWidth: 160 }
                }}
              >
                <MenuItem onClick={handleVisibilityToggle}>
                  {config.visible ? <VisibilityOffIcon sx={{ mr: 1 }} /> : <VisibilityIcon sx={{ mr: 1 }} />}
                  {config.visible ? 'Hide Widget' : 'Show Widget'}
                </MenuItem>
                
                {config.refreshable && (
                  <MenuItem onClick={handleRefresh}>
                    <RefreshIcon sx={{ mr: 1 }} />
                    Refresh Data
                  </MenuItem>
                )}
                
                <MenuItem onClick={handleConfigure}>
                  <SettingsIcon sx={{ mr: 1 }} />
                  Configure
                </MenuItem>
              </Menu>
            </Box>
          )
        }
        sx={{ pb: 1 }}
      />
      
      <CardContent sx={{ flexGrow: 1, pt: 0 }}>
        {children}
      </CardContent>
    </Card>
  );
};

export const getGridProps = (size: WidgetConfig['size']) => sizeToGrid[size];