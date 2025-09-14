'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  GetApp as DownloadIcon,
  Description as FileIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { FormFileUpload } from '@/components/forms';
import { FilingData, InvoiceData } from '../FilingWizard';

interface UploadStepProps {
  data: FilingData;
  onUpdate: (updates: Partial<FilingData>) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const UploadStep = ({ data, onUpdate, onNext, loading, setLoading }: UploadStepProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const downloadTemplate = useCallback(() => {
    // Create CSV template
    const template = [
      'Invoice Number,Invoice Date,Customer Name,Customer GSTIN,Place of Supply,Invoice Value,Taxable Value,CGST Rate,CGST Amount,SGST Rate,SGST Amount,IGST Rate,IGST Amount,HSN Code,Description,Quantity,Rate',
      'INV001,2024-01-15,ABC Pvt Ltd,27AAAAA0000A1Z5,Maharashtra,11800,10000,9,900,9,900,0,0,1001,Computer Services,1,10000',
      'INV002,2024-01-16,XYZ Corp,29BBBBB1111B2Y6,Karnataka,5900,5000,0,0,0,0,18,900,2001,Software License,1,5000'
    ];
    
    const csvContent = template.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GSTR1_Invoice_Template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }, []);

  const parseCSVFile = useCallback(async (file: File): Promise<InvoiceData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim());
          
          const invoices: InvoiceData[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length < headers.length) continue;
            
            const invoice: InvoiceData = {
              id: `inv-${Date.now()}-${i}`,
              invoiceNumber: values[0] || '',
              invoiceDate: values[1] || '',
              customerName: values[2] || '',
              customerGSTIN: values[3] || '',
              placeOfSupply: values[4] || '',
              invoiceValue: parseFloat(values[5]) || 0,
              taxableValue: parseFloat(values[6]) || 0,
              cgstRate: parseFloat(values[7]) || 0,
              cgstAmount: parseFloat(values[8]) || 0,
              sgstRate: parseFloat(values[9]) || 0,
              sgstAmount: parseFloat(values[10]) || 0,
              igstRate: parseFloat(values[11]) || 0,
              igstAmount: parseFloat(values[12]) || 0,
              hsnCode: values[13] || '',
              description: values[14] || '',
              quantity: parseFloat(values[15]) || 1,
              rate: parseFloat(values[16]) || 0,
              category: '',
              errors: [],
              status: 'pending'
            };
            
            invoices.push(invoice);
          }
          
