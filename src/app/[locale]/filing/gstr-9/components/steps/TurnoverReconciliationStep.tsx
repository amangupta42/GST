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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  AutoAwesome,
  Warning,
  CheckCircle,
  Info,
  Edit,
  Help,
  TrendingUp,
  Assessment
} from '@mui/icons-material';
import { GSTR9Data } from '../GSTR9Wizard';

interface TurnoverReconciliationStepProps {
  data: GSTR9Data;
  onUpdate: (updates: Partial<GSTR9Data>) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

interface ReconciliationItem {
  description: string;
  gstr1Value: number;
  gstr3bValue: number;
  auditorValue: number;
  difference: number;
  status: 'matched' | 'minor_difference' | 'major_difference';
  explanation?: string;
}

export function TurnoverReconciliationStep({ data, onUpdate, loading, setLoading }: TurnoverReconciliationStepProps) {
  const [reconciling, setReconciling] = useState(false);
  const [adjustmentDialog, setAdjustmentDialog] = useState<{ open: boolean; item?: ReconciliationItem }>({ open: false });
  const [adjustmentValue, setAdjustmentValue] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  const reconciliationItems = useMemo((): ReconciliationItem[] => [
    {
      description: 'Total Taxable Supplies',
      gstr1Value: data.turnoverData.gstr1Turnover,
      gstr3bValue: data.turnoverData.gstr3bTurnover,
      auditorValue: data.turnoverData.auditorTurnover,
      difference: data.turnoverData.gstr1Turnover - data.turnoverData.gstr3bTurnover,
      status: Math.abs(data.turnoverData.gstr1Turnover - data.turnoverData.gstr3bTurnover) <= 50000 ? 'matched' : 
              Math.abs(data.turnoverData.gstr1Turnover - data.turnoverData.gstr3bTurnover) <= 200000 ? 'minor_difference' : 'major_difference',
      explanation: 'Difference may be due to amendments, cancellations, or timing differences in reporting'
    },
    {
      description: 'Exempt Supplies',
      gstr1Value: data.turnoverData.exemptSupplies,
      gstr3bValue: data.turnoverData.exemptSupplies,
      auditorValue: data.turnoverData.exemptSupplies + 5000,
      difference: 0,
      status: 'matched' as const
    },
    {
      description: 'Nil Rated Supplies',
      gstr1Value: data.turnoverData.nilRatedSupplies,
      gstr3bValue: data.turnoverData.nilRatedSupplies,
      auditorValue: data.turnoverData.nilRatedSupplies,
      difference: 0,
      status: 'matched' as const
    },
    {
      description: 'Non-GST Supplies',
      gstr1Value: data.turnoverData.nonGstSupplies,
      gstr3bValue: data.turnoverData.nonGstSupplies,
      auditorValue: data.turnoverData.nonGstSupplies + 2000,
      difference: 0,
      status: 'matched' as const
    }
  ], [data.turnoverData]);

  const reconciliationStatus = useMemo(() => {
    const total = reconciliationItems.length;
    const matched = reconciliationItems.filter(item => item.status === 'matched').length;
    const minorIssues = reconciliationItems.filter(item => item.status === 'minor_difference').length;
    const majorIssues = reconciliationItems.filter(item => item.status === 'major_difference').length;

    return {
      total,
      matched,
      minorIssues,
      majorIssues,
      completionPercentage: Math.round(((matched + minorIssues * 0.5) / total) * 100)
    };
  }, [reconciliationItems]);

  const autoReconcile = useCallback(async () => {
    setReconciling(true);
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate auto-reconciliation logic
      const discrepancies: string[] = [];
      
      if (Math.abs(data.turnoverData.gstr1Turnover - data.turnoverData.gstr3bTurnover) > 50000) {
        discrepancies.push(`Turnover difference: ₹${Math.abs(data.turnoverData.gstr1Turnover - data.turnoverData.gstr3bTurnover).toLocaleString()}`);
      }

      const isReconciled = reconciliationStatus.majorIssues === 0;

      onUpdate({
        reconciliationStatus: {
          ...data.reconciliationStatus,
          turnoverReconciled: isReconciled,
          discrepancies: isReconciled ? [] : discrepancies
        }
      });

    } finally {
      setLoading(false);
      setReconciling(false);
    }
  }, [data, onUpdate, setLoading, reconciliationStatus.majorIssues]);

  const openAdjustmentDialog = useCallback((item: ReconciliationItem) => {
    setAdjustmentDialog({ open: true, item });
    setAdjustmentValue(item.gstr1Value.toString());
    setAdjustmentReason('');
  }, []);

  const closeAdjustmentDialog = useCallback(() => {
    setAdjustmentDialog({ open: false });
    setAdjustmentValue('');
    setAdjustmentReason('');
  }, []);

