'use client';

import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button,
  Chip,
  Avatar
} from '@mui/material';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  Assignment,
  AccountBalance,
  Warning
} from '@mui/icons-material';
import { DashboardLayout } from '@/components/layouts';
import { formatCurrency } from '@/lib/utils';
import { 
  GSTLiabilityChart, 
  ITCUtilizationChart, 
  ComplianceScoreChart, 
  FilingStatusChart 
} from '@/components/charts';
import { useAppSelector, useAppDispatch } from '@/store';
import { 
  selectDashboardKPIs, 
  selectNotifications,
  fetchDashboardData 
} from '@/store/slices/dashboardSlice';
import { 
  selectVisibleWidgets,
  toggleWidgetVisibility
} from '@/store/slices/widgetSlice';
import { WidgetContainer, getGridProps } from '@/components/ui';
import { useEffect, useCallback } from 'react';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const kpis = useAppSelector(selectDashboardKPIs);
  const notifications = useAppSelector(selectNotifications);
  const visibleWidgets = useAppSelector(selectVisibleWidgets);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const handleWidgetVisibilityToggle = useCallback((id: string, visible: boolean) => {
    dispatch(toggleWidgetVisibility({ id, visible }));
  }, [dispatch]);

  const handleWidgetRefresh = useCallback((id: string) => {
    if (id.includes('Chart') || id === 'notifications') {
      dispatch(fetchDashboardData());
    }
  }, [dispatch]);

  const handleWidgetConfigure = useCallback((id: string) => {
    console.log('Configure widget:', id);
  }, []);

  const renderWidget = (widget: any) => {
    const gridProps = getGridProps(widget.size);
    
    const widgetContent = (() => {
      switch (widget.id) {
        case 'kpis':
          return (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} lg={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'error.light', mr: 2 }}>
                        <Assessment />
                      </Avatar>
                      <Typography variant="subtitle2" color="text.secondary">
                        Current Liability
                      </Typography>
                    </Box>
                    <Typography variant="h4" component="div" gutterBottom>
                      {formatCurrency(kpis.currentLiability)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingDown sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                      <Typography variant="body2" color="success.main">
                        12% from last month
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} lg={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'info.light', mr: 2 }}>
                        <AccountBalance />
                      </Avatar>
                      <Typography variant="subtitle2" color="text.secondary">
                        Available ITC
                      </Typography>
                    </Box>
                    <Typography variant="h4" component="div" gutterBottom>
                      {formatCurrency(kpis.availableITC)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUp sx={{ color: 'info.main', fontSize: 16, mr: 0.5 }} />
                      <Typography variant="body2" color="info.main">
                        8% from last month
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} lg={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                        <Assessment />
                      </Avatar>
                      <Typography variant="subtitle2" color="text.secondary">
                        Compliance Score
                      </Typography>
                    </Box>
                    <Typography variant="h4" component="div" gutterBottom>
                      {kpis.complianceScore}/100
                    </Typography>
                    <Chip 
                      label="Excellent" 
                      color="success" 
                      size="small"
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} lg={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                        <Assignment />
                      </Avatar>
                      <Typography variant="subtitle2" color="text.secondary">
                        Pending Returns
                      </Typography>
                    </Box>
                    <Typography variant="h4" component="div" gutterBottom>
                      {kpis.pendingReturns}
                    </Typography>
                    <Typography variant="body2" color="warning.main">
                      Due in 5 days
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          );

        case 'quickActions':
          return (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Link href="/filing/gstr-1" passHref legacyBehavior>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    sx={{
                      height: 80,
                      flexDirection: 'column',
                      gap: 1
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="medium">
                      File GSTR-1
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Sales return filing
                    </Typography>
                  </Button>
                </Link>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Link href="/filing/gstr-3b" passHref legacyBehavior>
                  <Button
                    variant="outlined"
                    color="success"
                    fullWidth
                    sx={{
                      height: 80,
                      flexDirection: 'column',
                      gap: 1
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="medium">
                      File GSTR-3B
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monthly summary
                    </Typography>
                  </Button>
                </Link>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Link href="/filing/gstr-9" passHref legacyBehavior>
                  <Button
                    variant="outlined"
                    color="info"
                    fullWidth
                    sx={{
                      height: 80,
                      flexDirection: 'column',
                      gap: 1
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="medium">
                      File GSTR-9
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Annual return
                    </Typography>
                  </Button>
                </Link>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Link href="/reconciliation" passHref legacyBehavior>
                  <Button
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    sx={{
                      height: 80,
                      flexDirection: 'column',
                      gap: 1
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="medium">
                      ITC Reconciliation
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Match invoices
                    </Typography>
                  </Button>
                </Link>
              </Grid>
            </Grid>
          );

        case 'gstLiabilityChart':
          return <GSTLiabilityChart />;

        case 'itcUtilizationChart':
          return <ITCUtilizationChart />;

        case 'complianceChart':
          return <ComplianceScoreChart />;

        case 'filingStatusChart':
          return <FilingStatusChart />;

        case 'notifications':
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {notifications.map((notification) => (
                <Box key={notification.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  {notification.type === 'warning' && (
                    <Warning sx={{ color: 'warning.main', mt: 0.5 }} />
                  )}
                  {notification.type === 'info' && (
                    <Avatar sx={{ bgcolor: 'info.main', width: 24, height: 24 }}>
                      <Typography variant="caption">N</Typography>
                    </Avatar>
                  )}
                  {notification.type === 'success' && (
                    <Avatar sx={{ bgcolor: 'success.main', width: 24, height: 24 }}>
                      <Typography variant="caption">✓</Typography>
                    </Avatar>
                  )}
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {notification.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {notification.subtitle}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          );

        default:
          return <Typography>Widget not found</Typography>;
      }
    })();

    return (
      <Grid item {...gridProps} key={widget.id}>
        <WidgetContainer
          config={widget}
          onVisibilityToggle={handleWidgetVisibilityToggle}
          onRefresh={handleWidgetRefresh}
          onConfigure={handleWidgetConfigure}
        >
          {widgetContent}
        </WidgetContainer>
      </Grid>
    );
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome to your GST compliance dashboard
          </Typography>
        </Box>

        {/* Configurable Widgets */}
        <Grid container spacing={3}>
          {visibleWidgets.map(renderWidget)}
        </Grid>
      </Box>
    </DashboardLayout>
  );
}