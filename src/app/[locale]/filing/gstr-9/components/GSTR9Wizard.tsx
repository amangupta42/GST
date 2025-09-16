'use client';

import { useState, useCallback, useMemo } from 'react';
import { 
  Paper, 
  Stepper, 
  Step, 
  StepLabel, 
  Box, 
  Button, 
  Typography,
  Alert,
  Chip,
  LinearProgress
} from '@mui/material';
import {
  DataSourceStep,
  TurnoverReconciliationStep,
  TaxDetailsStep,
  ITCAnalysisStep,
  GSTR9PreviewStep,
  GSTR9SubmitStep
} from './steps';

export interface GSTR9TurnoverData {
  gstr1Turnover: number;
  gstr3bTurnover: number;
  auditorTurnover: number;
  exemptSupplies: number;
  nilRatedSupplies: number;
  nonGstSupplies: number;
}

export interface GSTR9TaxData {
  gstr1Tax: {
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
  gstr3bTax: {
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
  adjustments: {
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
}

export interface GSTR9ITCData {
  availableITC: {
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
  claimedITC: {
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
  reversedITC: {
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
  ineligibleITC: {
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
}

export interface GSTR9Data {
  financialYear: string;
  gstin: string;
  tradeName: string;
  legalName: string;
  turnoverData: GSTR9TurnoverData;
  taxData: GSTR9TaxData;
  itcData: GSTR9ITCData;
  reconciliationStatus: {
    turnoverReconciled: boolean;
    taxReconciled: boolean;
    itcReconciled: boolean;
    discrepancies: string[];
  };
  auditTrail: {
    dataSource: 'manual' | 'automated' | 'mixed';
    lastUpdated: Date;
    validatedBy: string;
  };
  currentStep: number;
  isSubmitted: boolean;
}

interface GSTR9WizardProps {
  onComplete: () => void;
}

const steps = [
  'Data Source & Import',
  'Turnover Reconciliation', 
  'Tax Details Analysis',
  'ITC Reconciliation',
  'Review & Preview',
  'Submit Return'
];

export function GSTR9Wizard({ onComplete }: GSTR9WizardProps) {
  const [data, setData] = useState<GSTR9Data>({
    financialYear: '2023-24',
    gstin: 'DEFAULTGSTIN001',
    tradeName: 'Sample Company',
    legalName: 'Sample Company Private Limited',
    turnoverData: {
      gstr1Turnover: 0,
      gstr3bTurnover: 0,
      auditorTurnover: 0,
      exemptSupplies: 0,
      nilRatedSupplies: 0,
      nonGstSupplies: 0
    },
    taxData: {
      gstr1Tax: { cgst: 0, sgst: 0, igst: 0, cess: 0 },
      gstr3bTax: { cgst: 0, sgst: 0, igst: 0, cess: 0 },
      adjustments: { cgst: 0, sgst: 0, igst: 0, cess: 0 }
    },
    itcData: {
      availableITC: { cgst: 0, sgst: 0, igst: 0, cess: 0 },
      claimedITC: { cgst: 0, sgst: 0, igst: 0, cess: 0 },
      reversedITC: { cgst: 0, sgst: 0, igst: 0, cess: 0 },
      ineligibleITC: { cgst: 0, sgst: 0, igst: 0, cess: 0 }
    },
    reconciliationStatus: {
      turnoverReconciled: false,
      taxReconciled: false,
      itcReconciled: false,
      discrepancies: []
    },
    auditTrail: {
      dataSource: 'manual',
      lastUpdated: new Date(),
      validatedBy: 'System'
    },
    currentStep: 0,
    isSubmitted: false
  });

  const [loading, setLoading] = useState(false);

  const updateData = useCallback((updates: Partial<GSTR9Data>) => {
    setData(prev => ({ 
      ...prev, 
      ...updates,
      auditTrail: {
        ...prev.auditTrail,
        lastUpdated: new Date()
      }
    }));
  }, []);

  const handleNext = useCallback(() => {
    setData(prev => ({ 
      ...prev, 
      currentStep: Math.min(prev.currentStep + 1, steps.length - 1) 
    }));
  }, []);

  const handleBack = useCallback(() => {
    setData(prev => ({ 
      ...prev, 
      currentStep: Math.max(prev.currentStep - 1, 0) 
    }));
  }, []);

  const handleComplete = useCallback(() => {
    updateData({ isSubmitted: true });
    onComplete();
  }, [updateData, onComplete]);

  const completionPercentage = useMemo(() => {
    let completed = 0;
    const total = 6;
    
    if (data.turnoverData.gstr1Turnover > 0 || data.turnoverData.gstr3bTurnover > 0) completed++;
    if (data.reconciliationStatus.turnoverReconciled) completed++;
    if (data.reconciliationStatus.taxReconciled) completed++;
    if (data.reconciliationStatus.itcReconciled) completed++;
    if (data.currentStep >= 4) completed++;
    if (data.isSubmitted) completed++;
    
    return Math.round((completed / total) * 100);
  }, [data]);

  const getStepStatus = useCallback((stepIndex: number) => {
    if (stepIndex < data.currentStep) return 'completed';
    if (stepIndex === data.currentStep) return 'active';
    return 'inactive';
  }, [data.currentStep]);

  const canProceed = useMemo(() => {
    switch (data.currentStep) {
      case 0: // Data Source
        return data.turnoverData.gstr1Turnover > 0 || data.turnoverData.gstr3bTurnover > 0;
      case 1: // Turnover Reconciliation
        return data.reconciliationStatus.turnoverReconciled;
      case 2: // Tax Details
        return data.reconciliationStatus.taxReconciled;
      case 3: // ITC Analysis
        return data.reconciliationStatus.itcReconciled;
      case 4: // Preview
        return true;
      case 5: // Submit
        return !data.isSubmitted;
      default:
        return true;
    }
  }, [data.currentStep, data.reconciliationStatus, data.turnoverData, data.isSubmitted]);

  const renderStepContent = () => {
    switch (data.currentStep) {
      case 0:
        return (
          <DataSourceStep
            data={data}
            onUpdate={updateData}
            loading={loading}
            setLoading={setLoading}
          />
        );
      case 1:
        return (
          <TurnoverReconciliationStep
            data={data}
            onUpdate={updateData}
            loading={loading}
            setLoading={setLoading}
          />
        );
      case 2:
        return (
          <TaxDetailsStep
            data={data}
            onUpdate={updateData}
            loading={loading}
            setLoading={setLoading}
          />
        );
      case 3:
        return (
          <ITCAnalysisStep
            data={data}
            onUpdate={updateData}
            loading={loading}
            setLoading={setLoading}
          />
        );
      case 4:
        return (
          <GSTR9PreviewStep
            data={data}
            onUpdate={updateData}
            loading={loading}
            setLoading={setLoading}
          />
        );
      case 5:
        return (
          <GSTR9SubmitStep
            data={data}
            onUpdate={updateData}
            onComplete={handleComplete}
            loading={loading}
            setLoading={setLoading}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          GSTR-9 Filing
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Annual return preparation and filing
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            GSTR-9 Annual Return Preparation
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip 
              label={`FY ${data.financialYear}`} 
              color="primary" 
              size="small"
            />
            <Chip 
              label={`${completionPercentage}% Complete`} 
              color={completionPercentage === 100 ? 'success' : 'default'}
              size="small"
            />
          </Box>
        </Box>

        <LinearProgress 
          variant="determinate" 
          value={completionPercentage} 
          sx={{ mb: 2, height: 6, borderRadius: 3 }}
        />

        {data.reconciliationStatus.discrepancies.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2">
              {data.reconciliationStatus.discrepancies.length} discrepancies found:
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

        <Stepper activeStep={data.currentStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel 
                error={getStepStatus(index) === 'completed' && data.reconciliationStatus.discrepancies.length > 0}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Paper sx={{ p: 3, minHeight: 600 }}>
        {renderStepContent()}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 2, borderTop: '1px solid #e0e0e0' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={data.currentStep === 0}
          >
            Back
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {data.currentStep < steps.length - 1 && (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!canProceed || loading}
              >
                {data.currentStep === steps.length - 2 ? 'Review' : 'Next'}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}