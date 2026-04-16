import { useState, useEffect } from 'react';
import { obterPerfilService, atualizarPerfilService } from '../services/perfilService';
import { toast } from 'react-toastify';

export const usePerfil = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [perfil, setPerfil] = useState<{ usuario: any, fiscal: any, fiscal_nfse: any }>({ usuario: {}, fiscal: {}, fiscal_nfse: {} });

  const fetchPerfil = async () => {
    try {
      setLoading(true);
      const data = await obterPerfilService();
      if (data.success) {
        setPerfil({
           usuario: data.data.usuario,
           fiscal: data.data.fiscal,
           fiscal_nfse: data.data.fiscal_nfse
        });
      }
    } catch (error: any) {
      toast.error('Erro ao buscar perfil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfil();
  }, []);

  const salvarPerfil = async (dadosMistos: any) => {
    try {
      setSubmitting(true);
      
      const payload = {
        usuario: { 
           nome: dadosMistos.nome,
           nome_completo: dadosMistos.nome_completo,
           cpf: dadosMistos.cpf,
           cnpj: dadosMistos.cnpj,
           razao_social: dadosMistos.razao_social,
           telefone: dadosMistos.telefone,
           cidade: dadosMistos.cidade,
           estado: dadosMistos.estado,
           senha: dadosMistos.senha
        },
        fiscal: {
           inscricao_estadual: dadosMistos.inscricao_estadual,
           regime_tributario: dadosMistos.regime_tributario,
           csc_id: dadosMistos.csc_id,
           csc_alfanumerico: dadosMistos.csc_alfanumerico,
           ambiente_sefaz: dadosMistos.ambiente_sefaz,
           certificado_base64: dadosMistos.certificado_base64,
           certificado_senha: dadosMistos.certificado_senha
        },
        fiscal_nfse: {
           inscricao_municipal: dadosMistos.inscricao_municipal_nfse,
           codigo_tributacao_nacional: dadosMistos.codigo_tributacao_nacional,
           codigo_tributacao_municipal: dadosMistos.codigo_tributacao_municipal,
           serie_dps: dadosMistos.serie_dps,
           cnbs: dadosMistos.cnbs,
           cnae: dadosMistos.cnae_nfse
        }
      };

      await atualizarPerfilService(payload);
      toast.success('Perfil e Configurações Fiscais atualizados!');
      await fetchPerfil();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar perfil.');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { perfil, loading, submitting, salvarPerfil };
};
