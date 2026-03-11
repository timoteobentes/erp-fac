import React from 'react';
import { Box, Typography, Card, CardContent, Divider } from '@mui/material';
import { Lock } from '@mui/icons-material';
import { type PlanData, type PaymentData } from '../../../hooks/usePaymentForm';

interface StepSummaryProps {
  selectedPlan: PlanData | null;
  paymentData: PaymentData | null;
}

export const StepSummary: React.FC<StepSummaryProps> = ({ selectedPlan, paymentData }) => {
  if (!selectedPlan) return null;
  if (!paymentData) return null;

  return (
    <Box className="py-2 animate-fadeIn">
      <Typography variant="h6" className="text-center font-bold text-[#3C0473] mb-6">
        Resumo do Pedido
      </Typography>

      <Card variant="outlined" sx={{ bgcolor: '#FAFAFA', mb: 4, borderRadius: "4px" }}>
        <CardContent>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Plano Selecionado:</span>
            <span className="font-bold text-gray-800">{selectedPlan.name}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Ciclo:</span>
            <span className="font-bold text-gray-800">Mensal</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Forma de Pagamento:</span>
            <span className="font-bold text-gray-800">{paymentData.method === "cartao" ? "Cartão" : paymentData.method === "boleto" ? "Boleto" : "PIX"}</span>
          </div>
          {paymentData.method == "pix" && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Desconto:</span>
              <span className="font-bold text-gray-800">{(selectedPlan.price * 0.05).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
          )}
          <Divider sx={{ my: 2 }} />
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-[#3C0473]">Total a Pagar:</span>
            <span className="text-2xl font-extrabold text-[#3C0473]">
              {paymentData.method == "pix" ? selectedPlan?.price_with_off?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : selectedPlan.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) }
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 bg-blue-50 p-3 rounded text-sm text-blue-800 mb-6">
        <Lock fontSize="small" className="mt-0.5" />
        <p>Ao confirmar, você concorda com nossos Termos de Serviço. A renovação é automática para pagamentos via cartão.</p>
      </div>
    </Box>
  );
};