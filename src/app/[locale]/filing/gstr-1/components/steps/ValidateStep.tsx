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
  Chip,
  IconButton,
  Button,
  Alert,
  Tabs,
  Tab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse
} from '@mui/material';
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Build as AutoFixIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { FilingData, InvoiceData } from '../FilingWizard';

interface ValidateStepProps {
  data: FilingData;
  onUpdate: (updates: Partial<FilingData>) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

interface ValidationRule {
  field: keyof InvoiceData;
  message: string;
  severity: 'error' | 'warning';
  autoFix?: (invoice: InvoiceData) => Partial<InvoiceData>;
}

const validationRules: ValidationRule[] = [
  {
    field: 'invoiceNumber',
    message: 'Invoice number is required',
    severity: 'error'
  },
  {
    field: 'invoiceDate',
    message: 'Invoice date is required',
    severity: 'error'
  },
  {
    field: 'customerName',
    message: 'Customer name is required',
    severity: 'error'
  },
  {
    field: 'customerGSTIN',
    message: 'Invalid GSTIN format',
    severity: 'error'
  },
  {
    field: 'taxableValue',
    message: 'Taxable value must be greater than 0',
    severity: 'error'
  },
  {
    field: 'hsnCode',
    message: 'HSN code is required',
    severity: 'error'
  },
  {
    field: 'invoiceValue',
    message: 'Invoice value mismatch with taxable + tax amounts',
    severity: 'warning',
    autoFix: (invoice) => {
      const calculatedValue = invoice.taxableValue + invoice.cgstAmount + invoice.sgstAmount + invoice.igstAmount;
      return { invoiceValue: calculatedValue };
    }
  }
];

export const ValidateStep = ({ data, onUpdate, loading, setLoading }: ValidateStepProps) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [editDialog, setEditDialog] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceData | null>(null);
  const [expandedErrors, setExpandedErrors] = useState<string[]>([]);

