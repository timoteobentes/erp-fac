/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, Collapse, Snackbar, Alert } from "@mui/material";
import { ConfigProvider } from "antd";
import Layout from "../../../template/Layout";
import { useNavigate } from "react-router-dom";
import { useProdutos } from "../../../modules/Cadastros/Produtos/hooks/useProdutos";
import { TabelaProdutos } from "../../../modules/Cadastros/Produtos/components/TabelaProdutos";
import { ProdutosFilters, type FiltrosType } from "../../../modules/Cadastros/Produtos/components/ProdutosFilters";
import { ProdutosActions } from "../../../modules/Cadastros/Produtos/components/ProdutosActions";

// Estado inicial dos filtros extraído para constante
const INITIAL_FILTERS: FiltrosType = {
  tipo: "", codigo: "", nome: "", fornecedor: "", situacao: "", marca: "", modelo: ""
};

const Produtos: React.FC = () => {
  const navigate = useNavigate();
  
  // Hook Personalizado
  const { 
    produtos, 
    isLoading, 
    paginacao, 
    fetchProdutos, 
    // handleSearch, 
    deleteProduto 
  } = useProdutos();

  // Estados Locais de Controle de UI
  const [mounted, setMounted] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosType>(INITIAL_FILTERS);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  // const [termoBusca, setTermoBusca] = useState("");

  // Efeito de entrada (Animação) e carga inicial
  useEffect(() => {
    fetchProdutos(); // Carrega dados iniciais
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handlers Otimizados
  const showSnackbar = useCallback((message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleBuscarAvancada = async () => {
    try {
      // Remove campos vazios e mapeia chaves para API
      // const filtrosAtivos = Object.entries(filtros).reduce((acc: any, [key, value]) => {
      //   if (value) {
      //     acc[key] = value;
      //   }
      //   return acc;
      // }, {});

      // await aplicarFiltrosManuais(filtrosAtivos);
      // setOpenFilters(false);
      showSnackbar('Filtros aplicados com sucesso!');
    } catch (error) {
      console.error(error);
      showSnackbar('Erro ao buscar clientes', 'error');
    }
  };

  const handleSearchSimple = async (term: string) => {
    try {
      // await aplicarFiltrosManuais({ nome: term });
      console.log("Buscando por:", term);
    } catch {
      showSnackbar('Erro na busca rápida', 'error');
    }
  };

  const handleExport = async (formato: string) => {
    showSnackbar(`Iniciando exportação ${formato.toUpperCase()}...`, 'info');
    try {
      // Lógica de mapeamento de filtros similar à busca (pode extrair para função auxiliar se quiser reutilizar)
      // const filtrosAtivos = Object.entries(filtros).reduce((acc: any, [key, value]) => {
      //   if (value) acc[key] = value;
      //   return acc;
      // }, {});
      
      // await exportarClientes(formato, filtrosAtivos);
      showSnackbar('Exportação concluída!', 'success');
    } catch (error: any) {
      showSnackbar(`Erro: ${error.message}`, 'error');
    }
  };

  const handleLimpar = () => {
    setFiltros(INITIAL_FILTERS);
    // limparFiltros();
    showSnackbar('Filtros limpos');
  };

  if (isLoading && produtos.length === 0) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9842F6]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-full text-start mb-6">
          <span className="text-[#9842F6] font-bold text-2xl">Gerenciar Produtos</span>
        </div>

        <Card sx={{ boxShadow: "none !important", borderRadius: "4px", border: "1px solid #E9DEF6" }}>
          <CardContent>
            {/* Componente de Ações (Botões) */}
              <ProdutosActions
                onAdd={() => navigate("/cadastros/produtos/novo")}
                onRefresh={fetchProdutos}
                onExport={handleExport}
                onToggleFilters={() => setOpenFilters(!openFilters)}
                onSearchSimple={handleSearchSimple}
                mounted={mounted}
              />

              {/* Componente de Filtros (Collapsible) */}
              <Collapse in={openFilters}>
                <ProdutosFilters 
                  filtros={filtros}
                  setFiltros={setFiltros}
                  onBuscar={handleBuscarAvancada}
                  onLimpar={handleLimpar}
                />
              </Collapse>

              {/* Tabela */}
              <ConfigProvider
                theme={{
                  components: {
                    Checkbox: {
                      colorPrimary: '#6B00A1',
                      colorPrimaryHover: '#1a0027'
                    },
                    Table: {
                      rowSelectedBg: '#f4dfff',
                      rowSelectedHoverBg: '#ecc6ff'
                    },
                    Pagination: {
                      colorPrimary: '#6B00A1',
                      colorPrimaryHover: '#1a0027'
                    },
                    Spin: {
                      colorPrimary: '#3C0473'
                    }
                  }
                }}
              >
                <div className="text-[#3C0473] font-normal text-lg mb-4">
                  {produtos.length > 0 ? `Mostrando ${produtos.length} de ${paginacao.total}` : 'Nenhum registro'}
                </div>
                <TabelaProdutos
                  produtos={produtos}
                  isLoading={isLoading}
                  onRefresh={fetchProdutos}
                  onChange={() => {}}
                  // onChange={handleTableChange}
                  onDelete={deleteProduto}
                  pagination={{
                    current: paginacao.page,
                    pageSize: paginacao.limit,
                    total: paginacao.total,
                    align: 'center'
                  }}
                />
              </ConfigProvider>
          </CardContent>
        </Card>
      </div>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default Produtos;