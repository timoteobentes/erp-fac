import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import {
  exportarFluxoCaixaService,
  obterFluxoCaixaService,
} from "../services/fluxoCaixaService";
import type { FluxoCaixaFiltros, FluxoCaixaResponse } from "../services/fluxoCaixaService";

export const useFluxoCaixa = () => {
  const [fluxoCaixa, setFluxoCaixa] = useState<FluxoCaixaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFluxoCaixa = useCallback(async (filtros?: FluxoCaixaFiltros) => {
    setIsLoading(true);
    try {
      const data = await obterFluxoCaixaService(filtros);
      setFluxoCaixa(data as FluxoCaixaResponse);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao carregar Fluxo de Caixa.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportarFluxoCaixa = useCallback(
    async (formato: "csv" | "xlsx" | "pdf", filtros?: FluxoCaixaFiltros) => {
      setIsLoading(true);
      try {
        const blob = await exportarFluxoCaixaService(formato, filtros);
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `fluxo_caixa_${new Date().getTime()}.${formato}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success(`Download do ${formato.toUpperCase()} iniciado com sucesso!`);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Erro ao exportar Fluxo de Caixa.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    fluxoCaixa,
    isLoading,
    fetchFluxoCaixa,
    exportarFluxoCaixa,
  };
};
