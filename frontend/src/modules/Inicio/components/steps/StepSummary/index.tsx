import React from 'react';
import { Box, Typography, Card, CardContent, Divider, Chip } from '@mui/material';
import { Lock, OpenInNew, CreditCard, QrCode2 } from '@mui/icons-material';
import type { PlanData } from '../../../hooks/usePaymentForm';

interface StepSummaryProps {
  selectedPlan: PlanData | null;
}

export const StepSummary: React.FC<StepSummaryProps> = ({ selectedPlan }) => {
  if (!selectedPlan) return null;

  const chargeAmount =
    selectedPlan.billingCycle === 'annual'
      ? selectedPlan.annualTotal!
      : selectedPlan.price;

  return (
    <Box className="py-2 animate-fadeIn">
      <Typography variant="h6" className="text-center font-bold text-[#3C0473] mb-6">
        Resumo do Pedido
      </Typography>

      <Card variant="outlined" sx={{ bgcolor: '#FAFAFA', mb: 4, borderRadius: '4px' }}>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Plano Selecionado:</span>
            <span className="font-bold text-gray-800">{selectedPlan.name}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Ciclo:</span>
            <span className="font-bold text-gray-800">
              {selectedPlan.billingCycle === 'annual' ? 'Anual' : 'Mensal'}
            </span>
          </div>

          <Divider sx={{ my: 2 }} />

          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-[#3C0473]">Total a Pagar:</span>
            <span className="text-2xl font-extrabold text-[#3C0473]">
              {chargeAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              {selectedPlan.billingCycle === 'monthly' && (
                <span className="text-sm font-normal text-gray-500">/mês</span>
              )}
            </span>
          </div>

          {selectedPlan.billingCycle === 'annual' && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ textAlign: 'right', mt: 0.5 }}>
              Equivalente a 12x de{' '}
              {selectedPlan.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/mês
            </Typography>
          )}
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 4, borderRadius: '4px', borderColor: '#e0d6f5' }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Formas de pagamento aceitas pelo checkout
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
            <Chip icon={<CreditCard />} label="Cartão de Crédito" size="small" variant="outlined" />
            <Chip icon={<QrCode2 />} label="PIX" size="small" variant="outlined" />
          </Box>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 bg-blue-50 p-3 rounded text-sm text-blue-800">
        <Lock fontSize="small" className="mt-0.5 shrink-0" />
        <p>
          Ao clicar em <strong>Ir para Pagamento</strong>, você será direcionado ao checkout seguro da{' '}
          <strong>InfinityPay</strong> para concluir sua assinatura.
          <span className="flex items-center gap-1 mt-1 text-xs opacity-75">
            <OpenInNew fontSize="inherit" /> Você será redirecionado para uma página externa.
          </span>
        </p>
      </div>
    </Box>
  );
};
