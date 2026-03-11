export interface ContaPagar {
  id?: number;
  usuario_id: number;
  fornecedor_id?: number | null;
  descricao: string;
  valor_total: number;
  data_vencimento: Date | string;
  data_pagamento?: Date | string | null;
  status: 'pendente' | 'pago' | 'cancelado' | 'vencido';
  categoria_despesa?: string | null;
  observacao?: string | null;
  criado_em?: Date | string;
  atualizado_em?: Date | string;
}
