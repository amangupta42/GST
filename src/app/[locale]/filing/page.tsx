import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import { 
  Assignment as FilingIcon,
  Description as DocumentIcon,
  CheckCircle as CompleteIcon 
} from '@mui/icons-material';
import { DashboardLayout } from '@/components/layouts';
import Link from 'next/link';

export default function ReturnFiling() {
  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Return Filing
          </Typography>
          <Typography variant="body1" color="text.secondary">
            File your GST returns quickly and accurately
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <FilingIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  GSTR-1
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Monthly outward supplies return
                </Typography>
                <Button 
                  component={Link}
                  href="/filing/gstr-1"
                  variant="contained"
                  fullWidth
                >
                  File GSTR-1
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <DocumentIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  GSTR-3B
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Monthly summary return
                </Typography>
                <Button 
                  component={Link}
                  href="/filing/gstr-3b"
                  variant="contained"
                  color="success"
                  fullWidth
                >
                  File GSTR-3B
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <CompleteIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  GSTR-9
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Annual return
                </Typography>
                <Button 
                  component={Link}
                  href="/filing/gstr-9"
                  variant="contained"
                  color="secondary"
                  fullWidth
                >
                  File GSTR-9
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}