  const saveAdjustment = useCallback(() => {
    // In a real implementation, this would save the adjustment
    closeAdjustmentDialog();
  }, [closeAdjustmentDialog]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

  const getStatusColor = (status: ReconciliationItem['status']) => {
    switch (status) {
      case 'matched': return 'success';
      case 'minor_difference': return 'warning';
      case 'major_difference': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: ReconciliationItem['status']) => {
    switch (status) {
      case 'matched': return 'Matched';
      case 'minor_difference': return 'Minor Diff';
      case 'major_difference': return 'Major Diff';
      default: return 'Unknown';
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Turnover Reconciliation
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Compare and reconcile turnover figures from GSTR-1, GSTR-3B, and auditor reports.
      </Typography>

      {/* Reconciliation Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Reconciliation Progress</Typography>
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
                  onClick={autoReconcile}
                  disabled={loading}
                >
                  Auto Reconcile
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Detailed Reconciliation Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Detailed Turnover Comparison
          </Typography>

          <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell align="right"><strong>GSTR-1</strong></TableCell>
                  <TableCell align="right"><strong>GSTR-3B</strong></TableCell>
                  <TableCell align="right"><strong>Auditor</strong></TableCell>
                  <TableCell align="right"><strong>Difference</strong></TableCell>
                  <TableCell align="center"><strong>Status</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reconciliationItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {item.status === 'matched' && <CheckCircle sx={{ mr: 1, fontSize: 16, color: 'success.main' }} />}
                        {item.status === 'minor_difference' && <Warning sx={{ mr: 1, fontSize: 16, color: 'warning.main' }} />}
                        {item.status === 'major_difference' && <Warning sx={{ mr: 1, fontSize: 16, color: 'error.main' }} />}
                        {item.description}
                      </Box>
                    </TableCell>
                    <TableCell align="right">{formatCurrency(item.gstr1Value)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.gstr3bValue)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.auditorValue)}</TableCell>
                    <TableCell align="right">
                      <Typography 
                        color={Math.abs(item.difference) > 50000 ? 'error.main' : item.difference !== 0 ? 'warning.main' : 'text.secondary'}
                        fontWeight={Math.abs(item.difference) > 50000 ? 'bold' : 'normal'}
                      >
                        {item.difference >= 0 ? '+' : ''}{formatCurrency(item.difference)}
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
                      <Tooltip title="Adjust value">
                        <IconButton 
                          size="small" 
                          onClick={() => openAdjustmentDialog(item)}
                          disabled={item.status === 'matched'}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {item.explanation && (
                        <Tooltip title={item.explanation}>
                          <IconButton size="small">
                            <Help fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Summary Cards */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUp sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6">
                    Total Turnover (GSTR-1)
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {formatCurrency(data.turnoverData.gstr1Turnover)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Assessment sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
                  <Typography variant="h6">
                    Total Turnover (GSTR-3B)
                  </Typography>
                  <Typography variant="h4" color="secondary.main">
                    {formatCurrency(data.turnoverData.gstr3bTurnover)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center' }}>
                  <Info sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h6">
                    Net Difference
                  </Typography>
                  <Typography 
                    variant="h4" 
                    color={Math.abs(data.turnoverData.gstr1Turnover - data.turnoverData.gstr3bTurnover) > 100000 ? 'error.main' : 'info.main'}
                  >
                    {formatCurrency(Math.abs(data.turnoverData.gstr1Turnover - data.turnoverData.gstr3bTurnover))}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Reconciliation Status */}
          {reconciliationStatus.majorIssues > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Action Required: Major Discrepancies Found
              </Typography>
              <List dense>
                {reconciliationItems.filter(item => item.status === 'major_difference').map((item, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.description}
                      secondary={`Difference: ${formatCurrency(Math.abs(item.difference))}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Alert>
          )}

          {data.reconciliationStatus.turnoverReconciled && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Reconciliation Complete:</strong> All turnover figures have been successfully reconciled. 
                You can proceed to the next step.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Adjustment Dialog */}
      <Dialog open={adjustmentDialog.open} onClose={closeAdjustmentDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Adjust Turnover Value
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {adjustmentDialog.item?.description}
          </Typography>
          
          <TextField
            fullWidth
            label="Adjusted Value"
            type="number"
            value={adjustmentValue}
            onChange={(e) => setAdjustmentValue(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Reason for Adjustment"
            multiline
            rows={3}
            value={adjustmentReason}
            onChange={(e) => setAdjustmentReason(e.target.value)}
            placeholder="Explain why this adjustment is necessary..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeAdjustmentDialog}>Cancel</Button>
          <Button onClick={saveAdjustment} variant="contained">
            Save Adjustment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}