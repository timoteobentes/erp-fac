/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-catch */
import { useState } from "react";
import { useNavigate } from "react-router";
import { cadastrarService } from "../services/novoFornecedorService";

export const useNovoFornecedor = () => {
  const navigate = useNavigate();
  const [viaCep, setViaCep] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const handleCadastrarFornecedor = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await cadastrarService(data);
      navigate("/simples/comercial/fornecedores");
      return response;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  const handleViaCep = async (cep: string, index?: number) => {
    if (!cep || cep.length < 8) return null;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setViaCep({ data, index });
        return { data, index };
      } else {
        setViaCep(null);
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setViaCep(null);
      return null;
    }
  }

  return {
    viaCep,
    handleViaCep,
    handleCadastrarFornecedor,
    loading,
    error
  }
}