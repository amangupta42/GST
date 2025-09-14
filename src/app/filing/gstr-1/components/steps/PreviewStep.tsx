'use client';

import { useMemo } from 'react';
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
  Divider,
  Chip,
  Alert
} from '@mui/material';
import {
  Business as B2BIcon,
  Person as B2CIcon,
  Public as ExportIcon,
  Block as NilRatedIcon
} from '@mui/icons-material';
import { FilingData } from '../FilingWizard';
import { formatCurrency } from '@/lib/utils';

interface PreviewStepProps {
  data: FilingData;
  onUpdate: (updates: Partial<FilingData>) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const PreviewStep = ({ data }: PreviewStepProps) => {
  const summary = useMemo(() => {
    const categorySummary = {
      B2B: { count: 0, taxableValue: 0, cgst: 0, sgst: 0, igst: 0, total: 0 },
      B2C: { count: 0, taxableValue: 0, cgst: 0, sgst: 0, igst: 0, total: 0 },
      Export: { count: 0, taxableValue: 0, cgst: 0, sgst: 0, igst: 0, total: 0 },
      NilRated: { count: 0, taxableValue: 0, cgst: 0, sgst: 0, igst: 0, total: 0 }
    };

    data.invoices.forEach(invoice => {
      const category = invoice.category || 'B2B';
      if (category in categorySummary) {
        categorySummary[category as keyof typeof categorySummary].count++;
        categorySummary[category as keyof typeof categorySummary].taxableValue += invoice.taxableValue;
        categorySummary[category as keyof typeof categorySummary].cgst += invoice.cgstAmount;
        categorySummary[category as keyof typeof categorySummary].sgst += invoice.sgstAmount;
        categorySummary[category as keyof typeof categorySummary].igst += invoice.igstAmount;
        categorySummary[category as keyof typeof categorySummary].total += invoice.invoiceValue;
      }
    });

    const grandTotal = {
      count: data.invoices.length,
      taxableValue: Object.values(categorySummary).reduce((sum, cat) => sum + cat.taxableValue, 0),
      cgst: Object.values(categorySummary).reduce((sum, cat) => sum + cat.cgst, 0),
      sgst: Object.values(categorySummary).reduce((sum, cat) => sum + cat.sgst, 0),
      igst: Object.values(categorySummary).reduce((sum, cat) => sum + cat.igst, 0),
      total: Object.values(categorySummary).reduce((sum, cat) => sum + cat.total, 0)
    };

    return { categorySummary, grandTotal };
  }, [data.invoices]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'B2B': return <B2BIcon fontSize="small" />;
      case 'B2C': return <B2CIcon fontSize="small" />;
      case 'Export': return <ExportIcon fontSize="small" />;
      case 'NilRated': return <NilRatedIcon fontSize="small" />;
      default: return <B2BIcon fontSize="small" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'B2B': return 'Business to Business';
      case 'B2C': return 'Business to Consumer';
      case 'Export': return 'Export Sales';
      case 'NilRated': return 'Nil Rated Sales';
      default: return category;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Preview GSTR-1 Return
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review your GSTR-1 return summary before submission. Ensure all details are correct.
      </Typography>

      {/* Overall Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Return Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {summary.grandTotal.count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Invoices
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {formatCurrency(summary.grandTotal.taxableValue)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Taxable Value
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {formatCurrency(summary.grandTotal.cgst + summary.grandTotal.sgst + summary.grandTotal.igst)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Tax
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {formatCurrency(summary.grandTotal.total)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Value
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Category-wise Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Category-wise Breakdown
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell align="center">Invoices</TableCell>
                  <TableCell align="right">Taxable Value</TableCell>
                  <TableCell align="right">CGST</TableCell>
                  <TableCell align="right">SGST</TableCell>
                  <TableCell align="right">IGST</TableCell>
                  <TableCell align="right">Total Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(summary.categorySummary).map(([category, data]) => (
                  <TableRow key={category}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getCategoryIcon(category)}
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {category}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getCategoryLabel(category)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={data.count} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(data.taxableValue)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(data.cgst)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(data.sgst)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(data.igst)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(data.total)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={7}>
                    <Divider />
                  </TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    Grand Total
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    <Chip label={summary.grandTotal.count} color="primary" />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(summary.grandTotal.taxableValue)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(summary.grandTotal.cgst)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(summary.grandTotal.sgst)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(summary.grandTotal.igst)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(summary.grandTotal.total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* HSN-wise Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            HSN-wise Summary
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>HSN Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Taxable Value</TableCell>
                  <TableCell align="right">Tax Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(
                  data.invoices.reduce((acc, invoice) => {
                    const key = invoice.hsnCode;
                    if (!acc[key]) {
                      acc[key] = {
                        description: invoice.description,
                        quantity: 0,
                        taxableValue: 0,
                        taxAmount: 0
                      };
                    }
                    acc[key].quantity += invoice.quantity;
                    acc[key].taxableValue += invoice.taxableValue;
                    acc[key].taxAmount += invoice.cgstAmount + invoice.sgstAmount + invoice.igstAmount;
                    return acc;
                  }, {} as Record<string, any>)
                ).map(([hsnCode, hsnData]) => (
                  <TableRow key={hsnCode}>
                    <TableCell sx={{ fontWeight: 'medium' }}>
                      {hsnCode || 'Not specified'}
                    </TableCell>
                    <TableCell>{hsnData.description}</TableCell>
                    <TableCell align="right">{hsnData.quantity}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(hsnData.taxableValue)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(hsnData.taxAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Filing Information */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filing Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Return Period
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Filing Date
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {new Date().toLocaleDateString('en-IN')}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Return Type
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                GSTR-1 (Sales Return)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Chip label="Ready for Filing" color="success" size="small" />
            </Grid>
          </Grid>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            Please review all details carefully. Once submitted, amendments can only be made in subsequent returns or through amendment forms.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};