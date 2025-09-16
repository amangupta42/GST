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
  Divider
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Download as ImportIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { GSTR3BData, OutwardSupply } from '../GSTR3BWizard';
import { formatCurrency } from '@/lib/utils';

interface OutwardSuppliesStepProps {
  data: GSTR3BData;
  onUpdate: (updates: Partial<GSTR3BData>) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const OutwardSuppliesStep = ({ 
  data, 
  onUpdate, 
  loading, 
  setLoading 
}: OutwardSuppliesStepProps) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [importingData, setImportingData] = useState(false);

  // Mock GSTR-1 data import
  const importFromGSTR1 = useCallback(async () => {
    setImportingData(true);
    setLoading(true);
    
    try {
      // Simulate importing from GSTR-1
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockOutwardSupplies: OutwardSupply[] = [
        {
          id: 'b2b-001',
          type: 'B2B',
          taxableValue: 100000,
          cgstAmount: 9000,
          sgstAmount: 9000,
          igstAmount: 0,
          cessAmount: 0
        },
        {
          id: 'b2c-001',
          type: 'B2C',
          taxableValue: 50000,
          cgstAmount: 4500,
          sgstAmount: 4500,
          igstAmount: 0,
          cessAmount: 0
        },
        {
          id: 'export-001',
          type: 'Export',
          taxableValue: 75000,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          cessAmount: 0
        },
        {
          id: 'exempt-001',
          type: 'Exempt',
          taxableValue: 25000,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          cessAmount: 0
        }
      ];
      
      // Calculate summary
      const totalOutwardTurnover = mockOutwardSupplies.reduce(
        (sum, supply) => sum + supply.taxableValue, 0
      );
      
      onUpdate({
        outwardSupplies: mockOutwardSupplies,
        summary: {
          ...data.summary,
          totalOutwardTurnover,
          validatedSupplies: mockOutwardSupplies.length
        }
      });
      
    } catch (error) {
      console.error('Failed to import GSTR-1 data:', error);
    } finally {
      setImportingData(false);
      setLoading(false);
    }
  }, [data.summary, onUpdate, setLoading]);

  const suppliesByType = useMemo(() => {
    return {
      all: data.outwardSupplies,
      B2B: data.outwardSupplies.filter(s => s.type === 'B2B'),
      B2C: data.outwardSupplies.filter(s => s.type === 'B2C'),
      Export: data.outwardSupplies.filter(s => s.type === 'Export'),
      Exempt: data.outwardSupplies.filter(s => s.type === 'Exempt')
    };
  }, [data.outwardSupplies]);

  const summary = useMemo(() => {
    const totals = {
      B2B: { taxableValue: 0, tax: 0, count: 0 },
      B2C: { taxableValue: 0, tax: 0, count: 0 },
      Export: { taxableValue: 0, tax: 0, count: 0 },
      Exempt: { taxableValue: 0, tax: 0, count: 0 }
    };

    data.outwardSupplies.forEach(supply => {
      const total = supply.cgstAmount + supply.sgstAmount + supply.igstAmount + supply.cessAmount;
      totals[supply.type].taxableValue += supply.taxableValue;
      totals[supply.type].tax += total;
      totals[supply.type].count++;
    });

    return totals;
  }, [data.outwardSupplies]);

  const getDisplaySupplies = () => {
    switch (currentTab) {
      case 1: return suppliesByType.B2B;
      case 2: return suppliesByType.B2C;
      case 3: return suppliesByType.Export;
      case 4: return suppliesByType.Exempt;
      default: return suppliesByType.all;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Outward Supplies Summary
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Import and review your outward supplies from GSTR-1 for the current month
        </Typography>
      </Box>

      {/* Import Section */}
      {data.outwardSupplies.length === 0 ? (
        <Card sx={{ mb: 3, textAlign: 'center' }}>
          <CardContent sx={{ py: 6 }}>
            <ReceiptIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Import Outward Supplies
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Import your filed GSTR-1 data for the current month to populate outward supplies
            </Typography>
            <Button
              onClick={importFromGSTR1}
              disabled={importingData || loading}
              variant="contained"
              size="large"
              startIcon={importingData ? undefined : <ImportIcon />}
            >
              {importingData ? (
                <>
                  <LinearProgress sx={{ width: 100, mr: 1 }} />
                  Importing from GSTR-1...
                </>
              ) : (
                'Import from GSTR-1'
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {Object.entries(summary).map(([type, data]) => (
              <Grid item xs={12} sm={6} md={3} key={type}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(data.taxableValue)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {type} Sales
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="caption">
                        {data.count} transactions
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        Tax: {formatCurrency(data.tax)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Action Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Supply Details ({data.outwardSupplies.length} records)
            </Typography>
            <Button
              onClick={importFromGSTR1}
              disabled={importingData || loading}
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
            >
              Refresh Data
            </Button>
          </Box>

          {/* Filter Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} variant="scrollable">
              <Tab label={`All (${suppliesByType.all.length})`} />
              <Tab label={`B2B (${suppliesByType.B2B.length})`} />
              <Tab label={`B2C (${suppliesByType.B2C.length})`} />
              <Tab label={`Export (${suppliesByType.Export.length})`} />
              <Tab label={`Exempt (${suppliesByType.Exempt.length})`} />
            </Tabs>
          </Box>

          {/* Supplies Table */}
          <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Supply Type</TableCell>
                  <TableCell align="right">Taxable Value</TableCell>
                  <TableCell align="right">CGST</TableCell>
                  <TableCell align="right">SGST</TableCell>
                  <TableCell align="right">IGST</TableCell>
                  <TableCell align="right">Cess</TableCell>
                  <TableCell align="right">Total Tax</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getDisplaySupplies().map((supply, index) => (
                  <TableRow key={supply.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={supply.type} 
                          size="small" 
                          color={
                            supply.type === 'B2B' ? 'primary' :
                            supply.type === 'B2C' ? 'secondary' :
                            supply.type === 'Export' ? 'success' : 'default'
                          }
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(supply.taxableValue)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(supply.cgstAmount)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(supply.sgstAmount)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(supply.igstAmount)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(supply.cessAmount)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(supply.cgstAmount + supply.sgstAmount + supply.igstAmount + supply.cessAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Summary Footer */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Outward Supplies Summary
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Total Outward Turnover:</strong> {formatCurrency(data.summary.totalOutwardTurnover)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sum of all taxable supplies for the month
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Records Processed:</strong> {data.summary.validatedSupplies}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    All supplies imported and validated successfully
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}

      {/* Status Alert */}
      {data.outwardSupplies.length > 0 ? (
        <Alert severity="success" sx={{ mt: 3 }}>
          Outward supplies imported successfully! You can proceed to import inward supplies.
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mt: 3 }}>
          Please import outward supplies from your filed GSTR-1 to continue with the GSTR-3B filing.
        </Alert>
      )}
    </Box>
  );
};