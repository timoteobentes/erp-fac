/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Typography, Button } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { type PlanData, type PaymentData } from '../../../hooks/usePaymentForm';
import { toast } from 'react-toastify';

interface StepSuccessProps {
  selectedPlan: PlanData | null;
  paymentData: PaymentData;
  responseData?: any; // Adicionado para mostrar detalhes da resposta, se necessário
}

export const StepSuccess: React.FC<StepSuccessProps> = ({ selectedPlan, paymentData, responseData }) => {
  const ImagemBase64 = ({ base64 }: any) => {
    return (
      <img
        src={
          base64.startsWith("data:image")
            ? base64
            : `data:image/png;base64,${base64}`
        }
        alt="QR Code"
        className="mx-auto py-4"
        style={{ maxWidth: "50%" }}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center animate-fadeIn">
      {responseData?.data?.status === "approved" && (
        <>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle sx={{ fontSize: 50, color: '#2e7d32' }} />
          </div>
          <Typography variant="h5" fontWeight="bold" className="text-gray-800 mb-2">
            Pagamento Confirmado!
          </Typography>
          <Typography className="text-gray-600 mb-6 max-w-sm">
            Sua assinatura do <strong>{selectedPlan?.name}</strong> foi ativada com sucesso. Você já pode acessar todos os recursos.
          </Typography>

          <Button 
            variant="contained" 
            size="large"
            onClick={() => {
              let getUserStorage = JSON.parse(localStorage.getItem("user") || "");
              getUserStorage = { ...getUserStorage, status: "ativo", plano_selecionado: selectedPlan?.name }

              localStorage.setItem("user", JSON.stringify(getUserStorage));
              window.location.reload();
            }} 
            sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' }, px: 6 }}
          >
            Acessar Painel
          </Button>
        </>
      )}

      {(paymentData.method === 'pix' && responseData?.data?.status === "pending") && (
        <div className="mb-6 p-4 w-full">
          <p className="text-xs text-purple-800 uppercase font-bold mb-2">Atenção: Pagamento via PIX</p>
          <p className="text-sm text-gray-700">Escaneie o QR Code no seu aplicativo bancário para pagar.</p>
          {<ImagemBase64 base64={responseData?.data?.point_of_interaction?.transaction_data?.qr_code_base64} />}
          <p className="text-xs text-gray-500 uppercase font-bold mb-2">Ou copia e cole o código abaixo:</p>
          <code
            onClick={() => {
              navigator.clipboard.writeText(
                responseData?.data?.point_of_interaction?.transaction_data?.qr_code
              );
              toast.success("Código copiado para a área de transferência!");
            }}
            className="block bg-white p-2 rounded text-xs break-all border border-gray-200 text-gray-600 cursor-pointer hover:bg-gray-50 hover:border-purple-500"
          >
            {responseData?.data?.point_of_interaction?.transaction_data?.qr_code}
          </code>
        </div>
      )}
    </div>
  );
};