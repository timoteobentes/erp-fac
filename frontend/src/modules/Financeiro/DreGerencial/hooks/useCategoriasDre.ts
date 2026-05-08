import { useCallback, useState } from "react";
import { toast } from "react-toastify";
import {
  excluirCategoriaDreService,
  listarCategoriasDreService,
  type FiltrosCategoriaDre,
} from "../services/categoriasDreService";

export interface CategoriaDre {
  id: number;
  grupo: string;
  nome: string;
  tipo: string;
  ativo: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

export const useCategoriasDre = () => {
  const [categoriasDre, setCategoriasDre] = useState<CategoriaDre[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategoriasDre = useCallback(async (filtros?: FiltrosCategoriaDre) => {
    setIsLoading(true);
    try {
      const response = await listarCategoriasDreService(filtros);
      const payload = response?.data && response?.success !== undefined ? response.data : response;

      let dataArray: CategoriaDre[] = [];
      if (Array.isArray(payload)) dataArray = payload;
      else if (payload?.dados && Array.isArray(payload.dados)) dataArray = payload.dados;
      else if (payload?.data && Array.isArray(payload.data)) dataArray = payload.data;

      setCategoriasDre(dataArray);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao carregar Categorias DRE");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const excluirCategoriaDre = async (id: number | string) => {
    try {
      await excluirCategoriaDreService(id);
      toast.success("Categoria DRE excluida com sucesso");
      await fetchCategoriasDre();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao excluir Categoria DRE");
      throw error;
    }
  };

  return {
    categoriasDre,
    isLoading,
    fetchCategoriasDre,
    excluirCategoriaDre,
  };
};
