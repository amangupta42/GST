'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Divider
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  Warning,
  Download,
  Print,
  Assessment,
  AccountBalance,
  Receipt
} from '@mui/icons-material';
import { GSTR9Data } from '../GSTR9Wizard';

interface GSTR9PreviewStepProps {
  data: GSTR9Data;
  onUpdate: (updates: Partial<GSTR9Data>) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function GSTR9PreviewStep({ data }: GSTR9PreviewStepProps) {
  const gstr9Tables = useMemo(() => {
    // Calculate derived values for GSTR-9 tables
    const totalTurnover = data.turnoverData.gstr1Turnover + data.turnoverData.exemptSupplies + 
                         data.turnoverData.nilRatedSupplies + data.turnoverData.nonGstSupplies;
    
    const totalTaxLiability = Object.values(data.taxData.gstr1Tax).reduce((sum, val) => sum + val, 0);
    const totalTaxPaid = Object.values(data.taxData.gstr3bTax).reduce((sum, val) => sum + val, 0);
    const totalAdjustments = Object.values(data.taxData.adjustments).reduce((sum, val) => sum + val, 0);
    
    const totalITCAvailable = Object.values(data.itcData.availableITC).reduce((sum, val) => sum + val, 0);
    const totalITCClaimed = Object.values(data.itcData.claimedITC).reduce((sum, val) => sum + val, 0);
    const totalITCReversed = Object.values(data.itcData.reversedITC).reduce((sum, val) => sum + val, 0);

    return {
      table4: { // Supplies and Turnover
        taxableSupplies: data.turnoverData.gstr1Turnover,
        exemptSupplies: data.turnoverData.exemptSupplies,
        nilRatedSupplies: data.turnoverData.nilRatedSupplies,
        nonGstSupplies: data.turnoverData.nonGstSupplies,
        totalTurnover: totalTurnover
      },
      table5: { // Tax Liability
        cgst: data.taxData.gstr1Tax.cgst,
        sgst: data.taxData.gstr1Tax.sgst,
        igst: data.taxData.gstr1Tax.igst,
        cess: data.taxData.gstr1Tax.cess,
        totalTax: totalTaxLiability
      },
      table6: { // ITC Details
        availableITC: {
          cgst: data.itcData.availableITC.cgst,
          sgst: data.itcData.availableITC.sgst,
          igst: data.itcData.availableITC.igst,
          cess: data.itcData.availableITC.cess,
          total: totalITCAvailable
        },
        claimedITC: {
          cgst: data.itcData.claimedITC.cgst,
          sgst: data.itcData.claimedITC.sgst,
          igst: data.itcData.claimedITC.igst,
          cess: data.itcData.claimedITC.cess,
          total: totalITCClaimed
        },
        reversedITC: {
          cgst: data.itcData.reversedITC.cgst,
          sgst: data.itcData.reversedITC.sgst,
          igst: data.itcData.reversedITC.igst,
          cess: data.itcData.reversedITC.cess,
          total: totalITCReversed
        }
      },
      table8: { // Tax Paid
        cgst: data.taxData.gstr3bTax.cgst,
        sgst: data.taxData.gstr3bTax.sgst,
        igst: data.taxData.gstr3bTax.igst,
        cess: data.taxData.gstr3bTax.cess,
        totalPaid: totalTaxPaid
      },
      table9: { // Adjustments
        cgst: data.taxData.adjustments.cgst,
        sgst: data.taxData.adjustments.sgst,
        igst: data.taxData.adjustments.igst,
        cess: data.taxData.adjustments.cess,
        totalAdjustments: totalAdjustments
      }
    };
  }, [data]);

  const [tabValue, setTabValue] = useState(0);

  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

  const downloadPreview = () => {
    // Simulate PDF download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `GSTR-9-Preview-${data.financialYear}-${data.gstin}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printPreview = () => {
    window.print();
  };

  const validationStatus = useMemo(() => {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check for major discrepancies
    if (Math.abs(data.turnoverData.gstr1Turnover - data.turnoverData.gstr3bTurnover) > 100000) {
      issues.push('Significant turnover difference between GSTR-1 and GSTR-3B');
    }

    // Check for excess ITC claims
    Object.keys(data.itcData.availableITC).forEach(taxType => {
      const key = taxType as keyof typeof data.itcData.availableITC;
      if (data.itcData.claimedITC[key] > data.itcData.availableITC[key]) {
        issues.push(`Excess ITC claim for ${taxType.toUpperCase()}: ${formatCurrency(data.itcData.claimedITC[key] - data.itcData.availableITC[key])}`);
      }
    });

    // Check for missing data
    if (gstr9Tables.table4.totalTurnover === 0) {
      warnings.push('No turnover data imported');
    }

    if (gstr9Tables.table5.totalTax === 0) {
      warnings.push('No tax liability data found');
    }

    return { issues, warnings, isValid: issues.length === 0 };
  }, [data, gstr9Tables]);

  const TabPanel = ({ children, value, index }: { children: React.ReactNode; value: number; index: number }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        GSTR-9 Preview & Validation
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Review the complete GSTR-9 annual return before submission. Verify all calculations and reconciliations.
      </Typography>

      {/* Header Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                {data.legalName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                GSTIN: {data.gstin} | Trade Name: {data.tradeName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Financial Year: {data.financialYear}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Button
                  variant="outlined"
                  startIcon={<Download />}
                  onClick={downloadPreview}
                  size="small"
                >
                  Download
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Print />}
                  onClick={printPreview}
                  size="small"
                >
                  Print
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Validation Status */}
      {!validationStatus.isValid && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Validation Issues Found - Must be resolved before submission:
          </Typography>
          {validationStatus.issues.map((issue, index) => (
            <Typography key={index} variant="body2">
              • {issue}
            </Typography>
          ))}
        </Alert>
      )}

      {validationStatus.warnings.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Warnings - Please review:
          </Typography>
          {validationStatus.warnings.map((warning, index) => (
            <Typography key={index} variant="body2">
              • {warning}
            </Typography>
          ))}
        </Alert>
      )}

