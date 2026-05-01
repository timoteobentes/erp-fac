import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import {
  excluirFormaPagamentoService,
  listarFormasPagamentoService,
  type FiltrosFormaPagamento,
} from "../services/formasPagamentoService";

export interface FormaPagamento {
  id: number;
  nome: string;
  conta_bancaria_id: number;
  conta_bancaria_nome?: string;
  disponivel_em: string;
  confirmacao_automatica: string;
  numero_maximo_parcelas: number;
  intervalo_parcelas_dias: number;
  primeira_parcela_dias: number;
  taxa_banco: number | string;
  taxa_operadora: number | string;
  juros_multa: number | string;
  juros_mora: number | string;
  modalidade: string;
  criado_em?: string;
  atualizado_em?: string;
}

export const useFormasPagamento = () => {
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFormasPagamento = useCallback(async (filtros?: FiltrosFormaPagamento) => {
    setIsLoading(true);
    try {
      const response = await listarFormasPagamentoService(filtros);
      const payload = response?.data && response?.success !== undefined ? response.data : response;

      let dataArray: FormaPagamento[] = [];
      if (Array.isArray(payload)) {
        dataArray = payload;
      } else if (payload?.dados && Array.isArray(payload.dados)) {
        dataArray = payload.dados;
      } else if (payload?.data && Array.isArray(payload.data)) {
        dataArray = payload.data;
      }

      setFormasPagamento(dataArray);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao carregar Formas de Pagamento");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const excluirFormaPagamento = async (id: number | string) => {
    try {
      await excluirFormaPagamentoService(id);
      toast.success("Forma de Pagamento excluida com sucesso");
      await fetchFormasPagamento();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao excluir Forma de Pagamento");
      throw error;
    }
  };

  return {
    formasPagamento,
    isLoading,
    fetchFormasPagamento,
    excluirFormaPagamento,
  };
};
