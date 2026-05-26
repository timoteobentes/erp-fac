import React from 'react';
import { Box, Stepper, Step, StepLabel, Button, CircularProgress, Alert } from '@mui/material';
import { ArrowBack, ArrowForward, OpenInNew } from '@mui/icons-material';
import { usePaymentForm } from '../../hooks/usePaymentForm';
import { StepPlans } from '../steps/StepPlans';
import { StepSummary } from '../steps/StepSummary';

const steps = ['Planos', 'Confirmação'];

export const PaymentFormSteps: React.FC = () => {
  const {
    activeStep,
    selectedPlan,
    isLoading,
    error,
    handleSelectPlan,
    handleNext,
    handleBack,
    handleSubmit,
  } = usePaymentForm();

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <StepPlans selectedPlan={selectedPlan} onSelect={handleSelectPlan} />;
      case 1:
        return <StepSummary selectedPlan={selectedPlan} />;
      default:
        return null;
    }
  };

  return (
    <Box className="w-full">
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step
            key={label}
            sx={{
              '& .MuiStepLabel-root .Mui-active': { color: '#6B00A1' },
              '& .MuiStepLabel-root .Mui-completed': { color: '#3C0473' },
            }}
          >
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: '350px' }}>
        {renderStepContent(activeStep)}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid #f0f0f0' }}>
        <Button
          disabled={activeStep === 0 || isLoading}
          onClick={handleBack}
          startIcon={<ArrowBack />}
          sx={{ color: 'gray' }}
        >
          Voltar
        </Button>

        {activeStep === 0 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            disabled={!selectedPlan}
            endIcon={<ArrowForward />}
            sx={{ bgcolor: '#6B00A1', '&:hover': { bgcolor: '#3C0473' }, px: 4 }}
          >
            Continuar
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="large"
            disabled={isLoading}
            startIcon={
              isLoading ? <CircularProgress size={20} color="inherit" /> : <OpenInNew />
            }
            sx={{ bgcolor: '#3C0473', '&:hover': { bgcolor: '#2a0252' }, px: 4, fontWeight: 'bold' }}
          >
            {isLoading ? 'Aguarde...' : 'Ir para Pagamento'}
          </Button>
        )}
      </Box>
    </Box>
  );
};
