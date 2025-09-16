'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CloudDownload,
  Assessment,
  Sync,
  CheckCircle,
  Warning,
  Info,
  GetApp
} from '@mui/icons-material';
import { GSTR9Data } from '../GSTR9Wizard';

interface DataSourceStepProps {
  data: GSTR9Data;
  onUpdate: (updates: Partial<GSTR9Data>) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

interface DataImportStatus {
  gstr1Data: { available: boolean; records: number; lastUpdated: string };
  gstr3bData: { available: boolean; records: number; lastUpdated: string };
  auditorData: { available: boolean; records: number; lastUpdated: string };
  bankStatements: { available: boolean; records: number; lastUpdated: string };
  purchaseRegister: { available: boolean; records: number; lastUpdated: string };
}

export function DataSourceStep({ data, onUpdate, loading, setLoading }: DataSourceStepProps) {
  const [importStatus, setImportStatus] = useState<DataImportStatus>({
    gstr1Data: { available: false, records: 0, lastUpdated: '' },
    gstr3bData: { available: false, records: 0, lastUpdated: '' },
    auditorData: { available: false, records: 0, lastUpdated: '' },
    bankStatements: { available: false, records: 0, lastUpdated: '' },
    purchaseRegister: { available: false, records: 0, lastUpdated: '' }
  });

  const [importingData, setImportingData] = useState<string | null>(null);

  const importGSTR1Data = useCallback(async () => {
    setImportingData('gstr1');
    setLoading(true);

    try {
      // Simulate API call to import GSTR-1 data
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockTurnoverData = {
        gstr1Turnover: 12500000, // 1.25 crores
        gstr3bTurnover: 12480000, // Slight difference for reconciliation
        auditorTurnover: 12520000,
        exemptSupplies: 150000,
        nilRatedSupplies: 25000,
        nonGstSupplies: 75000
      };

      const mockTaxData = {
        gstr1Tax: { cgst: 562500, sgst: 562500, igst: 225000, cess: 12000 },
        gstr3bTax: { cgst: 561000, sgst: 561000, igst: 224000, cess: 11800 },
        adjustments: { cgst: 0, sgst: 0, igst: 0, cess: 0 }
      };

      onUpdate({
        turnoverData: mockTurnoverData,
        taxData: {
          ...data.taxData,
          gstr1Tax: mockTaxData.gstr1Tax,
          gstr3bTax: mockTaxData.gstr3bTax
        },
        auditTrail: {
          ...data.auditTrail,
          dataSource: 'automated'
        }
      });

      setImportStatus(prev => ({
        ...prev,
        gstr1Data: {
          available: true,
          records: 1247,
          lastUpdated: new Date().toLocaleString()
        },
        gstr3bData: {
          available: true,
          records: 12,
          lastUpdated: new Date().toLocaleString()
        }
      }));
    } finally {
      setLoading(false);
      setImportingData(null);
    }
  }, [data.taxData, data.auditTrail, onUpdate, setLoading]);

  const importAuditorData = useCallback(async () => {
    setImportingData('auditor');
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2500));

      setImportStatus(prev => ({
        ...prev,
        auditorData: {
          available: true,
          records: 1,
          lastUpdated: new Date().toLocaleString()
        },
        bankStatements: {
          available: true,
          records: 365,
          lastUpdated: new Date().toLocaleString()
        },
        purchaseRegister: {
          available: true,
          records: 892,
          lastUpdated: new Date().toLocaleString()
        }
      }));
    } finally {
      setLoading(false);
      setImportingData(null);
    }
  }, [setLoading]);

  const downloadTemplate = useCallback((templateType: string) => {
    // Simulate template download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `GSTR-9-${templateType}-template.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const dataCompleteness = useCallback(() => {
    const sources = Object.values(importStatus);
    const available = sources.filter(source => source.available).length;
    return Math.round((available / sources.length) * 100);
  }, [importStatus]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Data Source & Import
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Import data from various sources to prepare your GSTR-9 annual return. All data will be automatically reconciled and validated.
      </Typography>

      {/* Progress Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Import Progress</Typography>
            <Chip 
              label={`${dataCompleteness()}% Complete`}
              color={dataCompleteness() === 100 ? 'success' : 'primary'}
              size="small"
            />
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={dataCompleteness()} 
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {Object.values(importStatus).filter(s => s.available).length} of {Object.values(importStatus).length} data sources imported
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* GST Portal Data */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assessment sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">GST Portal Data</Typography>
                {importStatus.gstr1Data.available && importStatus.gstr3bData.available && (
                  <CheckCircle sx={{ ml: 'auto', color: 'success.main' }} />
                )}
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Import GSTR-1 and GSTR-3B data for FY {data.financialYear}
              </Typography>

              {importStatus.gstr1Data.available ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>GSTR-1 Data:</strong> {importStatus.gstr1Data.records} records imported
                  </Typography>
                  <Typography variant="body2">
                    <strong>GSTR-3B Data:</strong> {importStatus.gstr3bData.records} monthly returns imported
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {importStatus.gstr1Data.lastUpdated}
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mb: 2 }}>
                  GST portal data not imported yet. This includes all filed returns for FY {data.financialYear}.
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                startIcon={importingData === 'gstr1' ? <Sync className="animate-spin" /> : <CloudDownload />}
                onClick={importGSTR1Data}
                disabled={loading}
              >
                {importingData === 'gstr1' ? 'Importing GST Data...' : 'Import GST Data'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Auditor Data */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Info sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="h6">Auditor & Books Data</Typography>
                {importStatus.auditorData.available && (
                  <CheckCircle sx={{ ml: 'auto', color: 'success.main' }} />
                )}
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Import auditor reports, bank statements, and purchase registers
              </Typography>

              {importStatus.auditorData.available ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Auditor Report:</strong> {importStatus.auditorData.records} report imported
                  </Typography>
                  <Typography variant="body2">
                    <strong>Bank Data:</strong> {importStatus.bankStatements.records} transactions
                  </Typography>
                  <Typography variant="body2">
                    <strong>Purchase Register:</strong> {importStatus.purchaseRegister.records} entries
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Auditor data recommended for accurate reconciliation and compliance verification.
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  startIcon={importingData === 'auditor' ? <Sync className="animate-spin" /> : <CloudDownload />}
                  onClick={importAuditorData}
                  disabled={loading}
                >
                  {importingData === 'auditor' ? 'Importing Auditor Data...' : 'Import Auditor Data'}
                </Button>
                
                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  startIcon={<GetApp />}
                  onClick={() => downloadTemplate('auditor-data')}
                >
                  Download Template
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Summary Table */}
      {(importStatus.gstr1Data.available || importStatus.gstr3bData.available) && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Imported Data Summary
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Data Source</strong></TableCell>
                    <TableCell align="right"><strong>Status</strong></TableCell>
                    <TableCell align="right"><strong>Records</strong></TableCell>
                    <TableCell align="right"><strong>Last Updated</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>GSTR-1 Returns</TableCell>
                    <TableCell align="right">
                      <Chip 
                        size="small"
                        label={importStatus.gstr1Data.available ? 'Imported' : 'Pending'}
                        color={importStatus.gstr1Data.available ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">{importStatus.gstr1Data.records}</TableCell>
                    <TableCell align="right">{importStatus.gstr1Data.lastUpdated}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Refresh data">
                        <IconButton size="small" onClick={importGSTR1Data}>
                          <Sync fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>GSTR-3B Returns</TableCell>
                    <TableCell align="right">
                      <Chip 
                        size="small"
                        label={importStatus.gstr3bData.available ? 'Imported' : 'Pending'}
                        color={importStatus.gstr3bData.available ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">{importStatus.gstr3bData.records}</TableCell>
                    <TableCell align="right">{importStatus.gstr3bData.lastUpdated}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Refresh data">
                        <IconButton size="small" onClick={importGSTR1Data}>
                          <Sync fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Auditor Report</TableCell>
                    <TableCell align="right">
                      <Chip 
                        size="small"
                        label={importStatus.auditorData.available ? 'Imported' : 'Pending'}
                        color={importStatus.auditorData.available ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell align="right">{importStatus.auditorData.records}</TableCell>
                    <TableCell align="right">{importStatus.auditorData.lastUpdated}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Import auditor data">
                        <IconButton size="small" onClick={importAuditorData}>
                          <CloudDownload fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {data.turnoverData.gstr1Turnover > 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Quick Summary:</strong> GSTR-1 Turnover: ₹{(data.turnoverData.gstr1Turnover / 100000).toFixed(2)} lakhs, 
                  GSTR-3B Turnover: ₹{(data.turnoverData.gstr3bTurnover / 100000).toFixed(2)} lakhs
                  {Math.abs(data.turnoverData.gstr1Turnover - data.turnoverData.gstr3bTurnover) > 10000 && (
                    <span style={{ color: '#f57c00' }}>
                      {' '} - Reconciliation required (₹{Math.abs(data.turnoverData.gstr1Turnover - data.turnoverData.gstr3bTurnover).toLocaleString()} difference)
                    </span>
                  )}
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}