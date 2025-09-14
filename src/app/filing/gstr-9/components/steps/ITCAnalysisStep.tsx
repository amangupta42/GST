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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  AutoAwesome,
  CheckCircle,
  Warning,
  Error,
  Info,
  AccountBalance,
  TrendingDown,
  Cancel,
  Assessment
} from '@mui/icons-material';
import { GSTR9Data } from '../GSTR9Wizard';

interface ITCAnalysisStepProps {
  data: GSTR9Data;
  onUpdate: (updates: Partial<GSTR9Data>) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

interface ITCAnalysisItem {
  description: string;
  availableITC: number;
  claimedITC: number;
  reversedITC: number;
  netITC: number;
  status: 'compliant' | 'excess_claim' | 'under_claim' | 'reversal_required';
  riskLevel: 'low' | 'medium' | 'high';
}

export function ITCAnalysisStep({ data, onUpdate, loading, setLoading }: ITCAnalysisStepProps) {
  const [tabValue, setTabValue] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [reversalDialog, setReversalDialog] = useState<{ open: boolean; taxType?: string }>({ open: false });
  const [reversalAmount, setReversalAmount] = useState('');
  const [reversalReason, setReversalReason] = useState('');

  const itcAnalysis = useMemo((): ITCAnalysisItem[] => {
    return [
      {
        description: 'CGST Input Tax Credit',
        availableITC: data.itcData.availableITC.cgst,
        claimedITC: data.itcData.claimedITC.cgst,
        reversedITC: data.itcData.reversedITC.cgst,
        netITC: data.itcData.claimedITC.cgst - data.itcData.reversedITC.cgst,
        status: data.itcData.claimedITC.cgst > data.itcData.availableITC.cgst ? 'excess_claim' : 
                data.itcData.claimedITC.cgst < data.itcData.availableITC.cgst * 0.9 ? 'under_claim' : 'compliant',
        riskLevel: data.itcData.claimedITC.cgst > data.itcData.availableITC.cgst * 1.1 ? 'high' :
                   data.itcData.claimedITC.cgst > data.itcData.availableITC.cgst ? 'medium' : 'low'
      },
      {
        description: 'SGST Input Tax Credit',
        availableITC: data.itcData.availableITC.sgst,
        claimedITC: data.itcData.claimedITC.sgst,
        reversedITC: data.itcData.reversedITC.sgst,
        netITC: data.itcData.claimedITC.sgst - data.itcData.reversedITC.sgst,
        status: data.itcData.claimedITC.sgst > data.itcData.availableITC.sgst ? 'excess_claim' : 
                data.itcData.claimedITC.sgst < data.itcData.availableITC.sgst * 0.9 ? 'under_claim' : 'compliant',
        riskLevel: data.itcData.claimedITC.sgst > data.itcData.availableITC.sgst * 1.1 ? 'high' :
                   data.itcData.claimedITC.sgst > data.itcData.availableITC.sgst ? 'medium' : 'low'
      },
      {
        description: 'IGST Input Tax Credit',
        availableITC: data.itcData.availableITC.igst,
        claimedITC: data.itcData.claimedITC.igst,
        reversedITC: data.itcData.reversedITC.igst,
        netITC: data.itcData.claimedITC.igst - data.itcData.reversedITC.igst,
        status: data.itcData.claimedITC.igst > data.itcData.availableITC.igst ? 'excess_claim' : 
                data.itcData.claimedITC.igst < data.itcData.availableITC.igst * 0.9 ? 'under_claim' : 'compliant',
        riskLevel: data.itcData.claimedITC.igst > data.itcData.availableITC.igst * 1.1 ? 'high' :
                   data.itcData.claimedITC.igst > data.itcData.availableITC.igst ? 'medium' : 'low'
      },
      {
        description: 'Compensation Cess ITC',
        availableITC: data.itcData.availableITC.cess,
        claimedITC: data.itcData.claimedITC.cess,
        reversedITC: data.itcData.reversedITC.cess,
        netITC: data.itcData.claimedITC.cess - data.itcData.reversedITC.cess,
        status: data.itcData.claimedITC.cess > data.itcData.availableITC.cess ? 'excess_claim' : 'compliant',
        riskLevel: data.itcData.claimedITC.cess > data.itcData.availableITC.cess ? 'medium' : 'low'
      }
    ];
  }, [data.itcData]);

  const complianceStatus = useMemo(() => {
    const total = itcAnalysis.length;
    const compliant = itcAnalysis.filter(item => item.status === 'compliant').length;
    const excessClaims = itcAnalysis.filter(item => item.status === 'excess_claim').length;
    const underClaims = itcAnalysis.filter(item => item.status === 'under_claim').length;
    const reversalsRequired = itcAnalysis.filter(item => item.status === 'reversal_required').length;
    const highRisk = itcAnalysis.filter(item => item.riskLevel === 'high').length;

    return {
      total,
      compliant,
      excessClaims,
      underClaims,
      reversalsRequired,
      highRisk,
      completionPercentage: Math.round((compliant / total) * 100)
    };
  }, [itcAnalysis]);

  const totalITC = useMemo(() => {
    return {
      totalAvailable: Object.values(data.itcData.availableITC).reduce((sum, val) => sum + val, 0),
      totalClaimed: Object.values(data.itcData.claimedITC).reduce((sum, val) => sum + val, 0),
      totalReversed: Object.values(data.itcData.reversedITC).reduce((sum, val) => sum + val, 0),
      totalIneligible: Object.values(data.itcData.ineligibleITC).reduce((sum, val) => sum + val, 0)
    };
  }, [data.itcData]);

  const performITCAnalysis = useCallback(async () => {
    setAnalyzing(true);
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock ITC data if not already populated
      if (totalITC.totalAvailable === 0) {
        const mockITCData = {
          availableITC: { cgst: 125000, sgst: 125000, igst: 45000, cess: 5000 },
          claimedITC: { cgst: 130000, sgst: 124000, igst: 44000, cess: 5200 },
          reversedITC: { cgst: 8000, sgst: 7500, igst: 2000, cess: 0 },
          ineligibleITC: { cgst: 15000, sgst: 15000, igst: 5000, cess: 500 }
        };

        onUpdate({
          itcData: mockITCData
        });
      }

      // Simulate analysis completion
      const discrepancies: string[] = [];
      
      itcAnalysis.forEach(item => {
        if (item.status === 'excess_claim') {
          discrepancies.push(`${item.description}: Excess claim of ₹${Math.abs(item.claimedITC - item.availableITC).toLocaleString()}`);
        }
      });

      const isReconciled = complianceStatus.excessClaims === 0 && complianceStatus.highRisk === 0;

      onUpdate({
        reconciliationStatus: {
          ...data.reconciliationStatus,
          itcReconciled: isReconciled,
          discrepancies: [...data.reconciliationStatus.discrepancies, ...discrepancies].slice(0, 10)
        }
      });

    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  }, [totalITC.totalAvailable, itcAnalysis, complianceStatus.excessClaims, complianceStatus.highRisk, data.reconciliationStatus, onUpdate, setLoading]);

  const openReversalDialog = useCallback((taxType: string) => {
    setReversalDialog({ open: true, taxType });
    setReversalAmount('');
    setReversalReason('');
  }, []);

  const closeReversalDialog = useCallback(() => {
    setReversalDialog({ open: false });
    setReversalAmount('');
    setReversalReason('');
  }, []);

  const processReversal = useCallback(() => {
    // In a real implementation, this would process the ITC reversal
    closeReversalDialog();
  }, [closeReversalDialog]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

  const getStatusColor = (status: ITCAnalysisItem['status']) => {
    switch (status) {
      case 'compliant': return 'success';
      case 'under_claim': return 'info';
      case 'excess_claim': return 'warning';
      case 'reversal_required': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: ITCAnalysisItem['status']) => {
    switch (status) {
      case 'compliant': return 'Compliant';
      case 'under_claim': return 'Under Claim';
      case 'excess_claim': return 'Excess Claim';
      case 'reversal_required': return 'Reversal Req.';
      default: return 'Unknown';
    }
  };

  const getRiskColor = (riskLevel: ITCAnalysisItem['riskLevel']) => {
    switch (riskLevel) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'error';
      default: return 'default';
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
        ITC Reconciliation & Analysis
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Analyze Input Tax Credit claims, reversals, and compliance status for accurate GSTR-9 reporting.
      </Typography>

      {/* ITC Analysis Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">ITC Compliance Analysis</Typography>
            <Chip 
              label={`${complianceStatus.completionPercentage}% Compliant`}
              color={complianceStatus.completionPercentage >= 90 ? 'success' : complianceStatus.completionPercentage >= 70 ? 'warning' : 'error'}
            />
          </Box>

          <LinearProgress 
            variant="determinate" 
            value={complianceStatus.completionPercentage} 
            sx={{ height: 8, borderRadius: 4, mb: 2 }}
          />

          <Grid container spacing={2}>
            <Grid item xs={6} sm={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {complianceStatus.compliant}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Compliant
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {complianceStatus.excessClaims}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Excess Claims
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="error.main">
                  {complianceStatus.highRisk}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  High Risk
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={2}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {complianceStatus.underClaims}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Under Claims
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={analyzing ? <AutoAwesome className="animate-spin" /> : <AutoAwesome />}
                  onClick={performITCAnalysis}
                  disabled={loading}
                >
                  {analyzing ? 'Analyzing ITC...' : 'Analyze ITC'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ITC Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <AccountBalance sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6">Available ITC</Typography>
              <Typography variant="h4" color="primary.main">
                {formatCurrency(totalITC.totalAvailable)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingDown sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h6">Claimed ITC</Typography>
              <Typography variant="h4" color="secondary.main">
                {formatCurrency(totalITC.totalClaimed)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Cancel sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h6">Reversed ITC</Typography>
              <Typography variant="h4" color="warning.main">
                {formatCurrency(totalITC.totalReversed)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Error sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h6">Ineligible ITC</Typography>
              <Typography variant="h4" color="error.main">
                {formatCurrency(totalITC.totalIneligible)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed ITC Analysis */}
      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="ITC Analysis" />
              <Tab label="Compliance Issues" />
              <Tab label="Reversals" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Typography variant="h6" gutterBottom>
              Detailed ITC Analysis by Tax Type
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Tax Type</strong></TableCell>
                    <TableCell align="right"><strong>Available</strong></TableCell>
                    <TableCell align="right"><strong>Claimed</strong></TableCell>
                    <TableCell align="right"><strong>Reversed</strong></TableCell>
                    <TableCell align="right"><strong>Net ITC</strong></TableCell>
                    <TableCell align="center"><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Risk</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itcAnalysis.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {item.status === 'compliant' && <CheckCircle sx={{ mr: 1, fontSize: 16, color: 'success.main' }} />}
                          {item.status === 'excess_claim' && <Warning sx={{ mr: 1, fontSize: 16, color: 'warning.main' }} />}
                          {item.status === 'reversal_required' && <Error sx={{ mr: 1, fontSize: 16, color: 'error.main' }} />}
                          {item.status === 'under_claim' && <Info sx={{ mr: 1, fontSize: 16, color: 'info.main' }} />}
                          {item.description}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{formatCurrency(item.availableITC)}</TableCell>
                      <TableCell align="right">
                        <Typography 
                          color={item.claimedITC > item.availableITC ? 'error.main' : 'text.primary'}
                          fontWeight={item.claimedITC > item.availableITC ? 'bold' : 'normal'}
                        >
                          {formatCurrency(item.claimedITC)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{formatCurrency(item.reversedITC)}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="bold">
                          {formatCurrency(item.netITC)}
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
                        <Chip 
                          size="small"
                          label={item.riskLevel.toUpperCase()}
                          color={getRiskColor(item.riskLevel)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {item.status === 'excess_claim' && (
                          <Button 
                            size="small" 
                            variant="contained" 
                            color="warning"
                            onClick={() => openReversalDialog(item.description)}
                          >
                            Reverse
                          </Button>
                        )}
                        {item.status === 'compliant' && (
                          <Chip size="small" label="OK" color="success" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" gutterBottom>
              ITC Compliance Issues & Recommendations
            </Typography>

            {complianceStatus.excessClaims > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Excess ITC Claims Detected
                </Typography>
                <List dense>
                  {itcAnalysis.filter(item => item.status === 'excess_claim').map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Error color="error" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.description}
                        secondary={`Excess claim: ${formatCurrency(item.claimedITC - item.availableITC)} - Reversal required`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Alert>
            )}

            {complianceStatus.underClaims > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Under-utilized ITC Opportunities
                </Typography>
                <List dense>
                  {itcAnalysis.filter(item => item.status === 'under_claim').map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Info color="info" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.description}
                        secondary={`Additional ITC available: ${formatCurrency(item.availableITC - item.claimedITC)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Alert>
            )}

            {complianceStatus.highRisk > 0 && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  High Risk Items Requiring Attention
                </Typography>
                <List dense>
                  {itcAnalysis.filter(item => item.riskLevel === 'high').map((item, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Warning color="warning" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.description}
                        secondary="Significant variance detected - Review supporting documents"
                      />
                    </ListItem>
                  ))}
                </List>
              </Alert>
            )}

            {complianceStatus.completionPercentage === 100 && (
              <Alert severity="success">
                <Typography variant="body2">
                  <strong>ITC Compliance Verified:</strong> All ITC claims are within acceptable limits. 
                  No immediate action required.
                </Typography>
              </Alert>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" gutterBottom>
              ITC Reversals & Adjustments
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                ITC reversals will be reported in Table 4(B)(2) of GSTR-9. 
                Ensure all reversals are properly documented and justified.
              </Typography>
            </Alert>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Tax Type</strong></TableCell>
                    <TableCell align="right"><strong>Current Reversal</strong></TableCell>
                    <TableCell align="right"><strong>Required Reversal</strong></TableCell>
                    <TableCell align="right"><strong>Adjustment Needed</strong></TableCell>
                    <TableCell><strong>Reason</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itcAnalysis.map((item, index) => {
                    const requiredReversal = Math.max(0, item.claimedITC - item.availableITC);
                    const adjustmentNeeded = requiredReversal - item.reversedITC;
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{formatCurrency(item.reversedITC)}</TableCell>
                        <TableCell align="right">
                          <Typography color={requiredReversal > 0 ? 'error.main' : 'text.secondary'}>
                            {formatCurrency(requiredReversal)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            color={adjustmentNeeded > 0 ? 'error.main' : 'success.main'}
                            fontWeight={adjustmentNeeded > 0 ? 'bold' : 'normal'}
                          >
                            {formatCurrency(adjustmentNeeded)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {item.status === 'excess_claim' ? 'Excess ITC claim reversal' : 
                           item.status === 'compliant' ? 'No reversal required' :
                           'Standard compliance reversal'}
                        </TableCell>
                        <TableCell align="center">
                          <Button 
                            size="small" 
                            variant={adjustmentNeeded > 0 ? 'contained' : 'outlined'}
                            color={adjustmentNeeded > 0 ? 'error' : 'primary'}
                            disabled={adjustmentNeeded <= 0}
                            onClick={() => openReversalDialog(item.description)}
                          >
                            {adjustmentNeeded > 0 ? 'Process' : 'Complete'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {data.reconciliationStatus.itcReconciled && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>ITC Analysis Complete:</strong> All Input Tax Credit items have been analyzed and reconciled. 
                Ready to proceed to GSTR-9 preview.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* ITC Reversal Dialog */}
      <Dialog open={reversalDialog.open} onClose={closeReversalDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Process ITC Reversal
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {reversalDialog.taxType}
          </Typography>
          
          <TextField
            fullWidth
            label="Reversal Amount"
            type="number"
            value={reversalAmount}
            onChange={(e) => setReversalAmount(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Reason for Reversal"
            multiline
            rows={3}
            value={reversalReason}
            onChange={(e) => setReversalReason(e.target.value)}
            placeholder="Explain the reason for ITC reversal..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReversalDialog}>Cancel</Button>
          <Button onClick={processReversal} variant="contained" color="error">
            Process Reversal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}