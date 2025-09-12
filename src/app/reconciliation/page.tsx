import { Box, Typography, Card, CardContent, Grid, Button, Chip } from '@mui/material';
import { 
  AccountBalance as BankIcon,
  Sync as SyncIcon,
  Warning as WarningIcon 
} from '@mui/icons-material';
import { DashboardLayout } from '@/components/layouts';

export default function ITCReconciliation() {
  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            ITC Reconciliation
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Match your purchase invoices with GSTR-2A/2B data
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <BankIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  156
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Purchase Invoices
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <SyncIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  142
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Matched Invoices
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <WarningIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  14
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Mismatched Invoices
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Recent Mismatches
              </Typography>
              <Button variant="contained" startIcon={<SyncIcon />}>
                Start Reconciliation
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    ABC Suppliers Pvt Ltd
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Invoice: INV-2024-001 | Amount: ₹15,000
                  </Typography>
                </Box>
                <Chip label="Amount Mismatch" color="warning" size="small" />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    XYZ Trading Co
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Invoice: XYZ-456 | Amount: ₹8,500
                  </Typography>
                </Box>
                <Chip label="Not in GSTR-2A" color="error" size="small" />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    PQR Industries
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Invoice: PQR-789 | Amount: ₹22,000
                  </Typography>
                </Box>
                <Chip label="Date Mismatch" color="warning" size="small" />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}