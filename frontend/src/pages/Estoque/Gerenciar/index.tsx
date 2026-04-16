import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Collapse, TextField, Button, CircularProgress } from "@mui/material";
import { Check, Close } from "@mui/icons-material";
import { ConfigProvider } from "antd";
import Layout from '../../../template/Layout';
import { useGerenciarEstoque } from '../../../modules/Estoque/hooks/useGerenciarEstoque';
import { ModalCustom } from '../../../components/ui/Modal';
import { EstoqueActions } from '../../../modules/Estoque/components/Gerenciar/EstoqueActions';
import { EstoqueFilters } from '../../../modules/Estoque/components/Gerenciar/EstoqueFilters';
import { TabelaEstoque } from '../../../modules/Estoque/components/Gerenciar/TabelaEstoque';

// Estilo Premium B2B para os Inputs do MUI (usado no Modal)
const premiumInputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#F8FAFC',
    transition: 'all 0.2s ease-in-out',
    '& fieldset': { borderColor: '#E2E8F0' },
    '&:hover fieldset': { borderColor: '#CBD5E1' },
    '&.Mui-focused': {
      backgroundColor: '#FFFFFF',
      boxShadow: '0 0 0 3px rgba(91, 33, 182, 0.1)',
    },
    '&.Mui-focused fieldset': { borderColor: '#5B21B6', borderWidth: '1px' },
  }
};

