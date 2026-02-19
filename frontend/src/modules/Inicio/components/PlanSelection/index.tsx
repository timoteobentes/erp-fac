import React, { useState } from 'react';
import { 
  Box, Card, CardContent, Typography, Button, 
  Chip, List, ListItem, ListItemIcon, ListItemText,
  Collapse, Radio
} from '@mui/material';
import { CheckCircle, Star, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

// Dados dos Planos (Mock)
const PLANS = [
  {
    id: 'mei',
    name: 'MEI',
    price: '96,90',
    color: '#64748b',
    features: ['Gestão de Clientes', 'Controle de Vendas', 'Relatórios Básicos'],
    moreFeatures: ['Suporte por E-mail', '1 Usuário', 'Backup Diário']
  },
  {
    id: 'essencial',
    name: 'Essencial',
    price: '316,90',
    recommended: true,
    color: '#6B00A1', // Roxo Principal
    features: ['Tudo do Básico', 'Múltiplos Usuários', 'Emissão de NFe/NFCe'],
    moreFeatures: ['Suporte WhatsApp', 'Controle de Estoque Avançado', 'Integração API', 'Gestão Financeira Completa']
  },
  {
    id: 'controle',
    name: 'Controle',
    price: '216,90',
    color: '#1e293b', // Dark
    features: ['Filiais Ilimitadas', 'Gestor de Conta Dedicado'],
    moreFeatures: ['Auditória Avançada', 'BI Personalizado', 'SLA Garantido', 'Treinamento Equipe']
  }
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
          const isRecommended = plan.recommended;

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
                borderRadius: "4px",
                overflow: 'visible' // Para o Chip sair pra fora se precisar
              }}
              onClick={() => onSelectPlan(plan.id)}
            >
              {isRecommended && (
                <Chip 
                  label="MAIS POPULAR" 
                  color="warning" 
                  size="small"
                  icon={<Star fontSize="small" />}
                  sx={{ 
                    position: 'absolute', 
                    top: -12, 
                    left: '50%', 
                    transform: 'translateX(-50%)',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
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
                
                <Typography variant="h6" sx={{ color: plan.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {plan.name}
                </Typography>
                
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

                {/* Botão de Ver Mais Recursos */}
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
                            <ListItemText primary={`+ ${feat}`} primaryTypographyProps={{ fontSize: 12, color: 'text.secondary' }} />
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