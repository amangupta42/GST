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
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Payment as PaymentIcon,
  AccountBalance as BankIcon,
  ExpandMore as ExpandMoreIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { GSTR3BData, TaxLiability } from '../GSTR3BWizard';
import { formatCurrency } from '@/lib/utils';

interface TaxCalculationStepProps {
  data: GSTR3BData;
  onUpdate: (updates: Partial<GSTR3BData>) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

interface PaymentEntry {
  type: 'Cash' | 'ITC_CGST' | 'ITC_SGST' | 'ITC_IGST';
  amount: number;
}

export const TaxCalculationStep = ({ 
  data, 
  onUpdate, 
  loading, 
  setLoading 
}: TaxCalculationStepProps) => {
  const [paymentMode, setPaymentMode] = useState<'auto' | 'manual'>('auto');
  const [manualPayments, setManualPayments] = useState<Record<string, PaymentEntry[]>>({
    cgst: [],
    sgst: [],
    igst: [],
    cess: []
  });

  // Calculate tax liability
  const taxCalculations = useMemo(() => {
    // Outward supplies tax
    const outwardTax = {
      cgst: data.outwardSupplies.reduce((sum, s) => sum + s.cgstAmount, 0),
      sgst: data.outwardSupplies.reduce((sum, s) => sum + s.sgstAmount, 0),
      igst: data.outwardSupplies.reduce((sum, s) => sum + s.igstAmount, 0),
      cess: data.outwardSupplies.reduce((sum, s) => sum + s.cessAmount, 0)
    };

    // Input Tax Credit
    const itcClaimed = {
      cgst: data.inwardSupplies.reduce((sum, s) => sum + (s.cgstAmount * (s.itcClaimed / (s.cgstAmount + s.sgstAmount + s.igstAmount))), 0),
      sgst: data.inwardSupplies.reduce((sum, s) => sum + (s.sgstAmount * (s.itcClaimed / (s.cgstAmount + s.sgstAmount + s.igstAmount))), 0),
      igst: data.inwardSupplies.reduce((sum, s) => sum + (s.igstAmount * (s.itcClaimed / (s.cgstAmount + s.sgstAmount + s.igstAmount))), 0),
      cess: 0 // Simplified for demo
    };

    // Net tax liability
    const netLiability = {
      cgst: Math.max(0, outwardTax.cgst - itcClaimed.cgst),
      sgst: Math.max(0, outwardTax.sgst - itcClaimed.sgst),
      igst: Math.max(0, outwardTax.igst - itcClaimed.igst),
      cess: Math.max(0, outwardTax.cess - itcClaimed.cess)
    };

    const totalNetLiability = netLiability.cgst + netLiability.sgst + netLiability.igst + netLiability.cess;

    // Available ITC for utilization
    const availableITC = {
      cgst: Math.max(0, itcClaimed.cgst - (outwardTax.cgst - netLiability.cgst)),
      sgst: Math.max(0, itcClaimed.sgst - (outwardTax.sgst - netLiability.sgst)),
      igst: Math.max(0, itcClaimed.igst - (outwardTax.igst - netLiability.igst)),
      cess: Math.max(0, itcClaimed.cess - (outwardTax.cess - netLiability.cess))
    };

    return {
      outwardTax,
      itcClaimed,
      netLiability,
      availableITC,
      totalNetLiability
    };
  }, [data.outwardSupplies, data.inwardSupplies]);

  // Calculate optimal ITC utilization
  const calculateOptimalPayment = useCallback(() => {
    const { netLiability, availableITC } = taxCalculations;
    
    // ITC utilization rules:
    // 1. CGST can be set off against CGST and IGST
    // 2. SGST can be set off against SGST and IGST
    // 3. IGST can be set off against IGST, CGST, and SGST
    
    let itcUtilization = {
      cgst: 0,
      sgst: 0,
      igst: 0,
      cess: 0
    };

    let cashPayment = {
      cgst: netLiability.cgst,
      sgst: netLiability.sgst,
      igst: netLiability.igst,
      cess: netLiability.cess
    };

    // First, use same-type ITC
    itcUtilization.cgst = Math.min(netLiability.cgst, availableITC.cgst);
    itcUtilization.sgst = Math.min(netLiability.sgst, availableITC.sgst);
    itcUtilization.igst = Math.min(netLiability.igst, availableITC.igst);
    itcUtilization.cess = Math.min(netLiability.cess, availableITC.cess);

    // Reduce cash payment by utilized ITC
    cashPayment.cgst -= itcUtilization.cgst;
    cashPayment.sgst -= itcUtilization.sgst;
    cashPayment.igst -= itcUtilization.igst;
    cashPayment.cess -= itcUtilization.cess;

    // Use excess IGST for CGST and SGST
    const excessIGST = availableITC.igst - itcUtilization.igst;
    if (excessIGST > 0) {
      const igstForCGST = Math.min(cashPayment.cgst, excessIGST / 2);
      const igstForSGST = Math.min(cashPayment.sgst, excessIGST - igstForCGST);
      
      cashPayment.cgst -= igstForCGST;
      cashPayment.sgst -= igstForSGST;
      itcUtilization.igst += igstForCGST + igstForSGST;
    }

    const totalCashPayment = cashPayment.cgst + cashPayment.sgst + cashPayment.igst + cashPayment.cess;
    const totalITCUtilized = itcUtilization.cgst + itcUtilization.sgst + itcUtilization.igst + itcUtilization.cess;

    const updatedTaxLiability: TaxLiability = {
      totalTaxableValue: data.summary.totalOutwardTurnover,
      totalCGST: taxCalculations.outwardTax.cgst,
      totalSGST: taxCalculations.outwardTax.sgst,
      totalIGST: taxCalculations.outwardTax.igst,
      totalCess: taxCalculations.outwardTax.cess,
      netTaxLiability: taxCalculations.totalNetLiability,
      cashPayment: totalCashPayment,
      itcUtilization: totalITCUtilized,
      refundClaimed: 0 // For simplicity
    };

    onUpdate({ taxLiability: updatedTaxLiability });
  }, [taxCalculations, data.summary.totalOutwardTurnover, onUpdate]);

  // Interest and penalty calculations
  const interestPenalty = useMemo(() => {
    const filingDate = new Date();
    const dueDate = new Date(filingDate.getFullYear(), filingDate.getMonth(), 20); // 20th of next month
    
    const daysLate = Math.max(0, Math.floor((filingDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    const interestRate = 0.18 / 365; // 18% per annum
    const interest = data.taxLiability.cashPayment * interestRate * daysLate;
    
    // Late fee: ₹200 per day for each act, max ₹5000
    const lateFee = Math.min(daysLate * 200, 5000);
    
    return { interest, lateFee, daysLate };
  }, [data.taxLiability.cashPayment]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Tax Calculation & Payment Planning
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Calculate net tax liability and plan optimal payment using available ITC
        </Typography>
      </Box>

      {/* Calculate Button */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <CalculateIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            Calculate Tax Liability
          </Typography>
          <Button
            onClick={calculateOptimalPayment}
            disabled={loading}
            variant="contained"
            size="large"
            startIcon={<CalculateIcon />}
          >
            Calculate & Optimize Payment
          </Button>
        </CardContent>
      </Card>

      {data.taxLiability.netTaxLiability > 0 && (
        <>
          {/* Tax Liability Summary */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="primary.main">
                    {formatCurrency(data.taxLiability.totalCGST + data.taxLiability.totalSGST + data.taxLiability.totalIGST)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Tax Liability
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(data.taxLiability.itcUtilization)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ITC Utilized
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="warning.main">
                    {formatCurrency(data.taxLiability.cashPayment)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cash Payment Required
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="error.main">
                    {formatCurrency(data.taxLiability.netTaxLiability)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Net Tax Payable
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Detailed Tax Calculation */}
          <Accordion sx={{ mb: 3 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Detailed Tax Calculation</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tax Type</TableCell>
                      <TableCell align="right">Outward Tax</TableCell>
                      <TableCell align="right">ITC Available</TableCell>
                      <TableCell align="right">ITC Utilized</TableCell>
                      <TableCell align="right">Cash Payment</TableCell>
                      <TableCell align="right">Net Payable</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell><strong>CGST</strong></TableCell>
                      <TableCell align="right">{formatCurrency(taxCalculations.outwardTax.cgst)}</TableCell>
                      <TableCell align="right">{formatCurrency(taxCalculations.itcClaimed.cgst)}</TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>
                        {formatCurrency(Math.min(taxCalculations.outwardTax.cgst, taxCalculations.itcClaimed.cgst))}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'warning.main' }}>
                        {formatCurrency(Math.max(0, taxCalculations.outwardTax.cgst - taxCalculations.itcClaimed.cgst))}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(taxCalculations.netLiability.cgst)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>SGST</strong></TableCell>
                      <TableCell align="right">{formatCurrency(taxCalculations.outwardTax.sgst)}</TableCell>
                      <TableCell align="right">{formatCurrency(taxCalculations.itcClaimed.sgst)}</TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>
                        {formatCurrency(Math.min(taxCalculations.outwardTax.sgst, taxCalculations.itcClaimed.sgst))}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'warning.main' }}>
                        {formatCurrency(Math.max(0, taxCalculations.outwardTax.sgst - taxCalculations.itcClaimed.sgst))}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(taxCalculations.netLiability.sgst)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>IGST</strong></TableCell>
                      <TableCell align="right">{formatCurrency(taxCalculations.outwardTax.igst)}</TableCell>
                      <TableCell align="right">{formatCurrency(taxCalculations.itcClaimed.igst)}</TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>
                        {formatCurrency(Math.min(taxCalculations.outwardTax.igst, taxCalculations.itcClaimed.igst))}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'warning.main' }}>
                        {formatCurrency(Math.max(0, taxCalculations.outwardTax.igst - taxCalculations.itcClaimed.igst))}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(taxCalculations.netLiability.igst)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Cess</strong></TableCell>
                      <TableCell align="right">{formatCurrency(taxCalculations.outwardTax.cess)}</TableCell>
                      <TableCell align="right">{formatCurrency(taxCalculations.itcClaimed.cess)}</TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>
                        {formatCurrency(Math.min(taxCalculations.outwardTax.cess, taxCalculations.itcClaimed.cess))}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'warning.main' }}>
                        {formatCurrency(Math.max(0, taxCalculations.outwardTax.cess - taxCalculations.itcClaimed.cess))}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(taxCalculations.netLiability.cess)}
                      </TableCell>
                    </TableRow>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell><strong>TOTAL</strong></TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(
                          taxCalculations.outwardTax.cgst + taxCalculations.outwardTax.sgst + 
                          taxCalculations.outwardTax.igst + taxCalculations.outwardTax.cess
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(
                          taxCalculations.itcClaimed.cgst + taxCalculations.itcClaimed.sgst + 
                          taxCalculations.itcClaimed.igst + taxCalculations.itcClaimed.cess
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        {formatCurrency(data.taxLiability.itcUtilization)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                        {formatCurrency(data.taxLiability.cashPayment)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(taxCalculations.totalNetLiability)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>

          {/* Interest and Penalty */}
          {interestPenalty.daysLate > 0 && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Late Filing Detected
              </Typography>
              <Typography variant="body2">
                Filing is {interestPenalty.daysLate} days late. Additional charges:
              </Typography>
              <ul>
                <li>Interest: {formatCurrency(interestPenalty.interest)} (18% p.a.)</li>
                <li>Late Fee: {formatCurrency(interestPenalty.lateFee)}</li>
              </ul>
            </Alert>
          )}

          {/* Payment Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Tax Payment Details
                  </Typography>
                  <Box sx={{ pl: 3 }}>
                    <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Net Tax Liability:</span>
                      <span>{formatCurrency(data.taxLiability.netTaxLiability)}</span>
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>ITC Utilized:</span>
                      <span style={{ color: 'green' }}>({formatCurrency(data.taxLiability.itcUtilization)})</span>
                    </Typography>
                    {interestPenalty.interest > 0 && (
                      <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Interest:</span>
                        <span>{formatCurrency(interestPenalty.interest)}</span>
                      </Typography>
                    )}
                    {interestPenalty.lateFee > 0 && (
                      <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Late Fee:</span>
                        <span>{formatCurrency(interestPenalty.lateFee)}</span>
                      </Typography>
                    )}
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="h6" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Total Payment Due:</span>
                      <span>{formatCurrency(data.taxLiability.cashPayment + interestPenalty.interest + interestPenalty.lateFee)}</span>
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    <BankIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Payment Recommendations
                  </Typography>
                  <Box sx={{ pl: 3 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        ITC utilization has been optimized to minimize cash payment.
                      </Typography>
                    </Alert>
                    <Typography variant="body2" paragraph>
                      • Use electronic payment for faster processing
                    </Typography>
                    <Typography variant="body2" paragraph>
                      • Ensure sufficient bank balance before filing
                    </Typography>
                    <Typography variant="body2">
                      • Payment must be completed before filing GSTR-3B
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </>
      )}

      {/* Status Alert */}
      {data.taxLiability.netTaxLiability === 0 ? (
        <Alert severity="info" sx={{ mt: 3 }}>
          Click "Calculate & Optimize Payment" to compute your tax liability and optimal ITC utilization.
        </Alert>
      ) : (
        <Alert severity="success" sx={{ mt: 3 }}>
          Tax calculations completed! Total payment required: {formatCurrency(data.taxLiability.cashPayment + interestPenalty.interest + interestPenalty.lateFee)}
        </Alert>
      )}
    </Box>
  );
};