import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Collapse } from "@mui/material";
import { ConfigProvider } from "antd";
import Layout from '../../../template/Layout';
import { useMovimentacoesEstoque } from '../../../modules/Estoque/hooks/useMovimentacoesEstoque';
import { MovimentacoesActions } from '../../../modules/Estoque/components/Movimentacoes/MovimentacoesActions';
import { MovimentacoesFilters } from '../../../modules/Estoque/components/Movimentacoes/MovimentacoesFilters';
import { TabelaMovimentacoes } from '../../../modules/Estoque/components/Movimentacoes/TabelaMovimentacoes';

const MovimentacoesEstoque = () => {
  const { movimentacoes, loading, carregarMovimentacoes, exportarMovimentacoes } = useMovimentacoesEstoque();
  
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

  const movimentacoesFiltradas = useMemo(() => {
      let result = [...(movimentacoes || [])];
      
      // Busca Simples Em Memória (Produto, Tipo, Origem)
      if (termoBusca) {
        const lower = termoBusca.toLowerCase();
        result = result.filter(m => 
          (m.produto_nome && m.produto_nome.toLowerCase().includes(lower)) || 
          (m.tipo && m.tipo.toLowerCase().includes(lower)) ||
          (m.origem && m.origem.toLowerCase().includes(lower)) ||
          (m.observacao && m.observacao.toLowerCase().includes(lower))
        );
      }
      
      // Busca Avançada Em Memória
      if (filtros.tipo) {
        result = result.filter(m => m.tipo === filtros.tipo);
      }
      if (filtros.origem) {
        result = result.filter(m => m.origem === filtros.origem);
      }
      
      return result;
  }, [movimentacoes, termoBusca, filtros]);

  // Renderização de Loading Premium
  if (loading && (!movimentacoes || movimentacoes.length === 0)) {
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
            Histórico de Movimentações
          </Typography>
          <Typography variant="body2" color="#64748B">
            Consulte as entradas, saídas e ajustes registados no inventário da sua empresa.
          </Typography>
        </div>

        {/* CONTAINER PRINCIPAL (Soft UX) */}
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
          {/* BARRA DE AÇÕES (Fundo levemente destacado) */}
          <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
            <MovimentacoesActions 
              mounted={mounted}
              onRefresh={() => carregarMovimentacoes?.()}
              onToggleFilters={() => setOpenFilters(!openFilters)}
              onSearchSimple={(term) => setTermoBusca(term)}
              onExport={(formato) => exportarMovimentacoes(formato as 'csv'|'xlsx'|'pdf')}
            />
          </Box>

          {/* FILTROS RETRÁTEIS */}
          <Collapse in={openFilters}>
            <Box sx={{ p: 4, borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
              <MovimentacoesFilters 
                filtros={filtros}
                setFiltros={setFiltros}
                onBuscar={() => {}} // A busca é reativa pelo useMemo
                onLimpar={handleLimparFiltros}
              />
            </Box>
          </Collapse>

          {/* ÁREA DA TABELA */}
          <Box sx={{ p: 4 }}>
            <div className="flex justify-between items-center mb-4">
              {/* Badge indicadora de registos */}
              <span className="text-[#64748B] text-xs font-bold uppercase tracking-wider bg-[#F1F5F9] px-3 py-1.5 rounded-md">
                {movimentacoesFiltradas.length > 0 ? `${movimentacoesFiltradas.length} movimentações encontradas` : 'Nenhum registo encontrado'}
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
                    rowSelectedBg: '#F3E8FF',      // Roxo super claro B2B
                    rowSelectedHoverBg: '#E9D5FF', // Hover do selecionado
                    borderColor: '#F1F5F9',
                  },
                  Pagination: {
                    colorPrimary: '#5B21B6',
                    colorPrimaryHover: '#3C0473',
                    itemActiveBg: '#F3E8FF'
                  },
                  Spin: {
                    colorPrimary: '#5B21B6'
                  }
                }
              }}
            >
              <TabelaMovimentacoes 
                movimentacoes={movimentacoesFiltradas as any}
                isLoading={loading}
              />
            </ConfigProvider>
          </Box>
        </Box>
      </div>
    </Layout>
  );
};

export default MovimentacoesEstoque;