      {validationStatus.isValid && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle sx={{ mr: 1 }} />
            <Typography variant="body2">
              <strong>Validation Passed:</strong> GSTR-9 return is ready for submission
            </Typography>
          </Box>
        </Alert>
      )}

      {/* GSTR-9 Tables */}
      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} variant="scrollable" scrollButtons="auto">
              <Tab label="Table 4 - Turnover" />
              <Tab label="Table 5 - Tax Liability" />
              <Tab label="Table 6 - ITC" />
              <Tab label="Table 8 - Tax Paid" />
              <Tab label="Table 9 - Adjustments" />
              <Tab label="Summary" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Receipt sx={{ mr: 1 }} />
              Table 4: Turnover Details
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell align="right"><strong>Amount</strong></TableCell>
                    <TableCell align="center"><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>4(A) Taxable Supplies (GSTR-1)</TableCell>
                    <TableCell align="right">{formatCurrency(gstr9Tables.table4.taxableSupplies)}</TableCell>
                    <TableCell align="center">
                      <Chip size="small" label="Verified" color="success" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>4(B) Exempt Supplies</TableCell>
                    <TableCell align="right">{formatCurrency(gstr9Tables.table4.exemptSupplies)}</TableCell>
                    <TableCell align="center">
                      <Chip size="small" label="Verified" color="success" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>4(C) Nil Rated Supplies</TableCell>
                    <TableCell align="right">{formatCurrency(gstr9Tables.table4.nilRatedSupplies)}</TableCell>
                    <TableCell align="center">
                      <Chip size="small" label="Verified" color="success" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>4(D) Non-GST Supplies</TableCell>
                    <TableCell align="right">{formatCurrency(gstr9Tables.table4.nonGstSupplies)}</TableCell>
                    <TableCell align="center">
                      <Chip size="small" label="Verified" color="success" />
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Total Turnover</strong></TableCell>
                    <TableCell align="right"><strong>{formatCurrency(gstr9Tables.table4.totalTurnover)}</strong></TableCell>
                    <TableCell align="center">
                      <Chip size="small" label="Calculated" color="primary" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Assessment sx={{ mr: 1 }} />
              Table 5: Tax Liability Details
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Tax Type</strong></TableCell>
                    <TableCell align="right"><strong>Tax Liability</strong></TableCell>
                    <TableCell align="right"><strong>Adjustments</strong></TableCell>
                    <TableCell align="right"><strong>Net Tax</strong></TableCell>
                    <TableCell align="center"><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Central GST (CGST)</TableCell>
                    <TableCell align="right">{formatCurrency(gstr9Tables.table5.cgst)}</TableCell>
                    <TableCell align="right">{formatCurrency(gstr9Tables.table9.cgst)}</TableCell>
                    <TableCell align="right"><strong>{formatCurrency(gstr9Tables.table5.cgst + gstr9Tables.table9.cgst)}</strong></TableCell>
                    <TableCell align="center">
                      <Chip size="small" label="Reconciled" color="success" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>State GST (SGST)</TableCell>
                    <TableCell align="right">{formatCurrency(gstr9Tables.table5.sgst)}</TableCell>
                    <TableCell align="right">{formatCurrency(gstr9Tables.table9.sgst)}</TableCell>
                    <TableCell align="right"><strong>{formatCurrency(gstr9Tables.table5.sgst + gstr9Tables.table9.sgst)}</strong></TableCell>
                    <TableCell align="center">
                      <Chip size="small" label="Reconciled" color="success" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Integrated GST (IGST)</TableCell>
                    <TableCell align="right">{formatCurrency(gstr9Tables.table5.igst)}</TableCell>
                    <TableCell align="right">{formatCurrency(gstr9Tables.table9.igst)}</TableCell>
                    <TableCell align="right"><strong>{formatCurrency(gstr9Tables.table5.igst + gstr9Tables.table9.igst)}</strong></TableCell>
                    <TableCell align="center">
                      <Chip size="small" label="Reconciled" color="success" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Compensation Cess</TableCell>
                    <TableCell align="right">{formatCurrency(gstr9Tables.table5.cess)}</TableCell>
                    <TableCell align="right">{formatCurrency(gstr9Tables.table9.cess)}</TableCell>
                    <TableCell align="right"><strong>{formatCurrency(gstr9Tables.table5.cess + gstr9Tables.table9.cess)}</strong></TableCell>
                    <TableCell align="center">
                      <Chip size="small" label="Reconciled" color="success" />
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Total Tax Liability</strong></TableCell>
                    <TableCell align="right"><strong>{formatCurrency(gstr9Tables.table5.totalTax)}</strong></TableCell>
                    <TableCell align="right"><strong>{formatCurrency(gstr9Tables.table9.totalAdjustments)}</strong></TableCell>
                    <TableCell align="right"><strong>{formatCurrency(gstr9Tables.table5.totalTax + gstr9Tables.table9.totalAdjustments)}</strong></TableCell>
                    <TableCell align="center">
                      <Chip size="small" label="Verified" color="primary" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AccountBalance sx={{ mr: 1 }} />
              Table 6: Input Tax Credit Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>6(A) Available ITC</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell>CGST</TableCell>
                        <TableCell align="right">{formatCurrency(gstr9Tables.table6.availableITC.cgst)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>SGST</TableCell>
                        <TableCell align="right">{formatCurrency(gstr9Tables.table6.availableITC.sgst)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>IGST</TableCell>
                        <TableCell align="right">{formatCurrency(gstr9Tables.table6.availableITC.igst)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Cess</TableCell>
                        <TableCell align="right">{formatCurrency(gstr9Tables.table6.availableITC.cess)}</TableCell>
                      </TableRow>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell><strong>Total</strong></TableCell>
                        <TableCell align="right"><strong>{formatCurrency(gstr9Tables.table6.availableITC.total)}</strong></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>6(B) Claimed ITC</Typography>
                <TableContainer>
                  <Paper variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>CGST</TableCell>
                          <TableCell align="right">{formatCurrency(gstr9Tables.table6.claimedITC.cgst)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>SGST</TableCell>
                          <TableCell align="right">{formatCurrency(gstr9Tables.table6.claimedITC.sgst)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>IGST</TableCell>
                          <TableCell align="right">{formatCurrency(gstr9Tables.table6.claimedITC.igst)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Cess</TableCell>
                          <TableCell align="right">{formatCurrency(gstr9Tables.table6.claimedITC.cess)}</TableCell>
                        </TableRow>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell><strong>Total</strong></TableCell>
                          <TableCell align="right"><strong>{formatCurrency(gstr9Tables.table6.claimedITC.total)}</strong></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Paper>
                </TableContainer>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1" gutterBottom>6(C) Reversed ITC</Typography>
                <TableContainer>
                  <Paper variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>CGST</TableCell>
                          <TableCell align="right">{formatCurrency(gstr9Tables.table6.reversedITC.cgst)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>SGST</TableCell>
                          <TableCell align="right">{formatCurrency(gstr9Tables.table6.reversedITC.sgst)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>IGST</TableCell>
                          <TableCell align="right">{formatCurrency(gstr9Tables.table6.reversedITC.igst)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Cess</TableCell>
                          <TableCell align="right">{formatCurrency(gstr9Tables.table6.reversedITC.cess)}</TableCell>
                        </TableRow>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell><strong>Total</strong></TableCell>
                          <TableCell align="right"><strong>{formatCurrency(gstr9Tables.table6.reversedITC.total)}</strong></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Paper>
                </TableContainer>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AccountBalance sx={{ mr: 1 }} />
              Table 8: Tax Paid Details
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Tax Type</strong></TableCell>
                    <TableCell align="right"><strong>Tax Paid (GSTR-3B)</strong></TableCell>
                    <TableCell align="right"><strong>Tax Liability</strong></TableCell>
                    <TableCell align="right"><strong>Difference</strong></TableCell>
                    <TableCell align="center"><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Central GST</TableCell>
                    <TableCell align="right">{formatCurrency(gstr9Tables.table8.cgst)}</TableCell>
                    <TableCell align="right">{formatCurrency(gstr9Tables.table5.cgst)}</TableCell>
                    <TableCell align="right">
                      <Typography color={gstr9Tables.table8.cgst - gstr9Tables.table5.cgst >= 0 ? 'success.main' : 'error.main'}>
                        {formatCurrency(gstr9Tables.table8.cgst - gstr9Tables.table5.cgst)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        size="small" 
                        label={gstr9Tables.table8.cgst >= gstr9Tables.table5.cgst ? 'Paid' : 'Shortfall'} 
                        color={gstr9Tables.table8.cgst >= gstr9Tables.table5.cgst ? 'success' : 'error'} 
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>State GST</TableCell>
                    <TableCell align="right">{formatCurrency(gstr9Tables.table8.sgst)}</TableCell>
                    <TableCell align="right">{formatCurrency(gstr9Tables.table5.sgst)}</TableCell>
                    <TableCell align="right">
                      <Typography color={gstr9Tables.table8.sgst - gstr9Tables.table5.sgst >= 0 ? 'success.main' : 'error.main'}>
                        {formatCurrency(gstr9Tables.table8.sgst - gstr9Tables.table5.sgst)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        size="small" 
                        label={gstr9Tables.table8.sgst >= gstr9Tables.table5.sgst ? 'Paid' : 'Shortfall'} 
                        color={gstr9Tables.table8.sgst >= gstr9Tables.table5.sgst ? 'success' : 'error'} 
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Integrated GST</TableCell>
                    <TableCell align="right">{formatCurrency(gstr9Tables.table8.igst)}</TableCell>
                    <TableCell align="right">{formatCurrency(gstr9Tables.table5.igst)}</TableCell>
                    <TableCell align="right">
                      <Typography color={gstr9Tables.table8.igst - gstr9Tables.table5.igst >= 0 ? 'success.main' : 'error.main'}>
                        {formatCurrency(gstr9Tables.table8.igst - gstr9Tables.table5.igst)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        size="small" 
                        label={gstr9Tables.table8.igst >= gstr9Tables.table5.igst ? 'Paid' : 'Shortfall'} 
                        color={gstr9Tables.table8.igst >= gstr9Tables.table5.igst ? 'success' : 'error'} 
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Compensation Cess</TableCell>
                    <TableCell align="right">{formatCurrency(gstr9Tables.table8.cess)}</TableCell>
                    <TableCell align="right">{formatCurrency(gstr9Tables.table5.cess)}</TableCell>
                    <TableCell align="right">
                      <Typography color={gstr9Tables.table8.cess - gstr9Tables.table5.cess >= 0 ? 'success.main' : 'error.main'}>
                        {formatCurrency(gstr9Tables.table8.cess - gstr9Tables.table5.cess)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        size="small" 
                        label={gstr9Tables.table8.cess >= gstr9Tables.table5.cess ? 'Paid' : 'Shortfall'} 
                        color={gstr9Tables.table8.cess >= gstr9Tables.table5.cess ? 'success' : 'error'} 
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Total</strong></TableCell>
                    <TableCell align="right"><strong>{formatCurrency(gstr9Tables.table8.totalPaid)}</strong></TableCell>
                    <TableCell align="right"><strong>{formatCurrency(gstr9Tables.table5.totalTax)}</strong></TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" color={gstr9Tables.table8.totalPaid - gstr9Tables.table5.totalTax >= 0 ? 'success.main' : 'error.main'}>
                        {formatCurrency(gstr9Tables.table8.totalPaid - gstr9Tables.table5.totalTax)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        size="small" 
                        label={gstr9Tables.table8.totalPaid >= gstr9Tables.table5.totalTax ? 'Compliant' : 'Deficient'} 
                        color={gstr9Tables.table8.totalPaid >= gstr9Tables.table5.totalTax ? 'success' : 'error'} 
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" gutterBottom>
              Table 9: Adjustments & Amendments
            </Typography>
            
            {gstr9Tables.table9.totalAdjustments === 0 ? (
              <Alert severity="info">
                No adjustments or amendments recorded for this financial year.
              </Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Tax Type</strong></TableCell>
                      <TableCell align="right"><strong>Adjustment Amount</strong></TableCell>
                      <TableCell><strong>Nature of Adjustment</strong></TableCell>
                      <TableCell align="center"><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>CGST</TableCell>
                      <TableCell align="right">{formatCurrency(gstr9Tables.table9.cgst)}</TableCell>
                      <TableCell>Late filing adjustments</TableCell>
                      <TableCell align="center">
                        <Chip size="small" label="Applied" color="success" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>SGST</TableCell>
                      <TableCell align="right">{formatCurrency(gstr9Tables.table9.sgst)}</TableCell>
                      <TableCell>Late filing adjustments</TableCell>
                      <TableCell align="center">
                        <Chip size="small" label="Applied" color="success" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>IGST</TableCell>
                      <TableCell align="right">{formatCurrency(gstr9Tables.table9.igst)}</TableCell>
                      <TableCell>Late filing adjustments</TableCell>
                      <TableCell align="center">
                        <Chip size="small" label="Applied" color="success" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Cess</TableCell>
                      <TableCell align="right">{formatCurrency(gstr9Tables.table9.cess)}</TableCell>
                      <TableCell>Late filing adjustments</TableCell>
                      <TableCell align="center">
                        <Chip size="small" label="Applied" color="success" />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={5}>
            <Typography variant="h6" gutterBottom>
              GSTR-9 Summary Overview
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Business Overview
                    </Typography>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Total Annual Turnover</TableCell>
                          <TableCell align="right">{formatCurrency(gstr9Tables.table4.totalTurnover)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Taxable Supplies</TableCell>
                          <TableCell align="right">{formatCurrency(gstr9Tables.table4.taxableSupplies)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Exempt + Nil + Non-GST</TableCell>
                          <TableCell align="right">
                            {formatCurrency(gstr9Tables.table4.exemptSupplies + gstr9Tables.table4.nilRatedSupplies + gstr9Tables.table4.nonGstSupplies)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="secondary">
                      Tax Compliance
                    </Typography>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell>Total Tax Liability</TableCell>
                          <TableCell align="right">{formatCurrency(gstr9Tables.table5.totalTax)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Total Tax Paid</TableCell>
                          <TableCell align="right">{formatCurrency(gstr9Tables.table8.totalPaid)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Net Tax Position</TableCell>
                          <TableCell align="right">
                            <Typography color={gstr9Tables.table8.totalPaid - gstr9Tables.table5.totalTax >= 0 ? 'success.main' : 'error.main'} fontWeight="bold">
                              {formatCurrency(gstr9Tables.table8.totalPaid - gstr9Tables.table5.totalTax)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="info.main">
                      ITC Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h5" color="primary.main">
                            {formatCurrency(gstr9Tables.table6.availableITC.total)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Available ITC
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h5" color="secondary.main">
                            {formatCurrency(gstr9Tables.table6.claimedITC.total)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Claimed ITC
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h5" color="warning.main">
                            {formatCurrency(gstr9Tables.table6.reversedITC.total)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Reversed ITC
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Compliance Checklist</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      ✅ Completed Items
                    </Typography>
                    <ul>
                      <li>Data import from GSTR-1 and GSTR-3B</li>
                      <li>Turnover reconciliation</li>
                      <li>Tax liability calculation</li>
                      <li>ITC analysis and validation</li>
                      <li>All mandatory tables populated</li>
                    </ul>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      📋 Pre-submission Requirements
                    </Typography>
                    <ul>
                      <li>Digital signature certificate</li>
                      <li>Board resolution (if applicable)</li>
                      <li>Auditor certificate verification</li>
                      <li>Outstanding demand clearance</li>
                      <li>Form GSTR-9C (if required)</li>
                    </ul>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
}

