export interface ContaReceber {
  id?: number;
  usuario_id: number;
  cliente_id?: number | null;
  venda_id?: number | null;
  descricao: string;
  valor_total: number;
  data_vencimento: Date | string;
  data_recebimento?: Date | string | null;
  status: 'pendente' | 'recebido' | 'cancelado' | 'vencido'; // 'vencido' pode ser computado, mas deixamos aqui pro flexibilidade
  forma_pagamento?: string | null;
  observacao?: string | null;
  criado_em?: Date | string;
  atualizado_em?: Date | string;
}