  const invoicesByStatus = useMemo(() => {
    return {
      all: data.invoices,
      errors: data.invoices.filter(inv => inv.status === 'error'),
      warnings: data.invoices.filter(inv => inv.errors.some(error => 
        validationRules.find(rule => error.includes(rule.message))?.severity === 'warning'
      )),
      valid: data.invoices.filter(inv => inv.status === 'validated')
    };
  }, [data.invoices]);

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  }, []);

  const validateInvoice = useCallback((invoice: InvoiceData): InvoiceData => {
    const errors: string[] = [];
    
    // Apply validation rules
    for (const rule of validationRules) {
      let hasError = false;
      
      switch (rule.field) {
        case 'invoiceNumber':
        case 'invoiceDate':
        case 'customerName':
        case 'hsnCode':
          hasError = !invoice[rule.field] || invoice[rule.field] === '';
          break;
        case 'customerGSTIN':
          if (invoice.customerGSTIN) {
            hasError = !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(invoice.customerGSTIN);
          }
          break;
        case 'taxableValue':
          hasError = !invoice.taxableValue || invoice.taxableValue <= 0;
          break;
        case 'invoiceValue':
          const calculatedTotal = invoice.taxableValue + invoice.cgstAmount + invoice.sgstAmount + invoice.igstAmount;
          hasError = Math.abs(calculatedTotal - invoice.invoiceValue) > 1;
          break;
      }
      
      if (hasError) {
        errors.push(rule.message);
      }
    }
    
    return {
      ...invoice,
      errors,
      status: errors.length > 0 ? 'error' : 'validated'
    };
  }, []);

  const handleEditInvoice = useCallback((invoice: InvoiceData) => {
    setEditingInvoice({ ...invoice });
    setEditDialog(true);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingInvoice) return;
    
    const validatedInvoice = validateInvoice(editingInvoice);
    const updatedInvoices = data.invoices.map(inv => 
      inv.id === editingInvoice.id ? validatedInvoice : inv
    );
    
    // Update summary
    const summary = {
      totalInvoices: updatedInvoices.length,
      totalValue: updatedInvoices.reduce((sum, inv) => sum + inv.invoiceValue, 0),
      totalTax: updatedInvoices.reduce((sum, inv) => sum + inv.cgstAmount + inv.sgstAmount + inv.igstAmount, 0),
      validatedCount: updatedInvoices.filter(inv => inv.status === 'validated').length,
      errorCount: updatedInvoices.filter(inv => inv.status === 'error').length
    };
    
    onUpdate({
      invoices: updatedInvoices,
      summary
    });
    
    setEditDialog(false);
    setEditingInvoice(null);
  }, [editingInvoice, data.invoices, onUpdate, validateInvoice]);

  const handleAutoFix = useCallback((invoice: InvoiceData, rule: ValidationRule) => {
    if (!rule.autoFix) return;
    
    const fixes = rule.autoFix(invoice);
    const updatedInvoice = { ...invoice, ...fixes };
    const validatedInvoice = validateInvoice(updatedInvoice);
    
    const updatedInvoices = data.invoices.map(inv => 
      inv.id === invoice.id ? validatedInvoice : inv
    );
    
    // Update summary
    const summary = {
      totalInvoices: updatedInvoices.length,
      totalValue: updatedInvoices.reduce((sum, inv) => sum + inv.invoiceValue, 0),
      totalTax: updatedInvoices.reduce((sum, inv) => sum + inv.cgstAmount + inv.sgstAmount + inv.igstAmount, 0),
      validatedCount: updatedInvoices.filter(inv => inv.status === 'validated').length,
      errorCount: updatedInvoices.filter(inv => inv.status === 'error').length
    };
    
    onUpdate({
      invoices: updatedInvoices,
      summary
    });
  }, [data.invoices, onUpdate, validateInvoice]);

  const handleAutoFixAll = useCallback(() => {
    setLoading(true);
    
    setTimeout(() => {
      const updatedInvoices = data.invoices.map(invoice => {
        let updatedInvoice = { ...invoice };
        
        // Apply all available auto-fixes
        for (const rule of validationRules) {
          if (rule.autoFix && invoice.errors.includes(rule.message)) {
            const fixes = rule.autoFix(updatedInvoice);
            updatedInvoice = { ...updatedInvoice, ...fixes };
          }
        }
        
        return validateInvoice(updatedInvoice);
      });
      
      // Update summary
      const summary = {
        totalInvoices: updatedInvoices.length,
        totalValue: updatedInvoices.reduce((sum, inv) => sum + inv.invoiceValue, 0),
        totalTax: updatedInvoices.reduce((sum, inv) => sum + inv.cgstAmount + inv.sgstAmount + inv.igstAmount, 0),
        validatedCount: updatedInvoices.filter(inv => inv.status === 'validated').length,
        errorCount: updatedInvoices.filter(inv => inv.status === 'error').length
      };
      
      onUpdate({
        invoices: updatedInvoices,
        summary
      });
      
      setLoading(false);
    }, 1000);
  }, [data.invoices, onUpdate, setLoading, validateInvoice]);

  const toggleErrorExpansion = useCallback((invoiceId: string) => {
    setExpandedErrors(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  }, []);

  const getDisplayInvoices = () => {
    switch (currentTab) {
      case 1: return invoicesByStatus.errors;
      case 2: return invoicesByStatus.warnings;
      case 3: return invoicesByStatus.valid;
      default: return invoicesByStatus.all;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Validate Invoice Data
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and fix any data errors before proceeding to categorization.
          </Typography>
        </Box>
        
        {data.summary.errorCount > 0 && (
          <Button
            startIcon={<AutoFixIcon />}
            onClick={handleAutoFixAll}
            variant="contained"
            color="secondary"
            disabled={loading}
          >
            {loading ? 'Fixing...' : 'Auto-Fix Issues'}
          </Button>
        )}
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary">
                {data.summary.totalInvoices}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Invoices
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="success.main">
                {data.summary.validatedCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Valid
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="error.main">
                {data.summary.errorCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Errors
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="warning.main">
                {invoicesByStatus.warnings.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Warnings
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status Alert */}
      {data.summary.errorCount > 0 ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {data.summary.errorCount} invoices have validation errors that must be fixed before proceeding.
        </Alert>
      ) : (
        <Alert severity="success" sx={{ mb: 3 }}>
          All invoices have been validated successfully!
        </Alert>
      )}

      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label={`All (${invoicesByStatus.all.length})`} />
          <Tab 
            label={`Errors (${invoicesByStatus.errors.length})`}
            icon={invoicesByStatus.errors.length > 0 ? <ErrorIcon color="error" /> : undefined}
          />
          <Tab 
            label={`Warnings (${invoicesByStatus.warnings.length})`}
            icon={invoicesByStatus.warnings.length > 0 ? <WarningIcon color="warning" /> : undefined}
          />
          <Tab 
            label={`Valid (${invoicesByStatus.valid.length})`}
            icon={invoicesByStatus.valid.length > 0 ? <SuccessIcon color="success" /> : undefined}
          />
        </Tabs>
      </Box>

      {/* Invoice Table */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell align="right">Value</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Issues</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getDisplayInvoices().map((invoice) => (
              <>
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.invoiceDate}</TableCell>
                  <TableCell>{invoice.customerName}</TableCell>
                  <TableCell align="right">
                    ₹{invoice.invoiceValue.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={invoice.status === 'validated' ? <SuccessIcon /> : <ErrorIcon />}
                      label={invoice.status}
                      color={invoice.status === 'validated' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {invoice.errors.length > 0 && (
                      <Button
                        size="small"
                        onClick={() => toggleErrorExpansion(invoice.id)}
                        endIcon={expandedErrors.includes(invoice.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      >
                        {invoice.errors.length} issues
                      </Button>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditInvoice(invoice)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
                
                {/* Error Details Row */}
                {invoice.errors.length > 0 && (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ py: 0 }}>
                      <Collapse in={expandedErrors.includes(invoice.id)}>
                        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <List dense>
                            {invoice.errors.map((error, index) => {
                              const rule = validationRules.find(r => error.includes(r.message));
                              return (
                                <ListItem key={index}>
                                  <ListItemIcon>
                                    <ErrorIcon color="error" fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText primary={error} />
                                  {rule?.autoFix && (
                                    <Button
                                      size="small"
                                      startIcon={<AutoFixIcon />}
                                      onClick={() => handleAutoFix(invoice, rule)}
                                    >
                                      Auto Fix
                                    </Button>
                                  )}
                                </ListItem>
                              );
                            })}
                          </List>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Invoice</DialogTitle>
        <DialogContent>
          {editingInvoice && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Invoice Number"
                  value={editingInvoice.invoiceNumber}
                  onChange={(e) => setEditingInvoice(prev => prev ? { ...prev, invoiceNumber: e.target.value } : null)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Invoice Date"
                  type="date"
                  value={editingInvoice.invoiceDate}
                  onChange={(e) => setEditingInvoice(prev => prev ? { ...prev, invoiceDate: e.target.value } : null)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  value={editingInvoice.customerName}
                  onChange={(e) => setEditingInvoice(prev => prev ? { ...prev, customerName: e.target.value } : null)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer GSTIN"
                  value={editingInvoice.customerGSTIN}
                  onChange={(e) => setEditingInvoice(prev => prev ? { ...prev, customerGSTIN: e.target.value } : null)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Taxable Value"
                  type="number"
                  value={editingInvoice.taxableValue}
                  onChange={(e) => setEditingInvoice(prev => prev ? { ...prev, taxableValue: parseFloat(e.target.value) || 0 } : null)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="HSN Code"
                  value={editingInvoice.hsnCode}
                  onChange={(e) => setEditingInvoice(prev => prev ? { ...prev, hsnCode: e.target.value } : null)}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};