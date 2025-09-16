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
  Alert,
  IconButton
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Receipt as ReceiptIcon,
  CreditCard as ITCIcon,
  Calculate as CalculateIcon,
  Preview as PreviewIcon,
  Send as SubmitIcon,
  ArrowBack as BackIcon,
  ArrowForward as ForwardIcon
} from '@mui/icons-material';

// Import step components
import { OutwardSuppliesStep } from './steps/OutwardSuppliesStep';
import { InwardSuppliesStep } from './steps/InwardSuppliesStep';
import { ITCReconciliationStep } from './steps/ITCReconciliationStep';
import { TaxCalculationStep } from './steps/TaxCalculationStep';
import { GSTR3BPreviewStep } from './steps/GSTR3BPreviewStep';
import { GSTR3BSubmitStep } from './steps/GSTR3BSubmitStep';

interface GSTR3BWizardProps {
  onComplete?: () => void;
}

// GSTR-3B data structure
export interface OutwardSupply {
  id: string;
  type: 'B2B' | 'B2C' | 'Export' | 'Exempt';
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
}

export interface InwardSupply {
  id: string;
  gstin: string;
  invoiceNumber: string;
  invoiceDate: string;
  taxableValue: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
  itcClaimed: number;
  itcReversed: number;
}

export interface ITCDetails {
  itcAvailed: {
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
  itcReversed: {
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
  itcIneligible: {
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
}

export interface TaxLiability {
  totalTaxableValue: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  totalCess: number;
  netTaxLiability: number;
  cashPayment: number;
  itcUtilization: number;
  refundClaimed: number;
}

export interface GSTR3BData {
  outwardSupplies: OutwardSupply[];
  inwardSupplies: InwardSupply[];
  itcDetails: ITCDetails;
  taxLiability: TaxLiability;
  summary: {
    totalOutwardTurnover: number;
    totalInwardTurnover: number;
    netTaxPayable: number;
    validatedSupplies: number;
    pendingReconciliation: number;
  };
  currentStep: number;
  isSubmitted: boolean;
}

const steps = [
  {
    label: 'Outward Supplies',
    description: 'Import and review supplies from GSTR-1',
    icon: ReceiptIcon,
    component: OutwardSuppliesStep
  },
  {
    label: 'Inward Supplies',
    description: 'Import purchases and inward supplies',
    icon: AssessmentIcon,
    component: InwardSuppliesStep
  },
  {
    label: 'ITC Reconciliation',
    description: 'Reconcile Input Tax Credit with GSTR-2A/2B',
    icon: ITCIcon,
    component: ITCReconciliationStep
  },
  {
    label: 'Tax Calculation',
    description: 'Calculate net tax liability and payments',
    icon: CalculateIcon,
    component: TaxCalculationStep
  },
  {
    label: 'Preview Return',
    description: 'Review complete GSTR-3B return',
    icon: PreviewIcon,
    component: GSTR3BPreviewStep
  },
  {
    label: 'Submit Return',
    description: 'File GSTR-3B with GST portal',
    icon: SubmitIcon,
    component: GSTR3BSubmitStep
  }
];

export const GSTR3BWizard = ({ onComplete }: GSTR3BWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [gstr3bData, setGSTR3BData] = useState<GSTR3BData>({
    outwardSupplies: [],
    inwardSupplies: [],
    itcDetails: {
      itcAvailed: { cgst: 0, sgst: 0, igst: 0, cess: 0 },
      itcReversed: { cgst: 0, sgst: 0, igst: 0, cess: 0 },
      itcIneligible: { cgst: 0, sgst: 0, igst: 0, cess: 0 }
    },
    taxLiability: {
      totalTaxableValue: 0,
      totalCGST: 0,
      totalSGST: 0,
      totalIGST: 0,
      totalCess: 0,
      netTaxLiability: 0,
      cashPayment: 0,
      itcUtilization: 0,
      refundClaimed: 0
    },
    summary: {
      totalOutwardTurnover: 0,
      totalInwardTurnover: 0,
      netTaxPayable: 0,
      validatedSupplies: 0,
      pendingReconciliation: 0
    },
    currentStep: 0,
    isSubmitted: false
  });
  const [loading, setLoading] = useState(false);

  const updateGSTR3BData = useCallback((updates: Partial<GSTR3BData>) => {
    setGSTR3BData(prev => ({
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

  const canProceedToNext = useCallback((): boolean => {
    switch (currentStep) {
      case 0: // Outward Supplies
        return gstr3bData.outwardSupplies.length > 0;
      case 1: // Inward Supplies
        return gstr3bData.inwardSupplies.length > 0;
      case 2: // ITC Reconciliation
        return gstr3bData.summary.pendingReconciliation === 0;
      case 3: // Tax Calculation
        return gstr3bData.taxLiability.netTaxLiability >= 0;
      case 4: // Preview
        return true;
      default:
        return false;
    }
  }, [currentStep, gstr3bData]);

  const getCurrentStepComponent = () => {
    const StepComponent = steps[currentStep].component;
    return (
      <StepComponent
        data={gstr3bData}
        onUpdate={updateGSTR3BData}
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
              GSTR-3B Monthly Summary Return
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

          <Stepper 
            activeStep={currentStep} 
            orientation="horizontal"
            sx={{ 
              '& .MuiStepLabel-label': { fontSize: '0.875rem' }
            }}
          >
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Step key={step.label}>
                  <StepLabel
                    icon={<Icon fontSize="small" />}
                    optional={
                      <Typography variant="caption" color="text.secondary">
                        {step.description}
                      </Typography>
                    }
                  >
                    {step.label}
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {getCurrentStepComponent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2
          }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                onClick={handleBack}
                disabled={currentStep === 0 || loading}
                variant="outlined"
                startIcon={<BackIcon />}
              >
                Back
              </Button>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {currentStep + 1} / {steps.length}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceedToNext() || loading}
                  variant="contained"
                  endIcon={loading ? undefined : (() => {
                    const NextIcon = steps[currentStep + 1]?.icon;
                    return NextIcon ? <NextIcon /> : <ForwardIcon />;
                  })()}
                >
                  {loading ? 'Processing...' : `Next: ${steps[currentStep + 1]?.label || 'Step'}`}
                </Button>
              ) : (
                <Button
                  onClick={onComplete}
                  disabled={!gstr3bData.isSubmitted}
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
              {currentStep === 0 && 'Please import outward supplies from GSTR-1 to proceed'}
              {currentStep === 1 && 'Please import inward supplies data to proceed'}
              {currentStep === 2 && `Please reconcile ${gstr3bData.summary.pendingReconciliation} pending supplies`}
              {currentStep === 3 && 'Please verify tax calculations before proceeding'}
            </Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};