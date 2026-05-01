import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import {
  excluirContaBancariaService,
  listarContasBancariasService,
  type FiltrosContaBancaria,
} from "../services/contasBancariasService";

export interface ContaBancaria {
  id: number;
  nome: string;
  saldo_inicial: number | string;
  data_saldo: string;
  criado_em?: string;
  atualizado_em?: string;
}

export const useContasBancarias = () => {
  const [contasBancarias, setContasBancarias] = useState<ContaBancaria[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchContasBancarias = useCallback(async (filtros?: FiltrosContaBancaria) => {
    setIsLoading(true);
    try {
      const response = await listarContasBancariasService(filtros);
      const payload = response?.data && response?.success !== undefined ? response.data : response;

      let dataArray: ContaBancaria[] = [];
      if (Array.isArray(payload)) {
        dataArray = payload;
      } else if (payload?.dados && Array.isArray(payload.dados)) {
        dataArray = payload.dados;
      } else if (payload?.data && Array.isArray(payload.data)) {
        dataArray = payload.data;
      }

      setContasBancarias(dataArray);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao carregar Contas Bancarias");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const excluirContaBancaria = async (id: number | string) => {
    try {
      await excluirContaBancariaService(id);
      toast.success("Conta Bancaria excluida com sucesso");
      await fetchContasBancarias();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao excluir Conta Bancaria");
      throw error;
    }
  };

  return {
    contasBancarias,
    isLoading,
    fetchContasBancarias,
    excluirContaBancaria,
  };
};
