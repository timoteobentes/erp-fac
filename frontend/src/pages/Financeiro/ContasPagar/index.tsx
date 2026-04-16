import React, { useState, useEffect } from "react";
import { Box, Collapse, Typography } from "@mui/material";
import { ConfigProvider } from "antd";
import { 
  WarningAmberOutlined, 
  ErrorOutline, 
  CheckCircleOutline, 
  AccountBalanceWalletOutlined, 
  DateRangeOutlined 
} from "@mui/icons-material";
import Layout from "../../../template/Layout";
import { useNavigate } from "react-router-dom";
import { useContasPagar } from "../../../modules/Financeiro/ContasPagar/hooks/useContasPagar";
import type { FiltrosContaPagar } from "../../../modules/Financeiro/ContasPagar/services/contasPagarService";
import { ContasPagarActions } from "../../../modules/Financeiro/ContasPagar/components/ContasPagarActions";
import { ContasPagarFilters } from "../../../modules/Financeiro/ContasPagar/components/ContasPagarFilters";
import { TabelaContasPagar } from "../../../modules/Financeiro/ContasPagar/components/TabelaContasPagar";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const ContasPagar: React.FC = () => {
  const navigate = useNavigate();
  const { contas, isLoading, resumo, fetchContas, darBaixa, excluirConta, exportarContas } = useContasPagar();
  
  const [mounted, setMounted] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosContaPagar>({});
  const [pagination] = useState({ pageSize: 12 });

  useEffect(() => {
    fetchContas();
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, [fetchContas]);

  const handleBuscar = () => {
    fetchContas(filtros);
  };

  const handleLimparFiltros = () => {
    setFiltros({});
    fetchContas({});
  };

  const handleSearchSimple = (term: string) => {
    setFiltros(prev => ({ ...prev, termo: term }));
    fetchContas({ ...filtros, termo: term });
  };

  // Renderização de Loading Premium B2B
  if (isLoading && (!contas || contas.length === 0)) {
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
            Contas a Pagar
          </Typography>
          <Typography variant="body2" color="#64748B">
            Controle as despesas da sua empresa, evite juros e acompanhe os próximos vencimentos.
          </Typography>
        </div>

        {/* WIDGETS DE RESUMO FINANCEIRO (Soft UX) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          
          {/* Card: A Vencer */}
          <Box className="bg-white rounded-2xl border border-[#E2E8F0] p-5 flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
               <div className="p-2.5 bg-[#F1F5F9] rounded-lg text-[#64748B]"><DateRangeOutlined fontSize="small" /></div>
            </div>
            <Typography variant="caption" fontWeight={700} color="#64748B" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>A Vencer</Typography>
            <Typography variant="h5" fontWeight={800} color="#0F172A">{formatCurrency(resumo.aVencer)}</Typography>
          </Box>

          {/* Card: Vence Hoje */}
          <Box className="bg-white rounded-2xl border border-[#FDE68A] p-5 flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
               <div className="p-2.5 bg-[#FFFBEB] rounded-lg text-[#F59E0B]"><WarningAmberOutlined fontSize="small" /></div>
            </div>
            <Typography variant="caption" fontWeight={700} color="#D97706" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Vence Hoje</Typography>
            <Typography variant="h5" fontWeight={800} color="#B45309">{formatCurrency(resumo.venceHoje)}</Typography>
          </Box>

          {/* Card: Vencidos */}
          <Box className="bg-[#FEF2F2] rounded-2xl border border-[#FECACA] p-5 flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
               <div className="p-2.5 bg-white rounded-lg text-[#EF4444] shadow-sm"><ErrorOutline fontSize="small" /></div>
            </div>
            <Typography variant="caption" fontWeight={700} color="#DC2626" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Vencidos</Typography>
            <Typography variant="h5" fontWeight={800} color="#991B1B">{formatCurrency(resumo.vencidos)}</Typography>
          </Box>

          {/* Card: Pagos */}
          <Box className="bg-white rounded-2xl border border-[#A7F3D0] p-5 flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
            <div className="flex justify-between items-start mb-3">
               <div className="p-2.5 bg-[#ECFDF5] rounded-lg text-[#10B981]"><CheckCircleOutline fontSize="small" /></div>
            </div>
            <Typography variant="caption" fontWeight={700} color="#059669" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5 }}>Pagos (Mês)</Typography>
            <Typography variant="h5" fontWeight={800} color="#047857">{formatCurrency(resumo.pagos)}</Typography>
          </Box>

          {/* Card: Total */}
          <Box className="bg-gradient-to-br from-[#3C0473] to-[#5B21B6] rounded-2xl p-5 flex flex-col relative overflow-hidden shadow-[0_10px_20px_-5px_rgba(91,33,182,0.3)] transition-all hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-5 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
            <div className="flex justify-between items-start mb-3 relative z-10">
               <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-lg text-white"><AccountBalanceWalletOutlined fontSize="small" /></div>
            </div>
            <Typography variant="caption" fontWeight={700} color="#E2E8F0" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.5, position: 'relative', zIndex: 10 }}>Total Geral</Typography>
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
            <ContasPagarActions 
              mounted={mounted}
              onAdd={() => navigate('/financeiro/pagar/novo')}
              onRefresh={() => fetchContas()}
              onToggleFilters={() => setOpenFilters(!openFilters)}
              onSearchSimple={handleSearchSimple}
              onExport={(formato) => exportarContas(formato as 'csv'|'xlsx'|'pdf', filtros)}
            />
          </Box>

          {/* FILTROS RETRÁTEIS */}
          <Collapse in={openFilters}>
            <Box sx={{ p: 4, borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
              <ContasPagarFilters 
                filtros={filtros}
                setFiltros={setFiltros}
                onBuscar={handleBuscar}
                onLimpar={handleLimparFiltros}
              />
            </Box>
          </Collapse>

          {/* ÁREA DA TABELA */}
          <Box sx={{ p: 4 }}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#64748B] text-xs font-bold uppercase tracking-wider bg-[#F1F5F9] px-3 py-1.5 rounded-md">
                {contas && contas.length > 0 ? `${contas.length} contas encontradas` : 'Nenhuma conta encontrada'}
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
              <TabelaContasPagar 
                contas={contas as any}
                isLoading={isLoading}
                onRefresh={() => fetchContas()}
                pagination={pagination}
                onDelete={excluirConta}
                onBaixa={darBaixa}
              />
            </ConfigProvider>
          </Box>
        </Box>
      </div>
    </Layout>
  );
};

export default ContasPagar;