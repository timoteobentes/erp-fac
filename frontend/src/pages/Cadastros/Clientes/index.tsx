/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { Collapse, Snackbar, Alert, Box, Typography } from "@mui/material";
import { ConfigProvider } from "antd";
import Layout from "../../../template/Layout";
import { useNavigate } from "react-router";
import { useClientes } from "../../../modules/Cadastros/Clientes/hooks/useClientes";
import { TabelaClientes } from "../../../modules/Cadastros/Clientes/components/TabelaClientes";
import { ClientesFilters, type FiltrosType } from "../../../modules/Cadastros/Clientes/components/ClientesFilters";
import { ClientesActions } from "../../../modules/Cadastros/Clientes/components/ClientesActions";

// Estado inicial dos filtros mantido intacto
const INITIAL_FILTERS: FiltrosType = {
  tipo: "", codigo: "", nome: "", cpfCnpj: "", telefone: "",
  email: "", cidade: "", estado: "", vendedor: "", situacao: "",
  data_inicio: "", data_fim: ""
};

const Clientes: React.FC = () => {
  const navigate = useNavigate();
  const { clientes, isLoading, paginacao, fetchClientes, exportarClientes, aplicarFiltrosManuais, limparFiltros } = useClientes();
  
  // Estados Locais
  const [mounted, setMounted] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosType>(INITIAL_FILTERS);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  // Efeito de Montagem (Animação Suave)
  useEffect(() => {
    fetchClientes();
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handlers Otimizados mantidos
  const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleBuscarAvancada = async () => {
    try {
      const filtrosAtivos = Object.entries(filtros).reduce((acc: any, [key, value]) => {
        if (value) {
          const apiKey = key === 'cpfCnpj' ? 'cpf_cnpj' : key === 'vendedor' ? 'vendedor_responsavel' : key;
          acc[apiKey] = value;
        }
        return acc;
      }, {});

      await aplicarFiltrosManuais(filtrosAtivos);
      showSnackbar('Filtros aplicados com sucesso!');
    } catch (error) {
      console.error(error);
      showSnackbar('Erro ao buscar clientes', 'error');
    }
  };

  const handleSearchSimple = async (term: string) => {
    try {
      await aplicarFiltrosManuais({ nome: term });
    } catch {
      showSnackbar('Erro na busca rápida', 'error');
    }
  };

  const handleExport = async (formato: string) => {
    showSnackbar(`Iniciando exportação ${formato.toUpperCase()}...`, 'info');
    try {
      const filtrosAtivos = Object.entries(filtros).reduce((acc: any, [key, value]) => {
        if (value) acc[key === 'cpfCnpj' ? 'cpf_cnpj' : key] = value;
        return acc;
      }, {});
      
      await exportarClientes(formato, filtrosAtivos);
      showSnackbar('Exportação concluída!', 'success');
    } catch (error: any) {
      showSnackbar(`Erro: ${error.message}`, 'error');
    }
  };

  const handleLimpar = () => {
    setFiltros(INITIAL_FILTERS);
    limparFiltros();
    showSnackbar('Filtros limpos');
  };

  // Renderização de Loading Premium
  if (isLoading && clientes.length === 0) {
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
            Clientes
          </Typography>
          <Typography variant="body2" color="#64748B">
            Gerencie sua base de clientes, consulte históricos e aplique filtros para relatórios precisos.
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
            <ClientesActions
              onAdd={() => navigate("/cadastros/clientes/novo")}
              onRefresh={fetchClientes}
              onExport={handleExport}
              onToggleFilters={() => setOpenFilters(!openFilters)}
              onSearchSimple={handleSearchSimple}
              mounted={mounted}
            />
          </Box>

          {/* ÁREA DE FILTROS */}
          <Collapse in={openFilters}>
            <Box sx={{ p: 4, borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
              <ClientesFilters 
                filtros={filtros}
                setFiltros={setFiltros}
                onBuscar={handleBuscarAvancada}
                onLimpar={handleLimpar}
              />
            </Box>
          </Collapse>

          {/* ÁREA DA TABELA */}
          <Box sx={{ p: 4 }}>
            <div className="flex justify-between items-center mb-4">
              {/* Badge indicadora de registros */}
              <span className="text-[#64748B] text-xs font-bold uppercase tracking-wider bg-[#F1F5F9] px-3 py-1.5 rounded-md">
                {clientes.length > 0 ? `${clientes.length} de ${paginacao.total} registros` : 'Nenhum registro encontrado'}
              </span>
            </div>

            <ConfigProvider
              theme={{
                components: {
                  Checkbox: {
                    colorPrimary: '#5B21B6',
                    colorPrimaryHover: '#3C0473'
                  },
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
              <TabelaClientes 
                clientes={clientes} 
                isLoading={isLoading} 
                onRefresh={fetchClientes}
                onChange={() => {}} 
                pagination={{ 
                  current: paginacao.pagina, 
                  pageSize: paginacao.limite, 
                  total: paginacao.total, 
                  align: 'center',
                  showSizeChanger: true,
                }} 
              />
            </ConfigProvider>
          </Box>
        </Box>
      </div>

      {/* SNACKBAR REFINADO */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar(p => ({ ...p, open: false }))}
          sx={{ 
            borderRadius: '12px', 
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            fontWeight: 600
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default Clientes;