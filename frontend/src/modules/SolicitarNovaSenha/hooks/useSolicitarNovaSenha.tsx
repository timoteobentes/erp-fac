/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { solicitarNovaSenhaService } from "../services/solicitarNovaSenhaService";
import { toast } from "react-toastify";

export const useSolicitarNovaSenha = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const handleSolicitarNovaSenha = async(data: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await solicitarNovaSenhaService(data);
      if (response.data.status === 'success') {
        toast.success(
          <div>
            <p className="font-semibold text-base">Link enviado!</p>
            <p className="text-sm mt-1">Verifique sua caixa de e-mail para redefinir sua senha.</p>
          </div>,
          {
            autoClose: 5000,
            style: { backgroundColor: '#f0f9ff' },
            progressClassName: 'bg-[#3C0473]',
          }
        );
      }
      return response;
    } catch (err) {
      setError(err);
      toast.info(
        <div>
          <p className="font-semibold text-base">Solicitação enviada</p>
          <p className="text-sm mt-1">Se o e-mail existir em nossa base, você receberá um link para redefinição.</p>
        </div>,
        {
          autoClose: 5000,
          style: { backgroundColor: '#f0f9ff' },
          progressClassName: 'bg-[#3C0473]',
        }
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    handleSolicitarNovaSenha,
    loading,
    error
  }
}