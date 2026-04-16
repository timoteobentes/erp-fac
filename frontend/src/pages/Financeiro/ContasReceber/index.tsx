import React, { useState, useEffect, useMemo } from "react";
import { Box, Collapse, Typography } from "@mui/material";
import { ConfigProvider } from "antd";
import { 
  ErrorOutline, 
  CheckCircleOutline, 
  AccountBalanceWalletOutlined, 
  TrendingUpOutlined 
} from "@mui/icons-material";
import Layout from "../../../template/Layout";
import { useContasReceber } from "../../../modules/Financeiro/ContasReceber/hooks/useContasReceber";
import { ContasReceberActions } from "../../../modules/Financeiro/ContasReceber/components/ContasReceberActions";
import { ContasReceberFilters } from "../../../modules/Financeiro/ContasReceber/components/ContasReceberFilters";
import { TabelaContasReceber } from "../../../modules/Financeiro/ContasReceber/components/TabelaContasReceber";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const ContasReceber: React.FC = () => {
  const { contas, loading, carregarContas, baixarConta, excluirConta, exportarContas } = useContasReceber();
  const [mounted, setMounted] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  
  // UI States para Filtragem Visual
  const [filtros, setFiltros] = useState<any>({});
  const [termoBusca, setTermoBusca] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLimparFiltros = () => {
    setFiltros({});
  };

  // Filtragem Front-end
  const contasFiltradas = useMemo(() => {
    let result = [...(contas || [])];
    
    // Busca Simples
    if (termoBusca) {
      result = result.filter(c => c.descricao?.toLowerCase().includes(termoBusca.toLowerCase()));
    }
    
    // Busca Avançada
    if (filtros.status) {
      result = result.filter(c => c.status === filtros.status);
    }
    if (filtros.data_vencimento_inicio) {
      result = result.filter(c => new Date(c.data_vencimento) >= new Date(filtros.data_vencimento_inicio));
    }
    if (filtros.data_vencimento_fim) {
      result = result.filter(c => new Date(c.data_vencimento) <= new Date(filtros.data_vencimento_fim));
    }
    
    return result;
  }, [contas, termoBusca, filtros]);

  const resumo = useMemo(() => {
     let aVencer = 0, vencidos = 0, recebidos = 0, total = 0;
     const hoje = new Date();
     hoje.setHours(0,0,0,0);
     
     (contas || []).forEach(c => {
         const valor = Number(c.valor_total) || 0;
         if (c.status === 'recebido') { recebidos += valor; }
         else if (c.status === 'cancelado') {} // ignora
         else {
             const dataVenc = new Date(c.data_vencimento);
             dataVenc.setHours(0,0,0,0);
             if (dataVenc < hoje) { vencidos += valor; }
             else { aVencer += valor; }
             total += valor;
         }
     });
     return { aVencer, vencidos, recebidos, total };
  }, [contas]);

  // Renderização de Loading Premium B2B
  if (loading && (!contas || contas.length === 0)) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[calc(100vh-140px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#F1F5F9] border-t-[#5B21B6]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`transition-all duration-500 ease-in-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} pb-8`}>
        
        {/* HEADER DA PÁGINA */}
        <div className="flex flex-col mb-8">
          <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
            Contas a Receber
          </Typography>
          <Typography variant="body2" color="#64748B">
            Acompanhe o fluxo de receitas, verifique recebimentos de clientes e controle a inadimplência.
          </Typography>
        </div>

        {/* WIDGETS DE RESUMO FINANCEIRO (Soft UX) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Card: A Receber (Azul/Slate) */}
          <Box className="bg-white rounded-2xl border border-[#E2E8F0] p-5 flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
               <div className="p-2.5 bg-[#EFF6FF] rounded-lg text-[#3B82F6]"><TrendingUpOutlined fontSize="small" /></div>
            </div>
            <Typography variant="caption" fontWeight={700} color="#64748B" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>A Receber (Previsto)</Typography>
            <Typography variant="h5" fontWeight={800} color="#0F172A">{formatCurrency(resumo.aVencer)}</Typography>
          </Box>

          {/* Card: Em Atraso (Vermelho) */}
          <Box className="bg-[#FEF2F2] rounded-2xl border border-[#FECACA] p-5 flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
               <div className="p-2.5 bg-white rounded-lg text-[#EF4444] shadow-sm"><ErrorOutline fontSize="small" /></div>
            </div>
            <Typography variant="caption" fontWeight={700} color="#DC2626" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Em Atraso (Inadimplência)</Typography>
            <Typography variant="h5" fontWeight={800} color="#991B1B">{formatCurrency(resumo.vencidos)}</Typography>
          </Box>

          {/* Card: Recebidos (Verde) */}
          <Box className="bg-white rounded-2xl border border-[#A7F3D0] p-5 flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
               <div className="p-2.5 bg-[#ECFDF5] rounded-lg text-[#10B981]"><CheckCircleOutline fontSize="small" /></div>
            </div>
            <Typography variant="caption" fontWeight={700} color="#059669" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Recebidos (Realizado)</Typography>
            <Typography variant="h5" fontWeight={800} color="#047857">{formatCurrency(resumo.recebidos)}</Typography>
          </Box>

          {/* Card: Saldo Previsto (Roxo) */}
          <Box className="bg-gradient-to-br from-[#3C0473] to-[#5B21B6] rounded-2xl p-5 flex flex-col relative overflow-hidden shadow-[0_10px_20px_-5px_rgba(91,33,182,0.3)] transition-all hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
            <div className="flex justify-between items-start mb-3 relative z-10">
               <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-lg text-white"><AccountBalanceWalletOutlined fontSize="small" /></div>
            </div>
            <Typography variant="caption" fontWeight={700} color="#E2E8F0" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5, position: 'relative', zIndex: 10 }}>Total Pendente</Typography>
            <Typography variant="h5" fontWeight={800} color="#FFFFFF" sx={{ position: 'relative', zIndex: 10 }}>{formatCurrency(resumo.total)}</Typography>
          </Box>

        </div>

        {/* CONTAINER PRINCIPAL DA TABELA E AÇÕES */}
        <Box 
          sx={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: '24px', 
            boxShadow: '0 4px 24px rgba(0,0,0,0.02)', 
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* BARRA DE AÇÕES */}
          <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
            <ContasReceberActions 
              mounted={mounted}
              // onAdd={() => navigate('/financeiro/receber/novo')} - Sem criação manual por enquanto (regra PDV)
              onRefresh={() => carregarContas?.()}
              onToggleFilters={() => setOpenFilters(!openFilters)}
              onSearchSimple={(term) => setTermoBusca(term)}
              onExport={(formato) => exportarContas(formato as 'csv'|'xlsx'|'pdf', filtros)}
            />
          </Box>

          {/* FILTROS RETRÁTEIS */}
          <Collapse in={openFilters}>
            <Box sx={{ p: 4, borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
              <ContasReceberFilters 
                filtros={filtros}
                setFiltros={setFiltros}
                onBuscar={() => {}} // A busca aviada atualiza on-the-fly pelo useMemo acima
                onLimpar={handleLimparFiltros}
              />
            </Box>
          </Collapse>

          {/* ÁREA DA TABELA */}
          <Box sx={{ p: 4 }}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#64748B] text-xs font-bold uppercase tracking-wider bg-[#F1F5F9] px-3 py-1.5 rounded-md">
                {contasFiltradas && contasFiltradas.length > 0 ? `${contasFiltradas.length} cobranças encontradas` : 'Nenhuma cobrança encontrada'}
              </span>
            </div>

            <ConfigProvider
              theme={{
                components: {
                  Table: {
                    headerBg: '#F8FAFC',
                    headerColor: '#475569',
                    headerBorderRadius: 8,
                    rowHoverBg: '#F8FAFC',
                    rowSelectedBg: '#F3E8FF',
                    rowSelectedHoverBg: '#E9D5FF',
                    borderColor: '#F1F5F9',
                  },
                  Pagination: { colorPrimary: '#5B21B6', colorPrimaryHover: '#3C0473', itemActiveBg: '#F3E8FF' },
                  Spin: { colorPrimary: '#5B21B6' }
                }
              }}
            >
              <TabelaContasReceber 
                contas={contasFiltradas}
                isLoading={loading}
                onRefresh={() => carregarContas?.()}
                onDelete={excluirConta}
                onBaixa={baixarConta}
              />
            </ConfigProvider>
          </Box>
        </Box>
      </div>
    </Layout>
  );
};

export default ContasReceber;