import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button,
  Chip, List, ListItem, ListItemIcon, ListItemText,
  Collapse, Radio,
} from '@mui/material';
import { CheckCircle, Cancel, Star, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import type { PlanData } from '../../../hooks/usePaymentForm';

const PLANS: (Omit<PlanData, 'billingCycle'> & {
  billingCycle: 'monthly' | 'annual';
  subtitle?: string;
  annualLabel?: string;
  color: string;
  recommended?: boolean;
  features: { label: string; included: boolean | string }[];
})[] = [
  {
    id: 'mei',
    name: 'MEI',
    price: 107,
    billingCycle: 'monthly',
    subtitle: 'Micro Empreendedor Individual',
    color: '#5B21B6',
    features: [
      { label: 'Atendimento online (WhatsApp)', included: true },
      { label: 'Segunda a Sexta 8h às 18h', included: true },
      { label: 'Sábado 8h às 12h', included: false },
      { label: 'Fechamento Fiscal', included: true },
      { label: 'Departamento Pessoal', included: true },
      { label: 'Pró-labore', included: true },
      { label: 'Imposto de Renda para Sócios', included: true },
      { label: 'Funcionários', included: 'Até 01' },
      { label: 'Regime Tributário', included: 'SIMEI' },
      { label: 'Emissor Ilimitado (NF-e/NFC-e)', included: true },
      { label: 'Gestão (Estoque, Financeiro, Venda)', included: false },
    ],
  },
  {
    id: 'controle',
    name: 'Controle',
    price: 237,
    billingCycle: 'monthly',
    color: '#22C55E',
    features: [
      { label: 'Atendimento online (WhatsApp)', included: true },
      { label: 'Segunda a Sexta 8h às 18h', included: true },
      { label: 'Sábado 8h às 12h', included: true },
      { label: 'Fechamento Fiscal', included: true },
      { label: 'Departamento Pessoal', included: true },
      { label: 'Pró-labore', included: true },
      { label: 'Imposto de Renda para Sócios', included: true },
      { label: 'Funcionários', included: 'Até 02' },
      { label: 'Regime Tributário', included: 'Simples Nacional' },
      { label: 'Emissor Ilimitado (NF-e/NFC-e)', included: false },
      { label: 'Gestão (Estoque, Financeiro, Venda)', included: false },
    ],
  },
  {
    id: 'essencial',
    name: 'Essencial',
    price: 337,
    billingCycle: 'monthly',
    color: '#7C3AED',
    recommended: true,
    features: [
      { label: 'Atendimento online (WhatsApp)', included: true },
      { label: 'Segunda a Sexta 8h às 18h', included: true },
      { label: 'Sábado 8h às 12h', included: true },
      { label: 'Fechamento Fiscal', included: true },
      { label: 'Departamento Pessoal', included: true },
      { label: 'Pró-labore', included: true },
      { label: 'Imposto de Renda para Sócios', included: true },
      { label: 'Funcionários', included: 'Até 5' },
      { label: 'Regime Tributário', included: 'Simples Nacional' },
      { label: 'Emissor Ilimitado (NF-e/NFC-e)', included: true },
      { label: 'Gestão (Estoque, Financeiro, Venda)', included: true },
    ],
  },
  {
    id: 'anual',
    name: 'Plano anual',
    price: 303.30,
    annualTotal: 3639.60,
    billingCycle: 'annual',
    annualLabel: 'R$ 3.639,60 equivalente a 12x de',
    color: '#22C55E',
    features: [
      { label: 'Atendimento online (WhatsApp)', included: true },
      { label: 'Segunda a Sexta 8h às 18h', included: true },
      { label: 'Sábado 8h às 12h', included: true },
      { label: 'Fechamento Fiscal', included: true },
      { label: 'Departamento Pessoal', included: true },
      { label: 'Pró-labore', included: true },
      { label: 'Imposto de Renda para Sócios', included: true },
      { label: 'Funcionários', included: 'Até 5' },
      { label: 'Regime Tributário', included: 'Simples Nacional' },
      { label: 'Emissor Ilimitado (NF-e/NFC-e)', included: true },
      { label: 'Gestão (Estoque, Financeiro, Venda)', included: true },
    ],
  },
];

interface StepPlansProps {
  selectedPlan: PlanData | null;
  onSelect: (plan: PlanData) => void;
}

export const StepPlans: React.FC<StepPlansProps> = ({ selectedPlan, onSelect }) => {
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const toggleFeatures = (id: string) => {
    setExpandedPlan(expandedPlan === id ? null : id);
  };

  return (
    <Box className="flex flex-col gap-6 animate-fadeIn">
      <Typography variant="h6" className="text-center text-gray-600 font-normal">
        Escolha o plano ideal para o seu negócio
      </Typography>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan?.id === plan.id;

          return (
            <Card
              key={plan.id}
              elevation={isSelected ? 8 : 1}
              sx={{
                position: 'relative',
                border: isSelected ? `2px solid ${plan.color}` : '1px solid #e2e8f0',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                borderRadius: '4px',
                overflow: 'visible',
              }}
              onClick={() =>
                onSelect({
                  id: plan.id,
                  name: plan.name,
                  price: plan.price,
                  annualTotal: plan.annualTotal,
                  billingCycle: plan.billingCycle,
                })
              }
            >
              {plan.recommended && (
                <Chip
                  label="MAIS ESCOLHIDO"
                  color="warning"
                  size="small"
                  icon={<Star fontSize="small" />}
                  sx={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  }}
                />
              )}

              <CardContent className="text-center pt-8 pb-4 px-2">
                <div className="flex justify-center mb-1">
                  <Radio
                    checked={isSelected}
                    value={plan.id}
                    sx={{ color: plan.color, '&.Mui-checked': { color: plan.color } }}
                  />
                </div>

                <Typography
                  variant="h6"
                  sx={{ color: plan.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}
                >
                  {plan.name}
                </Typography>

                {plan.subtitle && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    {plan.subtitle}
                  </Typography>
                )}

                {plan.annualLabel && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {plan.annualLabel}
                  </Typography>
                )}

                <Box
                  sx={{
                    my: 1,
                    bgcolor: plan.recommended ? plan.color : '#22C55E',
                    borderRadius: '4px',
                    px: 1,
                    py: 0.5,
                  }}
                >
                  <Typography variant="h4" fontWeight="bold" color="white" component="span">
                    R${' '}
                    {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: plan.id === 'anual' ? 2 : 0 })}
                  </Typography>
                  <Typography variant="caption" color="white" sx={{ ml: 0.5 }}>
                    /mês
                  </Typography>
                </Box>

                <Button
                  size="small"
                  onClick={(e) => { e.stopPropagation(); toggleFeatures(plan.id); }}
                  endIcon={expandedPlan === plan.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  sx={{ mt: 1, color: 'gray', textTransform: 'none', fontSize: 11 }}
                >
                  {expandedPlan === plan.id ? 'Ocultar recursos' : 'Ver recursos'}
                </Button>

                <Collapse in={expandedPlan === plan.id}>
                  <Box sx={{ mt: 1, bgcolor: '#f8fafc', borderRadius: 2, p: 1 }}>
                    <List dense disablePadding>
                      {plan.features.map((feat, idx) => (
                        <ListItem key={idx} disablePadding sx={{ py: 0.3 }}>
                          <ListItemIcon sx={{ minWidth: 22 }}>
                            {feat.included === false ? (
                              <Cancel sx={{ fontSize: 14, color: '#EF4444' }} />
                            ) : feat.included === true ? (
                              <CheckCircle sx={{ fontSize: 14, color: '#22C55E' }} />
                            ) : null}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              typeof feat.included === 'string'
                                ? `${feat.label}: ${feat.included}`
                                : feat.label
                            }
                            primaryTypographyProps={{ fontSize: 11, color: 'text.secondary' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Box>
  );
};
