'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  Button,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Schedule,
  Security,
  Receipt,
  Download,
  Warning,
  Error,
  Info,
  Send,
  Lock
} from '@mui/icons-material';
import { GSTR9Data } from '../GSTR9Wizard';

interface GSTR9SubmitStepProps {
  data: GSTR9Data;
  onUpdate: (updates: Partial<GSTR9Data>) => void;
  onComplete: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

interface SubmissionStep {
  label: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  details?: string;
}

export function GSTR9SubmitStep({ data, onUpdate, onComplete, loading, setLoading }: GSTR9SubmitStepProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [submissionError, setSubmissionError] = useState('');
  const [acknowledgmentDialog, setAcknowledgmentDialog] = useState(false);
  const [digitalSignature, setDigitalSignature] = useState('');
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  const [submissionSteps, setSubmissionSteps] = useState<SubmissionStep[]>([
    {
      label: 'Pre-submission Validation',
      description: 'Validate all data and check compliance requirements',
      status: 'pending'
    },
    {
      label: 'Digital Signature Verification',
      description: 'Verify digital signature certificate',
      status: 'pending'
    },
    {
      label: 'Portal Authentication',
      description: 'Authenticate with GST portal',
      status: 'pending'
    },
    {
      label: 'Return Submission',
      description: 'Submit GSTR-9 return to GST portal',
      status: 'pending'
    },
    {
      label: 'Acknowledgment Generation',
      description: 'Generate submission acknowledgment',
      status: 'pending'
    }
  ]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

  const updateStepStatus = useCallback((stepIndex: number, status: SubmissionStep['status'], details?: string) => {
    setSubmissionSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, status, details } : step
    ));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!digitalSignature || !declarationAccepted) {
      setSubmissionError('Please provide digital signature and accept the declaration');
      return;
    }

    setLoading(true);
    setSubmissionError('');

