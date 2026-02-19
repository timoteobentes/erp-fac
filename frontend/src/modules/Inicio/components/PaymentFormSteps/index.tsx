/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { Box, Stepper, Step, StepLabel, Button, CircularProgress } from '@mui/material';
import { ArrowBack, ArrowForward, Lock } from '@mui/icons-material';
import { usePaymentForm } from '../../hooks/usePaymentForm';

// Importação dos Componentes Menores
import { StepPlans } from '../steps/StepPlans';
import { StepPayment } from '../steps/StepPayment';
import { StepSummary } from '../steps/StepSummary';
import { StepSuccess } from '../steps/StepSuccess';

interface PaymentFormStepsProps {
  onClose: () => void;
}

export const PaymentFormSteps: React.FC<PaymentFormStepsProps> = () => {
  const {
    activeStep,
    selectedPlan,
    paymentData,
    responseData,
    isLoading,
    isSuccess,
    handleSelectPlan,
    handleUpdatePaymentData,
    handleMethodChange,
    handleNext,
    handleBack,
    handleSubmit
  } = usePaymentForm();

  const steps = ['Planos', 'Pagamento', 'Confirmação', 'Conclusão'];

  // Função simplificada de renderização
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: 
        return <StepPlans selectedPlan={selectedPlan} onSelect={handleSelectPlan} />;
      case 1: 
        return <StepPayment 
                  paymentData={paymentData} 
                  onMethodChange={handleMethodChange} 
                  onUpdateData={handleUpdatePaymentData} 
                />;
      case 2: 
        return <StepSummary selectedPlan={selectedPlan} paymentData={paymentData} />;
      case 3: 
        return <StepSuccess selectedPlan={selectedPlan} paymentData={paymentData} responseData={responseData} />;
      default: 
        return null;
    }
  };

  return (
    <Box className="w-full">
      {/* STEPPER (Escondido no sucesso) */}
      {!isSuccess && (
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.slice(0, 3).map((label) => (
            <Step key={label} sx={{ 
              '& .MuiStepLabel-root .Mui-active': { color: '#6B00A1' },
              '& .MuiStepLabel-root .Mui-completed': { color: '#3C0473' },
            }}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      {/* CONTEÚDO */}
      <Box sx={{ minHeight: '350px' }}>
        {renderStepContent(activeStep)}
      </Box>

      {/* NAVEGAÇÃO */}
      {!isSuccess && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid #f0f0f0' }}>
          <Button
            disabled={activeStep === 0 || isLoading}
            onClick={handleBack}
            startIcon={<ArrowBack />}
            sx={{ color: 'gray' }}
          >
            Voltar
          </Button>
          
          <Box>
            {activeStep === 2 ? (
              <Button
                onClick={handleSubmit}
                variant="contained"
                size="large"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Lock />}
                sx={{ 
                  bgcolor: '#3C0473', 
                  '&:hover': { bgcolor: '#2a0252' },
                  px: 4,
                  fontWeight: 'bold'
                }}
              >
                {
                  isLoading ? 'Processando...' :
                  selectedPlan?.price_with_off && paymentData.method == "pix" ?
                  `Pagar ${selectedPlan?.price_with_off.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}` :
                  `Pagar ${selectedPlan?.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
                }
              </Button>
            ) : (
              <Button
                onClick={() => {
                  const price_with_off = selectedPlan.price - (selectedPlan.price * 0.05);
                  selectedPlan.price_with_off = price_with_off
                  handleNext()
                }}
                variant="contained"
                // Regras de validação para habilitar o botão
                disabled={
                  (activeStep === 0 && !selectedPlan) || 
                  (activeStep === 1 && paymentData.method === 'cartao' && paymentData.cartao.numero.length < 16)
                }
                endIcon={<ArrowForward />}
                sx={{ 
                  bgcolor: '#6B00A1', 
                  '&:hover': { bgcolor: '#3C0473' },
                  px: 4
                }}
              >
                Continuar
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};