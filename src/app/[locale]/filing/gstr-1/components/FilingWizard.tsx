'use client';

import { useState, useCallback } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as ValidateIcon,
  Category as CategorizeIcon,
  Preview as PreviewIcon,
  Send as SubmitIcon
} from '@mui/icons-material';

// Import step components (will create these)
import { UploadStep } from './steps/UploadStep';
import { ValidateStep } from './steps/ValidateStep';
import { CategorizeStep } from './steps/CategorizeStep';
import { PreviewStep } from './steps/PreviewStep';
import { SubmitStep } from './steps/SubmitStep';

interface FilingWizardProps {
  onComplete?: () => void;
}

const steps = [
  {
    label: 'Upload Invoices',
    description: 'Import your sales invoices via CSV/Excel or manual entry',
    icon: UploadIcon,
    component: UploadStep
  },
  {
    label: 'Validate Data',
    description: 'Review and fix any data errors or missing information',
    icon: ValidateIcon,
    component: ValidateStep
  },
  {
    label: 'Categorize Transactions',
    description: 'Classify invoices as B2B, B2C, Export, or Nil-rated',
    icon: CategorizeIcon,
    component: CategorizeStep
  },
  {
    label: 'Preview & Review',
    description: 'Final review of your GSTR-1 return before submission',
    icon: PreviewIcon,
    component: PreviewStep
  },
  {
    label: 'Submit Return',
    description: 'File your GSTR-1 return to the GST portal',
    icon: SubmitIcon,
    component: SubmitStep
  }
];

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerGSTIN: string;
  placeOfSupply: string;
  invoiceValue: number;
  taxableValue: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  hsnCode: string;
  description: string;
  quantity: number;
  rate: number;
  category: 'B2B' | 'B2C' | 'Export' | 'NilRated' | '';
  errors: string[];
  status: 'pending' | 'validated' | 'error';
}

export interface FilingData {
  invoices: InvoiceData[];
  summary: {
    totalInvoices: number;
    totalValue: number;
    totalTax: number;
    validatedCount: number;
    errorCount: number;
  };
  currentStep: number;
  isSubmitted: boolean;
}

export const FilingWizard = ({ onComplete }: FilingWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [filingData, setFilingData] = useState<FilingData>({
    invoices: [],
    summary: {
      totalInvoices: 0,
      totalValue: 0,
      totalTax: 0,
      validatedCount: 0,
      errorCount: 0
    },
    currentStep: 0,
    isSubmitted: false
  });
  const [loading, setLoading] = useState(false);

  const updateFilingData = useCallback((updates: Partial<FilingData>) => {
    setFilingData(prev => ({
      ...prev,
      ...updates,
      currentStep: currentStep
    }));
  }, [currentStep]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleStepClick = useCallback((stepIndex: number) => {
    // Allow clicking on previous steps or current step
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  }, [currentStep]);

  const canProceedToNext = useCallback(() => {
    switch (currentStep) {
      case 0: // Upload step
        return filingData.invoices.length > 0;
      case 1: // Validate step
        return filingData.summary.errorCount === 0;
      case 2: // Categorize step
        return filingData.invoices.every(invoice => invoice.category !== '');
      case 3: // Preview step
        return true;
      case 4: // Submit step
        return filingData.isSubmitted;
      default:
        return false;
    }
  }, [currentStep, filingData]);

  const getCurrentStepComponent = () => {
    const StepComponent = steps[currentStep].component;
    return (
      <StepComponent
        data={filingData}
        onUpdate={updateFilingData}
        onNext={handleNext}
        onBack={handleBack}
        loading={loading}
        setLoading={setLoading}
      />
    );
  };

  const getStepProgress = () => {
    return ((currentStep + 1) / steps.length) * 100;
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
      {/* Progress Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              GSTR-1 Return Filing
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].label}
            </Typography>
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={getStepProgress()} 
            sx={{ mb: 2, height: 8, borderRadius: 4 }} 
          />
          
          <Typography variant="body2" color="text.secondary">
            {steps[currentStep].description}
          </Typography>
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={currentStep} alternativeLabel>
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <Step 
                  key={step.label}
                  onClick={() => handleStepClick(index)}
                  sx={{ 
                    cursor: index <= currentStep ? 'pointer' : 'default',
                    '& .MuiStepLabel-root': {
                      cursor: index <= currentStep ? 'pointer' : 'default'
                    }
                  }}
                >
                  <StepLabel 
                    StepIconComponent={() => (
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: index <= currentStep ? 'primary.main' : 'action.disabled',
                          color: index <= currentStep ? 'white' : 'text.disabled',
                          transition: 'all 0.2s ease-in-out'
                        }}
                      >
                        <StepIcon fontSize="small" />
                      </Box>
                    )}
                  >
                    <Typography variant="body2" fontWeight={index === currentStep ? 600 : 400}>
                      {step.label}
                    </Typography>
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {getCurrentStepComponent()}
        </CardContent>
      </Card>

      {/* Navigation Controls */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              onClick={handleBack}
              disabled={currentStep === 0 || loading}
              variant="outlined"
            >
              Back
            </Button>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {filingData.summary.totalInvoices > 0 && (
                <Typography variant="body2" color="text.secondary">
                  {filingData.summary.totalInvoices} invoices • 
                  ₹{filingData.summary.totalValue.toLocaleString()} total value
                </Typography>
              )}
              
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceedToNext() || loading}
                  variant="contained"
                  endIcon={loading ? undefined : (() => {
                    const NextIcon = steps[currentStep + 1]?.icon;
                    return NextIcon ? <NextIcon /> : undefined;
                  })()}
                >
                  {loading ? 'Processing...' : `Next: ${steps[currentStep + 1]?.label || 'Step'}`}
                </Button>
              ) : (
                <Button
                  onClick={onComplete}
                  disabled={!filingData.isSubmitted}
                  variant="contained"
                  color="success"
                >
                  Complete Filing
                </Button>
              )}
            </Box>
          </Box>
          
          {!canProceedToNext() && !loading && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {currentStep === 0 && 'Please upload at least one invoice to proceed'}
              {currentStep === 1 && `Please resolve ${filingData.summary.errorCount} validation errors to proceed`}
              {currentStep === 2 && 'Please categorize all invoices before proceeding'}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};