'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Avatar
} from '@mui/material';
import {
  QrCode,
  CloudUpload,
  CloudDownload,
  CheckCircle,
  Cancel,
  Warning,
  Info,
  Refresh,
  Send,
  Receipt,
  Assignment,
  Assessment,
  Verified,
  Error,
  Schedule,
  Print,
  GetApp,
  Visibility,
  Edit,
  Delete,
  ExpandMore,
  BugReport,
  Done,
  Pending,
  Block,
  Download
} from '@mui/icons-material';

export interface EInvoiceRecord {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  buyerGstin: string;
  buyerName: string;
  invoiceValue: number;
  taxAmount: number;
  status: 'draft' | 'generated' | 'cancelled' | 'error' | 'pending';
  irn: string | null;
  ackNo: string | null;
  ackDate: string | null;
  qrCode: string | null;
  signedInvoice: string | null;
  signedQrCode: string | null;
  cancelDate: string | null;
  cancelReason: string | null;
  errorCode: string | null;
  errorDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EInvoiceBatchJob {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  totalInvoices: number;
  processedInvoices: number;
  successfulInvoices: number;
  failedInvoices: number;
  startTime: string;
  endTime?: string;
  errors: string[];
}

interface EInvoiceHubProps {
  onComplete?: () => void;
}

export function EInvoiceHub({ onComplete }: EInvoiceHubProps) {
  const [tabValue, setTabValue] = useState(0);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [bulkProcessDialog, setBulkProcessDialog] = useState({ open: false, action: '' });
  const [irnGenerationDialog, setIrnGenerationDialog] = useState({ open: false, invoice: null as EInvoiceRecord | null });
  const [qrCodeDialog, setQrCodeDialog] = useState({ open: false, record: null as EInvoiceRecord | null });
  const [cancelDialog, setCancelDialog] = useState({ open: false, record: null as EInvoiceRecord | null });
  const [loading, setLoading] = useState(false);

  // Mock data for E-invoice records
  const [eInvoices, setEInvoices] = useState<EInvoiceRecord[]>([
    {
      id: 'EI001',
      invoiceNumber: 'INV/2024/001',
      invoiceDate: '2024-03-01',
      buyerGstin: '09ABCDE1234F1Z5',
      buyerName: 'ABC Industries Ltd',
      invoiceValue: 118000,
      taxAmount: 18000,
      status: 'generated',
      irn: '2f4c6f8e123456789abcdef123456789abcdef123456789abcdef123456789abcd',
      ackNo: 'ACK112024030100001',
      ackDate: '2024-03-01T10:30:00Z',
      qrCode: 'https://einvoice1.gst.gov.in/Others/VSignedInvoice?aspx?irn=2f4c6f8e123456789abcdef123456789abcdef123456789abcdef123456789abcd',
      signedInvoice: 'base64_encoded_signed_invoice_data',
      signedQrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAA',
      cancelDate: null,
      cancelReason: null,
      errorCode: null,
      errorDescription: null,
      createdAt: '2024-03-01T09:00:00Z',
      updatedAt: '2024-03-01T10:30:00Z'
    },
    {
      id: 'EI002',
      invoiceNumber: 'INV/2024/002',
      invoiceDate: '2024-03-02',
      buyerGstin: '27XYZPQ5678M1N2',
      buyerName: 'XYZ Trading Co',
      invoiceValue: 56640,
      taxAmount: 8640,
      status: 'error',
      irn: null,
      ackNo: null,
      ackDate: null,
      qrCode: null,
      signedInvoice: null,
      signedQrCode: null,
      cancelDate: null,
      cancelReason: null,
      errorCode: '2150',
      errorDescription: 'Duplicate IRN. IRN generation is not allowed for duplicate Invoice',
      createdAt: '2024-03-02T09:00:00Z',
      updatedAt: '2024-03-02T09:15:00Z'
    },
    {
      id: 'EI003',
      invoiceNumber: 'INV/2024/003',
      invoiceDate: '2024-03-03',
      buyerGstin: '36MNOPQ9876L1M1',
      buyerName: 'MNO Enterprises',
      invoiceValue: 94400,
      taxAmount: 14400,
      status: 'pending',
      irn: null,
      ackNo: null,
      ackDate: null,
      qrCode: null,
      signedInvoice: null,
      signedQrCode: null,
      cancelDate: null,
      cancelReason: null,
      errorCode: null,
      errorDescription: null,
      createdAt: '2024-03-03T09:00:00Z',
      updatedAt: '2024-03-03T09:00:00Z'
    }
  ]);

  const [batchJobs, setBatchJobs] = useState<EInvoiceBatchJob[]>([
    {
      id: 'BATCH001',
      name: 'March 2024 Bulk Processing',
      status: 'completed',
      totalInvoices: 156,
      processedInvoices: 156,
      successfulInvoices: 142,
      failedInvoices: 14,
      startTime: '2024-03-01T08:00:00Z',
      endTime: '2024-03-01T10:30:00Z',
      errors: ['Duplicate IRN for 14 invoices', 'Invalid GSTIN format for 2 invoices']
    },
    {
      id: 'BATCH002',
      name: 'Weekly Processing - Week 1',
      status: 'running',
      totalInvoices: 45,
      processedInvoices: 23,
      successfulInvoices: 21,
      failedInvoices: 2,
      startTime: '2024-03-04T09:00:00Z',
      errors: []
    }
  ]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const total = eInvoices.length;
    const generated = eInvoices.filter(inv => inv.status === 'generated').length;
    const pending = eInvoices.filter(inv => inv.status === 'pending').length;
    const errors = eInvoices.filter(inv => inv.status === 'error').length;
    const cancelled = eInvoices.filter(inv => inv.status === 'cancelled').length;
    const totalValue = eInvoices.reduce((sum, inv) => sum + inv.invoiceValue, 0);
    const successRate = total > 0 ? Math.round((generated / total) * 100) : 0;

    return {
      total,
      generated,
      pending,
      errors,
      cancelled,
      totalValue,
      successRate
    };
  }, [eInvoices]);

