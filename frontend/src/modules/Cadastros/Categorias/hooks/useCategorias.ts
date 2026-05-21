/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  atualizarCategoriaService,
  buscarCategoriaService,
  criarCategoriaService,
  excluirCategoriaService,
  listarCategoriasService,
  type Categoria
} from "../services/categoriaService";

export const useCategorias = () => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [loading, setLoading] = useState(false);
  const [paginacao, setPaginacao] = useState({ page: 1, limit: 10, total: 0 });
  const [filtros, setFiltros] = useState<{ nome?: string }>({});

  const fetchCategorias = useCallback(async (page = paginacao.page, limit = paginacao.limit, novosFiltros = filtros) => {
    setLoading(true);
    try {
      const resultado = await listarCategoriasService(page, limit, novosFiltros);
      setCategorias(resultado.data);
      setPaginacao({ page: resultado.meta.page, limit: resultado.meta.limit, total: resultado.meta.total });
      setFiltros(novosFiltros);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  }, [filtros, paginacao.limit, paginacao.page]);

  const fetchCategoria = useCallback(async (id: string | number) => {
    setLoading(true);
    try {
      const data = await buscarCategoriaService(id);
      setCategoria(data);
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao carregar categoria.");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const criarCategoria = async (dados: { nome: string }) => {
    setLoading(true);
    try {
      await criarCategoriaService(dados);
      toast.success("Categoria cadastrada com sucesso.");
      navigate("/cadastros/categorias");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao cadastrar categoria.");
    } finally {
      setLoading(false);
    }
  };

  const atualizarCategoria = async (id: string | number, dados: { nome: string }) => {
    setLoading(true);
    try {
      await atualizarCategoriaService(id, dados);
      toast.success("Categoria atualizada com sucesso.");
      navigate("/cadastros/categorias");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao atualizar categoria.");
    } finally {
      setLoading(false);
    }
  };

  const excluirCategoria = async (id: string | number) => {
    setLoading(true);
    try {
      await excluirCategoriaService(id);
      toast.success("Categoria excluida com sucesso.");
      await fetchCategorias();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao excluir categoria.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination: any) => {
    fetchCategorias(pagination.current, pagination.pageSize, filtros);
  };

  const aplicarBusca = (nome?: string) => fetchCategorias(1, paginacao.limit, { nome });
  const limparBusca = () => fetchCategorias(1, paginacao.limit, {});

  return {
    categorias,
    categoria,
    loading,
    paginacao,
    fetchCategorias,
    fetchCategoria,
    criarCategoria,
    atualizarCategoria,
    excluirCategoria,
    handleTableChange,
    aplicarBusca,
    limparBusca
  };
};
