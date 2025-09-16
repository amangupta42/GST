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
  Checkbox,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Fab,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Menu,
  ListItemIcon,
  ListItemText,
  Divider,
  Switch,
  FormControlLabel,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  CloudUpload,
  CloudDownload,
  GetApp,
  Send,
  QrCode,
  Receipt,
  Email,
  Print,
  Share,
  FilterList,
  Search,
  MoreVert,
  CheckCircle,
  Cancel,
  Schedule,
  Warning,
  Error,
  Refresh,
  Backup,
  ExpandMore,
  ContentCopy,
  Archive
} from '@mui/icons-material';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerGstin: string;
  customerName: string;
  customerAddress: string;
  placeOfSupply: string;
  invoiceType: 'B2B' | 'B2C' | 'Export' | 'SEZ' | 'Deemed Export';
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'failed';
  eInvoiceDetails?: {
    irn: string;
    ackNo: string;
    ackDate: string;
    qrCode: string;
    status: 'pending' | 'generated' | 'cancelled';
  };
  eWayBillDetails?: {
    ewbNo: string;
    validUpto: string;
    status: 'pending' | 'generated' | 'cancelled' | 'expired';
  };
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  taxableValue: number;
  gstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
  totalAmount: number;
}

interface InvoiceManagementSystemProps {
  onComplete?: () => void;
}

