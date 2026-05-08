import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import {
  exportarDreGerencialService,
  obterDreGerencialService,
  type DreGerencialFiltros,
  type DreGerencialResponse,
} from "../services/dreGerencialService";

export const useDreGerencial = () => {
  const [dreGerencial, setDreGerencial] = useState<DreGerencialResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDreGerencial = useCallback(async (filtros?: DreGerencialFiltros) => {
    setIsLoading(true);
    try {
      const response = await obterDreGerencialService(filtros);
      const payload = response?.data && response?.success !== undefined ? response.data : response;
      setDreGerencial(payload);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao carregar DRE Gerencial");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportarDreGerencial = useCallback(async (formato: "csv" | "xlsx", filtros?: DreGerencialFiltros) => {
    setIsLoading(true);
    try {
      const blob = await exportarDreGerencialService(formato, filtros);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `dre_gerencial_${new Date().getTime()}.${formato}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Download do ${formato.toUpperCase()} iniciado com sucesso!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao exportar DRE Gerencial");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    dreGerencial,
    isLoading,
    fetchDreGerencial,
    exportarDreGerencial,
  };
};
