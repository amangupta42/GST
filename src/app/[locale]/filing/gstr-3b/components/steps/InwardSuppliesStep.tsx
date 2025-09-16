'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Alert,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Upload as UploadIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudDownload as DownloadIcon
} from '@mui/icons-material';
import { GSTR3BData, InwardSupply } from '../GSTR3BWizard';
import { formatCurrency } from '@/lib/utils';

interface InwardSuppliesStepProps {
  data: GSTR3BData;
  onUpdate: (updates: Partial<GSTR3BData>) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const InwardSuppliesStep = ({ 
  data, 
  onUpdate, 
  loading, 
  setLoading 
}: InwardSuppliesStepProps) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [importingData, setImportingData] = useState(false);
  const [newSupply, setNewSupply] = useState<Partial<InwardSupply>>({
    gstin: '',
    invoiceNumber: '',
    invoiceDate: '',
    taxableValue: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    cessAmount: 0,
    itcClaimed: 0,
    itcReversed: 0
  });

  // Import from purchase register or 2A/2B
  const importInwardSupplies = useCallback(async () => {
    setImportingData(true);
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const mockInwardSupplies: InwardSupply[] = [
        {
          id: 'inward-001',
          gstin: '27AAAAA0000A1Z5',
          invoiceNumber: 'PUR-001',
          invoiceDate: '2024-01-15',
          taxableValue: 80000,
          cgstAmount: 7200,
          sgstAmount: 7200,
          igstAmount: 0,
          cessAmount: 0,
          itcClaimed: 14400,
          itcReversed: 0
        },
        {
          id: 'inward-002',
          gstin: '29BBBBB1111B2Z6',
          invoiceNumber: 'PUR-002',
          invoiceDate: '2024-01-20',
          taxableValue: 60000,
          cgstAmount: 5400,
          sgstAmount: 5400,
          igstAmount: 0,
          cessAmount: 0,
          itcClaimed: 10800,
          itcReversed: 0
        },
        {
          id: 'inward-003',
          gstin: '33CCCCC2222C3Z7',
          invoiceNumber: 'PUR-003',
          invoiceDate: '2024-01-25',
          taxableValue: 45000,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 8100,
          cessAmount: 0,
          itcClaimed: 8100,
          itcReversed: 0
        }
      ];
      
      const totalInwardTurnover = mockInwardSupplies.reduce(
        (sum, supply) => sum + supply.taxableValue, 0
      );
      
      onUpdate({
        inwardSupplies: [...data.inwardSupplies, ...mockInwardSupplies],
        summary: {
          ...data.summary,
          totalInwardTurnover,
          pendingReconciliation: mockInwardSupplies.length
        }
      });
      
    } catch (error) {
      console.error('Failed to import inward supplies:', error);
    } finally {
      setImportingData(false);
      setLoading(false);
    }
  }, [data.inwardSupplies, data.summary, onUpdate, setLoading]);

  const handleAddSupply = useCallback(() => {
    if (newSupply.gstin && newSupply.invoiceNumber && newSupply.taxableValue) {
      const supply: InwardSupply = {
        id: `inward-${Date.now()}`,
        gstin: newSupply.gstin!,
        invoiceNumber: newSupply.invoiceNumber!,
        invoiceDate: newSupply.invoiceDate!,
        taxableValue: newSupply.taxableValue!,
        cgstAmount: newSupply.cgstAmount!,
        sgstAmount: newSupply.sgstAmount!,
        igstAmount: newSupply.igstAmount!,
        cessAmount: newSupply.cessAmount!,
        itcClaimed: newSupply.itcClaimed!,
        itcReversed: newSupply.itcReversed!
      };
      
      onUpdate({
        inwardSupplies: [...data.inwardSupplies, supply],
        summary: {
          ...data.summary,
          totalInwardTurnover: data.summary.totalInwardTurnover + supply.taxableValue,
          pendingReconciliation: data.summary.pendingReconciliation + 1
        }
      });
      
      setNewSupply({
        gstin: '',
        invoiceNumber: '',
        invoiceDate: '',
        taxableValue: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        cessAmount: 0,
        itcClaimed: 0,
        itcReversed: 0
      });
      setAddDialogOpen(false);
    }
  }, [newSupply, data.inwardSupplies, data.summary, onUpdate]);

  const suppliesByStatus = useMemo(() => {
    return {
      all: data.inwardSupplies,
      matched: data.inwardSupplies.filter(s => s.itcClaimed > 0),
      unmatched: data.inwardSupplies.filter(s => s.itcClaimed === 0),
      reversed: data.inwardSupplies.filter(s => s.itcReversed > 0)
    };
  }, [data.inwardSupplies]);

  const summary = useMemo(() => {
    const totals = {
      totalTaxableValue: 0,
      totalTax: 0,
      totalITCClaimed: 0,
      totalITCReversed: 0
    };

    data.inwardSupplies.forEach(supply => {
      const totalTax = supply.cgstAmount + supply.sgstAmount + supply.igstAmount + supply.cessAmount;
      totals.totalTaxableValue += supply.taxableValue;
      totals.totalTax += totalTax;
      totals.totalITCClaimed += supply.itcClaimed;
      totals.totalITCReversed += supply.itcReversed;
    });

    return totals;
  }, [data.inwardSupplies]);

  const getDisplaySupplies = () => {
    switch (currentTab) {
      case 1: return suppliesByStatus.matched;
      case 2: return suppliesByStatus.unmatched;
      case 3: return suppliesByStatus.reversed;
      default: return suppliesByStatus.all;
    }
  };

  const downloadTemplate = useCallback(() => {
    const csvContent = [
      'GSTIN,Invoice Number,Invoice Date,Taxable Value,CGST Amount,SGST Amount,IGST Amount,Cess Amount,ITC Claimed,ITC Reversed',
      '27AAAAA0000A1Z5,PUR-001,2024-01-15,50000,4500,4500,0,0,9000,0'
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GSTR3B_Inward_Supplies_Template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Inward Supplies & Input Tax Credit
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Import your purchase invoices and reconcile with GSTR-2A/2B data
        </Typography>
      </Box>

      {/* Import Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <UploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="subtitle1" gutterBottom>
                Import from Purchase Register
              </Typography>
              <Button
                onClick={importInwardSupplies}
                disabled={importingData || loading}
                variant="contained"
                size="small"
                fullWidth
              >
                {importingData ? (
                  <>
                    <LinearProgress sx={{ width: 60, mr: 1 }} />
                    Importing...
                  </>
                ) : (
                  'Import Data'
                )}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <AddIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
              <Typography variant="subtitle1" gutterBottom>
                Add Manual Entry
              </Typography>
              <Button
                onClick={() => setAddDialogOpen(true)}
                disabled={loading}
                variant="outlined"
                size="small"
                fullWidth
              >
                Add Supply
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <DownloadIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="subtitle1" gutterBottom>
                Download Template
              </Typography>
              <Button
                onClick={downloadTemplate}
                variant="outlined"
                color="success"
                size="small"
                fullWidth
              >
                Download CSV
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {data.inwardSupplies.length > 0 && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(summary.totalTaxableValue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Purchases
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(summary.totalITCClaimed)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ITC Claimed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="warning.main">
                    {formatCurrency(summary.totalITCReversed)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ITC Reversed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="error.main">
                    {data.summary.pendingReconciliation}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Reconciliation
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filter Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} variant="scrollable">
              <Tab label={`All (${suppliesByStatus.all.length})`} />
              <Tab label={`Matched (${suppliesByStatus.matched.length})`} />
              <Tab label={`Unmatched (${suppliesByStatus.unmatched.length})`} />
              <Tab label={`Reversed (${suppliesByStatus.reversed.length})`} />
            </Tabs>
          </Box>

          {/* Supplies Table */}
          <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>GSTIN</TableCell>
                  <TableCell>Invoice Details</TableCell>
                  <TableCell align="right">Taxable Value</TableCell>
                  <TableCell align="right">Total Tax</TableCell>
                  <TableCell align="right">ITC Claimed</TableCell>
                  <TableCell align="right">ITC Reversed</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getDisplaySupplies().map((supply) => (
                  <TableRow key={supply.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {supply.gstin}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {supply.invoiceNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(supply.invoiceDate).toLocaleDateString('en-IN')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(supply.taxableValue)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(
                        supply.cgstAmount + supply.sgstAmount + supply.igstAmount + supply.cessAmount
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        color={supply.itcClaimed > 0 ? 'success.main' : 'text.secondary'}
                        fontWeight={supply.itcClaimed > 0 ? 'bold' : 'normal'}
                      >
                        {formatCurrency(supply.itcClaimed)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        color={supply.itcReversed > 0 ? 'error.main' : 'text.secondary'}
                      >
                        {formatCurrency(supply.itcReversed)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={
                          supply.itcReversed > 0 ? 'Reversed' :
                          supply.itcClaimed > 0 ? 'Matched' : 'Unmatched'
                        }
                        size="small"
                        color={
                          supply.itcReversed > 0 ? 'error' :
                          supply.itcClaimed > 0 ? 'success' : 'warning'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Add Supply Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Inward Supply</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Supplier GSTIN"
                  value={newSupply.gstin}
                  onChange={(e) => setNewSupply(prev => ({ ...prev, gstin: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Invoice Number"
                  value={newSupply.invoiceNumber}
                  onChange={(e) => setNewSupply(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Invoice Date"
                  type="date"
                  value={newSupply.invoiceDate}
                  onChange={(e) => setNewSupply(prev => ({ ...prev, invoiceDate: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Taxable Value"
                  type="number"
                  value={newSupply.taxableValue}
                  onChange={(e) => setNewSupply(prev => ({ ...prev, taxableValue: Number(e.target.value) }))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="CGST Amount"
                  type="number"
                  value={newSupply.cgstAmount}
                  onChange={(e) => setNewSupply(prev => ({ ...prev, cgstAmount: Number(e.target.value) }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="SGST Amount"
                  type="number"
                  value={newSupply.sgstAmount}
                  onChange={(e) => setNewSupply(prev => ({ ...prev, sgstAmount: Number(e.target.value) }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="IGST Amount"
                  type="number"
                  value={newSupply.igstAmount}
                  onChange={(e) => setNewSupply(prev => ({ ...prev, igstAmount: Number(e.target.value) }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label="Cess Amount"
                  type="number"
                  value={newSupply.cessAmount}
                  onChange={(e) => setNewSupply(prev => ({ ...prev, cessAmount: Number(e.target.value) }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="ITC Claimed"
                  type="number"
                  value={newSupply.itcClaimed}
                  onChange={(e) => setNewSupply(prev => ({ ...prev, itcClaimed: Number(e.target.value) }))}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="ITC Reversed"
                  type="number"
                  value={newSupply.itcReversed}
                  onChange={(e) => setNewSupply(prev => ({ ...prev, itcReversed: Number(e.target.value) }))}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSupply} variant="contained">Add Supply</Button>
        </DialogActions>
      </Dialog>

      {/* Status Alert */}
      {data.inwardSupplies.length > 0 ? (
        <Alert 
          severity={data.summary.pendingReconciliation > 0 ? 'warning' : 'success'} 
          sx={{ mt: 3 }}
        >
          {data.summary.pendingReconciliation > 0 
            ? `${data.summary.pendingReconciliation} supplies need reconciliation with GSTR-2A/2B before proceeding.`
            : 'All inward supplies have been reconciled successfully!'
          }
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mt: 3 }}>
          Import your purchase invoices to calculate Input Tax Credit for GSTR-3B filing.
        </Alert>
      )}
    </Box>
  );
};