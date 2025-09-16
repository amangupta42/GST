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
  LinearProgress,
  Alert,
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
  MenuItem,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  AutoAwesome,
  Sync,
  CheckCircle,
  Warning,
  Error,
  Info,
  CloudDownload,
  CloudUpload,
  CompareArrows,
  FilterList,
  Visibility,
  VisibilityOff,
  ExpandMore,
  GetApp,
  Refresh
} from '@mui/icons-material';

export interface PurchaseInvoice {
  id: string;
  gstin: string;
  supplierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceValue: number;
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
  pos: string;
  reverseCharge: boolean;
  invoiceType: 'Regular' | 'Debit Note' | 'Credit Note' | 'Refund Voucher';
  eligibilityITC: 'Eligible' | 'Ineligible' | 'Blocked';
  itcClaimStatus: 'Claimed' | 'Not Claimed' | 'Partial' | 'Reversed';
  source: 'Purchase Register' | 'Manual Entry' | 'Bank Statement';
}

export interface GSTR2ARecord {
  id: string;
  gstin: string;
  supplierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceValue: number;
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
  pos: string;
  reverseCharge: boolean;
  invoiceType: 'Regular' | 'Debit Note' | 'Credit Note' | 'Refund Voucher';
  filingStatus: 'Filed' | 'Not Filed' | 'Cancelled' | 'Amendment';
  status: 'available' | 'provisional' | 'accepted' | 'pending';
  actionRequired: boolean;
  availableDate: string;
}

export interface GSTR2BRecord extends GSTR2ARecord {
  amendmentDetails?: {
    originalInvoiceNumber: string;
    amendmentDate: string;
    amendmentReason: string;
  };
  autoDraftedITC: {
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
}

export interface ReconciliationMatch {
  purchaseInvoice: PurchaseInvoice;
  gstr2aRecord?: GSTR2ARecord;
  gstr2bRecord?: GSTR2BRecord;
  matchStatus: 'exact' | 'partial' | 'discrepancy' | 'missing' | 'excess';
  matchScore: number;
  discrepancies: {
    field: string;
    purchaseValue: any;
    gstr2Value: any;
    severity: 'low' | 'medium' | 'high';
  }[];
  recommendations: string[];
  itcEligible: boolean;
  itcAmount: {
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
}

interface ITCReconciliationEngineProps {
  onComplete?: () => void;
}

export function ITCReconciliationEngine({ onComplete }: ITCReconciliationEngineProps) {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [autoReconciling, setAutoReconciling] = useState(false);
  const [filterDialog, setFilterDialog] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    matchStatus: 'all',
    itcStatus: 'all',
    discrepancyLevel: 'all',
    dateRange: 'current_month'
  });

  // Mock data - in real implementation, this would come from API
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>([
    {
      id: 'PI001',
      gstin: '09ABCDE1234F1Z5',
      supplierName: 'ABC Suppliers Pvt Ltd',
      invoiceNumber: 'INV/2024/001',
      invoiceDate: '2024-03-01',
      invoiceValue: 118000,
      taxableValue: 100000,
      cgstAmount: 9000,
      sgstAmount: 9000,
      igstAmount: 0,
      cessAmount: 0,
      pos: '09',
      reverseCharge: false,
      invoiceType: 'Regular',
      eligibilityITC: 'Eligible',
      itcClaimStatus: 'Claimed',
      source: 'Purchase Register'
    },
    {
      id: 'PI002',
      gstin: '27XYZPQ5678M1N2',
      supplierName: 'XYZ Trading Company',
      invoiceNumber: 'BILL/24/0156',
      invoiceDate: '2024-03-02',
      invoiceValue: 59000,
      taxableValue: 50000,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 9000,
      cessAmount: 0,
      pos: '27',
      reverseCharge: false,
      invoiceType: 'Regular',
      eligibilityITC: 'Eligible',
      itcClaimStatus: 'Claimed',
      source: 'Purchase Register'
    }
  ]);

