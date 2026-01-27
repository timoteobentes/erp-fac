/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router";
import { cadastroService } from "../services/cadastroService";
import type { CadastroData } from "../services/cadastroService";
import { toast } from "react-toastify";

export const useCadastro = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cadastro = async (data: CadastroData) => {
    try {
      setIsLoading(true);
      await cadastroService(data);
      toast.success("Cadastro realizado com sucesso! Por favor, faça o login.");
      return navigate("/login");
    } catch (err: any) {
      toast.error("Erro ao cadastrar. Por favor, tente novamente.");
      setError(err.response?.data?.message || "Erro ao cadastrar");
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    error,
    cadastro
  }
}