const GerenciarEstoque = () => {
  const { produtos, loading, registrarMovimentacao, carregarProdutos, exportarEstoque } = useGerenciarEstoque();
  
  const [mounted, setMounted] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  
  // Controlo do Modal de Movimentação
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [tipoMovimento, setTipoMovimento] = useState<'entrada' | 'saida' | 'ajuste'>('entrada');
  const [quantidade, setQuantidade] = useState<number | string>('');
  const [observacao, setObservacao] = useState('');

  // UI States para Filtragem Visual
  const [filtros, setFiltros] = useState<any>({});
  const [termoBusca, setTermoBusca] = useState('');
  const [loadingMovimentacao, setLoadingMovimentacao] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLimparFiltros = () => {
    setFiltros({});
  };

  const produtosFiltrados = useMemo(() => {
      let result = [...produtos];
      
      if (termoBusca) {
        const lower = termoBusca.toLowerCase();
        result = result.filter(p => 
          p.nome.toLowerCase().includes(lower) || 
          (p.codigo_interno && p.codigo_interno.toLowerCase().includes(lower)) ||
          (p.codigo_barras && p.codigo_barras.toLowerCase().includes(lower))
        );
      }
      
      if (filtros.movimenta_estoque === 'sim') {
        result = result.filter(p => p.movimenta_estoque);
      } else if (filtros.movimenta_estoque === 'nao') {
        result = result.filter(p => !p.movimenta_estoque);
      }
      
      return result;
  }, [produtos, termoBusca, filtros]);

  const abrirModal = (produto: any, tipo: 'entrada' | 'saida' | 'ajuste') => {
    setProdutoSelecionado(produto);
    setTipoMovimento(tipo);
    setQuantidade('');
    setObservacao('');
    setModalAberto(true);
  };

  const handleConfirmar = async () => {
    if (!quantidade || Number(quantidade) <= 0) {
      alert('Informe uma quantidade válida e maior que zero.');
      return;
    }

    setLoadingMovimentacao(true);
    const sucesso = await registrarMovimentacao({
      produto_id: produtoSelecionado.id,
      tipo: tipoMovimento,
      quantidade: Number(quantidade),
      origem: 'manual',
      observacao: observacao || `Movimentação manual de ${tipoMovimento}`
    });
    setLoadingMovimentacao(false);

    if (sucesso) {
      setModalAberto(false);
    }
  };

  return (
    <Layout>
      <div className={`transition-all duration-500 ease-in-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} pb-8`}>
        
        {/* HEADER DA PÁGINA */}
        <div className="flex flex-col mb-8">
          <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
            Gerenciar Estoque
          </Typography>
          <Typography variant="body2" color="#64748B">
            Acompanhe o saldo dos produtos, realize entradas, saídas manuais e ajustes de inventário.
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
          {/* BARRA DE AÇÕES */}
          <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
            <EstoqueActions 
              mounted={mounted}
              onRefresh={() => carregarProdutos?.()}
              onToggleFilters={() => setOpenFilters(!openFilters)}
              onSearchSimple={(term) => setTermoBusca(term)}
              onExport={(formato) => exportarEstoque(formato as 'csv'|'xlsx'|'pdf')}
            />
          </Box>

          {/* FILTROS RETRÁTEIS */}
          <Collapse in={openFilters}>
            <Box sx={{ p: 4, borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
              <EstoqueFilters 
                filtros={filtros}
                setFiltros={setFiltros}
                onBuscar={() => {}} // Atualiza on-the-fly pelo useMemo
                onLimpar={handleLimparFiltros}
              />
            </Box>
          </Collapse>

          {/* ÁREA DA TABELA */}
          <Box sx={{ p: 4 }}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#64748B] text-xs font-bold uppercase tracking-wider bg-[#F1F5F9] px-3 py-1.5 rounded-md">
                {produtosFiltrados.length > 0 ? `${produtosFiltrados.length} itens encontrados` : 'Nenhum registo encontrado'}
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
              <TabelaEstoque 
                produtos={produtosFiltrados}
                isLoading={loading}
                onMovimentar={abrirModal}
              />
            </ConfigProvider>
          </Box>
        </Box>
      </div>

      {/* MODAL DE MOVIMENTAÇÃO PREMIUM */}
      {modalAberto && (
        <ModalCustom 
          open={modalAberto} 
          onClose={() => setModalAberto(false)} 
          title={`Registar ${tipoMovimento.charAt(0).toUpperCase() + tipoMovimento.slice(1)} de Estoque`}
          content={
            <div className="flex flex-col gap-5 pt-2">
              <Box className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-xl">
                <Typography variant="body2" color="#475569">Produto Selecionado:</Typography>
                <Typography variant="subtitle1" fontWeight={700} color="#0F172A">
                  {produtoSelecionado?.nome}
                </Typography>
                <Typography variant="caption" fontWeight={600} color="#5B21B6" sx={{ mt: 1, display: 'inline-block', backgroundColor: '#F3E8FF', px: 1.5, py: 0.5, borderRadius: '6px' }}>
                  Saldo atual: {Number(produtoSelecionado?.estoque_atual || 0).toFixed(2)}
                </Typography>
              </Box>
              
              <TextField 
                label="Quantidade a movimentar"
                type="number"
                fullWidth
                required
                placeholder="Ex: 10"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                sx={premiumInputStyles}
              />
              
              <TextField 
                label="Observação (Opcional)"
                multiline
                rows={3}
                fullWidth
                placeholder="Motivo da movimentação..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                sx={premiumInputStyles}
              />
            </div>
          }
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button 
                variant="outlined" 
                startIcon={<Close />}
                onClick={() => setModalAberto(false)}
                sx={{ borderColor: '#E2E8F0', color: '#475569', textTransform: 'none', fontWeight: 600, borderRadius: '8px', '&:hover': { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' } }}
              >
                Cancelar
              </Button>
              <Button 
                variant="contained" 
                onClick={handleConfirmar}
                disabled={loadingMovimentacao}
                startIcon={loadingMovimentacao ? <CircularProgress size={20} color="inherit" /> : <Check />}
                sx={{ 
                  background: 'linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)', 
                  color: 'white', 
                  textTransform: 'none', 
                  fontWeight: 600, 
                  borderRadius: '8px',
                  boxShadow: '0 4px 14px 0 rgba(91, 33, 182, 0.25)', 
                  '&:hover': { background: 'linear-gradient(90deg, #28024D 0%, #4C1D95 100%)', boxShadow: '0 6px 20px rgba(91, 33, 182, 0.3)' } 
                }}
              >
                {loadingMovimentacao ? "A registar..." : "Confirmar Movimentação"}
              </Button>
            </div>
          }
        />
      )}
    </Layout>
  );
};

export default GerenciarEstoque;