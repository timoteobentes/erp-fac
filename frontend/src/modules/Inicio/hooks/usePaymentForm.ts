import { useState } from 'react';
import { useAuth } from '../../Login/context/AuthContext';
import { createPaymentLink } from '../services/infinitypayService';

export type BillingCycle = 'monthly' | 'annual';

export interface PlanData {
  id: string;
  name: string;
  price: number;        // preço mensal exibido
  annualTotal?: number; // total cobrado no plano anual (uma vez por ano)
  billingCycle: BillingCycle;
}

export const usePaymentForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSelectPlan = (plan: PlanData) => {
    setSelectedPlan(plan);
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async () => {
    if (!selectedPlan || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const amount =
        selectedPlan.billingCycle === 'annual'
          ? selectedPlan.annualTotal!
          : selectedPlan.price;

      const { checkoutUrl } = await createPaymentLink({
        usuarioId: String(user.id),
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        amount,
        email: user.email,
        nome: user.nome_empresa || user.nome_completo || user.name,
      });

      // Redireciona para o checkout InfinityPay (sai do app)
      window.location.href = checkoutUrl;
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? 'Erro ao criar link de pagamento. Tente novamente.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    activeStep,
    selectedPlan,
    isLoading,
    error,
    handleSelectPlan,
    handleNext,
    handleBack,
    handleSubmit,
  };
};
