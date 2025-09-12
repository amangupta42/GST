import { Box, Typography, Card, CardContent } from '@mui/material';
import { DashboardLayout } from '@/components/layouts';

export default function InvoiceManagement() {
  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Invoice Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and organize your invoices
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h6" color="text.secondary" textAlign="center">
              🚧 Coming Soon
            </Typography>
            <Typography variant="body1" textAlign="center" sx={{ mt: 2 }}>
              Invoice management system is under development
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}