  const [gstr2bRecords, setGSTR2BRecords] = useState<GSTR2BRecord[]>([
    {
      id: 'G2B001',
      gstin: '09ABCDE1234F1Z5',
      supplierName: 'ABC Suppliers Pvt Ltd',
      invoiceNumber: 'INV/2024/001',
      invoiceDate: '2024-03-01',
      invoiceValue: 118000,
      taxableValue: 100000,
      cgstAmount: 9000,
      sgstAmount: 9000,
      igstAmount: 0,
      cessAmount: 0,
      pos: '09',
      reverseCharge: false,
      invoiceType: 'Regular',
      filingStatus: 'Filed',
      status: 'available',
      actionRequired: false,
      availableDate: '2024-03-10',
      autoDraftedITC: {
        cgst: 9000,
        sgst: 9000,
        igst: 0,
        cess: 0
      }
    },
    {
      id: 'G2B002',
      gstin: '27XYZPQ5678M1N2',
      supplierName: 'XYZ Trading Company',
      invoiceNumber: 'BILL/24/0156',
      invoiceDate: '2024-03-02',
      invoiceValue: 56400, // Discrepancy in value
      taxableValue: 48000,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 8640,
      cessAmount: 0,
      pos: '27',
      reverseCharge: false,
      invoiceType: 'Regular',
      filingStatus: 'Filed',
      status: 'available',
      actionRequired: true,
      availableDate: '2024-03-11',
      autoDraftedITC: {
        cgst: 0,
        sgst: 0,
        igst: 8640,
        cess: 0
      }
    }
  ]);

  const [reconciliationMatches, setReconciliationMatches] = useState<ReconciliationMatch[]>([]);

