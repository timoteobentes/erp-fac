import api from '../../../api/api';

export interface CreateLinkRequest {
  usuarioId: string;
  planId: string;
  planName: string;
  amount: number;
  email?: string;
  nome?: string;
  telefone?: string;
}

export interface CreateLinkResponse {
  checkoutUrl: string;
  orderNsu: string;
  pagamentoId: number;
}

export const createPaymentLink = async (data: CreateLinkRequest): Promise<CreateLinkResponse> => {
  const response = await api.post('/api/payments/link', data);
  return response.data;
};

export const checkPaymentStatus = async (data: {
  orderNsu: string;
  transactionNsu?: string;
  slug?: string;
}) => {
  const response = await api.post('/api/payments/check', data);
  return response.data;
};
