/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { redefinirSenhaService } from "../services/redefinirSenhaService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

export const useRedefinirSenha = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const handleRedefinirSenha = async(data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await redefinirSenhaService(data);
      if (response.data.status === 'success') {
        toast.success('Senha redefinida com sucesso!');
        
        // Redirecionar para login após 2 segundos
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Senha alterada com sucesso. Faça login com sua nova senha.' 
            } 
          });
        }, 2000);
      }
    } catch (err: any) {
      setError(err);
      if (err.response?.status === 400) {
        toast.error(err.response.data.message || 'Token expirado ou inválido');
      } else {
        toast.error('Erro ao redefinir senha. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }

  return {
    handleRedefinirSenha,
    loading,
    error
  }
}