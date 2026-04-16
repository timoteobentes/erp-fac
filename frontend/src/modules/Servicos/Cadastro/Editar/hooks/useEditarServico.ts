import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import type { ServicoFormData } from '../../schemas/servicoSchema';
import { servicoSchema } from '../../schemas/servicoSchema';
import { getServicoPorIdService, updateServicoService } from '../../services/servicoService';

export const useEditarServico = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const methods = useForm<ServicoFormData>({
    resolver: yupResolver(servicoSchema as any)
  });

  useEffect(() => {
    if (!id) return;
    const fetchDados = async () => {
      try {
        setIsFetching(true);
        const servico = await getServicoPorIdService(parseInt(id));
        methods.reset({
          nome: servico.nome,
          codigo_lc116: servico.codigo_lc116,
          cnae: servico.cnae,
          aliquota_iss: servico.aliquota_iss,
          valor_padrao: servico.valor_padrao,
          ativo: servico.ativo
        });
      } catch (error: any) {
        toast.error('Erro ao buscar dados do serviço');
        navigate('/servicos/cadastro');
      } finally {
        setIsFetching(false);
      }
    };
    fetchDados();
  }, [id, methods, navigate]);

  const onSubmit = async (data: any) => {
    if (!id) return;
    try {
      setIsLoading(true);
      const payload = {
        ...data,
        aliquota_iss: Number(data.aliquota_iss),
        valor_padrao: Number(data.valor_padrao || 0)
      };
      await updateServicoService(parseInt(id), payload as any);
      toast.success('Serviço atualizado com sucesso!');
      navigate('/servicos/cadastro');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar serviço');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    methods,
    isLoading,
    isFetching,
    onSubmit: methods.handleSubmit(onSubmit),
    voltar: () => navigate('/servicos/cadastro')
  };
};