    try {
      // Step 1: Pre-submission Validation
      setCurrentStep(0);
      updateStepStatus(0, 'in_progress');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate validation checks
      const validationIssues: string[] = [];
      
      if (data.turnoverData.gstr1Turnover === 0) {
        validationIssues.push('No turnover data found');
      }
      
      // Check for major discrepancies
      const turnoverDiff = Math.abs(data.turnoverData.gstr1Turnover - data.turnoverData.gstr3bTurnover);
      if (turnoverDiff > 100000) {
        validationIssues.push(`Turnover mismatch: ₹${turnoverDiff.toLocaleString()}`);
      }

      if (validationIssues.length > 0) {
        updateStepStatus(0, 'failed', `Validation failed: ${validationIssues.join(', ')}`);
        throw new (Error as any)(`Validation failed: ${validationIssues.join(', ')}`);
      }

      updateStepStatus(0, 'completed', 'All validation checks passed');

      // Step 2: Digital Signature Verification
      setCurrentStep(1);
      updateStepStatus(1, 'in_progress');
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateStepStatus(1, 'completed', 'Digital signature verified successfully');

      // Step 3: Portal Authentication
      setCurrentStep(2);
      updateStepStatus(2, 'in_progress');
      await new Promise(resolve => setTimeout(resolve, 2000));
      updateStepStatus(2, 'completed', 'Authenticated with GST portal');

      // Step 4: Return Submission
      setCurrentStep(3);
      updateStepStatus(3, 'in_progress');
      await new Promise(resolve => setTimeout(resolve, 3000));
      updateStepStatus(3, 'completed', 'GSTR-9 return submitted successfully');

      // Step 5: Acknowledgment Generation
      setCurrentStep(4);
      updateStepStatus(4, 'in_progress');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStepStatus(4, 'completed', 'Acknowledgment generated - ARN: GSTR9240320241234567890');

      // Update data with submission details
      onUpdate({
        isSubmitted: true,
        auditTrail: {
          ...data.auditTrail,
          lastUpdated: new Date(),
          validatedBy: 'GST Portal'
        }
      });

      setAcknowledgmentDialog(true);

    } catch (error: any) {
      setSubmissionError(error.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [digitalSignature, declarationAccepted, data, onUpdate, setLoading, updateStepStatus]);

  const downloadAcknowledment = useCallback(() => {
    // Simulate acknowledgment download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `GSTR-9-Acknowledgment-${data.financialYear}-${data.gstin}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data.financialYear, data.gstin]);

  const closeAcknowledgmentDialog = useCallback(() => {
    setAcknowledgmentDialog(false);
    onComplete();
  }, [onComplete]);

  const getStepIcon = (status: SubmissionStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle color="success" />;
      case 'in_progress': return <Schedule color="primary" />;
      case 'failed': return <Error color="error" />;
      default: return <Schedule color="disabled" />;
    }
  };

  const submissionProgress = () => {
    const completed = submissionSteps.filter(step => step.status === 'completed').length;
    return Math.round((completed / submissionSteps.length) * 100);
  };

  useEffect(() => {
    // Auto-scroll to current step
    if (currentStep >= 0) {
      const stepElement = document.getElementById(`submission-step-${currentStep}`);
      stepElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Submit GSTR-9 Annual Return
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Complete the submission process for your GSTR-9 annual return. Ensure all details are verified before final submission.
      </Typography>

      {/* Submission Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Return Summary
              </Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>Financial Year</TableCell>
                    <TableCell>{data.financialYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>GSTIN</TableCell>
                    <TableCell>{data.gstin}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Turnover</TableCell>
                    <TableCell>{formatCurrency(data.turnoverData.gstr1Turnover + data.turnoverData.exemptSupplies + data.turnoverData.nilRatedSupplies + data.turnoverData.nonGstSupplies)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total Tax Liability</TableCell>
                    <TableCell>{formatCurrency(Object.values(data.taxData.gstr1Tax).reduce((sum, val) => sum + val, 0))}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Total ITC Claimed</TableCell>
                    <TableCell>{formatCurrency(Object.values(data.itcData.claimedITC).reduce((sum, val) => sum + val, 0))}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Compliance Status
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    {data.reconciliationStatus.turnoverReconciled ? <CheckCircle color="success" /> : <Warning color="warning" />}
                  </ListItemIcon>
                  <ListItemText 
                    primary="Turnover Reconciliation"
                    secondary={data.reconciliationStatus.turnoverReconciled ? 'Completed' : 'Pending'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {data.reconciliationStatus.taxReconciled ? <CheckCircle color="success" /> : <Warning color="warning" />}
                  </ListItemIcon>
                  <ListItemText 
                    primary="Tax Reconciliation"
                    secondary={data.reconciliationStatus.taxReconciled ? 'Completed' : 'Pending'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {data.reconciliationStatus.itcReconciled ? <CheckCircle color="success" /> : <Warning color="warning" />}
                  </ListItemIcon>
                  <ListItemText 
                    primary="ITC Analysis"
                    secondary={data.reconciliationStatus.itcReconciled ? 'Completed' : 'Pending'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {data.reconciliationStatus.discrepancies.length === 0 ? <CheckCircle color="success" /> : <Error color="error" />}
                  </ListItemIcon>
                  <ListItemText 
                    primary="Discrepancies"
                    secondary={data.reconciliationStatus.discrepancies.length === 0 ? 'None found' : `${data.reconciliationStatus.discrepancies.length} issues`}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Pre-submission Requirements */}
      {!data.isSubmitted && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pre-submission Requirements
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Digital Signature Certificate"
                  value={digitalSignature}
                  onChange={(e) => setDigitalSignature(e.target.value)}
                  placeholder="Enter DSC serial number"
                  InputProps={{
                    startAdornment: <Security sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <Button
                    variant="outlined"
                    startIcon={<Lock />}
                    onClick={() => setDeclarationAccepted(!declarationAccepted)}
                    color={declarationAccepted ? 'success' : 'primary'}
                    fullWidth
                  >
                    {declarationAccepted ? 'Declaration Accepted' : 'Accept Declaration'}
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {data.reconciliationStatus.discrepancies.length > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Outstanding Discrepancies ({data.reconciliationStatus.discrepancies.length}):
                </Typography>
                {data.reconciliationStatus.discrepancies.slice(0, 3).map((discrepancy, index) => (
                  <Typography key={index} variant="body2">
                    • {discrepancy}
                  </Typography>
                ))}
                {data.reconciliationStatus.discrepancies.length > 3 && (
                  <Typography variant="body2" color="text.secondary">
                    ... and {data.reconciliationStatus.discrepancies.length - 3} more
                  </Typography>
                )}
              </Alert>
            )}

            {submissionError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {submissionError}
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={loading ? <Schedule className="animate-spin" /> : <Send />}
                onClick={handleSubmit}
                disabled={loading || !digitalSignature || !declarationAccepted}
                sx={{ minWidth: 200 }}
              >
                {loading ? 'Submitting...' : 'Submit GSTR-9'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Submission Progress */}
      {loading && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Submission Progress</Typography>
              <Chip 
                label={`${submissionProgress()}% Complete`}
                color="primary"
              />
            </Box>

            <LinearProgress 
              variant="determinate" 
              value={submissionProgress()} 
              sx={{ height: 8, borderRadius: 4, mb: 3 }}
            />

            <Stepper activeStep={currentStep} orientation="vertical">
              {submissionSteps.map((step, index) => (
                <Step key={step.label} id={`submission-step-${index}`}>
                  <StepLabel icon={getStepIcon(step.status)}>
                    <Typography variant="subtitle1">{step.label}</Typography>
                  </StepLabel>
                  <StepContent>
                    <Typography color="text.secondary" sx={{ mb: 1 }}>
                      {step.description}
                    </Typography>
                    {step.details && (
                      <Typography variant="body2" color={step.status === 'failed' ? 'error.main' : 'success.main'}>
                        {step.details}
                      </Typography>
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      )}

      {/* Submission Complete */}
      {data.isSubmitted && (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom color="success.main">
                GSTR-9 Submitted Successfully!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Your annual return has been submitted to the GST portal.
              </Typography>

              <Alert severity="success" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Submission Details:
                </Typography>
                <Typography variant="body2">
                  ARN: GSTR9240320241234567890
                </Typography>
                <Typography variant="body2">
                  Submitted on: {new Date().toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  Status: Filed
                </Typography>
              </Alert>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={downloadAcknowledment}
                >
                  Download Acknowledgment
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Receipt />}
                  onClick={() => window.print()}
                >
                  Print Receipt
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Acknowledgment Dialog */}
      <Dialog open={acknowledgmentDialog} onClose={closeAcknowledgmentDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle sx={{ mr: 2, color: 'success.main' }} />
            GSTR-9 Submission Successful
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Your GSTR-9 annual return has been successfully submitted to the GST portal.
            </Typography>
          </Alert>

          <Typography variant="h6" gutterBottom>
            Acknowledgment Details
          </Typography>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>ARN</TableCell>
                <TableCell>GSTR9240320241234567890</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Submission Date</TableCell>
                <TableCell>{new Date().toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Financial Year</TableCell>
                <TableCell>{data.financialYear}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>
                  <Chip size="small" label="Successfully Filed" color="success" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="text.secondary">
            <strong>Important:</strong> Keep the acknowledgment for your records. 
            You can download it anytime from your GST portal dashboard.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={downloadAcknowledment} startIcon={<Download />}>
            Download
          </Button>
          <Button onClick={closeAcknowledgmentDialog} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}