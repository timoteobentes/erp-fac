import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { nfseSchema } from '../schemas/nfseSchema';
import type { NFSeFormData } from '../schemas/nfseSchema';
import { createNFSeService } from '../services/nfseService';
import api from '../../../../api/api';

export const useNovaNFSe = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isBuscandoDependencies, setIsBuscandoDependencies] = useState(true);
  
  // Dados de Selects
  const [clientes, setClientes] = useState<any[]>([]);
  const [servicos, setServicos] = useState<any[]>([]);
  
  // Reactive display values
  const [servicoSelecionado, setServicoSelecionado] = useState<any | null>(null);

  const methods = useForm<NFSeFormData>({
    resolver: yupResolver(nfseSchema as any),
    defaultValues: {
      valor_servico: 0,
      desconto: 0,
    }
  });

  const { watch, setValue } = methods;
  const valorServicoWatch = watch('valor_servico') || 0;
  const descontoWatch = watch('desconto') || 0;
  const servicoIdWatch = watch('servico_id');

  // Atualiza infos de apoio reativamente ao mudar o serviço
  useEffect(() => {
    if (servicoIdWatch) {
      const srv = servicos.find(s => s.id === servicoIdWatch);
      if (srv) {
        setServicoSelecionado(srv);
        setValue('valor_servico', Number(srv.valor_padrao) || 0);
        setValue('aliquota_iss', Number(srv.aliquota_iss) || 0);
      }
    } else {
      setServicoSelecionado(null);
    }
  }, [servicoIdWatch, servicos, setValue]);

  useEffect(() => {
    const carregarDadosBase = async () => {
      try {
        const [resClientes, resServicos] = await Promise.all([
          api.get('/api/clientes'),
          api.get('/api/servicos')
        ]);
        
        const arrayClientes = Array.isArray(resClientes.data) ? resClientes.data : resClientes.data?.data || [];
        const arrayServicos = Array.isArray(resServicos.data) ? resServicos.data : resServicos.data?.data || [];

        // Trata os clientes unificando os campos
        const clientesFormatados = arrayClientes.map((c: any) => ({
          ...c,
          nome: c.nome || c.razao_social,
          cpf_cnpj: c.cpf || c.cnpj || c.cpf_cnpj
        }));

        setClientes(clientesFormatados);
        setServicos(arrayServicos);
      } catch (error) {
        console.error("Erro ao carregar listas:", error);
        toast.error("Erro ao carregar clientes e serviços.");
      } finally {
        setIsBuscandoDependencies(false);
      }
    };
    
    carregarDadosBase();
  }, []);

  const totalCalculado = Number(valorServicoWatch) - Number(descontoWatch);
  const issEstimado = servicoSelecionado 
    ? (Number(valorServicoWatch) * Number(servicoSelecionado.aliquota_iss || 0)) / 100 
    : 0;

  const handleSalvar = async (data: any, mode: 'rascunho' | 'emitir' = 'rascunho') => {
    try {
      setIsLoading(true);
      const payload = {
        ...data,
        valor_servico: Number(data.valor_servico),
        desconto: Number(data.desconto || 0),
        aliquota_iss: Number(data.aliquota_iss || 0),
        emitir_agora: mode === 'emitir'
      };

      await createNFSeService(payload as any);
      
      toast.success(
        mode === 'rascunho' 
          ? 'Rascunho da NFS-e salvo com sucesso!' 
          : 'NFS-e Transmitida à Sefaz/Serpro com Sucesso!'
      );
      navigate('/servicos/nfse');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao processar NFS-e');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitRascunho = methods.handleSubmit(data => handleSalvar(data, 'rascunho'));
  const onSubmitEmitir = methods.handleSubmit(data => handleSalvar(data, 'emitir'));

  return {
    methods,
    isLoading,
    isBuscandoDependencies,
    clientes,
    servicos,
    servicoSelecionado,
    totalCalculado,
    issEstimado,
    onSubmitRascunho,
    onSubmitEmitir,
    voltar: () => navigate('/servicos/nfse')
  };
};
