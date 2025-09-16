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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  AutoAwesome as AutoFixIcon,
  Sync as ReconcileIcon,
  CheckCircle as MatchedIcon,
  Warning as MismatchIcon,
  ExpandMore as ExpandMoreIcon,
  CompareArrows as CompareIcon
} from '@mui/icons-material';
import { GSTR3BData, InwardSupply } from '../GSTR3BWizard';
import { formatCurrency } from '@/lib/utils';

interface ITCReconciliationStepProps {
  data: GSTR3BData;
  onUpdate: (updates: Partial<GSTR3BData>) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

interface GSTR2AEntry {
  id: string;
  gstin: string;
  invoiceNumber: string;
  invoiceDate: string;
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
  status: 'available' | 'disputed' | 'pending';
}

export const ITCReconciliationStep = ({ 
  data, 
  onUpdate, 
  loading, 
  setLoading 
}: ITCReconciliationStepProps) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [reconciling, setReconciling] = useState(false);
  const [gstr2aData, setGSTR2AData] = useState<GSTR2AEntry[]>([]);
  const [selectedMismatch, setSelectedMismatch] = useState<InwardSupply | null>(null);

  // Mock GSTR-2A data
  const fetchGSTR2AData = useCallback(async () => {
    setReconciling(true);
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockGSTR2A: GSTR2AEntry[] = [
        {
          id: 'gstr2a-001',
          gstin: '27AAAAA0000A1Z5',
          invoiceNumber: 'PUR-001',
          invoiceDate: '2024-01-15',
          taxableValue: 80000,
          cgstAmount: 7200,
          sgstAmount: 7200,
          igstAmount: 0,
          cessAmount: 0,
          status: 'available'
        },
        {
          id: 'gstr2a-002',
          gstin: '29BBBBB1111B2Z6',
          invoiceNumber: 'PUR-002',
          invoiceDate: '2024-01-20',
          taxableValue: 60000,
          cgstAmount: 5400,
          sgstAmount: 5400,
          igstAmount: 0,
          cessAmount: 0,
          status: 'available'
        },
        {
          id: 'gstr2a-003',
          gstin: '33CCCCC2222C3Z7',
          invoiceNumber: 'PUR-003',
          invoiceDate: '2024-01-25',
          taxableValue: 42000, // Mismatch with inward supply
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 7560, // Different amount
          cessAmount: 0,
          status: 'disputed'
        }
      ];
      
      setGSTR2AData(mockGSTR2A);
      
    } catch (error) {
      console.error('Failed to fetch GSTR-2A data:', error);
    } finally {
      setReconciling(false);
      setLoading(false);
    }
  }, [setLoading]);

  // Auto-reconcile matches
  const autoReconcile = useCallback(async () => {
    setReconciling(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const reconciledSupplies = data.inwardSupplies.map(supply => {
        const matchingGSTR2A = gstr2aData.find(entry => 
          entry.gstin === supply.gstin && 
          entry.invoiceNumber === supply.invoiceNumber &&
          entry.status === 'available'
        );
        
        if (matchingGSTR2A) {
          const totalTax = matchingGSTR2A.cgstAmount + matchingGSTR2A.sgstAmount + 
                          matchingGSTR2A.igstAmount + matchingGSTR2A.cessAmount;
          
          return {
            ...supply,
            itcClaimed: totalTax,
            itcReversed: 0
          };
        }
        
        return supply;
      });
      
      const pendingCount = reconciledSupplies.filter(s => s.itcClaimed === 0).length;
      
      onUpdate({
        inwardSupplies: reconciledSupplies,
        summary: {
          ...data.summary,
          pendingReconciliation: pendingCount
        }
      });
      
    } catch (error) {
      console.error('Auto-reconcile failed:', error);
    } finally {
      setReconciling(false);
    }
  }, [data.inwardSupplies, data.summary, gstr2aData, onUpdate]);

  const reconciliationStatus = useMemo(() => {
    const matched: InwardSupply[] = [];
    const mismatched: InwardSupply[] = [];
    const unmatched: InwardSupply[] = [];
    
    data.inwardSupplies.forEach(supply => {
      const gstr2aEntry = gstr2aData.find(entry => 
        entry.gstin === supply.gstin && entry.invoiceNumber === supply.invoiceNumber
      );
      
      if (!gstr2aEntry) {
        unmatched.push(supply);
      } else if (gstr2aEntry.taxableValue === supply.taxableValue && 
                 gstr2aEntry.status === 'available') {
        matched.push(supply);
      } else {
        mismatched.push(supply);
      }
    });
    
    return { matched, mismatched, unmatched };
  }, [data.inwardSupplies, gstr2aData]);

  const itcSummary = useMemo(() => {
    const summary = {
      totalAvailable: 0,
      totalClaimed: 0,
      totalReversed: 0,
      totalIneligible: 0,
      netITC: 0
    };
    
    data.inwardSupplies.forEach(supply => {
      const totalTax = supply.cgstAmount + supply.sgstAmount + supply.igstAmount + supply.cessAmount;
      summary.totalAvailable += totalTax;
      summary.totalClaimed += supply.itcClaimed;
      summary.totalReversed += supply.itcReversed;
    });
    
    summary.totalIneligible = summary.totalAvailable - summary.totalClaimed - summary.totalReversed;
    summary.netITC = summary.totalClaimed - summary.totalReversed;
    
    return summary;
  }, [data.inwardSupplies]);

  const getDisplaySupplies = () => {
    switch (currentTab) {
      case 1: return reconciliationStatus.matched;
      case 2: return reconciliationStatus.mismatched;
      case 3: return reconciliationStatus.unmatched;
      default: return data.inwardSupplies;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Input Tax Credit Reconciliation
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Reconcile your purchase invoices with GSTR-2A/2B data to claim Input Tax Credit
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Button
            onClick={fetchGSTR2AData}
            disabled={reconciling || loading}
            variant="contained"
            fullWidth
            startIcon={reconciling ? <LinearProgress sx={{ width: 20 }} /> : <CompareIcon />}
          >
            {reconciling && !gstr2aData.length ? 'Fetching GSTR-2A Data...' : 'Fetch GSTR-2A/2B Data'}
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          <Button
            onClick={autoReconcile}
            disabled={!gstr2aData.length || reconciling || loading}
            variant="outlined"
            fullWidth
            startIcon={<AutoFixIcon />}
          >
            Auto Reconcile Matches
          </Button>
        </Grid>
      </Grid>

      {gstr2aData.length > 0 && (
        <>
          {/* Reconciliation Summary */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <MatchedIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h6" color="success.main">
                    {reconciliationStatus.matched.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Matched
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <MismatchIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h6" color="warning.main">
                    {reconciliationStatus.mismatched.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mismatched
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <MismatchIcon sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
                  <Typography variant="h6" color="error.main">
                    {reconciliationStatus.unmatched.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Unmatched
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ReconcileIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" color="primary.main">
                    {((reconciliationStatus.matched.length / data.inwardSupplies.length) * 100).toFixed(0)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reconciled
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ITC Summary */}
          <Accordion sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">ITC Summary & Calculation</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Input Tax Credit Available</Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Total ITC Available:</span>
                      <span>{formatCurrency(itcSummary.totalAvailable)}</span>
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>ITC Claimed:</span>
                      <span style={{ color: 'green' }}>{formatCurrency(itcSummary.totalClaimed)}</span>
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>ITC Reversed:</span>
                      <span style={{ color: 'red' }}>({formatCurrency(itcSummary.totalReversed)})</span>
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Ineligible ITC:</span>
                      <span>{formatCurrency(itcSummary.totalIneligible)}</span>
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                      <span>Net ITC Available:</span>
                      <span>{formatCurrency(itcSummary.netITC)}</span>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>ITC Breakdown by Tax Type</Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>CGST:</span>
                      <span>{formatCurrency(data.itcDetails.itcAvailed.cgst)}</span>
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>SGST:</span>
                      <span>{formatCurrency(data.itcDetails.itcAvailed.sgst)}</span>
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>IGST:</span>
                      <span>{formatCurrency(data.itcDetails.itcAvailed.igst)}</span>
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Cess:</span>
                      <span>{formatCurrency(data.itcDetails.itcAvailed.cess)}</span>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Filter Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} variant="scrollable">
              <Tab label={`All (${data.inwardSupplies.length})`} />
              <Tab label={`Matched (${reconciliationStatus.matched.length})`} />
              <Tab label={`Mismatched (${reconciliationStatus.mismatched.length})`} />
              <Tab label={`Unmatched (${reconciliationStatus.unmatched.length})`} />
            </Tabs>
          </Box>

          {/* Reconciliation Table */}
          <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>GSTIN</TableCell>
                  <TableCell>Invoice Details</TableCell>
                  <TableCell align="right">Your Record</TableCell>
                  <TableCell align="right">GSTR-2A/2B</TableCell>
                  <TableCell align="right">ITC Status</TableCell>
                  <TableCell>Reconciliation Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getDisplaySupplies().map((supply) => {
                  const gstr2aEntry = gstr2aData.find(entry => 
                    entry.gstin === supply.gstin && entry.invoiceNumber === supply.invoiceNumber
                  );
                  
                  const status = !gstr2aEntry ? 'unmatched' : 
                               (gstr2aEntry.taxableValue === supply.taxableValue && gstr2aEntry.status === 'available') 
                               ? 'matched' : 'mismatched';
                  
                  return (
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
                        <Typography variant="body2">
                          {formatCurrency(supply.taxableValue)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Tax: {formatCurrency(supply.cgstAmount + supply.sgstAmount + supply.igstAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {gstr2aEntry ? (
                          <>
                            <Typography variant="body2">
                              {formatCurrency(gstr2aEntry.taxableValue)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Tax: {formatCurrency(gstr2aEntry.cgstAmount + gstr2aEntry.sgstAmount + gstr2aEntry.igstAmount)}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" color="error.main">
                            Not found
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          color={supply.itcClaimed > 0 ? 'success.main' : 'warning.main'}
                          fontWeight="bold"
                        >
                          {formatCurrency(supply.itcClaimed)}
                        </Typography>
                        {supply.itcReversed > 0 && (
                          <Typography variant="caption" color="error.main">
                            Reversed: {formatCurrency(supply.itcReversed)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={status.charAt(0).toUpperCase() + status.slice(1)}
                          size="small"
                          color={
                            status === 'matched' ? 'success' :
                            status === 'mismatched' ? 'warning' : 'error'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Status Alert */}
      {gstr2aData.length === 0 ? (
        <Alert severity="info" sx={{ mt: 3 }}>
          Fetch GSTR-2A/2B data from the GST portal to reconcile your purchase invoices and claim Input Tax Credit.
        </Alert>
      ) : data.summary.pendingReconciliation > 0 ? (
        <Alert severity="warning" sx={{ mt: 3 }}>
          {data.summary.pendingReconciliation} supplies are still pending reconciliation. 
          Please resolve mismatches before proceeding to tax calculation.
        </Alert>
      ) : (
        <Alert severity="success" sx={{ mt: 3 }}>
          All supplies have been reconciled successfully! Net ITC available: {formatCurrency(itcSummary.netITC)}
        </Alert>
      )}
    </Box>
  );
};