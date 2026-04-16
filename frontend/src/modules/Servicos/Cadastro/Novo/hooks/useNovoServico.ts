import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import type { ServicoFormData } from '../../schemas/servicoSchema';
import { servicoSchema } from '../../schemas/servicoSchema';
import { createServicoService } from '../../services/servicoService';

export const useNovoServico = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const methods = useForm<ServicoFormData>({
    resolver: yupResolver(servicoSchema as any),
    defaultValues: {
      nome: '',
      codigo_lc116: '',
      codigo_tributacao_nacional: '',
      cnae: '',
      aliquota_iss: 0,
      valor_padrao: 0,
      ativo: true,
    }
  });

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const payload = {
        ...data,
        aliquota_iss: Number(data.aliquota_iss),
        valor_padrao: Number(data.valor_padrao || 0)
      };
      await createServicoService(payload as any);
      toast.success('Serviço cadastrado com sucesso!');
      navigate('/servicos/cadastro');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao cadastrar serviço');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    methods,
    isLoading,
    onSubmit: methods.handleSubmit(onSubmit),
    voltar: () => navigate('/servicos/cadastro')
  };
};