export function InvoiceManagementSystem({ onComplete }: InvoiceManagementSystemProps) {
  const [tabValue, setTabValue] = useState(0);
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'INV001',
      invoiceNumber: 'INV/2024/001',
      invoiceDate: '2024-03-01',
      dueDate: '2024-03-31',
      customerGstin: '09ABCDE1234F1Z5',
      customerName: 'ABC Industries Ltd',
      customerAddress: '123 Business Park, Mumbai, 400001',
      placeOfSupply: '27 - Maharashtra',
      invoiceType: 'B2B',
      items: [
        {
          id: 'ITM001',
          description: 'Steel Pipes',
          hsnCode: '7306',
          quantity: 100,
          unit: 'PCS',
          unitPrice: 500,
          discount: 0,
          taxableValue: 50000,
          gstRate: 18,
          cgstAmount: 4500,
          sgstAmount: 4500,
          igstAmount: 0,
          cessAmount: 0,
          totalAmount: 59000
        }
      ],
      subtotal: 50000,
      discountAmount: 0,
      cgstAmount: 4500,
      sgstAmount: 4500,
      igstAmount: 0,
      cessAmount: 0,
      totalAmount: 59000,
      status: 'sent',
      paymentStatus: 'pending',
      eInvoiceDetails: {
        irn: '2024030112345678901234567890123456789012345678901234',
        ackNo: 'ACK123456789',
        ackDate: '2024-03-01T10:30:00',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAA',
        status: 'generated'
      },
      eWayBillDetails: {
        ewbNo: '123456789012',
        validUpto: '2024-03-02T10:30:00',
        status: 'generated'
      },
      notes: 'Payment terms: 30 days',
      createdAt: '2024-03-01T09:00:00',
      updatedAt: '2024-03-01T10:30:00'
    },
    {
      id: 'INV002',
      invoiceNumber: 'INV/2024/002',
      invoiceDate: '2024-03-02',
      dueDate: '2024-04-01',
      customerGstin: '27XYZPQ5678M1N2',
      customerName: 'XYZ Trading Co',
      customerAddress: '456 Trade Street, Delhi, 110001',
      placeOfSupply: '07 - Delhi',
      invoiceType: 'B2B',
      items: [
        {
          id: 'ITM002',
          description: 'Electronic Components',
          hsnCode: '8517',
          quantity: 50,
          unit: 'PCS',
          unitPrice: 1000,
          discount: 2000,
          taxableValue: 48000,
          gstRate: 18,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 8640,
          cessAmount: 0,
          totalAmount: 56640
        }
      ],
      subtotal: 48000,
      discountAmount: 2000,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 8640,
      cessAmount: 0,
      totalAmount: 56640,
      status: 'paid',
      paymentStatus: 'paid',
      eInvoiceDetails: {
        irn: '2024030212345678901234567890123456789012345678901234',
        ackNo: 'ACK123456790',
        ackDate: '2024-03-02T11:30:00',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAB',
        status: 'generated'
      },
      notes: 'Express delivery required',
      createdAt: '2024-03-02T09:30:00',
      updatedAt: '2024-03-02T15:45:00'
    }
  ]);

  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [bulkActionDialog, setBulkActionDialog] = useState({ open: false, action: '' });
  const [invoiceDialog, setInvoiceDialog] = useState<{ open: boolean; mode: string; invoice?: Invoice }>({ open: false, mode: 'create' });
  const [eInvoiceDialog, setEInvoiceDialog] = useState({ open: false, invoiceIds: [] as string[] });
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');

  // Filter invoices based on search and filters
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.customerGstin.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
      const matchesType = filterType === 'all' || invoice.invoiceType === filterType;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [invoices, searchTerm, filterStatus, filterType]);

  // Summary statistics
  const invoiceSummary = useMemo(() => {
    const total = invoices.length;
    const draft = invoices.filter(inv => inv.status === 'draft').length;
    const sent = invoices.filter(inv => inv.status === 'sent').length;
    const paid = invoices.filter(inv => inv.status === 'paid').length;
    const overdue = invoices.filter(inv => inv.status === 'overdue').length;
    
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const pendingAmount = invoices.filter(inv => inv.paymentStatus === 'pending').reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paidAmount = invoices.filter(inv => inv.paymentStatus === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    const eInvoicesGenerated = invoices.filter(inv => inv.eInvoiceDetails?.status === 'generated').length;
    const eWayBillsGenerated = invoices.filter(inv => inv.eWayBillDetails?.status === 'generated').length;

    return {
      total,
      draft,
      sent,
      paid,
      overdue,
      totalAmount,
      pendingAmount,
      paidAmount,
      eInvoicesGenerated,
      eWayBillsGenerated
    };
  }, [invoices]);

  const handleSelectInvoice = useCallback((invoiceId: string, selected: boolean) => {
    if (selected) {
      setSelectedInvoices(prev => [...prev, invoiceId]);
    } else {
      setSelectedInvoices(prev => prev.filter(id => id !== invoiceId));
    }
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      setSelectedInvoices(filteredInvoices.map(inv => inv.id));
    } else {
      setSelectedInvoices([]);
    }
  }, [filteredInvoices]);

  const handleBulkAction = useCallback(async (action: string) => {
    if (selectedInvoices.length === 0) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      switch (action) {
        case 'generate-einvoice':
          setInvoices(prev => prev.map(inv => 
            selectedInvoices.includes(inv.id) ? {
              ...inv,
              eInvoiceDetails: {
                irn: `2024${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
                ackNo: `ACK${Date.now()}`,
                ackDate: new Date().toISOString(),
                qrCode: 'data:image/png;base64,generated_qr_code',
                status: 'generated' as const
              }
            } : inv
          ));
          break;
          
        case 'generate-ewaybill':
          setInvoices(prev => prev.map(inv => 
            selectedInvoices.includes(inv.id) ? {
              ...inv,
              eWayBillDetails: {
                ewbNo: `${Date.now()}${Math.floor(Math.random() * 1000)}`,
                validUpto: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                status: 'generated' as const
              }
            } : inv
          ));
          break;
          
        case 'mark-sent':
          setInvoices(prev => prev.map(inv => 
            selectedInvoices.includes(inv.id) ? { ...inv, status: 'sent' as const } : inv
          ));
          break;
          
        case 'export':
          // Simulate export
          const exportData = invoices.filter(inv => selectedInvoices.includes(inv.id));
          console.log('Exporting:', exportData);
          break;
      }
      
      setSelectedInvoices([]);
      setBulkActionDialog({ open: false, action: '' });
    } finally {
      setLoading(false);
    }
  }, [selectedInvoices, invoices]);

  const handleMenuClick = useCallback((event: React.MouseEvent<HTMLElement>, invoiceId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoiceId(invoiceId);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedInvoiceId('');
  }, []);

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return 'default';
      case 'sent': return 'primary';
      case 'paid': return 'success';
      case 'overdue': return 'error';
      case 'cancelled': return 'secondary';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status: Invoice['paymentStatus']) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'partial': return 'info';
      case 'paid': return 'success';
      case 'failed': return 'error';
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
          Invoice Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive invoice management with e-invoice and e-way bill generation capabilities
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3} md={2}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary.main">
                {invoiceSummary.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Invoices
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="warning.main">
                {invoiceSummary.sent}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="success.main">
                {invoiceSummary.paid}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Paid
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="error.main">
                {invoiceSummary.overdue}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overdue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="info.main">
                {invoiceSummary.eInvoicesGenerated}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                E-Invoices
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3} md={2}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="secondary.main">
                {invoiceSummary.eWayBillsGenerated}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                E-Way Bills
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  label="Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="B2B">B2B</MenuItem>
                  <MenuItem value="B2C">B2C</MenuItem>
                  <MenuItem value="Export">Export</MenuItem>
                  <MenuItem value="SEZ">SEZ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setInvoiceDialog({ open: true, mode: 'create' })}
                >
                  New Invoice
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CloudUpload />}
                >
                  Bulk Import
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<GetApp />}
                >
                  Export All
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Bulk Actions */}
          {selectedInvoices.length > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  {selectedInvoices.length} invoice(s) selected
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<QrCode />}
                    onClick={() => setBulkActionDialog({ open: true, action: 'generate-einvoice' })}
                  >
                    Generate E-Invoices
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Receipt />}
                    onClick={() => setBulkActionDialog({ open: true, action: 'generate-ewaybill' })}
                  >
                    Generate E-Way Bills
                  </Button>
                  <Button
                    size="small"
                    startIcon={<Send />}
                    onClick={() => setBulkActionDialog({ open: true, action: 'mark-sent' })}
                  >
                    Mark as Sent
                  </Button>
                  <Button
                    size="small"
                    startIcon={<GetApp />}
                    onClick={() => setBulkActionDialog({ open: true, action: 'export' })}
                  >
                    Export Selected
                  </Button>
                </Box>
              </Box>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label={`All Invoices (${filteredInvoices.length})`} />
              <Tab label="Drafts" />
              <Tab label="E-Invoice Status" />
              <Tab label="Payment Tracking" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedInvoices.length === filteredInvoices.length && filteredInvoices.length > 0}
                        indeterminate={selectedInvoices.length > 0 && selectedInvoices.length < filteredInvoices.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </TableCell>
                    <TableCell><strong>Invoice #</strong></TableCell>
                    <TableCell><strong>Customer</strong></TableCell>
                    <TableCell align="right"><strong>Amount</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Payment</strong></TableCell>
                    <TableCell><strong>E-Invoice</strong></TableCell>
                    <TableCell><strong>E-Way Bill</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={(e) => handleSelectInvoice(invoice.id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {invoice.invoiceNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {invoice.invoiceDate}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {invoice.customerName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {invoice.customerGstin}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(invoice.totalAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="small"
                          label={invoice.status.toUpperCase()}
                          color={getStatusColor(invoice.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="small"
                          label={invoice.paymentStatus.toUpperCase()}
                          color={getPaymentStatusColor(invoice.paymentStatus)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {invoice.eInvoiceDetails ? (
                          <Tooltip title={`IRN: ${invoice.eInvoiceDetails.irn}`}>
                            <Chip 
                              size="small"
                              icon={<CheckCircle />}
                              label="Generated"
                              color="success"
                              variant="outlined"
                            />
                          </Tooltip>
                        ) : (
                          <Chip 
                            size="small"
                            label="Pending"
                            color="default"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {invoice.eWayBillDetails ? (
                          <Tooltip title={`EWB: ${invoice.eWayBillDetails.ewbNo}`}>
                            <Chip 
                              size="small"
                              icon={<CheckCircle />}
                              label="Generated"
                              color="success"
                              variant="outlined"
                            />
                          </Tooltip>
                        ) : (
                          <Chip 
                            size="small"
                            label="Not Required"
                            color="default"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, invoice.id)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredInvoices.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Receipt sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No invoices found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create your first invoice or adjust your filters
                </Typography>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Draft Invoices ({invoices.filter(inv => inv.status === 'draft').length})
            </Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Complete your draft invoices to send them to customers and generate e-invoices.
              </Typography>
            </Alert>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Invoice #</strong></TableCell>
                    <TableCell><strong>Customer</strong></TableCell>
                    <TableCell align="right"><strong>Amount</strong></TableCell>
                    <TableCell><strong>Created</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.filter(inv => inv.status === 'draft').map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell align="right">{formatCurrency(invoice.totalAmount)}</TableCell>
                      <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="Edit">
                            <IconButton size="small">
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Send">
                            <IconButton size="small">
                              <Send />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error">
                              <Delete />
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

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              E-Invoice Status Overview
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      E-Invoice Generation Status
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Generated</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {invoiceSummary.eInvoicesGenerated}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(invoiceSummary.eInvoicesGenerated / invoiceSummary.total) * 100}
                        color="success"
                        sx={{ mb: 2 }}
                      />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Pending</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {invoiceSummary.total - invoiceSummary.eInvoicesGenerated}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={((invoiceSummary.total - invoiceSummary.eInvoicesGenerated) / invoiceSummary.total) * 100}
                        color="warning"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Compliance Requirements
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <FormControlLabel
                        control={<Switch checked disabled />}
                        label="E-Invoice mandatory for B2B transactions"
                      />
                      <FormControlLabel
                        control={<Switch checked disabled />}
                        label="QR Code generation enabled"
                      />
                      <FormControlLabel
                        control={<Switch checked={false} disabled />}
                        label="Auto e-way bill generation"
                      />
                      <FormControlLabel
                        control={<Switch checked disabled />}
                        label="Digital signature integration"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">
                  Detailed E-Invoice Status ({invoices.filter(inv => inv.eInvoiceDetails).length} invoices)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Invoice #</strong></TableCell>
                        <TableCell><strong>IRN</strong></TableCell>
                        <TableCell><strong>Ack No</strong></TableCell>
                        <TableCell><strong>Generated Date</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell align="center"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoices.filter(inv => inv.eInvoiceDetails).map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>{invoice.invoiceNumber}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {invoice.eInvoiceDetails?.irn.substring(0, 20)}...
                            </Typography>
                          </TableCell>
                          <TableCell>{invoice.eInvoiceDetails?.ackNo}</TableCell>
                          <TableCell>
                            {new Date(invoice.eInvoiceDetails?.ackDate || '').toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              size="small"
                              label={invoice.eInvoiceDetails?.status.toUpperCase()}
                              color="success"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Download QR Code">
                              <IconButton size="small">
                                <QrCode />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Copy IRN">
                              <IconButton size="small">
                                <ContentCopy />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Payment Tracking & Follow-up
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {formatCurrency(invoiceSummary.pendingAmount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Outstanding Amount
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {formatCurrency(invoiceSummary.paidAmount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Collected Amount
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main">
                      {invoiceSummary.overdue}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overdue Invoices
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <TableContainer sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Invoice #</strong></TableCell>
                    <TableCell><strong>Customer</strong></TableCell>
                    <TableCell align="right"><strong>Amount</strong></TableCell>
                    <TableCell><strong>Due Date</strong></TableCell>
                    <TableCell><strong>Days Overdue</strong></TableCell>
                    <TableCell><strong>Payment Status</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.filter(inv => inv.paymentStatus === 'pending').map((invoice) => {
                    const daysOverdue = Math.max(0, Math.floor((Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)));
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell align="right">{formatCurrency(invoice.totalAmount)}</TableCell>
                        <TableCell>{invoice.dueDate}</TableCell>
                        <TableCell>
                          {daysOverdue > 0 ? (
                            <Chip 
                              size="small" 
                              label={`${daysOverdue} days`}
                              color="error"
                            />
                          ) : (
                            <Chip 
                              size="small" 
                              label="Current"
                              color="success"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            size="small"
                            label={invoice.paymentStatus.toUpperCase()}
                            color={getPaymentStatusColor(invoice.paymentStatus)}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                            <Tooltip title="Send Reminder">
                              <IconButton size="small">
                                <Email />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Record Payment">
                              <IconButton size="small" color="success">
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><Visibility /></ListItemIcon>
          <ListItemText>View Invoice</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><Edit /></ListItemIcon>
          <ListItemText>Edit Invoice</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><ContentCopy /></ListItemIcon>
          <ListItemText>Duplicate</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><QrCode /></ListItemIcon>
          <ListItemText>Generate E-Invoice</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><Receipt /></ListItemIcon>
          <ListItemText>Generate E-Way Bill</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><Email /></ListItemIcon>
          <ListItemText>Email to Customer</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><Print /></ListItemIcon>
          <ListItemText>Print Invoice</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><GetApp /></ListItemIcon>
          <ListItemText>Download PDF</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><Archive /></ListItemIcon>
          <ListItemText>Archive</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <ListItemIcon><Delete color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Bulk Action Dialog */}
      <Dialog 
        open={bulkActionDialog.open} 
        onClose={() => setBulkActionDialog({ open: false, action: '' })}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          Confirm Bulk Action
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            {bulkActionDialog.action === 'generate-einvoice' && 
              `Generate e-invoices for ${selectedInvoices.length} selected invoice(s)?`}
            {bulkActionDialog.action === 'generate-ewaybill' && 
              `Generate e-way bills for ${selectedInvoices.length} selected invoice(s)?`}
            {bulkActionDialog.action === 'mark-sent' && 
              `Mark ${selectedInvoices.length} selected invoice(s) as sent?`}
            {bulkActionDialog.action === 'export' && 
              `Export ${selectedInvoices.length} selected invoice(s) to Excel?`}
          </Typography>
          
          {loading && (
            <LinearProgress sx={{ mt: 2 }} />
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setBulkActionDialog({ open: false, action: '' })}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleBulkAction(bulkActionDialog.action)}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setInvoiceDialog({ open: true, mode: 'create' })}
      >
        <Add />
      </Fab>
    </Box>
  );
}