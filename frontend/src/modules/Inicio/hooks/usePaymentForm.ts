/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useLogin } from '../../Login/hooks/useLogin';
import { useMercadoPagoReady } from './useMercadoPagoReady';
import { createCardToken } from '../services/mpService';
import { paymentService } from '../services/paymentService';

// Tipos
export type PaymentMethod = 'cartao' | 'pix' | 'boleto';

export interface PlanData {
  id: string;
  name: string;
  price: number;
  price_with_off?: number;
}

export interface PaymentData {
  method: PaymentMethod;
  cartao: {
    numero: string;
    nome: string;
    validade: string;
    cvv: string;
    cpf: string;
  };
  boleto: {
    nome: string;
    cpf: string;
    cep: string;
    endereco: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
}

interface BasePayload {
  usuarioId: string;
  amount: number | undefined;
  description: string;
  payer: {
    email: string;
    first_name: string;
    last_name?: string;
    identification: {
      type: string;
      number: string;
    };
    address?: {
      zip_code: string;
      street_name: string;
      street_number: string;
      neighborhood: string;
      city: string;
      federal_unit: string;
    };
  };
}

interface CardPayload extends BasePayload {
  token: string;
  installments: number;
  payment_method_id: string;
}

// Estado Inicial
const initialPaymentData: PaymentData = {
  method: 'cartao', // Padrão
  cartao: {
    numero: '',
    nome: '',
    validade: '',
    cvv: '',
    cpf: ''
  },
  boleto: {
    nome: '',
    cpf: '',
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: ''
  }
};

export const usePaymentForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<PlanData | any>({ id: 'essencial', name: 'Essencial', price: 316.90 });
  const [paymentData, setPaymentData] = useState<PaymentData>(initialPaymentData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);
  const { user } = useLogin();

  const isMpReady = useMercadoPagoReady();

  // Função auxiliar para separar Mês/Ano (MM/AA)
  const getExpirationDate = (dateString: string) => {
    const [month, year] = dateString.split('/');
    // MP precisa do ano com 4 dígitos (ex: 2028), se vier 28 convertemos.
    const fullYear = year.length === 2 ? `20${year}` : year; 
    return { month, year: fullYear };
  };

