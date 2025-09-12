import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { DashboardLayout } from '@/components/layouts';

export default function GSTR3BFiling() {
  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            GSTR-3B Filing
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monthly summary return - Auto-computed from GSTR-1
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <Typography variant="h6" color="text.secondary" textAlign="center">
              🚧 Coming Soon
            </Typography>
            <Typography variant="body1" textAlign="center" sx={{ mt: 2 }}>
              GSTR-3B filing interface is under development
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
}