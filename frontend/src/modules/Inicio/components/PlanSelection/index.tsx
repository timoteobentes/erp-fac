import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button,
  Chip, List, ListItem, ListItemIcon, ListItemText,
  Collapse, Radio,
} from '@mui/material';
import { CheckCircle, Cancel, Star, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

const PLANS = [
  {
    id: 'mei',
    name: 'MEI',
    price: 97,
    subtitle: 'Micro Empreendedor Individual',
    color: '#5B21B6',
    features: ['Atendimento online (WhatsApp)', 'Segunda a Sexta 8h às 18h', 'Fechamento Fiscal'],
    moreFeatures: [
      { label: 'Sábado 8h às 12h', included: false },
      { label: 'Emissor Ilimitado (NF-e/NFC-e)', included: true },
      { label: 'Gestão (Estoque, Financeiro, Venda)', included: false },
      { label: 'Funcionários: Até 01', included: true },
      { label: 'Regime Tributário: SIMEI', included: true },
    ],
  },
  {
    id: 'controle',
    name: 'Controle',
    price: 237,
    color: '#22C55E',
    features: ['Atendimento online (WhatsApp)', 'Segunda a Sexta e Sábado', 'Fechamento Fiscal'],
    moreFeatures: [
      { label: 'Emissor Ilimitado (NF-e/NFC-e)', included: false },
      { label: 'Gestão (Estoque, Financeiro, Venda)', included: false },
      { label: 'Funcionários: Até 02', included: true },
      { label: 'Regime Tributário: Simples Nacional', included: true },
    ],
  },
  {
    id: 'essencial',
    name: 'Essencial',
    price: 337,
    recommended: true,
    subtitle: 'Mais escolhido',
    color: '#7C3AED',
    features: ['Tudo do Controle', 'Emissor Ilimitado NFe/NFC-e', 'Gestão Completa do ERP'],
    moreFeatures: [
      { label: 'Emissor Ilimitado (NF-e/NFC-e)', included: true },
      { label: 'Gestão (Estoque, Financeiro, Venda)', included: true },
      { label: 'Funcionários: Até 5', included: true },
      { label: 'Regime Tributário: Simples Nacional', included: true },
    ],
  },
];

interface PlanSelectionProps {
  selectedPlan: string | null;
  onSelectPlan: (planId: string) => void;
}

export const PlanSelection: React.FC<PlanSelectionProps> = ({ selectedPlan, onSelectPlan }) => {
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  const toggleFeatures = (id: string) => {
    setExpandedPlan(expandedPlan === id ? null : id);
  };

  return (
    <Box className="flex flex-col gap-6 animate-fadeIn">
      <Typography variant="h6" className="text-center text-gray-600 font-normal">
        Escolha o plano ideal para o seu negócio
      </Typography>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;

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
              onClick={() => onSelectPlan(plan.id)}
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

              <CardContent className="text-center pt-8 pb-4">
                <div className="flex justify-center mb-2">
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
                  <Typography variant="caption" color="text.secondary" display="block">
                    {plan.subtitle}
                  </Typography>
                )}

                <Box className="my-4 flex justify-center items-baseline text-gray-800">
                  <Typography variant="h3" fontWeight="bold">R$ {plan.price}</Typography>
                  <Typography variant="subtitle1" color="text.secondary">/mês</Typography>
                </Box>

                <List dense>
                  {plan.features.map((feature, idx) => (
                    <ListItem key={idx} disablePadding sx={{ justifyContent: 'center', py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <CheckCircle sx={{ fontSize: 16, color: plan.color }} />
                      </ListItemIcon>
                      <ListItemText primary={feature} primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                  ))}
                </List>

                <Button
                  size="small"
                  onClick={(e) => { e.stopPropagation(); toggleFeatures(plan.id); }}
                  endIcon={expandedPlan === plan.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  sx={{ mt: 2, color: 'gray', textTransform: 'none' }}
                >
                  {expandedPlan === plan.id ? 'Ocultar recursos' : 'Ver todos os recursos'}
                </Button>

                <Collapse in={expandedPlan === plan.id}>
                  <Box sx={{ mt: 1, bgcolor: '#f8fafc', borderRadius: 2, p: 1 }}>
                    <List dense>
                      {plan.moreFeatures.map((feat, idx) => (
                        <ListItem key={idx} disablePadding sx={{ justifyContent: 'center' }}>
                          <ListItemIcon sx={{ minWidth: 22 }}>
                            {feat.included ? (
                              <CheckCircle sx={{ fontSize: 14, color: '#22C55E' }} />
                            ) : (
                              <Cancel sx={{ fontSize: 14, color: '#EF4444' }} />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={feat.label}
                            primaryTypographyProps={{ fontSize: 12, color: 'text.secondary' }}
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
