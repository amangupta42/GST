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
  Alert,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Receipt as ReceiptIcon,
  Assessment as AssessmentIcon,
  AccountBalance as TaxIcon,
  CreditCard as ITCIcon
} from '@mui/icons-material';
import { GSTR3BData } from '../GSTR3BWizard';
import { formatCurrency } from '@/lib/utils';

interface GSTR3BPreviewStepProps {
  data: GSTR3BData;
  onUpdate: (updates: Partial<GSTR3BData>) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const GSTR3BPreviewStep = ({ data }: GSTR3BPreviewStepProps) => {
  const returnSummary = useMemo(() => {
    // Outward supplies summary
    const outwardSummary = {
      B2B: { taxableValue: 0, tax: 0, count: 0 },
      B2C: { taxableValue: 0, tax: 0, count: 0 },
      Export: { taxableValue: 0, tax: 0, count: 0 },
      Exempt: { taxableValue: 0, tax: 0, count: 0 }
    };

    data.outwardSupplies.forEach(supply => {
      const tax = supply.cgstAmount + supply.sgstAmount + supply.igstAmount + supply.cessAmount;
      outwardSummary[supply.type].taxableValue += supply.taxableValue;
      outwardSummary[supply.type].tax += tax;
      outwardSummary[supply.type].count++;
    });

    // Inward supplies summary
    const inwardSummary = {
      totalPurchases: data.inwardSupplies.reduce((sum, s) => sum + s.taxableValue, 0),
      totalITC: data.inwardSupplies.reduce((sum, s) => sum + s.itcClaimed, 0),
      reversedITC: data.inwardSupplies.reduce((sum, s) => sum + s.itcReversed, 0),
      count: data.inwardSupplies.length
    };

    return { outwardSummary, inwardSummary };
  }, [data.outwardSupplies, data.inwardSupplies]);

  // GSTR-3B table structure (simplified)
  const gstr3bTables = useMemo(() => {
    const outwardTax = {
      cgst: data.outwardSupplies.reduce((sum, s) => sum + s.cgstAmount, 0),
      sgst: data.outwardSupplies.reduce((sum, s) => sum + s.sgstAmount, 0),
      igst: data.outwardSupplies.reduce((sum, s) => sum + s.igstAmount, 0),
      cess: data.outwardSupplies.reduce((sum, s) => sum + s.cessAmount, 0)
    };

    const itcClaimed = {
      cgst: data.inwardSupplies.reduce((sum, s) => sum + (s.cgstAmount * (s.itcClaimed / (s.cgstAmount + s.sgstAmount + s.igstAmount))), 0),
      sgst: data.inwardSupplies.reduce((sum, s) => sum + (s.sgstAmount * (s.itcClaimed / (s.cgstAmount + s.sgstAmount + s.igstAmount))), 0),
      igst: data.inwardSupplies.reduce((sum, s) => sum + (s.igstAmount * (s.itcClaimed / (s.cgstAmount + s.sgstAmount + s.igstAmount))), 0),
      cess: 0
    };

    return {
      table3_1: {
        b2b: { taxableValue: returnSummary.outwardSummary.B2B.taxableValue, cgst: 0, sgst: 0, igst: 0 }, // Simplified
        b2cl: { taxableValue: returnSummary.outwardSummary.B2C.taxableValue, cgst: 0, sgst: 0, igst: 0 },
        export: { taxableValue: returnSummary.outwardSummary.Export.taxableValue, cgst: 0, sgst: 0, igst: 0 },
        exempt: { taxableValue: returnSummary.outwardSummary.Exempt.taxableValue, cgst: 0, sgst: 0, igst: 0 }
      },
      table4: {
        itcAvailed: itcClaimed,
        itcReversed: {
          cgst: data.inwardSupplies.reduce((sum, s) => sum + s.itcReversed * 0.5, 0), // Simplified split
          sgst: data.inwardSupplies.reduce((sum, s) => sum + s.itcReversed * 0.5, 0),
          igst: 0,
          cess: 0
        }
      },
      table5: {
        taxPayable: {
          cgst: Math.max(0, outwardTax.cgst - itcClaimed.cgst),
          sgst: Math.max(0, outwardTax.sgst - itcClaimed.sgst),
          igst: Math.max(0, outwardTax.igst - itcClaimed.igst),
          cess: Math.max(0, outwardTax.cess - itcClaimed.cess)
        }
      }
    };
  }, [data.outwardSupplies, data.inwardSupplies, returnSummary]);

  const currentPeriod = new Date().toLocaleString('en-IN', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          GSTR-3B Return Preview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review your complete GSTR-3B monthly summary return before submission
        </Typography>
      </Box>

      {/* Return Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Return Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                GSTIN: <strong>27AAAAA0000A1Z5</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Return Period: <strong>{currentPeriod}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Return Type: <strong>GSTR-3B (Monthly Summary)</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Filing Date: <strong>{new Date().toLocaleDateString('en-IN')}</strong>
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Summary Statistics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Outward Supplies: <strong>{data.outwardSupplies.length} records</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Inward Supplies: <strong>{data.inwardSupplies.length} records</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Net Tax Payable: <strong>{formatCurrency(data.taxLiability.netTaxLiability)}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cash Payment: <strong>{formatCurrency(data.taxLiability.cashPayment)}</strong>
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table 3.1: Outward Supplies */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ReceiptIcon color="primary" />
            <Typography variant="h6">Table 3.1: Outward Supplies and Inward Supplies Liable to Reverse Charge</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nature of Supply</TableCell>
                  <TableCell align="right">Taxable Value</TableCell>
                  <TableCell align="right">CGST</TableCell>
                  <TableCell align="right">SGST/UTGST</TableCell>
                  <TableCell align="right">IGST</TableCell>
                  <TableCell align="right">Cess</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>(a) Outward taxable supplies (other than zero rated, nil rated and exempted)</TableCell>
                  <TableCell align="right">
                    {formatCurrency(returnSummary.outwardSummary.B2B.taxableValue + returnSummary.outwardSummary.B2C.taxableValue)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(data.outwardSupplies.reduce((sum, s) => sum + (s.type !== 'Export' && s.type !== 'Exempt' ? s.cgstAmount : 0), 0))}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(data.outwardSupplies.reduce((sum, s) => sum + (s.type !== 'Export' && s.type !== 'Exempt' ? s.sgstAmount : 0), 0))}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(data.outwardSupplies.reduce((sum, s) => sum + (s.type !== 'Export' && s.type !== 'Exempt' ? s.igstAmount : 0), 0))}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(data.outwardSupplies.reduce((sum, s) => sum + (s.type !== 'Export' && s.type !== 'Exempt' ? s.cessAmount : 0), 0))}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>(b) Outward taxable supplies (zero rated)</TableCell>
                  <TableCell align="right">{formatCurrency(returnSummary.outwardSummary.Export.taxableValue)}</TableCell>
                  <TableCell align="right">0.00</TableCell>
                  <TableCell align="right">0.00</TableCell>
                  <TableCell align="right">0.00</TableCell>
                  <TableCell align="right">0.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>(c) Other outward supplies (nil rated, exempted)</TableCell>
                  <TableCell align="right">{formatCurrency(returnSummary.outwardSummary.Exempt.taxableValue)}</TableCell>
                  <TableCell align="right">0.00</TableCell>
                  <TableCell align="right">0.00</TableCell>
                  <TableCell align="right">0.00</TableCell>
                  <TableCell align="right">0.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Table 4: Input Tax Credit */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ITCIcon color="success" />
            <Typography variant="h6">Table 4: Input Tax Credit (ITC)</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Details</TableCell>
                  <TableCell align="right">CGST</TableCell>
                  <TableCell align="right">SGST/UTGST</TableCell>
                  <TableCell align="right">IGST</TableCell>
                  <TableCell align="right">Cess</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>(A) ITC Available (whether in full or part)</TableCell>
                  <TableCell align="right">{formatCurrency(gstr3bTables.table4.itcAvailed.cgst)}</TableCell>
                  <TableCell align="right">{formatCurrency(gstr3bTables.table4.itcAvailed.sgst)}</TableCell>
                  <TableCell align="right">{formatCurrency(gstr3bTables.table4.itcAvailed.igst)}</TableCell>
                  <TableCell align="right">{formatCurrency(gstr3bTables.table4.itcAvailed.cess)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>(B) ITC Reversed</TableCell>
                  <TableCell align="right">{formatCurrency(gstr3bTables.table4.itcReversed.cgst)}</TableCell>
                  <TableCell align="right">{formatCurrency(gstr3bTables.table4.itcReversed.sgst)}</TableCell>
                  <TableCell align="right">{formatCurrency(gstr3bTables.table4.itcReversed.igst)}</TableCell>
                  <TableCell align="right">{formatCurrency(gstr3bTables.table4.itcReversed.cess)}</TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: 'success.50' }}>
                  <TableCell><strong>(C) Net ITC Available (A)-(B)</strong></TableCell>
                  <TableCell align="right"><strong>
                    {formatCurrency(gstr3bTables.table4.itcAvailed.cgst - gstr3bTables.table4.itcReversed.cgst)}
                  </strong></TableCell>
                  <TableCell align="right"><strong>
                    {formatCurrency(gstr3bTables.table4.itcAvailed.sgst - gstr3bTables.table4.itcReversed.sgst)}
                  </strong></TableCell>
                  <TableCell align="right"><strong>
                    {formatCurrency(gstr3bTables.table4.itcAvailed.igst - gstr3bTables.table4.itcReversed.igst)}
                  </strong></TableCell>
                  <TableCell align="right"><strong>
                    {formatCurrency(gstr3bTables.table4.itcAvailed.cess - gstr3bTables.table4.itcReversed.cess)}
                  </strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Table 5: Tax Payable */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TaxIcon color="warning" />
            <Typography variant="h6">Table 5: Values of Exempt, Nil Rated and Non-GST Inward Supplies</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary" paragraph>
            This section would contain details of exempt, nil-rated and non-GST supplies received.
            For this demo, we're focusing on the taxable supplies and ITC calculations.
          </Typography>
          <Alert severity="info">
            Values to be filled based on exempt and nil-rated inward supplies: ₹0.00
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* Tax Payment Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Tax Payment Summary (Table 6.1)
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Tax Liability</Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>CGST:</span>
                  <span>{formatCurrency(gstr3bTables.table5.taxPayable.cgst)}</span>
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>SGST:</span>
                  <span>{formatCurrency(gstr3bTables.table5.taxPayable.sgst)}</span>
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>IGST:</span>
                  <span>{formatCurrency(gstr3bTables.table5.taxPayable.igst)}</span>
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cess:</span>
                  <span>{formatCurrency(gstr3bTables.table5.taxPayable.cess)}</span>
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>Total Tax Payable:</span>
                  <span>{formatCurrency(data.taxLiability.netTaxLiability)}</span>
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Payment Mode</Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cash Payment:</span>
                  <span>{formatCurrency(data.taxLiability.cashPayment)}</span>
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>ITC Utilized:</span>
                  <span>{formatCurrency(data.taxLiability.itcUtilization)}</span>
                </Typography>
                {data.taxLiability.refundClaimed > 0 && (
                  <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Refund Claimed:</span>
                    <span>{formatCurrency(data.taxLiability.refundClaimed)}</span>
                  </Typography>
                )}
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>Total Payment:</span>
                  <span>{formatCurrency(data.taxLiability.cashPayment + data.taxLiability.itcUtilization)}</span>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Filing Status */}
      <Alert severity="info">
        <Typography variant="subtitle2" gutterBottom>
          Return Filing Status
        </Typography>
        <Typography variant="body2">
          Your GSTR-3B return for {currentPeriod} is ready for filing. 
          Please ensure all details are correct before submission.
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={`${data.outwardSupplies.length} Outward Supplies`} size="small" color="primary" />
          <Chip label={`${data.inwardSupplies.length} Inward Supplies`} size="small" color="secondary" />
          <Chip label={`${formatCurrency(data.taxLiability.cashPayment)} Cash Payment`} size="small" color="warning" />
          <Chip label="Ready for Filing" size="small" color="success" />
        </Box>
      </Alert>
    </Box>
  );
};