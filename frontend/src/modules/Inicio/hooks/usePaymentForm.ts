import { useState, useEffect } from 'react';

export type PaymentMethod = 'cartao' | 'pix' | 'boleto';

export interface PaymentData {
  method: PaymentMethod | null;
  cartao: {
    parcelas: number;
    email: string;
    nomeCartao: string;
    numeroCartao: string;
    validade: string;
    cvv: string;
  };
  pix: {
    qrCode: string;
    linkPix: string;
  };
  boleto: {
    codigoBarras: string;
    linhaDigitavel: string;
  };
}

const initialPaymentData: PaymentData = {
  method: null,
  cartao: {
    parcelas: 1,
    email: '',
    nomeCartao: '',
    numeroCartao: '',
    validade: '',
    cvv: '',
  },
  pix: {
    qrCode: '',
    linkPix: '',
  },
  boleto: {
    codigoBarras: '',
    linhaDigitavel: '',
  },
};

export const usePaymentForm = () => {
  const [step, setStep] = useState<number>(0);
  const [paymentData, setPaymentData] = useState<PaymentData>(initialPaymentData);

  // Carregar dados salvos ao iniciar
  useEffect(() => {
    const savedData = localStorage.getItem('paymentFormData');
    if (savedData) {
      setPaymentData(JSON.parse(savedData));
    }
  }, []);

  // Salvar dados sempre que mudar
  useEffect(() => {
    localStorage.setItem('paymentFormData', JSON.stringify(paymentData));
  }, [paymentData]);

  const handleSelectMethod = (method: PaymentMethod) => {
    setPaymentData(prev => ({ ...prev, method }));
    setStep(1);
  };

  const handleUpdateCartaoData = (data: Partial<PaymentData['cartao']>) => {
    setPaymentData(prev => ({
      ...prev,
      cartao: { ...prev.cartao, ...data }
    }));
  };

  const handleBack = () => {
    if (step === 0) return;
    setStep(prev => prev - 1);
  };

  const handleNext = () => {
    if (step === 1 && paymentData.method) {
      // Aqui você faria a chamada para gerar PIX ou Boleto
      if (paymentData.method === 'pix') {
        // Simulação de geração de PIX
        setPaymentData(prev => ({
          ...prev,
          pix: {
            qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PIX123456789',
            linkPix: 'https://pix.example.com/123456789'
          }
        }));
      } else if (paymentData.method === 'boleto') {
        // Simulação de geração de Boleto
        setPaymentData(prev => ({
          ...prev,
          boleto: {
            codigoBarras: '00190.00009 00012.110014 03045.817009 5 84210026000',
            linhaDigitavel: '0019000090001211001403045817009584210026000'
          }
        }));
      }
      setStep(2);
    }
  };

  const handleSubmit = () => {
    // Aqui você faria o submit dos dados
    console.log('Dados para pagamento:', paymentData);
    // Limpar localStorage após submit
    localStorage.removeItem('paymentFormData');
  };

  const handleReset = () => {
    setStep(0);
    setPaymentData(initialPaymentData);
    localStorage.removeItem('paymentFormData');
  };

  return {
    step,
    paymentData,
    handleSelectMethod,
    handleUpdateCartaoData,
    handleBack,
    handleNext,
    handleSubmit,
    handleReset,
    setStep,
  };
};