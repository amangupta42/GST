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

export default function Dashboard() {
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

        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
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
                  {formatCurrency(125000)}
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
                  {formatCurrency(45000)}
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
                  92/100
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
                  2
                </Typography>
                <Typography variant="body2" color="warning.main">
                  Due in 5 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
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
                    Upload and file your sales return
                  </Typography>
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
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
                    Submit your monthly summary
                  </Typography>
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
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
                    Match purchase invoices
                  </Typography>
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Notifications
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Warning sx={{ color: 'warning.main', mt: 0.5 }} />
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    GSTR-3B filing due in 5 days
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    December 2024 return
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', width: 24, height: 24 }}>
                  <Typography variant="caption">N</Typography>
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    New GSTR-2A data available
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    3 invoices to reconcile
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', width: 24, height: 24 }}>
                  <Typography variant="caption">✓</Typography>
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    GSTR-1 filed successfully
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    November 2024 return
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}