  const generateIRN = useCallback(async (invoiceId: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const currentTime = new Date().toISOString();
      const mockIRN = `${Date.now()}${Math.random().toString(36).substr(2, 9)}`.padEnd(64, '0');
      const mockAckNo = `ACK11${currentTime.slice(0, 10).replace(/-/g, '')}${Math.floor(Math.random() * 100000)}`;
      
      setEInvoices(prev => prev.map(inv => 
        inv.id === invoiceId ? {
          ...inv,
          status: 'generated' as const,
          irn: mockIRN,
          ackNo: mockAckNo,
          ackDate: currentTime,
          qrCode: `https://einvoice1.gst.gov.in/Others/VSignedInvoice?aspx?irn=${mockIRN}`,
          signedInvoice: 'base64_encoded_signed_invoice_data',
          signedQrCode: 'data:image/png;base64,generated_qr_code_data',
          updatedAt: currentTime
        } : inv
      ));
      
      setIrnGenerationDialog({ open: false, invoice: null });
    } catch (error) {
      console.error('IRN Generation failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelEInvoice = useCallback(async (invoiceId: string, reason: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const currentTime = new Date().toISOString();
      
      setEInvoices(prev => prev.map(inv => 
        inv.id === invoiceId ? {
          ...inv,
          status: 'cancelled' as const,
          cancelDate: currentTime,
          cancelReason: reason,
          updatedAt: currentTime
        } : inv
      ));
      
      setCancelDialog({ open: false, record: null });
    } catch (error) {
      console.error('E-invoice cancellation failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const processBulkEInvoices = useCallback(async (invoiceIds: string[]) => {
    setLoading(true);
    setBulkProcessDialog({ open: false, action: '' });
    
    try {
      const newBatchJob: EInvoiceBatchJob = {
        id: `BATCH${Date.now()}`,
        name: `Bulk Processing - ${new Date().toLocaleDateString()}`,
        status: 'running',
        totalInvoices: invoiceIds.length,
        processedInvoices: 0,
        successfulInvoices: 0,
        failedInvoices: 0,
        startTime: new Date().toISOString(),
        errors: []
      };
      
      setBatchJobs(prev => [newBatchJob, ...prev]);
      
      // Simulate batch processing
      for (let i = 0; i < invoiceIds.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const success = Math.random() > 0.15; // 85% success rate
        
        if (success) {
          await generateIRN(invoiceIds[i]);
          newBatchJob.successfulInvoices++;
        } else {
          newBatchJob.failedInvoices++;
          newBatchJob.errors.push(`Failed to generate IRN for invoice ${invoiceIds[i]}`);
        }
        
        newBatchJob.processedInvoices++;
        setBatchJobs(prev => prev.map(job => job.id === newBatchJob.id ? { ...newBatchJob } : job));
      }
      
      newBatchJob.status = 'completed';
      newBatchJob.endTime = new Date().toISOString();
      setBatchJobs(prev => prev.map(job => job.id === newBatchJob.id ? { ...newBatchJob } : job));
      
      setSelectedInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [generateIRN]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

  const getStatusColor = (status: EInvoiceRecord['status']) => {
    switch (status) {
      case 'generated': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'secondary';
      case 'error': return 'error';
      case 'draft': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: EInvoiceRecord['status']) => {
    switch (status) {
      case 'generated': return <CheckCircle />;
      case 'pending': return <Schedule />;
      case 'cancelled': return <Cancel />;
      case 'error': return <Error />;
      case 'draft': return <Assignment />;
      default: return <Info />;
    }
  };

  const getBatchStatusColor = (status: EInvoiceBatchJob['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'info';
      case 'failed': return 'error';
      case 'paused': return 'warning';
      default: return 'default';
    }
  };

  const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          E-Invoice Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Generate, manage, and track GST e-invoices with real-time IRN validation
        </Typography>
      </Box>

      {/* Summary Dashboard */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                <Receipt />
              </Avatar>
              <Typography variant="h4" color="primary.main">
                {summaryStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total E-Invoices
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                <Verified />
              </Avatar>
              <Typography variant="h4" color="success.main">
                {summaryStats.generated}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Generated
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1 }}>
                <Pending />
              </Avatar>
              <Typography variant="h4" color="warning.main">
                {summaryStats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 1 }}>
                <BugReport />
              </Avatar>
              <Typography variant="h4" color="error.main">
                {summaryStats.errors}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Errors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1 }}>
                <Assessment />
              </Avatar>
              <Typography variant="h4" color="info.main">
                {summaryStats.successRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Success Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 1 }}>
                <Assignment />
              </Avatar>
              <Typography variant="h6" color="secondary.main">
                {formatCurrency(summaryStats.totalValue)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Value
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<QrCode />}
                onClick={() => setBulkProcessDialog({ open: true, action: 'generate' })}
                disabled={selectedInvoices.length === 0}
              >
                Generate IRN ({selectedInvoices.length})
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CloudUpload />}
              >
                Bulk Import
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CloudDownload />}
              >
                Export Data
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
              >
                Refresh Status
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Assessment />}
              >
                View Reports
              </Button>
            </Grid>
          </Grid>

          {selectedInvoices.length > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {selectedInvoices.length} e-invoice(s) selected for bulk operations
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab 
                label={
                  <Badge badgeContent={summaryStats.total} color="primary" max={999}>
                    E-Invoices
                  </Badge>
                } 
              />
              <Tab 
                label={
                  <Badge badgeContent={batchJobs.filter(job => job.status === 'running').length} color="secondary" max={999}>
                    Batch Jobs
                  </Badge>
                } 
              />
              <Tab label="IRN Validation" />
              <Tab label="Reports & Analytics" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              E-Invoice Records Management
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.length === eInvoices.length && eInvoices.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedInvoices(eInvoices.map(inv => inv.id));
                          } else {
                            setSelectedInvoices([]);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell><strong>Invoice Details</strong></TableCell>
                    <TableCell><strong>Buyer</strong></TableCell>
                    <TableCell align="right"><strong>Value</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>IRN</strong></TableCell>
                    <TableCell><strong>Generated</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {eInvoices.map((record) => (
                    <TableRow key={record.id} hover>
                      <TableCell padding="checkbox">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(record.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedInvoices(prev => [...prev, record.id]);
                            } else {
                              setSelectedInvoices(prev => prev.filter(id => id !== record.id));
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {record.invoiceNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {record.invoiceDate}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {record.buyerName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {record.buyerGstin}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(record.invoiceValue)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Tax: {formatCurrency(record.taxAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="small"
                          icon={getStatusIcon(record.status)}
                          label={record.status.toUpperCase()}
                          color={getStatusColor(record.status)}
                        />
                        {record.status === 'error' && record.errorDescription && (
                          <Tooltip title={record.errorDescription}>
                            <Warning color="error" sx={{ ml: 1 }} />
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.irn ? (
                          <Tooltip title={record.irn}>
                            <Typography variant="body2" fontFamily="monospace">
                              {record.irn.substring(0, 12)}...
                            </Typography>
                          </Tooltip>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Not Generated
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {record.ackDate ? (
                          <Typography variant="body2">
                            {new Date(record.ackDate).toLocaleDateString()}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {record.status === 'pending' && (
                            <Tooltip title="Generate IRN">
                              <IconButton 
                                size="small" 
                                onClick={() => setIrnGenerationDialog({ open: true, invoice: record })}
                              >
                                <QrCode />
                              </IconButton>
                            </Tooltip>
                          )}
                          {record.status === 'generated' && (
                            <>
                              <Tooltip title="View QR Code">
                                <IconButton 
                                  size="small"
                                  onClick={() => setQrCodeDialog({ open: true, record })}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Cancel E-Invoice">
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => setCancelDialog({ open: true, record })}
                                >
                                  <Cancel />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          {record.status === 'error' && (
                            <Tooltip title="Retry Generation">
                              <IconButton 
                                size="small"
                                onClick={() => generateIRN(record.id)}
                              >
                                <Refresh />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="Download PDF">
                            <IconButton size="small">
                              <Print />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Batch Processing Jobs
            </Typography>

            {batchJobs.map((job) => (
              <Accordion key={job.id}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                    <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                      {job.name}
                    </Typography>
                    <Chip 
                      size="small"
                      label={job.status.toUpperCase()}
                      color={getBatchStatusColor(job.status)}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {job.processedInvoices}/{job.totalInvoices}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Progress Details
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(job.processedInvoices / job.totalInvoices) * 100}
                        sx={{ height: 8, borderRadius: 4, mb: 1 }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">
                          Processed: {job.processedInvoices}
                        </Typography>
                        <Typography variant="body2">
                          Success Rate: {job.processedInvoices > 0 ? Math.round((job.successfulInvoices / job.processedInvoices) * 100) : 0}%
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Results Summary
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Chip 
                          size="small" 
                          label={`✓ ${job.successfulInvoices}`}
                          color="success"
                          variant="outlined"
                        />
                        <Chip 
                          size="small" 
                          label={`✗ ${job.failedInvoices}`}
                          color="error"
                          variant="outlined"
                        />
                      </Box>
                    </Grid>
                    {job.errors.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom color="error">
                          Errors ({job.errors.length})
                        </Typography>
                        <List dense>
                          {job.errors.map((error, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <Error color="error" />
                              </ListItemIcon>
                              <ListItemText primary={error} />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              IRN Validation & Verification
            </Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Validate IRN status and verify e-invoice authenticity with GST portal.
              </Typography>
            </Alert>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      IRN Lookup & Validation
                    </Typography>
                    <TextField
                      fullWidth
                      label="Enter IRN"
                      placeholder="Enter 64-character IRN for validation"
                      sx={{ mb: 2 }}
                    />
                    <Button variant="contained" startIcon={<Verified />}>
                      Validate IRN
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      QR Code Verification
                    </Typography>
                    <TextField
                      fullWidth
                      label="QR Code Data"
                      placeholder="Paste QR code data for verification"
                      multiline
                      rows={3}
                      sx={{ mb: 2 }}
                    />
                    <Button variant="contained" startIcon={<QrCode />}>
                      Verify QR Code
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              E-Invoice Reports & Analytics
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary.main">
                      {summaryStats.successRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overall Success Rate
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {Math.round((summaryStats.errors / summaryStats.total) * 100) || 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Error Rate
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="info.main">
                      2.3s
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg. Processing Time
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>

      {/* IRN Generation Dialog */}
      <Dialog 
        open={irnGenerationDialog.open} 
        onClose={() => setIrnGenerationDialog({ open: false, invoice: null })}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Generate IRN</DialogTitle>
        <DialogContent>
          {irnGenerationDialog.invoice && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Generate IRN for invoice: <strong>{irnGenerationDialog.invoice.invoiceNumber}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Buyer: {irnGenerationDialog.invoice.buyerName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Value: {formatCurrency(irnGenerationDialog.invoice.invoiceValue)}
              </Typography>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  This will generate an IRN from the GST portal and cannot be undone.
                </Typography>
              </Alert>
            </Box>
          )}
          
          {loading && (
            <LinearProgress sx={{ mt: 2 }} />
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIrnGenerationDialog({ open: false, invoice: null })}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => irnGenerationDialog.invoice && generateIRN(irnGenerationDialog.invoice.id)}
            variant="contained"
            disabled={loading}
            startIcon={<QrCode />}
          >
            {loading ? 'Generating...' : 'Generate IRN'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Display Dialog */}
      <Dialog 
        open={qrCodeDialog.open} 
        onClose={() => setQrCodeDialog({ open: false, record: null })}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>E-Invoice QR Code</DialogTitle>
        <DialogContent>
          {qrCodeDialog.record && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                {qrCodeDialog.record.invoiceNumber}
              </Typography>
              
              {/* Mock QR Code Display */}
              <Box 
                sx={{ 
                  width: 200, 
                  height: 200, 
                  border: '1px solid #ddd', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <QrCode sx={{ fontSize: 150, color: 'text.secondary' }} />
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                IRN: {qrCodeDialog.record.irn?.substring(0, 20)}...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ack No: {qrCodeDialog.record.ackNo}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrCodeDialog({ open: false, record: null })}>
            Close
          </Button>
          <Button variant="contained" startIcon={<Download />}>
            Download QR
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel E-Invoice Dialog */}
      <Dialog 
        open={cancelDialog.open} 
        onClose={() => setCancelDialog({ open: false, record: null })}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Cancel E-Invoice</DialogTitle>
        <DialogContent>
          {cancelDialog.record && (
            <Box>
              <Typography variant="body1" gutterBottom>
                Cancel e-invoice: <strong>{cancelDialog.record.invoiceNumber}</strong>
              </Typography>
              
              <TextField
                fullWidth
                label="Cancellation Reason"
                multiline
                rows={3}
                sx={{ mt: 2 }}
                placeholder="Enter reason for cancellation..."
              />
              
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  E-invoice cancellation cannot be undone and must be done within 24 hours of generation.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog({ open: false, record: null })}>
            Close
          </Button>
          <Button 
            onClick={() => cancelDialog.record && cancelEInvoice(cancelDialog.record.id, 'User requested cancellation')}
            variant="contained"
            color="error"
            startIcon={<Cancel />}
          >
            Cancel E-Invoice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Processing Dialog */}
      <Dialog 
        open={bulkProcessDialog.open} 
        onClose={() => setBulkProcessDialog({ open: false, action: '' })}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Bulk IRN Generation</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Generate IRNs for {selectedInvoices.length} selected invoice(s)?
          </Typography>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              This will create a batch job to process all selected invoices. You can monitor progress in the Batch Jobs tab.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkProcessDialog({ open: false, action: '' })}>
            Cancel
          </Button>
          <Button 
            onClick={() => processBulkEInvoices(selectedInvoices)}
            variant="contained"
            startIcon={<Send />}
          >
            Start Batch Processing
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}