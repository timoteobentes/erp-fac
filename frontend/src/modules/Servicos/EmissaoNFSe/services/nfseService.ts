import api from '../../../../api/api';
import type { NFSeFormData } from '../schemas/nfseSchema';

export interface NotaFiscalServico {
  id: number;
  usuario_id: number;
  cliente_id: number;
  servico_id: number;
  competencia: string;
  valor_servico: string | number;
  desconto: string | number;
  valor_total: string | number;
  aliquota_iss: string | number;
  valor_iss: string | number;
  status: 'rascunho' | 'emitida' | 'rejeitada' | 'cancelada';
  xml_autorizado?: string;
  criado_em: string;
  
  // Detalhes da Relacional
  cliente_nome?: string;
  servico_nome?: string;
}

export const getNFSeService = async (): Promise<NotaFiscalServico[]> => {
  const { data } = await api.get('/api/nfse');
  return data;
};

export const getNFSeByIdService = async (id: number): Promise<NotaFiscalServico> => {
  const { data } = await api.get(`/api/nfse/${id}`);
  return data;
};

export const createNFSeService = async (payload: NFSeFormData): Promise<NotaFiscalServico> => {
  const { data } = await api.post('/api/nfse', payload);
  return data;
};

// Mapeamentos para Selects Otimizados
export const getClientesSimplesService = async (): Promise<{id: number; nome: string; cpf_cnpj?: string}[]> => {
  const { data } = await api.get('/api/clientes'); // Presumindo rota genérica de clientes
  return data.map((c: any) => ({ id: c.id, nome: c.nome || c.razao_social, cpf_cnpj: c.cpf || c.cnpj || c.cpf_cnpj }));
};

export const getServicosDisponiveisService = async (): Promise<any[]> => {
  const { data } = await api.get('/api/servicos');
  return data;
};
