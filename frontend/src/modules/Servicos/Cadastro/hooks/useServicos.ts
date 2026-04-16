import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getServicosService, deleteServicoService } from '../services/servicoService';
import type { Servico } from '../schemas/servicoSchema';

export const useServicos = () => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const carregarServicos = useCallback(async () => {
    try {
      setIsLoading(true);
      const response: any = await getServicosService();
      
      let dataArray: any[] = [];
      
      // 1. Remove o wrapper { success, data } se ele existir
      const payload = (response && response.data && !Array.isArray(response.data) && response.success !== undefined) 
        ? response.data 
        : response;

      // 2. Extrai o Array
      if (Array.isArray(payload)) {
        dataArray = payload;
      } else if (payload && typeof payload === 'object') {
        if (Array.isArray(payload.dados)) dataArray = payload.dados;
        else if (Array.isArray(payload.data)) dataArray = payload.data;
        else if (Array.isArray(payload.clientes)) dataArray = payload.clientes;
        else if (Array.isArray(payload.produtos)) dataArray = payload.produtos;
        else if (Array.isArray(payload.fornecedores)) dataArray = payload.fornecedores;
        else if (Array.isArray(payload.servicos)) dataArray = payload.servicos;
        else if (Array.isArray(payload.contas)) dataArray = payload.contas;
        else if (Array.isArray(payload.vendas)) dataArray = payload.vendas;
        else if (Array.isArray(payload.movimentacoes)) dataArray = payload.movimentacoes;
        else {
          const arrayEncontrado = Object.values(payload).find(val => Array.isArray(val));
          if (arrayEncontrado) dataArray = arrayEncontrado as any[];
        }
      }

      setServicos(dataArray as Servico[]);
    } catch (error: any) {
      toast.error('Erro ao carregar serviços');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deletarServico = async (id: number) => {
    try {
      await deleteServicoService(id);
      toast.success('Serviço deletado com sucesso');
      setServicos(prev => prev.filter(s => s.id !== id));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao deletar serviço');
    }
  };

  useEffect(() => {
    carregarServicos();
  }, [carregarServicos]);

  return {
    servicos,
    isLoading,
    deletarServico,
    recarregar: carregarServicos
  };
};
