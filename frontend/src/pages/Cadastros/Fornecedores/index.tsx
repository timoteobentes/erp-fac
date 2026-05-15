/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Collapse, Snackbar, Typography } from '@mui/material';
import { ConfigProvider } from 'antd';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../template/Layout';
import { useFornecedores } from '../../../modules/Cadastros/Fornecedores/hooks/useFornecedores';
import { TabelaFornecedores } from '../../../modules/Cadastros/Fornecedores/components/TabelaFornecedores';
import { FornecedoresActions } from '../../../modules/Cadastros/Fornecedores/components/FornecedoresActions';
import { FornecedoresFilters, type FiltrosFornecedoresType } from '../../../modules/Cadastros/Fornecedores/components/FornecedoresFilters';

const INITIAL_FILTERS: FiltrosFornecedoresType = {
  tipo_fornecedor: '',
  nome: '',
  cpf_cnpj: '',
  email: '',
  responsavel_compras: '',
  ramo_atividade: '',
  situacao: '',
  data_inicio: '',
  data_fim: ''
};

const Fornecedores: React.FC = () => {
  const navigate = useNavigate();
  const {
    fornecedores,
    isLoading,
    paginacao,
    fetchFornecedores,
    exportarFornecedores,
    aplicarFiltrosManuais,
    limparFiltros,
    handleTableChange
  } = useFornecedores();

  const [mounted, setMounted] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosFornecedoresType>(INITIAL_FILTERS);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  useEffect(() => {
    fetchFornecedores();
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleBuscarAvancada = async () => {
    try {
      const filtrosAtivos = Object.entries(filtros).reduce((acc: any, [key, value]) => {
        if (value) acc[key] = value;
        return acc;
      }, {});

      await aplicarFiltrosManuais(filtrosAtivos);
      showSnackbar('Filtros aplicados com sucesso');
    } catch {
      showSnackbar('Erro ao buscar fornecedores', 'error');
    }
  };

  const handleSearchSimple = async (term: string) => {
    try {
      await aplicarFiltrosManuais({ nome: term || undefined });
    } catch {
      showSnackbar('Erro na busca rápida', 'error');
    }
  };

  const handleExport = async (formato: string) => {
    showSnackbar(`Iniciando exportação ${formato.toUpperCase()}...`, 'info');
    try {
      const filtrosAtivos = Object.entries(filtros).reduce((acc: any, [key, value]) => {
        if (value) acc[key] = value;
        return acc;
      }, {});

      await exportarFornecedores(formato, filtrosAtivos);
      showSnackbar('Exportação concluída', 'success');
    } catch (error: any) {
      showSnackbar(`Erro: ${error.message}`, 'error');
    }
  };

  const handleLimpar = () => {
    setFiltros(INITIAL_FILTERS);
    limparFiltros();
    showSnackbar('Filtros limpos');
  };

  if (isLoading && fornecedores.length === 0) {
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
        <div className="flex flex-col mb-8">
          <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ letterSpacing: '-0.02em', mb: 1 }}>
            Fornecedores
          </Typography>
          <Typography variant="body2" color="#64748B">
            Gerencie fornecedores, documentos, contatos e condições comerciais em um único cadastro.
          </Typography>
        </div>

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
          <Box sx={{ p: 3, borderBottom: '1px solid #F1F5F9', backgroundColor: '#F8FAFC' }}>
            <FornecedoresActions
              onAdd={() => navigate('/cadastros/fornecedores/novo')}
              onRefresh={fetchFornecedores}
              onExport={handleExport}
              onToggleFilters={() => setOpenFilters(!openFilters)}
              onSearchSimple={handleSearchSimple}
              mounted={mounted}
            />
          </Box>

          <Collapse in={openFilters}>
            <Box sx={{ p: 4, borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
              <FornecedoresFilters
                filtros={filtros}
                setFiltros={setFiltros}
                onBuscar={handleBuscarAvancada}
                onLimpar={handleLimpar}
              />
            </Box>
          </Collapse>

          <Box sx={{ p: 4 }}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#64748B] text-xs font-bold uppercase tracking-wider bg-[#F1F5F9] px-3 py-1.5 rounded-md">
                {fornecedores.length > 0 ? `${fornecedores.length} de ${paginacao.total || 0} registros` : 'Nenhum registro encontrado'}
              </span>
            </div>

            <ConfigProvider
              theme={{
                components: {
                  Checkbox: { colorPrimary: '#5B21B6', colorPrimaryHover: '#3C0473' },
                  Table: {
                    headerBg: '#F8FAFC',
                    headerColor: '#475569',
                    headerBorderRadius: 8,
                    rowHoverBg: '#F8FAFC',
                    rowSelectedBg: '#F3E8FF',
                    rowSelectedHoverBg: '#E9D5FF',
                    borderColor: '#F1F5F9'
                  },
                  Pagination: {
                    colorPrimary: '#5B21B6',
                    colorPrimaryHover: '#3C0473',
                    itemActiveBg: '#F3E8FF'
                  },
                  Spin: { colorPrimary: '#5B21B6' }
                }
              }}
            >
              <TabelaFornecedores
                fornecedores={fornecedores}
                isLoading={isLoading}
                onRefresh={fetchFornecedores}
                onChange={handleTableChange}
                pagination={{
                  current: (paginacao as any).current || paginacao.pagina || 1,
                  pageSize: (paginacao as any).pageSize || paginacao.limite || 10,
                  total: paginacao.total || 0,
                  align: 'center',
                  showSizeChanger: true
                }}
              />
            </ConfigProvider>
          </Box>
        </Box>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(p => ({ ...p, open: false }))}
          sx={{ borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default Fornecedores;
