import { useState, useCallback } from 'react';
import { getNFSeService } from '../services/nfseService';
import type { NotaFiscalServico } from '../services/nfseService';
import { toast } from 'react-toastify';

export const useNFSe = () => {
  const [notas, setNotas] = useState<NotaFiscalServico[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotas = useCallback(async () => {
    try {
      setIsLoading(true);
      const response: any = await getNFSeService();
      
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

      setNotas(dataArray as NotaFiscalServico[]);
    } catch (error: any) {
      toast.error('Erro ao listar histórico de NFS-e');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    notas,
    isLoading,
    fetchNotas
  };
};
