'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  AutoAwesome,
  CheckCircle,
  Warning,
  Sync,
  Assessment,
  AccountBalance,
  TrendingUp
} from '@mui/icons-material';
import { GSTR9Data } from '../GSTR9Wizard';

interface TaxDetailsStepProps {
  data: GSTR9Data;
  onUpdate: (updates: Partial<GSTR9Data>) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

interface TaxComparisonItem {
  description: string;
  gstr1Tax: number;
  gstr3bTax: number;
  difference: number;
  status: 'matched' | 'minor_difference' | 'major_difference';
  percentage: number;
}

export function TaxDetailsStep({ data, onUpdate, loading, setLoading }: TaxDetailsStepProps) {
  const [tabValue, setTabValue] = useState(0);
  const [reconciling, setReconciling] = useState(false);

  const taxComparison = useMemo((): TaxComparisonItem[] => {
    const cgstDiff = data.taxData.gstr1Tax.cgst - data.taxData.gstr3bTax.cgst;
    const sgstDiff = data.taxData.gstr1Tax.sgst - data.taxData.gstr3bTax.sgst;
    const igstDiff = data.taxData.gstr1Tax.igst - data.taxData.gstr3bTax.igst;
    const cessDiff = data.taxData.gstr1Tax.cess - data.taxData.gstr3bTax.cess;

    return [
      {
        description: 'Central GST (CGST)',
        gstr1Tax: data.taxData.gstr1Tax.cgst,
        gstr3bTax: data.taxData.gstr3bTax.cgst,
        difference: cgstDiff,
        status: Math.abs(cgstDiff) <= 5000 ? 'matched' : Math.abs(cgstDiff) <= 25000 ? 'minor_difference' : 'major_difference',
        percentage: data.taxData.gstr1Tax.cgst > 0 ? (cgstDiff / data.taxData.gstr1Tax.cgst) * 100 : 0
      },
      {
        description: 'State GST (SGST)',
        gstr1Tax: data.taxData.gstr1Tax.sgst,
        gstr3bTax: data.taxData.gstr3bTax.sgst,
        difference: sgstDiff,
        status: Math.abs(sgstDiff) <= 5000 ? 'matched' : Math.abs(sgstDiff) <= 25000 ? 'minor_difference' : 'major_difference',
        percentage: data.taxData.gstr1Tax.sgst > 0 ? (sgstDiff / data.taxData.gstr1Tax.sgst) * 100 : 0
      },
      {
        description: 'Integrated GST (IGST)',
        gstr1Tax: data.taxData.gstr1Tax.igst,
        gstr3bTax: data.taxData.gstr3bTax.igst,
        difference: igstDiff,
        status: Math.abs(igstDiff) <= 5000 ? 'matched' : Math.abs(igstDiff) <= 25000 ? 'minor_difference' : 'major_difference',
        percentage: data.taxData.gstr1Tax.igst > 0 ? (igstDiff / data.taxData.gstr1Tax.igst) * 100 : 0
      },
      {
        description: 'Compensation Cess',
        gstr1Tax: data.taxData.gstr1Tax.cess,
        gstr3bTax: data.taxData.gstr3bTax.cess,
        difference: cessDiff,
        status: Math.abs(cessDiff) <= 1000 ? 'matched' : Math.abs(cessDiff) <= 5000 ? 'minor_difference' : 'major_difference',
        percentage: data.taxData.gstr1Tax.cess > 0 ? (cessDiff / data.taxData.gstr1Tax.cess) * 100 : 0
      }
    ];
  }, [data.taxData]);

  const reconciliationStatus = useMemo(() => {
    const total = taxComparison.length;
    const matched = taxComparison.filter(item => item.status === 'matched').length;
    const minorIssues = taxComparison.filter(item => item.status === 'minor_difference').length;
    const majorIssues = taxComparison.filter(item => item.status === 'major_difference').length;

    return {
      total,
      matched,
      minorIssues,
      majorIssues,
      completionPercentage: Math.round(((matched + minorIssues * 0.5) / total) * 100)
    };
  }, [taxComparison]);

  const totalTaxLiability = useMemo(() => {
    return {
      gstr1Total: Object.values(data.taxData.gstr1Tax).reduce((sum, val) => sum + val, 0),
      gstr3bTotal: Object.values(data.taxData.gstr3bTax).reduce((sum, val) => sum + val, 0),
      adjustmentsTotal: Object.values(data.taxData.adjustments).reduce((sum, val) => sum + val, 0)
    };
  }, [data.taxData]);

  const autoReconcileTax = useCallback(async () => {
    setReconciling(true);
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Simulate auto-reconciliation
      const discrepancies: string[] = [];
      
      taxComparison.forEach(item => {
        if (item.status === 'major_difference') {
          discrepancies.push(`${item.description} difference: ₹${Math.abs(item.difference).toLocaleString()}`);
        }
      });

      const isReconciled = reconciliationStatus.majorIssues === 0;

      onUpdate({
        reconciliationStatus: {
          ...data.reconciliationStatus,
          taxReconciled: isReconciled,
          discrepancies: [...data.reconciliationStatus.discrepancies, ...discrepancies].slice(0, 10) // Limit discrepancies
        }
      });

    } finally {
      setLoading(false);
      setReconciling(false);
    }
  }, [taxComparison, reconciliationStatus.majorIssues, data.reconciliationStatus, onUpdate, setLoading]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

  const getStatusColor = (status: TaxComparisonItem['status']) => {
    switch (status) {
      case 'matched': return 'success';
      case 'minor_difference': return 'warning';
      case 'major_difference': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: TaxComparisonItem['status']) => {
    switch (status) {
      case 'matched': return 'Matched';
      case 'minor_difference': return 'Minor Diff';
      case 'major_difference': return 'Major Diff';
      default: return 'Unknown';
    }
  };

  const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Tax Details Analysis
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Analyze and reconcile tax liability details from GSTR-1 and GSTR-3B returns.
      </Typography>

      {/* Tax Reconciliation Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Tax Reconciliation Progress</Typography>
            <Chip 
              label={`${reconciliationStatus.completionPercentage}% Complete`}
              color={reconciliationStatus.completionPercentage >= 90 ? 'success' : reconciliationStatus.completionPercentage >= 70 ? 'warning' : 'error'}
            />
          </Box>

          <LinearProgress 
            variant="determinate" 
            value={reconciliationStatus.completionPercentage} 
            sx={{ height: 8, borderRadius: 4, mb: 2 }}
          />

          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {reconciliationStatus.matched}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Matched
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {reconciliationStatus.minorIssues}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Minor Issues
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  {reconciliationStatus.majorIssues}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Major Issues
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={reconciling ? <AutoAwesome className="animate-spin" /> : <AutoAwesome />}
                  onClick={autoReconcileTax}
                  disabled={loading}
                >
                  Auto Reconcile
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Assessment sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">
                GSTR-1 Tax Liability
              </Typography>
              <Typography variant="h4" color="primary.main">
                {formatCurrency(totalTaxLiability.gstr1Total)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <AccountBalance sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h6">
                GSTR-3B Tax Paid
              </Typography>
              <Typography variant="h4" color="secondary.main">
                {formatCurrency(totalTaxLiability.gstr3bTotal)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h6">
                Net Difference
              </Typography>
              <Typography 
                variant="h4" 
                color={Math.abs(totalTaxLiability.gstr1Total - totalTaxLiability.gstr3bTotal) > 50000 ? 'error.main' : 'info.main'}
              >
                {formatCurrency(Math.abs(totalTaxLiability.gstr1Total - totalTaxLiability.gstr3bTotal))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Tax Analysis */}
      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Tax Comparison" />
              <Tab label="Adjustments" />
              <Tab label="Summary" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              GSTR-1 vs GSTR-3B Tax Comparison
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Tax Type</strong></TableCell>
                    <TableCell align="right"><strong>GSTR-1 Liability</strong></TableCell>
                    <TableCell align="right"><strong>GSTR-3B Paid</strong></TableCell>
                    <TableCell align="right"><strong>Difference</strong></TableCell>
                    <TableCell align="right"><strong>Variance %</strong></TableCell>
                    <TableCell align="center"><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {taxComparison.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {item.status === 'matched' && <CheckCircle sx={{ mr: 1, fontSize: 16, color: 'success.main' }} />}
                          {item.status !== 'matched' && <Warning sx={{ mr: 1, fontSize: 16, color: item.status === 'major_difference' ? 'error.main' : 'warning.main' }} />}
                          {item.description}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{formatCurrency(item.gstr1Tax)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.gstr3bTax)}</TableCell>
                      <TableCell align="right">
                        <Typography 
                          color={Math.abs(item.difference) > 25000 ? 'error.main' : item.difference !== 0 ? 'warning.main' : 'text.secondary'}
                          fontWeight={Math.abs(item.difference) > 25000 ? 'bold' : 'normal'}
                        >
                          {item.difference >= 0 ? '+' : ''}{formatCurrency(item.difference)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          color={Math.abs(item.percentage) > 5 ? 'error.main' : Math.abs(item.percentage) > 2 ? 'warning.main' : 'text.secondary'}
                        >
                          {formatPercentage(item.percentage)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          size="small"
                          label={getStatusLabel(item.status)}
                          color={getStatusColor(item.status)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Refresh data">
                          <IconButton size="small" onClick={autoReconcileTax}>
                            <Sync fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Tax Adjustments & Corrections
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Any adjustments made here will be reflected in Table 9 of GSTR-9. 
                Ensure all adjustments are supported by proper documentation.
              </Typography>
            </Alert>

            <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Tax Type</strong></TableCell>
                    <TableCell align="right"><strong>Current Adjustment</strong></TableCell>
                    <TableCell align="right"><strong>Suggested Adjustment</strong></TableCell>
                    <TableCell><strong>Reason</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {taxComparison.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(data.taxData.adjustments[item.description.toLowerCase().includes('cgst') ? 'cgst' : 
                          item.description.toLowerCase().includes('sgst') ? 'sgst' :
                          item.description.toLowerCase().includes('igst') ? 'igst' : 'cess'])}
                      </TableCell>
                      <TableCell align="right">
                        <Typography color={item.status === 'major_difference' ? 'error.main' : 'text.secondary'}>
                          {item.status === 'major_difference' ? formatCurrency(Math.abs(item.difference)) : '₹0'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {item.status === 'major_difference' ? 'Reconcile difference between GSTR-1 and GSTR-3B' : 'No adjustment required'}
                      </TableCell>
                      <TableCell align="center">
                        <Button 
                          size="small" 
                          variant={item.status === 'major_difference' ? 'contained' : 'outlined'}
                          disabled={item.status === 'matched'}
                        >
                          {item.status === 'major_difference' ? 'Apply' : 'Edit'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              Tax Analysis Summary
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Tax Liability Summary
                    </Typography>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>CGST</TableCell>
                          <TableCell align="right">{formatCurrency(data.taxData.gstr1Tax.cgst)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>SGST</TableCell>
                          <TableCell align="right">{formatCurrency(data.taxData.gstr1Tax.sgst)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>IGST</TableCell>
                          <TableCell align="right">{formatCurrency(data.taxData.gstr1Tax.igst)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Cess</TableCell>
                          <TableCell align="right">{formatCurrency(data.taxData.gstr1Tax.cess)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Total</strong></TableCell>
                          <TableCell align="right"><strong>{formatCurrency(totalTaxLiability.gstr1Total)}</strong></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Tax Paid Summary
                    </Typography>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>CGST</TableCell>
                          <TableCell align="right">{formatCurrency(data.taxData.gstr3bTax.cgst)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>SGST</TableCell>
                          <TableCell align="right">{formatCurrency(data.taxData.gstr3bTax.sgst)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>IGST</TableCell>
                          <TableCell align="right">{formatCurrency(data.taxData.gstr3bTax.igst)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Cess</TableCell>
                          <TableCell align="right">{formatCurrency(data.taxData.gstr3bTax.cess)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Total</strong></TableCell>
                          <TableCell align="right"><strong>{formatCurrency(totalTaxLiability.gstr3bTotal)}</strong></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {data.reconciliationStatus.taxReconciled && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Tax Reconciliation Complete:</strong> All tax details have been successfully analyzed and reconciled. 
                  You can proceed to the ITC analysis step.
                </Typography>
              </Alert>
            )}
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
}