  // --- Máscaras de Input ---
  const maskCardNumber = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().substring(0, 19);
  };

  const maskDate = (value: string) => {
    return value.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1/$2').substring(0, 5);
  };

  const maskCvv = (value: string) => {
    return value.replace(/\D/g, '').substring(0, 4);
  };

  // --- Actions ---

  const handleSelectPlan = (plan: PlanData) => {
    setSelectedPlan(plan);
    // handleNext();
  };

  const handleUpdatePaymentData = (field: string, value: string, method: string) => {
    let maskedValue = value;

    switch (method) {
      case "cartao":
        if (field === 'numero') maskedValue = maskCardNumber(value);
        if (field === 'validade') maskedValue = maskDate(value);
        if (field === 'cvv') maskedValue = maskCvv(value);
    
        setPaymentData((prev) => ({
          ...prev,
          cartao: { ...prev.cartao, [field]: maskedValue }
        }));
        break;

      case "boleto":
        setPaymentData((prev) => ({
          ...prev,
          boleto: { ...prev.boleto, [field]: maskedValue }
        }));
        break;

      default:
        break;

    }

  };

  const handleMethodChange = (method: PaymentMethod) => {
    setPaymentData((prev) => ({ ...prev, method }));
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async () => {
    setIsLoading(true);

    if (paymentData.method === 'cartao' && !isMpReady) {
        alert("O sistema de pagamento ainda está carregando. Aguarde alguns segundos.");
        setIsLoading(false);
        return;
    }

    try {
      let payloadBackend: BasePayload | CardPayload = {
        usuarioId: user.id,
        amount: paymentData.method == "pix" && selectedPlan?.price_with_off ? Number(selectedPlan?.price_with_off.toFixed(2)) : Number(selectedPlan?.price.toFixed(2)), // Valor do plano
        description: `Assinatura ${selectedPlan?.name}`,
        payer: {
          email: user?.email, // Pegar do contexto de Auth
          first_name: paymentData.cartao.nome.split(' ')[0], // Primeiro nome
          identification: {
            type: paymentData.cartao.cpf.length > 11 ? 'CNPJ' : 'CPF',
            number: paymentData.cartao.cpf.replace(/\D/g, '')
          }
        }
      };

      // ===============================================
      // LÓGICA 1: CARTÃO DE CRÉDITO (TOKENIZAÇÃO)
      // ===============================================
      if (paymentData.method === 'cartao') {
        const { month, year } = getExpirationDate(paymentData.cartao.validade);

        // 1. Gera o Token no Mercado Pago (Front)
        const token = await createCardToken({
          cardNumber: paymentData.cartao.numero,
          cardholderName: paymentData.cartao.nome,
          cardExpirationMonth: month,
          cardExpirationYear: year,
          securityCode: paymentData.cartao.cvv,
          identification: {
            type: paymentData.cartao.cpf.length > 11 ? 'CNPJ' : 'CPF',
            number: paymentData.cartao.cpf
          }
        });

        // 2. Prepara dados para o SEU Backend
        // Note que NÃO enviamos o número do cartão, apenas o TOKEN
        payloadBackend = {
          ...(payloadBackend as BasePayload),
          token: token, // O Token gerado
          installments: 1, // Ou pegar de um select de parcelas
          payment_method_id: "master", // Idealmente, usar mp.getPaymentMethods para detectar a bandeira automática
          payer: {
            ...payloadBackend.payer,
            identification: {
              type: paymentData.cartao.cpf.length > 11 ? 'CNPJ' : 'CPF',
              number: paymentData.cartao.cpf.replace(/\D/g, '')
            }
          }
        } as CardPayload;

        // 3. Envia para a rota de Cartão do seu Backend
        // await api.post('/payments/credit', payloadBackend);
        const response = await paymentService(payloadBackend, "credit")
        setResponseData(response);
        console.log("Enviando Cartão:", payloadBackend);
      
      // ===============================================
      // LÓGICA 2: PIX
      // ===============================================
      } else if (paymentData.method === 'pix') {
        // PIX não precisa de token, vai direto
        // await api.post('/payments/pix', payloadBackend);
        const response = await paymentService(payloadBackend, "pix")
        setResponseData(response)
        console.log("Enviando PIX:", payloadBackend);

      // ===============================================
      // LÓGICA 3: BOLETO
      // ===============================================
      } else if (paymentData.method === 'boleto') {
          // await api.post('/payments/boleto', payloadBackend);

          payloadBackend = {
            ...(payloadBackend as BasePayload),
            payer: {
              first_name: paymentData.boleto.nome.split(' ')[0] || '',
              last_name: paymentData.boleto.nome.split(' ')[1] || '',
              email: user?.email || '',
              identification: {
                type: paymentData.boleto.cpf.length > 11 ? 'CNPJ' : 'CPF',
                number: paymentData.boleto.cpf.replace(/\D/g, '')
              },
              address: {
                zip_code: paymentData.boleto.cep.replace(/\D/g, ''),
                street_name: paymentData.boleto.endereco,
                street_number: paymentData.boleto.numero,
                neighborhood: paymentData.boleto.bairro,
                city: paymentData.boleto.cidade,
                federal_unit: paymentData.boleto.estado
              }
            }
          }
          const response = await paymentService(payloadBackend, "boleto")
          setResponseData(response)
          console.log("Enviando Boleto:", payloadBackend);
      }

      // Se deu tudo certo
      setIsSuccess(true);
      handleNext();

    } catch (error) {
      console.error("Erro no pagamento:", error);
      // Exibir toast de erro
    } finally {
      setIsLoading(false);
    }
  };

  return {
    activeStep,
    selectedPlan,
    paymentData,
    isLoading,
    isSuccess,
    responseData,
    handleSelectPlan,
    handleUpdatePaymentData,
    handleMethodChange,
    handleNext,
    handleBack,
    handleSubmit
  };
};