          resolve(invoices);
        } catch (error) {
          reject(new Error('Failed to parse CSV file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, []);

  const validateInvoiceData = useCallback((invoices: InvoiceData[]): InvoiceData[] => {
    return invoices.map(invoice => {
      const errors: string[] = [];
      
      // Required field validations
      if (!invoice.invoiceNumber) errors.push('Invoice number is required');
      if (!invoice.invoiceDate) errors.push('Invoice date is required');
      if (!invoice.customerName) errors.push('Customer name is required');
      if (!invoice.taxableValue || invoice.taxableValue <= 0) errors.push('Valid taxable value is required');
      if (!invoice.hsnCode) errors.push('HSN code is required');
      
      // GSTIN validation (basic)
      if (invoice.customerGSTIN && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(invoice.customerGSTIN)) {
        errors.push('Invalid GSTIN format');
      }
      
      // Tax calculation validation
      const calculatedTotal = invoice.taxableValue + invoice.cgstAmount + invoice.sgstAmount + invoice.igstAmount;
      if (Math.abs(calculatedTotal - invoice.invoiceValue) > 1) {
        errors.push('Invoice value does not match taxable value + tax amounts');
      }
      
      return {
        ...invoice,
        errors,
        status: errors.length > 0 ? 'error' : 'validated'
      };
    });
  }, []);

  const handleFileUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    
    setLoading(true);
    try {
      let allInvoices: InvoiceData[] = [...data.invoices];
      
      for (const file of files) {
        if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
          const invoices = await parseCSVFile(file);
          allInvoices = [...allInvoices, ...invoices];
        } else {
          // Handle Excel files (simplified for now)
          console.log('Excel file support coming soon');
        }
      }
      
      // Validate all invoices
      const validatedInvoices = validateInvoiceData(allInvoices);
      
      // Update summary
      const summary = {
        totalInvoices: validatedInvoices.length,
        totalValue: validatedInvoices.reduce((sum, inv) => sum + inv.invoiceValue, 0),
        totalTax: validatedInvoices.reduce((sum, inv) => sum + inv.cgstAmount + inv.sgstAmount + inv.igstAmount, 0),
        validatedCount: validatedInvoices.filter(inv => inv.status === 'validated').length,
        errorCount: validatedInvoices.filter(inv => inv.status === 'error').length
      };
      
      onUpdate({
        invoices: validatedInvoices,
        summary
      });
      
      setUploadedFiles(files);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  }, [data.invoices, onUpdate, setLoading, parseCSVFile, validateInvoiceData]);

  const handlePreview = useCallback(() => {
    setPreviewData(data.invoices.slice(0, 10)); // Show first 10 invoices
    setPreviewDialog(true);
  }, [data.invoices]);

  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllData = useCallback(() => {
    onUpdate({
      invoices: [],
      summary: {
        totalInvoices: 0,
        totalValue: 0,
        totalTax: 0,
        validatedCount: 0,
        errorCount: 0
      }
    });
    setUploadedFiles([]);
  }, [onUpdate]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload Invoice Data
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload your sales invoices via CSV/Excel file or use our template to get started.
      </Typography>

      <Grid container spacing={3}>
        {/* Upload Section */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  File Upload
                </Typography>
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={downloadTemplate}
                  variant="outlined"
                  size="small"
                >
                  Download Template
                </Button>
              </Box>
              
              <FormFileUpload
                label="Upload CSV or Excel Files"
                accept=".csv,.xlsx,.xls"
                multiple
                maxSize={10}
                onChange={handleFileUpload}
                helperText="Supported formats: CSV, Excel (.xlsx, .xls). Max file size: 10MB"
              />
              
              {uploadedFiles.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Uploaded Files:
                  </Typography>
                  <List dense>
                    {uploadedFiles.map((file, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <FileIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={file.name}
                          secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                        />
                        <IconButton 
                          size="small" 
                          onClick={() => removeFile(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Section */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload Summary
              </Typography>
              
              {data.summary.totalInvoices > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Total Invoices:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {data.summary.totalInvoices}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Total Value:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      ₹{data.summary.totalValue.toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Total Tax:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      ₹{data.summary.totalTax.toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SuccessIcon color="success" fontSize="small" />
                      <Typography variant="body2">Valid:</Typography>
                    </Box>
                    <Chip 
                      label={data.summary.validatedCount} 
                      color="success" 
                      size="small"
                    />
                  </Box>
                  
                  {data.summary.errorCount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ErrorIcon color="error" fontSize="small" />
                        <Typography variant="body2">Errors:</Typography>
                      </Box>
                      <Chip 
                        label={data.summary.errorCount} 
                        color="error" 
                        size="small"
                      />
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      startIcon={<ViewIcon />}
                      onClick={handlePreview}
                      variant="outlined"
                      size="small"
                      fullWidth
                    >
                      Preview Data
                    </Button>
                  </Box>
                  
                  <Button
                    onClick={clearAllData}
                    variant="text"
                    color="error"
                    size="small"
                  >
                    Clear All Data
                  </Button>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No data uploaded yet. Use the template or upload your CSV/Excel file to get started.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status Alert */}
      {data.summary.totalInvoices > 0 && (
        <Alert 
          severity={data.summary.errorCount > 0 ? "warning" : "success"} 
          sx={{ mt: 3 }}
        >
          {data.summary.errorCount > 0 
            ? `${data.summary.validatedCount} invoices uploaded successfully, ${data.summary.errorCount} require attention.`
            : `All ${data.summary.totalInvoices} invoices uploaded successfully!`
          }
        </Alert>
      )}

      {/* Preview Dialog */}
      <Dialog 
        open={previewDialog} 
        onClose={() => setPreviewDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Invoice Data Preview (First 10 records)
        </DialogTitle>
        <DialogContent>
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Invoice #</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Value</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((invoice, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{invoice.invoiceNumber}</td>
                    <td style={{ padding: '8px' }}>{invoice.invoiceDate}</td>
                    <td style={{ padding: '8px' }}>{invoice.customerName}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>
                      ₹{invoice.invoiceValue.toLocaleString()}
                    </td>
                    <td style={{ padding: '8px' }}>
                      <Chip 
                        label={invoice.status} 
                        color={invoice.status === 'validated' ? 'success' : 'error'}
                        size="small"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};