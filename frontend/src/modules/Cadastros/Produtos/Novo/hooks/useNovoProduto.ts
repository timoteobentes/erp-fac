/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { criarProdutoService } from "../services/novoProdutoService";
import {
  obterDadosAuxiliaresService,
  type DadosAuxiliares 
} from "../../services/produtoService";

export const useNovoProduto = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Estado para armazenar as listas dos Selects (Categorias, Marcas, Unidades)
  const [auxiliares, setAuxiliares] = useState<DadosAuxiliares>({
    categorias: [],
    marcas: [],
    unidades: []
  });

  /**
   * Função para carregar os dados dos Selects (chamada no useEffect do form)
   */
  const carregarAuxiliares = useCallback(async () => {
    try {
      const dados = await obterDadosAuxiliaresService();
      setAuxiliares(dados);
    } catch (error) {
      console.error("Erro ao carregar auxiliares:", error);
      toast.warning("Não foi possível carregar as listas de categorias/marcas.");
    }
  }, []);

  /**
   * Função de Envio do Formulário
   */
  const handleCadastrarProduto = async (data: any) => {
    setIsLoading(true);
    try {
      // O service e o Zod já garantem a tipagem, enviamos direto
      const response = await criarProdutoService(data);
      
      toast.success("Produto cadastrado com sucesso!");
      navigate("/cadastros/produtos");
      
      return response;
    } catch (error: any) {
      console.error("Erro ao cadastrar produto:", error);
      
      // Tratamento de erro vindo do backend (Ex: "Nome já existe")
      const msg = error.response?.data?.message || error.message || "Erro ao salvar produto.";
      toast.error(msg);
      
      // Repassa o erro para o Form (opcional, caso queira setar erro no campo)
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    auxiliares,     // Dados para popular os <Select>
    carregarAuxiliares, // Função para iniciar o carregamento
    handleCadastrarProduto // Função de submit
  };
};