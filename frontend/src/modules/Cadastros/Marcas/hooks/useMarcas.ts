/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  atualizarMarcaService,
  buscarMarcaService,
  criarMarcaService,
  excluirMarcaService,
  listarMarcasService,
  type Marca
} from "../services/marcaService";

export const useMarcas = () => {
  const navigate = useNavigate();
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [marca, setMarca] = useState<Marca | null>(null);
  const [loading, setLoading] = useState(false);
  const [paginacao, setPaginacao] = useState({ page: 1, limit: 10, total: 0 });
  const [filtros, setFiltros] = useState<{ nome?: string }>({});

  const fetchMarcas = useCallback(async (page = paginacao.page, limit = paginacao.limit, novosFiltros = filtros) => {
    setLoading(true);
    try {
      const resultado = await listarMarcasService(page, limit, novosFiltros);
      setMarcas(resultado.data);
      setPaginacao({ page: resultado.meta.page, limit: resultado.meta.limit, total: resultado.meta.total });
      setFiltros(novosFiltros);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao carregar marcas.");
    } finally {
      setLoading(false);
    }
  }, [filtros, paginacao.limit, paginacao.page]);

  const fetchMarca = useCallback(async (id: string | number) => {
    setLoading(true);
    try {
      const data = await buscarMarcaService(id);
      setMarca(data);
      return data;
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao carregar marca.");
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const criarMarca = async (dados: { nome: string }) => {
    setLoading(true);
    try {
      await criarMarcaService(dados);
      toast.success("Marca cadastrada com sucesso.");
      navigate("/cadastros/marcas");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao cadastrar marca.");
    } finally {
      setLoading(false);
    }
  };

  const atualizarMarca = async (id: string | number, dados: { nome: string }) => {
    setLoading(true);
    try {
      await atualizarMarcaService(id, dados);
      toast.success("Marca atualizada com sucesso.");
      navigate("/cadastros/marcas");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao atualizar marca.");
    } finally {
      setLoading(false);
    }
  };

  const excluirMarca = async (id: string | number) => {
    setLoading(true);
    try {
      await excluirMarcaService(id);
      toast.success("Marca excluida com sucesso.");
      await fetchMarcas();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao excluir marca.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination: any) => {
    fetchMarcas(pagination.current, pagination.pageSize, filtros);
  };

  const aplicarBusca = (nome?: string) => fetchMarcas(1, paginacao.limit, { nome });
  const limparBusca = () => fetchMarcas(1, paginacao.limit, {});

  return {
    marcas,
    marca,
    loading,
    paginacao,
    fetchMarcas,
    fetchMarca,
    criarMarca,
    atualizarMarca,
    excluirMarca,
    handleTableChange,
    aplicarBusca,
    limparBusca
  };
};
