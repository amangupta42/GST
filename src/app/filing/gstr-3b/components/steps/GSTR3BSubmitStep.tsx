'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Payment as PaymentIcon,
  Security as SecurityIcon,
  Send as SendIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  AccountBalance as BankIcon
} from '@mui/icons-material';
import { GSTR3BData } from '../GSTR3BWizard';
import { formatCurrency } from '@/lib/utils';

interface GSTR3BSubmitStepProps {
  data: GSTR3BData;
  onUpdate: (updates: Partial<GSTR3BData>) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const submissionSteps = [
  {
    label: 'Payment Processing',
    description: 'Processing tax payment through electronic ledger'
  },
  {
    label: 'Data Validation',
    description: 'Final validation of return data'
  },
  {
    label: 'Digital Signature',
    description: 'Applying digital signature to the return'
  },
  {
    label: 'Portal Submission',
    description: 'Submitting GSTR-3B to GST portal'
  },
  {
    label: 'Acknowledgment',
    description: 'Receiving filing acknowledgment'
  }
];

export const GSTR3BSubmitStep = ({ 
  data, 
  onUpdate, 
  loading, 
  setLoading 
}: GSTR3BSubmitStepProps) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isSubmitted, setIsSubmitted] = useState(data.isSubmitted);
  const [acknowledgmentNumber, setAcknowledgmentNumber] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const handlePayment = useCallback(async () => {
    setLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate payment success (90% success rate)
      if (Math.random() < 0.9) {
        setPaymentCompleted(true);
      } else {
        throw new Error('Payment failed. Please check your bank balance and try again.');
      }
      
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const handleSubmit = useCallback(async () => {
    if (!paymentCompleted) {
      setSubmissionError('Please complete payment before submitting the return');
      return;
    }

    setLoading(true);
    setSubmissionError('');
    
    try {
      // Step 1: Payment Processing (already completed)
      setCurrentStep(0);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Data Validation
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 3: Digital Signature
      setCurrentStep(2);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 4: Portal Submission
      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate random failure for demo (10% chance)
      if (Math.random() < 0.1) {
        throw new Error('Portal connection timeout. Please try again.');
      }
      
      // Step 5: Acknowledgment
      setCurrentStep(4);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate acknowledgment number
      const ackNumber = `GSTR3B${Date.now().toString().slice(-8)}`;
      setAcknowledgmentNumber(ackNumber);
      setIsSubmitted(true);
      setShowSuccessDialog(true);
      
      // Update filing data
      onUpdate({ isSubmitted: true });
      
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : 'Submission failed');
      setCurrentStep(-1);
    } finally {
      setLoading(false);
    }
  }, [paymentCompleted, onUpdate, setLoading]);

  const downloadAcknowledgment = useCallback(() => {
    const currentPeriod = new Date().toLocaleString('en-IN', { 
      month: 'long', 
      year: 'numeric' 
    });
    
    const acknowledgment = `
GST MONTHLY RETURN FILING ACKNOWLEDGMENT
=======================================

GSTIN: 27AAAAA0000A1Z5
Return Period: ${currentPeriod}
Return Type: GSTR-3B
Filing Date: ${new Date().toLocaleDateString('en-IN')}
Acknowledgment Number: ${acknowledgmentNumber}

SUMMARY:
--------
Total Outward Turnover: ${formatCurrency(data.summary.totalOutwardTurnover)}
Total Inward Turnover: ${formatCurrency(data.summary.totalInwardTurnover)}
Net Tax Liability: ${formatCurrency(data.taxLiability.netTaxLiability)}
Cash Payment Made: ${formatCurrency(data.taxLiability.cashPayment)}
ITC Utilized: ${formatCurrency(data.taxLiability.itcUtilization)}

TAX DETAILS:
-----------
CGST: ${formatCurrency(data.taxLiability.totalCGST)}
SGST: ${formatCurrency(data.taxLiability.totalSGST)}
IGST: ${formatCurrency(data.taxLiability.totalIGST)}
Cess: ${formatCurrency(data.taxLiability.totalCess)}

Status: Successfully Filed

This is a system generated acknowledgment.
    `.trim();
    
    const blob = new Blob([acknowledgment], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GSTR3B_Acknowledgment_${acknowledgmentNumber}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [acknowledgmentNumber, data]);

  if (isSubmitted) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <SuccessIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" color="success.main" gutterBottom>
              GSTR-3B Filed Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your monthly summary return has been successfully filed with the GST portal.
            </Typography>
            
            <Box sx={{ 
              bgcolor: 'success.light', 
              color: 'success.contrastText', 
              p: 3, 
              borderRadius: 2, 
              mb: 3,
              maxWidth: 500,
              mx: 'auto'
            }}>
              <Typography variant="h6" gutterBottom>
                Acknowledgment Details
              </Typography>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {acknowledgmentNumber}
              </Typography>
              <Typography variant="body2">
                Filing Date: {new Date().toLocaleDateString('en-IN')}
              </Typography>
            </Box>
            
            <Grid container spacing={2} sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: 'primary.50' }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <BankIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Tax Paid
                    </Typography>
                    <Typography variant="h6" color="primary.main">
                      {formatCurrency(data.taxLiability.cashPayment)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: 'success.50' }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <ReceiptIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      ITC Utilized
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {formatCurrency(data.taxLiability.itcUtilization)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: 'warning.50' }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <SendIcon color="warning" sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Net Liability
                    </Typography>
                    <Typography variant="h6" color="warning.main">
                      {formatCurrency(data.taxLiability.netTaxLiability)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Button
              startIcon={<DownloadIcon />}
              onClick={downloadAcknowledgment}
              variant="outlined"
              size="large"
              sx={{ mr: 2 }}
            >
              Download Acknowledgment
            </Button>
          </CardContent>
        </Card>
        
        <Alert severity="success" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Filing Complete!</strong>
            <br />
            • Keep the acknowledgment number for your records
            • You can view the filing status on the GST portal
            • Next GSTR-3B filing due by 20th of next month
            • ITC credit has been updated in your electronic ledger
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Submit GSTR-3B Return
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Complete payment and file your GSTR-3B monthly summary return
      </Typography>

      {/* Payment Section */}
      {!paymentCompleted ? (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="warning.main">
              Payment Required
            </Typography>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Tax payment of {formatCurrency(data.taxLiability.cashPayment)} is required before filing the return.
            </Alert>
            
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Payment Summary:</Typography>
              <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>CGST:</span>
                <span>{formatCurrency(data.taxLiability.totalCGST / 4)}</span> {/* Simplified */}
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>SGST:</span>
                <span>{formatCurrency(data.taxLiability.totalSGST / 4)}</span>
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>IGST:</span>
                <span>{formatCurrency(data.taxLiability.totalIGST / 4)}</span>
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', pt: 1, borderTop: 1, borderColor: 'grey.300' }}>
                <span>Total Payment:</span>
                <span>{formatCurrency(data.taxLiability.cashPayment)}</span>
              </Typography>
            </Box>

            <Button
              onClick={handlePayment}
              disabled={loading}
              variant="contained"
              size="large"
              startIcon={loading ? undefined : <PaymentIcon />}
              fullWidth
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LinearProgress sx={{ width: 100 }} />
                  Processing Payment...
                </Box>
              ) : (
                'Make Payment'
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Payment Completed Successfully!</Typography>
          <Typography variant="body2">
            Tax payment of {formatCurrency(data.taxLiability.cashPayment)} has been processed. 
            You can now proceed with filing the return.
          </Typography>
        </Alert>
      )}

      {/* Final Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Final Return Summary
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Return Period:</Typography>
            <Typography fontWeight="bold">
              {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Total Outward Supplies:</Typography>
            <Typography fontWeight="bold">{data.outwardSupplies.length}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Total Inward Supplies:</Typography>
            <Typography fontWeight="bold">{data.inwardSupplies.length}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography>Net Tax Liability:</Typography>
            <Typography fontWeight="bold">{formatCurrency(data.taxLiability.netTaxLiability)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Cash Payment:</Typography>
            <Typography fontWeight="bold" color={paymentCompleted ? 'success.main' : 'error.main'}>
              {formatCurrency(data.taxLiability.cashPayment)} 
              <Chip 
                label={paymentCompleted ? 'Paid' : 'Pending'} 
                size="small" 
                color={paymentCompleted ? 'success' : 'error'} 
                sx={{ ml: 1 }}
              />
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Submission Progress */}
      {loading && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Filing in Progress...
            </Typography>
            <LinearProgress sx={{ mb: 2 }} />
            <Stepper activeStep={currentStep} orientation="vertical">
              {submissionSteps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel>
                    {step.label}
                  </StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {submissionError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Filing Failed:</strong> {submissionError}
          </Typography>
        </Alert>
      )}

      {/* Important Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="info.main">
            Important Filing Information
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <SecurityIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Secure Filing"
                secondary="All data is encrypted and transmitted securely to the GST portal"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <PaymentIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Payment Confirmation"
                secondary="Tax payment must be completed before filing the return"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ReceiptIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Acknowledgment"
                secondary="You will receive an acknowledgment number after successful filing"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <ErrorIcon color="warning" />
              </ListItemIcon>
              <ListItemText
                primary="Amendment Rules"
                secondary="GSTR-3B amendments can only be made through subsequent returns"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body1" paragraph>
              By clicking "File Return", you confirm that all information is correct and payment has been completed.
            </Typography>
            <Button
              onClick={handleSubmit}
              disabled={!paymentCompleted || loading}
              variant="contained"
              size="large"
              startIcon={loading ? undefined : <SendIcon />}
              sx={{ minWidth: 200 }}
            >
              {loading ? 'Filing Return...' : 'File GSTR-3B Return'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <SuccessIcon sx={{ fontSize: 60, color: 'success.main', mb: 1 }} />
          <Typography variant="h5">Filing Successful!</Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="body1" paragraph>
            Your GSTR-3B return has been successfully filed.
          </Typography>
          <Box sx={{ 
            bgcolor: 'success.light', 
            color: 'success.contrastText', 
            p: 2, 
            borderRadius: 1 
          }}>
            <Typography variant="subtitle1">
              Acknowledgment Number
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {acknowledgmentNumber}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            onClick={() => setShowSuccessDialog(false)} 
            variant="contained"
            startIcon={<DownloadIcon />}
          >
            Download Acknowledgment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};