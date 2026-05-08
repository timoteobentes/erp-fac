export interface ContaReceber {
  id?: number;
  usuario_id?: number;
  cliente_id?: number | null;
  venda_id?: number | null;
  descricao: string;
  valor_total: number;
  data_vencimento: Date | string;
  data_recebimento?: Date | string | null;
  status: 'pendente' | 'recebido' | 'cancelado' | 'atrasado';
  forma_pagamento?: string | null;
  observacao?: string | null;
  plano_conta_id?: number | null;
  centro_custo_id?: number | null;
  forma_pagamento_id?: number | null;
  conta_bancaria_id?: number | null;
  recebimento_quitado?: boolean;
  data_compensacao?: Date | string | null;
  entidade_tipo?: 'cliente' | 'fornecedor' | 'transportadora' | 'funcionario' | 'outros' | null;
  entidade_id?: number | null;
  data_competencia?: Date | string | null;
  informacoes_complementares?: string | null;
  anexos?: unknown[] | null;
  criado_em?: Date | string;
  atualizado_em?: Date | string;
}
