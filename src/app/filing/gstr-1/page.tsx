import { Box, Typography, Card, CardContent, Grid, Button, Chip } from '@mui/material';
import { 
  Upload as UploadIcon,
  Preview as PreviewIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { DashboardLayout } from '@/components/layouts';

export default function GSTR1Filing() {
  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            GSTR-1 Filing
          </Typography>
          <Typography variant="body1" color="text.secondary">
            File your monthly outward supplies return
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Filing Steps
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      bgcolor: 'primary.main', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'white'
                    }}>
                      1
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        Upload Invoice Data
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Import your sales invoices via Excel/CSV
                      </Typography>
                    </Box>
                    <Button variant="outlined" startIcon={<UploadIcon />}>
                      Upload
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      bgcolor: 'grey.300', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'text.secondary'
                    }}>
                      2
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="medium" color="text.secondary">
                        Review & Validate
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Verify HSN codes and tax calculations
                      </Typography>
                    </Box>
                    <Button variant="outlined" disabled startIcon={<PreviewIcon />}>
                      Preview
                    </Button>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      bgcolor: 'grey.300', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'text.secondary'
                    }}>
                      3
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="medium" color="text.secondary">
                        Submit Return
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        File with GSTN portal
                      </Typography>
                    </Box>
                    <Button variant="outlined" disabled startIcon={<SendIcon />}>
                      Submit
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Return Status
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">December 2024</Typography>
                    <Chip label="Due in 5 days" color="warning" size="small" />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">November 2024</Typography>
                    <Chip label="Filed" color="success" size="small" />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">October 2024</Typography>
                    <Chip label="Filed" color="success" size="small" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
}