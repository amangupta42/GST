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
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  CloudUpload as UploadIcon,
  Security as SecurityIcon,
  Send as SendIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { FilingData } from '../FilingWizard';
import { formatCurrency } from '@/lib/utils';

interface SubmitStepProps {
  data: FilingData;
  onUpdate: (updates: Partial<FilingData>) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const submissionSteps = [
  {
    label: 'Data Validation',
    description: 'Validating invoice data and calculations'
  },
  {
    label: 'Format Conversion',
    description: 'Converting to GST portal format'
  },
  {
    label: 'Digital Signature',
    description: 'Applying digital signature'
  },
  {
    label: 'Portal Submission',
    description: 'Submitting to GST portal'
  },
  {
    label: 'Acknowledgment',
    description: 'Receiving filing acknowledgment'
  }
];

export const SubmitStep = ({ data, onUpdate, loading, setLoading }: SubmitStepProps) => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isSubmitted, setIsSubmitted] = useState(data.isSubmitted);
  const [acknowledgmentNumber, setAcknowledgmentNumber] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setSubmissionError('');
    
    try {
      // Step 1: Data Validation
      setCurrentStep(0);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 2: Format Conversion
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 3: Digital Signature
      setCurrentStep(2);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      const ackNumber = `GST-${Date.now().toString().slice(-8)}`;
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
  }, [onUpdate, setLoading]);

  const downloadAcknowledgment = useCallback(() => {
    // Create acknowledgment content
    const acknowledgment = `
GST RETURN FILING ACKNOWLEDGMENT
=================================

GSTIN: 27AAAAA0000A1Z5
Return Period: ${new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
Return Type: GSTR-1
Filing Date: ${new Date().toLocaleDateString('en-IN')}
Acknowledgment Number: ${acknowledgmentNumber}

SUMMARY:
--------
Total Invoices: ${data.summary.totalInvoices}
Total Taxable Value: ${formatCurrency(data.summary.totalValue)}
Total Tax: ${formatCurrency(data.summary.totalTax)}

Status: Successfully Filed

This is a system generated acknowledgment.
    `.trim();
    
    const blob = new Blob([acknowledgment], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GSTR1_Acknowledgment_${acknowledgmentNumber}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [acknowledgmentNumber, data.summary]);

  if (isSubmitted) {
    return (
      <Box sx={{ p: 3 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <SuccessIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" color="success.main" gutterBottom>
              Filing Completed Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Your GSTR-1 return has been successfully filed with the GST portal.
            </Typography>
            
            <Box sx={{ 
              bgcolor: 'success.light', 
              color: 'success.contrastText', 
              p: 2, 
              borderRadius: 1, 
              mb: 3 
            }}>
              <Typography variant="h6" gutterBottom>
                Acknowledgment Number
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {acknowledgmentNumber}
              </Typography>
            </Box>
            
            <List sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
              <ListItem>
                <ListItemIcon>
                  <ReceiptIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Return Period"
                  secondary={new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SendIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Filing Date"
                  secondary={new Date().toLocaleDateString('en-IN')}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SuccessIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Status"
                  secondary={<Chip label="Filed Successfully" color="success" size="small" />}
                />
              </ListItem>
            </List>
            
            <Button
              startIcon={<DownloadIcon />}
              onClick={downloadAcknowledgment}
              variant="outlined"
              size="large"
            >
              Download Acknowledgment
            </Button>
          </CardContent>
        </Card>
        
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Next Steps:</strong>
            <br />
            • Keep the acknowledgment number for your records
            • You can view the filed return status in the GST portal
            • Amendment (if required) can be filed in the next return period
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Submit GSTR-1 Return
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Ready to file your GSTR-1 return. Please review and confirm submission.
      </Typography>

      {/* Pre-submission Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Final Summary
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography>Total Invoices:</Typography>
            <Typography fontWeight="bold">{data.summary.totalInvoices}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography>Total Taxable Value:</Typography>
            <Typography fontWeight="bold">{formatCurrency(data.summary.totalValue)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography>Total Tax Amount:</Typography>
            <Typography fontWeight="bold">{formatCurrency(data.summary.totalTax)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>Return Period:</Typography>
            <Typography fontWeight="bold">
              {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
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
            <strong>Submission Failed:</strong> {submissionError}
          </Typography>
        </Alert>
      )}

      {/* Important Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="warning.main">
            Important Information
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <SecurityIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Secure Submission"
                secondary="All data is encrypted and transmitted securely to the GST portal"
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
                primary="Final Submission"
                secondary="Once filed, amendments can only be made in subsequent returns"
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
              By clicking "Submit Return", you confirm that all information is correct and complete.
            </Typography>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              variant="contained"
              size="large"
              startIcon={loading ? <UploadIcon /> : <SendIcon />}
              sx={{ minWidth: 200 }}
            >
              {loading ? 'Filing Return...' : 'Submit Return'}
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
            Your GSTR-1 return has been successfully filed.
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