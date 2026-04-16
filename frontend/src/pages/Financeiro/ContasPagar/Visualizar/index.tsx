import React, { useEffect, useState } from "react";
import { Box, Divider, IconButton, Skeleton, Typography, Button } from "@mui/material";
import { 
  ArrowBack, EditOutlined, InfoOutlined, 
  AccountBalanceWalletOutlined, NotesOutlined 
} from '@mui/icons-material';
import Layout from "../../../../template/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { buscarContaPagarPorIdService } from "../../../../modules/Financeiro/ContasPagar/services/contasPagarService";
import { toast } from "react-toastify";

const VisualizarPagamento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [conta, setConta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConta = async () => {
      try {
        if (!id) return;
        const data = await buscarContaPagarPorIdService(id);
        setConta(data);
      } catch (error) {
        toast.error("Erro ao carregar os dados da conta.");
        navigate('/financeiro/pagar');
      } finally {
        setLoading(false);
      }
    };
    fetchConta();
  }, [id, navigate]);

  const formatCurrency = (val: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0);
  
  const formatDate = (date: string) => {
      if(!date) return '-';
      const d = new Date(date);
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      return d.toLocaleDateString('pt-BR');
  };

  const renderStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pago':
        return <span className="bg-[#ECFDF5] text-[#10B981] px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border border-[#A7F3D0]">Paga</span>;
      case 'vencido':
        return <span className="bg-[#FEF2F2] text-[#EF4444] px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border border-[#FECACA]">Vencida</span>;
      case 'cancelado':
        return <span className="bg-[#F1F5F9] text-[#64748B] px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border border-[#CBD5E1]">Cancelada</span>;
      default:
        return <span className="bg-[#FFFBEB] text-[#D97706] px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border border-[#FDE68A]">Pendente</span>;
    }
  };

  // LOADING PREMIUM B2B
  if (loading) {
    return (
      <Layout>
        <div className="mb-8 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Skeleton variant="circular" width={48} height={48} />
              <div>
                 <Skeleton variant="text" width={200} height={40} />
                 <Skeleton variant="text" width={300} height={20} />
              </div>
           </div>
           <Skeleton variant="rounded" width={140} height={42} sx={{ borderRadius: '8px' }} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton variant="rounded" width="100%" height={300} sx={{ borderRadius: '24px' }} />
            <Skeleton variant="rounded" width="100%" height={300} sx={{ borderRadius: '24px' }} />
        </div>
      </Layout>
    );
  }

  if (!conta) return <Layout><div className="p-8 text-center text-[#64748B]">Conta não encontrada.</div></Layout>;

  return (
    <Layout>
      {/* HEADER DE NAVEGAÇÃO PREMIUM */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center gap-4">
          <IconButton 
            onClick={() => navigate("/financeiro/pagar")}
            sx={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', color: '#475569', '&:hover': { backgroundColor: '#F8FAFC', color: '#0F172A' } }}
          >
            <ArrowBack />
          </IconButton>
          <div className="flex flex-col">
            <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {conta.descricao || 'Detalhes da Despesa'}
            </Typography>
            <Typography variant="body2" color="#64748B" sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                Cód: <strong className="text-[#3C0473]">#{conta.id?.toString().padStart(4, '0')}</strong> • Visualização de valores e status.
                {renderStatusBadge(conta.status)}
            </Typography>
          </div>
        </div>
        
        <Button 
          variant="outlined" 
          startIcon={<EditOutlined />}
          onClick={() => navigate(`/financeiro/pagar/editar/${conta.id}`)}
          sx={{ 
              borderColor: '#E2E8F0', color: '#0F172A', fontWeight: 600, textTransform: 'none', 
              borderRadius: '8px', px: 3, py: 1, backgroundColor: '#FFFFFF', boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              '&:hover': { borderColor: '#5B21B6', backgroundColor: '#F8FAFC', color: '#5B21B6' }
          }}
        >
          Editar Despesa
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
          
          {/* BLOCO 1: INFORMAÇÕES GERAIS */}
          <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", p: { xs: 3, md: 5 } }}>
            <div className="flex items-center gap-2 mb-6">
                <InfoOutlined sx={{ color: '#5B21B6' }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Informações Gerais</Typography>
            </div>
            
            <div className="flex flex-col gap-4">
                <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#F1F5F9]">
                    <Typography variant="caption" fontWeight={600} color="#64748B" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Descrição</Typography>
                    <Typography variant="body1" fontWeight={600} color="#0F172A" mt={0.5}>{conta.descricao}</Typography>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#F1F5F9]">
                        <Typography variant="caption" fontWeight={600} color="#64748B" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categoria (Plano de Contas)</Typography>
                        <Typography variant="body1" fontWeight={600} color="#0F172A" mt={0.5}>{conta.categoria_despesa || '-'}</Typography>
                    </div>
                    <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#F1F5F9]">
                        <Typography variant="caption" fontWeight={600} color="#64748B" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fornecedor/Beneficiário</Typography>
                        <Typography variant="body1" fontWeight={600} color="#0F172A" mt={0.5}>{conta.fornecedor_id || 'Não informado'}</Typography>
                    </div>
                </div>

                {conta.status === 'pago' && conta.data_pagamento && (
                    <div className="bg-[#ECFDF5] p-4 rounded-xl border border-[#A7F3D0]">
                        <Typography variant="caption" fontWeight={600} color="#059669" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Data de Pagamento</Typography>
                        <Typography variant="body1" fontWeight={700} color="#047857" mt={0.5}>{formatDate(conta.data_pagamento)}</Typography>
                    </div>
                )}
            </div>
          </Box>

          {/* BLOCO 2: VALORES E DATAS (RECEIPT LOOK) */}
          <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", p: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center gap-2 mb-6">
                <AccountBalanceWalletOutlined sx={{ color: '#5B21B6' }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Estrutura de Valores</Typography>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-4">
                <div className="flex justify-between items-center py-2">
                    <Typography variant="body2" fontWeight={600} color="#64748B" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Data de Vencimento</Typography>
                    <Typography variant="body1" fontWeight={700} color={conta.status === 'vencido' ? '#DC2626' : '#0F172A'}>
                        {formatDate(conta.data_vencimento)}
                    </Typography>
                </div>
                
                <Divider sx={{ borderColor: '#F1F5F9', borderStyle: 'dashed' }} />
                
                <div className="flex justify-between items-center py-2">
                    <Typography variant="body1" color="#475569">Valor Bruto Inicial</Typography>
                    <Typography variant="body1" fontWeight={600} color="#0F172A">{formatCurrency(conta.valor_bruto)}</Typography>
                </div>
                
                <div className="flex justify-between items-center py-2">
                    <Typography variant="body1" color="#475569">Juros / Multa (+)</Typography>
                    <Typography variant="body1" fontWeight={600} color="#DC2626">{formatCurrency(conta.juros)}</Typography>
                </div>
                
                <div className="flex justify-between items-center py-2">
                    <Typography variant="body1" color="#475569">Descontos (-)</Typography>
                    <Typography variant="body1" fontWeight={600} color="#10B981">{formatCurrency(conta.desconto)}</Typography>
                </div>
                
                <Divider sx={{ borderColor: '#E2E8F0', borderWidth: '1.5px', my: 2 }} />
                
                <div className="flex justify-between items-center bg-[#F8FAFC] p-4 rounded-xl border border-[#CBD5E1]">
                    <Typography variant="h6" fontWeight={800} color="#3C0473" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Valor Total</Typography>
                    <Typography variant="h4" fontWeight={900} color="#0F172A" sx={{ letterSpacing: '-0.02em' }}>
                        {formatCurrency(conta.valor_total)}
                    </Typography>
                </div>
            </div>
          </Box>
      </div>

      {/* BLOCO 3: OBSERVAÇÕES */}
      {conta.observacao && (
        <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", p: { xs: 3, md: 5 }, mt: 6, animate: 'fadeIn' }}>
            <div className="flex items-center gap-2 mb-4">
                <NotesOutlined sx={{ color: '#5B21B6' }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Observações e Notas</Typography>
            </div>
            <div className="bg-[#F8FAFC] p-5 rounded-xl border border-[#F1F5F9]">
                <Typography variant="body2" color="#475569" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {conta.observacao}
                </Typography>
            </div>
        </Box>
      )}

    </Layout>
  );
};

export default VisualizarPagamento;