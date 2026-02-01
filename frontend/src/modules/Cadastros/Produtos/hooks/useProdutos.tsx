/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { criarProdutoService } from "../Novo/services/novoProdutoService";
import {
  listarProdutosService,
  buscarProdutoPorIdService,
  atualizarProdutoService,
  excluirProdutoService,
  obterDadosAuxiliaresService,
  type FiltrosProduto,
  type PaginacaoProduto,
  type DadosAuxiliares
} from "../services/produtoService";

export const useProdutos = () => {
  const navigate = useNavigate();
  
  // --- Estados ---
  const [produtos, setProdutos] = useState<any[]>([]);
  const [produto, setProduto] = useState<any>(null);
  
  // Estado especial para selects (Categorias, Marcas, Unidades)
  const [auxiliares, setAuxiliares] = useState<DadosAuxiliares>({
    categorias: [],
    marcas: [],
    unidades: []
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [paginacao, setPaginacao] = useState<PaginacaoProduto>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const [filtros, setFiltros] = useState<FiltrosProduto>({});

  // ============================================================================
  // AÇÕES DE LEITURA
  // ============================================================================

  /**
   * Busca a lista de produtos com paginação e filtros
   */
  const fetchProdutos = useCallback(async (
    pagina = 1, 
    limite = 10, 
    filtrosAtuais?: FiltrosProduto
  ) => {
    setIsLoading(true);
    try {
      const response = await listarProdutosService(pagina, limite, filtrosAtuais);
      
      setProdutos(response.data);
      setPaginacao({
        page: response.meta.page,
        limit: response.meta.limit,
        total: response.meta.total,
        totalPages: response.meta.totalPages
      });
      
      // Atualiza o estado local de filtros se foram passados novos
      if (filtrosAtuais) setFiltros(filtrosAtuais);

    } catch (error: any) {
      console.error("Erro ao buscar produtos:", error);
      toast.error("Erro ao carregar lista de produtos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Busca um produto específico pelo ID
   */
  const fetchProdutoId = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      const dados = await buscarProdutoPorIdService(id);
      setProduto(dados);
      return dados;
    } catch (error: any) {
      console.error("Erro ao buscar produto:", error);
      toast.error("Erro ao carregar detalhes do produto.");
      navigate("/cadastros/produtos"); // Volta para listagem se falhar
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  /**
   * Carrega Categorias, Marcas e Unidades para preencher os Selects do formulário
   */
  const carregarAuxiliares = useCallback(async () => {
    try {
      const dados = await obterDadosAuxiliaresService();
      setAuxiliares(dados);
    } catch (error) {
      console.error("Erro ao carregar dados auxiliares:", error);
      toast.warning("Não foi possível carregar categorias e marcas.");
    }
  }, []);

  // ============================================================================
  // AÇÕES DE ESCRITA (CRUD)
  // ============================================================================

  const createProduto = async (dados: any) => {
    setIsLoading(true);
    try {
      const res = await criarProdutoService(dados);
      toast.success("Produto cadastrado com sucesso!");
      navigate(`/cadastros/produtos/visualizar/${res.id}`);
      return res;
    } catch (error: any) {
      console.error("Erro ao criar produto:", error);
      const msg = error.response?.data?.message || "Erro ao cadastrar produto.";
      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduto = async (id: number, dados: any) => {
    setIsLoading(true);
    try {
      await atualizarProdutoService(id, dados);
      toast.success("Produto atualizado com sucesso!");
      navigate("/cadastros/produtos");
    } catch (error: any) {
      console.error("Erro ao atualizar produto:", error);
      const msg = error.response?.data?.message || "Erro ao atualizar produto.";
      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduto = async (id: number) => {
    setIsLoading(true);
    try {
      await excluirProdutoService(id);
      toast.success("Produto removido com sucesso!");
      // Recarrega a lista mantendo a página atual (ou volta pra 1 se estiver vazia)
      fetchProdutos(paginacao.page, paginacao.limit, filtros);
    } catch (error: any) {
      console.error("Erro ao excluir produto:", error);
      const msg = error.response?.data?.message || "Erro ao excluir produto.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // HANDLERS DE UI (Busca, Filtros, Paginação)
  // ============================================================================

  const handleSearch = (termo: string) => {
    const novosFiltros = { ...filtros, termo };
    setFiltros(novosFiltros);
    fetchProdutos(1, paginacao.limit, novosFiltros);
  };

  const mudarPagina = (novaPagina: number) => {
    fetchProdutos(novaPagina, paginacao.limit, filtros);
  };

  const limparFiltros = () => {
    setFiltros({});
    fetchProdutos(1, paginacao.limit, {});
  };

  return {
    // Estados
    produtos,
    produto,
    auxiliares, // <--- Novo: Acesso direto às listas de categorias/marcas
    isLoading,
    paginacao,
    filtros,

    // Ações API
    fetchProdutos,
    fetchProdutoId,
    carregarAuxiliares, // <--- Novo: Chamar no useEffect do formulário
    createProduto,
    updateProduto,
    deleteProduto,

    // Helpers UI
    handleSearch,
    mudarPagina,
    limparFiltros
  };
};