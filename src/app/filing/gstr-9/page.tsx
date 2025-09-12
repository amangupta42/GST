import { Box, Typography, Card, CardContent } from '@mui/material';
import { DashboardLayout } from '@/components/layouts';

export default function GSTR9Filing() {
  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            GSTR-9 Filing
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Annual return filing
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h6" color="text.secondary" textAlign="center">
              🚧 Coming Soon
            </Typography>
            <Typography variant="body1" textAlign="center" sx={{ mt: 2 }}>
              GSTR-9 filing interface is under development
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}