  const performAutoReconciliation = useCallback(async () => {
    setAutoReconciling(true);
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const matches: ReconciliationMatch[] = [];

      purchaseInvoices.forEach(purchaseInvoice => {
        // Find matching GSTR-2B record
        const gstr2bMatch = gstr2bRecords.find(record => 
          record.gstin === purchaseInvoice.gstin &&
          record.invoiceNumber === purchaseInvoice.invoiceNumber &&
          record.invoiceDate === purchaseInvoice.invoiceDate
        );

        if (gstr2bMatch) {
          // Calculate match score and identify discrepancies
          const discrepancies = [];
          let matchScore = 100;

          if (Math.abs(purchaseInvoice.invoiceValue - gstr2bMatch.invoiceValue) > 100) {
            discrepancies.push({
              field: 'Invoice Value',
              purchaseValue: purchaseInvoice.invoiceValue,
              gstr2Value: gstr2bMatch.invoiceValue,
              severity: 'high' as const
            });
            matchScore -= 20;
          }

          if (Math.abs(purchaseInvoice.cgstAmount - gstr2bMatch.cgstAmount) > 10) {
            discrepancies.push({
              field: 'CGST Amount',
              purchaseValue: purchaseInvoice.cgstAmount,
              gstr2Value: gstr2bMatch.cgstAmount,
              severity: 'medium' as const
            });
            matchScore -= 15;
          }

          if (Math.abs(purchaseInvoice.igstAmount - gstr2bMatch.igstAmount) > 10) {
            discrepancies.push({
              field: 'IGST Amount',
              purchaseValue: purchaseInvoice.igstAmount,
              gstr2Value: gstr2bMatch.igstAmount,
              severity: 'medium' as const
            });
            matchScore -= 15;
          }

          const matchStatus = discrepancies.length === 0 ? 'exact' :
                             discrepancies.some(d => d.severity === 'high') ? 'discrepancy' :
                             'partial';

          const recommendations = [];
          if (discrepancies.length > 0) {
            recommendations.push('Review and resolve discrepancies before claiming ITC');
            if (gstr2bMatch.actionRequired) {
              recommendations.push('Action required in GSTR-2B - check GST portal');
            }
          }

          matches.push({
            purchaseInvoice,
            gstr2bRecord: gstr2bMatch,
            matchStatus,
            matchScore,
            discrepancies,
            recommendations,
            itcEligible: purchaseInvoice.eligibilityITC === 'Eligible' && discrepancies.length === 0,
            itcAmount: {
              cgst: discrepancies.length === 0 ? gstr2bMatch.autoDraftedITC.cgst : 0,
              sgst: discrepancies.length === 0 ? gstr2bMatch.autoDraftedITC.sgst : 0,
              igst: discrepancies.length === 0 ? gstr2bMatch.autoDraftedITC.igst : 0,
              cess: discrepancies.length === 0 ? gstr2bMatch.autoDraftedITC.cess : 0
            }
          });
        } else {
          // No matching GSTR-2B record found
          matches.push({
            purchaseInvoice,
            matchStatus: 'missing',
            matchScore: 0,
            discrepancies: [{
              field: 'GSTR-2B Record',
              purchaseValue: 'Present',
              gstr2Value: 'Missing',
              severity: 'high' as const
            }],
            recommendations: [
              'Contact supplier to check if they have filed GSTR-1',
              'Verify supplier GSTIN and invoice details',
              'Consider blocking ITC until supplier files return'
            ],
            itcEligible: false,
            itcAmount: { cgst: 0, sgst: 0, igst: 0, cess: 0 }
          });
        }
      });

      setReconciliationMatches(matches);

    } finally {
      setLoading(false);
      setAutoReconciling(false);
    }
  }, [purchaseInvoices, gstr2bRecords]);

  const reconciliationSummary = useMemo(() => {
    const total = reconciliationMatches.length;
    const exactMatches = reconciliationMatches.filter(m => m.matchStatus === 'exact').length;
    const partialMatches = reconciliationMatches.filter(m => m.matchStatus === 'partial').length;
    const discrepancies = reconciliationMatches.filter(m => m.matchStatus === 'discrepancy').length;
    const missing = reconciliationMatches.filter(m => m.matchStatus === 'missing').length;
    const itcEligible = reconciliationMatches.filter(m => m.itcEligible).length;
    
    const totalITCAmount = reconciliationMatches.reduce((sum, match) => {
      return sum + match.itcAmount.cgst + match.itcAmount.sgst + match.itcAmount.igst + match.itcAmount.cess;
    }, 0);

    return {
      total,
      exactMatches,
      partialMatches,
      discrepancies,
      missing,
      itcEligible,
      totalITCAmount,
      completionPercentage: total > 0 ? Math.round(((exactMatches + partialMatches) / total) * 100) : 0
    };
  }, [reconciliationMatches]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

  const getStatusColor = (status: ReconciliationMatch['matchStatus']) => {
    switch (status) {
      case 'exact': return 'success';
      case 'partial': return 'info';
      case 'discrepancy': return 'warning';
      case 'missing': return 'error';
      case 'excess': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: ReconciliationMatch['matchStatus']) => {
    switch (status) {
      case 'exact': return 'Perfect Match';
      case 'partial': return 'Partial Match';
      case 'discrepancy': return 'Discrepancy';
      case 'missing': return 'Missing in 2B';
      case 'excess': return 'Excess in 2B';
      default: return 'Unknown';
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
          ITC Reconciliation
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Automated reconciliation of purchase invoices with GSTR-2A/2B data for accurate ITC claims
        </Typography>
      </Box>

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={autoReconciling ? <Sync className="animate-spin" /> : <AutoAwesome />}
                onClick={performAutoReconciliation}
                disabled={loading}
              >
                {autoReconciling ? 'Auto Reconciling...' : 'Auto Reconcile'}
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CloudDownload />}
                onClick={() => setFilterDialog(true)}
              >
                Import Data
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setFilterDialog(true)}
              >
                Filters
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<GetApp />}
              >
                Export
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => typeof window !== 'undefined' && window.location.reload()}
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Reconciliation Summary */}
      {reconciliationMatches.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Reconciliation Summary
            </Typography>

            <LinearProgress 
              variant="determinate" 
              value={reconciliationSummary.completionPercentage} 
              sx={{ height: 8, borderRadius: 4, mb: 2 }}
            />

            <Grid container spacing={2}>
              <Grid item xs={6} sm={2}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    {reconciliationSummary.exactMatches}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Exact Matches
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={2}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">
                    {reconciliationSummary.partialMatches}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Partial Matches
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={2}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    {reconciliationSummary.discrepancies}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Discrepancies
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={2}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">
                    {reconciliationSummary.missing}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Missing in 2B
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary.main">
                    {formatCurrency(reconciliationSummary.totalITCAmount)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Eligible ITC
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Reconciliation Results" />
              <Tab label="Purchase Invoices" />
              <Tab label="GSTR-2B Data" />
              <Tab label="Analytics" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {reconciliationMatches.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  No reconciliation data available. Click "Auto Reconcile" to start the reconciliation process.
                </Typography>
              </Alert>
            ) : (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Reconciliation Results ({reconciliationMatches.length} records)
                </Typography>

                <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Purchase Invoice</strong></TableCell>
                        <TableCell><strong>Supplier</strong></TableCell>
                        <TableCell align="right"><strong>Invoice Value</strong></TableCell>
                        <TableCell align="right"><strong>Match Score</strong></TableCell>
                        <TableCell align="center"><strong>Status</strong></TableCell>
                        <TableCell align="center"><strong>ITC Eligible</strong></TableCell>
                        <TableCell align="right"><strong>ITC Amount</strong></TableCell>
                        <TableCell align="center"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reconciliationMatches.map((match, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {match.purchaseInvoice.invoiceNumber}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {match.purchaseInvoice.invoiceDate}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">
                                {match.purchaseInvoice.supplierName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {match.purchaseInvoice.gstin}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(match.purchaseInvoice.invoiceValue)}
                            {match.gstr2bRecord && Math.abs(match.purchaseInvoice.invoiceValue - match.gstr2bRecord.invoiceValue) > 100 && (
                              <Typography variant="caption" color="warning.main" display="block">
                                2B: {formatCurrency(match.gstr2bRecord.invoiceValue)}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Typography 
                              color={match.matchScore >= 90 ? 'success.main' : match.matchScore >= 70 ? 'warning.main' : 'error.main'}
                              fontWeight="bold"
                            >
                              {match.matchScore}%
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              size="small"
                              label={getStatusLabel(match.matchStatus)}
                              color={getStatusColor(match.matchStatus)}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {match.itcEligible ? (
                              <CheckCircle color="success" />
                            ) : (
                              <Error color="error" />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight="bold">
                              {formatCurrency(
                                match.itcAmount.cgst + match.itcAmount.sgst + 
                                match.itcAmount.igst + match.itcAmount.cess
                              )}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="View Details">
                              <IconButton size="small">
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Discrepancy Details */}
                {reconciliationMatches.some(m => m.discrepancies.length > 0) && (
                  <Accordion sx={{ mt: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography variant="h6">
                        Detailed Discrepancy Analysis ({reconciliationMatches.filter(m => m.discrepancies.length > 0).length} records)
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {reconciliationMatches
                        .filter(match => match.discrepancies.length > 0)
                        .map((match, index) => (
                          <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                            <CardContent>
                              <Typography variant="subtitle1" gutterBottom>
                                Invoice: {match.purchaseInvoice.invoiceNumber} - {match.purchaseInvoice.supplierName}
                              </Typography>
                              <List dense>
                                {match.discrepancies.map((discrepancy, idx) => (
                                  <ListItem key={idx}>
                                    <ListItemIcon>
                                      <Warning color={discrepancy.severity === 'high' ? 'error' : 'warning'} />
                                    </ListItemIcon>
                                    <ListItemText 
                                      primary={discrepancy.field}
                                      secondary={
                                        `Purchase: ${discrepancy.purchaseValue}, GSTR-2B: ${discrepancy.gstr2Value}`
                                      }
                                    />
                                    <Chip 
                                      size="small" 
                                      label={discrepancy.severity.toUpperCase()}
                                      color={discrepancy.severity === 'high' ? 'error' : 'warning'}
                                      variant="outlined"
                                    />
                                  </ListItem>
                                ))}
                              </List>
                              <Divider sx={{ my: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                <strong>Recommendations:</strong>
                              </Typography>
                              {match.recommendations.map((rec, idx) => (
                                <Typography key={idx} variant="body2" color="text.secondary">
                                  • {rec}
                                </Typography>
                              ))}
                            </CardContent>
                          </Card>
                        ))}
                    </AccordionDetails>
                  </Accordion>
                )}
              </>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              Purchase Invoices ({purchaseInvoices.length} records)
            </Typography>
            
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Invoice Details</strong></TableCell>
                    <TableCell><strong>Supplier</strong></TableCell>
                    <TableCell align="right"><strong>Value</strong></TableCell>
                    <TableCell align="right"><strong>Tax Amount</strong></TableCell>
                    <TableCell><strong>ITC Status</strong></TableCell>
                    <TableCell><strong>Source</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchaseInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {invoice.invoiceNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {invoice.invoiceDate} • {invoice.invoiceType}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {invoice.supplierName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {invoice.gstin}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(invoice.invoiceValue)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(invoice.cgstAmount + invoice.sgstAmount + invoice.igstAmount + invoice.cessAmount)}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="small"
                          label={invoice.itcClaimStatus}
                          color={invoice.itcClaimStatus === 'Claimed' ? 'success' : 
                                 invoice.itcClaimStatus === 'Not Claimed' ? 'error' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="small" 
                          label={invoice.source}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              GSTR-2B Records ({gstr2bRecords.length} records)
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Invoice Details</strong></TableCell>
                    <TableCell><strong>Supplier</strong></TableCell>
                    <TableCell align="right"><strong>Value</strong></TableCell>
                    <TableCell align="right"><strong>Auto Drafted ITC</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Filing Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gstr2bRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {record.invoiceNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {record.invoiceDate} • Available: {record.availableDate}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {record.supplierName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {record.gstin}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(record.invoiceValue)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(
                          record.autoDraftedITC.cgst + record.autoDraftedITC.sgst + 
                          record.autoDraftedITC.igst + record.autoDraftedITC.cess
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="small"
                          label={record.status}
                          color={record.status === 'available' ? 'success' : 
                                 record.status === 'provisional' ? 'warning' : 'info'}
                        />
                        {record.actionRequired && (
                          <Warning color="warning" sx={{ ml: 1 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="small"
                          label={record.filingStatus}
                          color={record.filingStatus === 'Filed' ? 'success' : 'error'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" gutterBottom>
              Reconciliation Analytics
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Match Quality Distribution
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Perfect Matches (90-100%)</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {reconciliationMatches.filter(m => m.matchScore >= 90).length}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={reconciliationMatches.length > 0 ? (reconciliationMatches.filter(m => m.matchScore >= 90).length / reconciliationMatches.length) * 100 : 0}
                        color="success"
                        sx={{ mb: 2 }}
                      />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Good Matches (70-89%)</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {reconciliationMatches.filter(m => m.matchScore >= 70 && m.matchScore < 90).length}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={reconciliationMatches.length > 0 ? (reconciliationMatches.filter(m => m.matchScore >= 70 && m.matchScore < 90).length / reconciliationMatches.length) * 100 : 0}
                        color="warning"
                        sx={{ mb: 2 }}
                      />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Poor Matches (0-69%)</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {reconciliationMatches.filter(m => m.matchScore < 70).length}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={reconciliationMatches.length > 0 ? (reconciliationMatches.filter(m => m.matchScore < 70).length / reconciliationMatches.length) * 100 : 0}
                        color="error"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      ITC Impact Analysis
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">Total Purchase Value</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(purchaseInvoices.reduce((sum, inv) => sum + inv.invoiceValue, 0))}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">Available ITC (GSTR-2B)</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(gstr2bRecords.reduce((sum, record) => 
                            sum + record.autoDraftedITC.cgst + record.autoDraftedITC.sgst + 
                            record.autoDraftedITC.igst + record.autoDraftedITC.cess, 0
                          ))}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">Eligible ITC (After Reconciliation)</Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {formatCurrency(reconciliationSummary.totalITCAmount)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body2">Blocked/Disputed ITC</Typography>
                        <Typography variant="body2" fontWeight="bold" color="error.main">
                          {formatCurrency(
                            gstr2bRecords.reduce((sum, record) => 
                              sum + record.autoDraftedITC.cgst + record.autoDraftedITC.sgst + 
                              record.autoDraftedITC.igst + record.autoDraftedITC.cess, 0
                            ) - reconciliationSummary.totalITCAmount
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
}