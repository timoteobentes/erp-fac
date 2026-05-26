import React, { useState } from 'react';
import {
  Box, Typography, Chip, Button, CircularProgress,
  LinearProgress, Divider, List, ListItem, ListItemIcon, ListItemText, Alert,
} from '@mui/material';
import {
  CheckCircle, Cancel, AutorenewOutlined, CalendarTodayOutlined,
  WorkspacePremiumOutlined, CreditCardOutlined, AccessTimeOutlined,
} from '@mui/icons-material';
import api from '../../../../api/api';

interface Feature { label: string; included: boolean | string }

interface PlanoInfo {
  nome: string;
  subtitulo?: string;
  preco: number;
  precoLabel: string;
  ciclo: string;
  totalAnual?: number;
  duracaoDias: number;
  color: string;
  features: Feature[];
}

const PLANO_INFO: Record<string, PlanoInfo> = {
  mei: {
    nome: 'MEI',
    subtitulo: 'Micro Empreendedor Individual',
    preco: 97,
    precoLabel: 'R$ 97/mês',
    ciclo: 'Mensal',
    duracaoDias: 30,
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
  controle: {
    nome: 'Controle',
    preco: 237,
    precoLabel: 'R$ 237/mês',
    ciclo: 'Mensal',
    duracaoDias: 30,
    color: '#059669',
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
  essencial: {
    nome: 'Essencial',
    preco: 337,
    precoLabel: 'R$ 337/mês',
    ciclo: 'Mensal',
    duracaoDias: 30,
    color: '#7C3AED',
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
  anual: {
    nome: 'Anual',
    preco: 303.30,
    precoLabel: 'R$ 303,30/mês',
    ciclo: 'Anual',
    totalAnual: 3639.60,
    duracaoDias: 365,
    color: '#059669',
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
};

const STATUS_CHIP: Record<string, { label: string; color: 'success' | 'error' | 'warning' | 'default' }> = {
  ativo:     { label: 'Ativo',     color: 'success' },
  bloqueado: { label: 'Suspenso',  color: 'error'   },
  pendente:  { label: 'Pendente',  color: 'warning'  },
};

interface Props {
  usuario: any;
}

const AssinaturaTab: React.FC<Props> = ({ usuario }) => {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const planoId = (usuario?.plano_selecionado ?? '').toLowerCase();
  const plano: PlanoInfo | null = PLANO_INFO[planoId] ?? null;
  const status = usuario?.status ?? 'pendente';
  const statusChip = STATUS_CHIP[status] ?? STATUS_CHIP['pendente'];

  // Validade
  const validadeRaw: string | null = usuario?.validade_assinatura ?? null;
  const validadeDate = validadeRaw ? new Date(validadeRaw) : null;
  const msRestantes = validadeDate ? validadeDate.getTime() - Date.now() : null;
  const diasRestantes = msRestantes !== null ? Math.ceil(msRestantes / (1000 * 60 * 60 * 24)) : null;

  // Barra de progresso (percentual do período consumido)
  const duracaoDias = plano?.duracaoDias ?? 30;
  const progressPercent = diasRestantes !== null
    ? Math.max(0, Math.min(100, ((duracaoDias - diasRestantes) / duracaoDias) * 100))
    : 0;

  const validadeLabel = validadeDate
    ? validadeDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

  const getValidadeColor = () => {
    if (diasRestantes === null) return '#64748B';
    if (diasRestantes <= 0) return '#EF4444';
    if (diasRestantes <= 3) return '#F97316';
    if (diasRestantes <= 7) return '#EAB308';
    return '#22C55E';
  };

  const getValidadeAlerta = () => {
    if (diasRestantes === null || diasRestantes > 7) return null;
    if (diasRestantes <= 0)
      return { severity: 'error' as const, texto: 'Sua assinatura venceu. Renove agora para restaurar o acesso completo.' };
    if (diasRestantes <= 3)
      return { severity: 'error' as const, texto: `Sua assinatura vence em ${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''}. Renove imediatamente.` };
    return { severity: 'warning' as const, texto: `Sua assinatura vence em ${diasRestantes} dias. Renove antes do prazo para não perder o acesso.` };
  };

  const alerta = getValidadeAlerta();

  const handleRenovar = async () => {
    setLoading(true);
    setErro(null);
    try {
      const { data } = await api.post('/api/payments/renovar', { usuarioId: usuario?.id });
      if (data?.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch (err: any) {
      setErro(err?.response?.data?.error ?? 'Erro ao gerar link de renovação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!plano) {
    return (
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <WorkspacePremiumOutlined sx={{ fontSize: 56, color: '#E2E8F0', mb: 2 }} />
        <Typography variant="h6" color="#64748B" fontWeight={600}>Nenhuma assinatura ativa</Typography>
        <Typography variant="body2" color="#94A3B8" sx={{ mt: 1 }}>
          Contrate um plano para liberar todas as funcionalidades do sistema.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>

      {/* Alerta de vencimento */}
      {alerta && (
        <Alert severity={alerta.severity} sx={{ borderRadius: '12px' }}>
          {alerta.texto}
        </Alert>
      )}

      {/* Cabeçalho do plano */}
      <Box
        sx={{
          borderRadius: '16px',
          border: `2px solid ${plano.color}20`,
          background: `linear-gradient(135deg, ${plano.color}08 0%, #FFFFFF 100%)`,
          p: { xs: 3, md: 4 },
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 56, height: 56, borderRadius: '14px',
              background: `linear-gradient(135deg, ${plano.color} 0%, ${plano.color}CC 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <WorkspacePremiumOutlined sx={{ color: '#FFFFFF', fontSize: 28 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="h5" fontWeight={800} color="#0F172A">
                Plano {plano.nome}
              </Typography>
              <Chip
                label={statusChip.label}
                color={statusChip.color}
                size="small"
                sx={{ fontWeight: 700, borderRadius: '6px' }}
              />
            </Box>
            {plano.subtitulo && (
              <Typography variant="body2" color="#64748B">{plano.subtitulo}</Typography>
            )}
          </Box>
        </Box>

        <Button
          type="button"
          variant="contained"
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AutorenewOutlined />}
          disabled={loading}
          onClick={handleRenovar}
          sx={{
            background: `linear-gradient(90deg, ${plano.color} 0%, ${plano.color}CC 100%)`,
            color: '#FFFFFF',
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: '10px',
            px: 4, py: 1.5,
            boxShadow: `0 4px 14px ${plano.color}40`,
            '&:hover': { opacity: 0.9, boxShadow: `0 6px 20px ${plano.color}50` },
          }}
        >
          {loading ? 'Aguarde...' : 'Renovar Assinatura'}
        </Button>
      </Box>

      {erro && (
        <Alert severity="error" onClose={() => setErro(null)} sx={{ borderRadius: '12px' }}>
          {erro}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>

        {/* Card: Validade */}
        <Box sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', p: 3, background: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <CalendarTodayOutlined sx={{ color: '#5B21B6', fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={700} color="#0F172A">Validade da Assinatura</Typography>
          </Box>

          <Typography variant="h5" fontWeight={800} color={getValidadeColor()} sx={{ mb: 0.5 }}>
            {validadeLabel}
          </Typography>

          {diasRestantes !== null && (
            <Typography variant="body2" color="#64748B" sx={{ mb: 2.5 }}>
              {diasRestantes > 0
                ? `${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''} restante${diasRestantes !== 1 ? 's' : ''}`
                : 'Assinatura vencida'}
            </Typography>
          )}

          <Box sx={{ mb: 1 }}>
            <LinearProgress
              variant="determinate"
              value={progressPercent}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#F1F5F9',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  backgroundColor: progressPercent >= 90 ? '#EF4444' : progressPercent >= 70 ? '#F97316' : plano.color,
                },
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="#94A3B8">Início</Typography>
            <Typography variant="caption" color="#94A3B8">
              {duracaoDias === 365 ? '365 dias' : '30 dias'}
            </Typography>
          </Box>
        </Box>

        {/* Card: Cobrança */}
        <Box sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', p: 3, background: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <CreditCardOutlined sx={{ color: '#5B21B6', fontSize: 20 }} />
            <Typography variant="subtitle1" fontWeight={700} color="#0F172A">Informações de Cobrança</Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="#64748B">Plano</Typography>
              <Typography variant="body2" fontWeight={700} color="#0F172A">{plano.nome}</Typography>
            </Box>
            <Divider sx={{ borderColor: '#F1F5F9' }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="#64748B">Ciclo de cobrança</Typography>
              <Typography variant="body2" fontWeight={700} color="#0F172A">{plano.ciclo}</Typography>
            </Box>
            <Divider sx={{ borderColor: '#F1F5F9' }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="#64748B">Valor mensal</Typography>
              <Typography variant="body2" fontWeight={700} color="#0F172A">{plano.precoLabel}</Typography>
            </Box>
            {plano.totalAnual && (
              <>
                <Divider sx={{ borderColor: '#F1F5F9' }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="#64748B">Total cobrado</Typography>
                  <Typography variant="body2" fontWeight={700} color="#0F172A">
                    {plano.totalAnual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </Typography>
                </Box>
              </>
            )}
            <Divider sx={{ borderColor: '#F1F5F9' }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="#64748B">Forma de pagamento</Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Chip label="Cartão" size="small" sx={{ fontSize: 11, fontWeight: 600, backgroundColor: '#F1F5F9' }} />
                <Chip label="PIX" size="small" sx={{ fontSize: 11, fontWeight: 600, backgroundColor: '#F1F5F9' }} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Recursos do plano */}
      <Box sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', p: 3, background: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <AccessTimeOutlined sx={{ color: '#5B21B6', fontSize: 20 }} />
          <Typography variant="subtitle1" fontWeight={700} color="#0F172A">Recursos incluídos no Plano {plano.nome}</Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0 }}>
          <List dense disablePadding>
            {plano.features.slice(0, Math.ceil(plano.features.length / 2)).map((feat, idx) => (
              <FeatureItem key={idx} feat={feat} />
            ))}
          </List>
          <List dense disablePadding>
            {plano.features.slice(Math.ceil(plano.features.length / 2)).map((feat, idx) => (
              <FeatureItem key={idx} feat={feat} />
            ))}
          </List>
        </Box>
      </Box>

      {/* Aviso de renovação automática */}
      <Box sx={{ borderRadius: '12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', p: 2.5 }}>
        <Typography variant="caption" color="#64748B" lineHeight={1.6}>
          <strong>Como funciona a renovação:</strong> O sistema não realiza cobranças automáticas. Ao clicar em "Renovar Assinatura",
          você será redirecionado para o checkout seguro onde poderá pagar via Cartão de Crédito ou PIX. Após a confirmação do pagamento,
          sua assinatura será renovada automaticamente.
        </Typography>
      </Box>

    </Box>
  );
};

const FeatureItem: React.FC<{ feat: Feature }> = ({ feat }) => (
  <ListItem disablePadding sx={{ py: 0.75, px: 1, borderRadius: '8px', '&:hover': { backgroundColor: '#F8FAFC' } }}>
    <ListItemIcon sx={{ minWidth: 30 }}>
      {feat.included === false ? (
        <Cancel sx={{ fontSize: 18, color: '#EF4444' }} />
      ) : (
        <CheckCircle sx={{ fontSize: 18, color: '#22C55E' }} />
      )}
    </ListItemIcon>
    <ListItemText
      primary={
        typeof feat.included === 'string'
          ? `${feat.label}: ${feat.included}`
          : feat.label
      }
      primaryTypographyProps={{ fontSize: 13, color: feat.included === false ? '#94A3B8' : '#374151', fontWeight: feat.included !== false ? 500 : 400 }}
    />
  </ListItem>
);

export default AssinaturaTab;
