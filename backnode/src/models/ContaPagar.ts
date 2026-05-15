export interface ContaPagar {
  id?: number;
  usuario_id?: number;
  fornecedor_id?: number | null;
  descricao: string;
  valor_total: number;
  data_vencimento: Date | string;
  data_pagamento?: Date | string | null;
  status: 'pendente' | 'pago' | 'cancelado' | 'atrasado' | 'vencido';
  categoria_despesa?: string | null;
  observacao?: string | null;
  plano_conta_id?: number | null;
  centro_custo_id?: number | null;
  forma_pagamento_id?: number | null;
  conta_bancaria_id?: number | null;
  pagamento_quitado?: boolean;
  data_compensacao?: Date | string | null;
  parcelamento_recorrencia_ativo?: boolean;
  tipo_parcela?: 'DIVIDIR_VALOR_ENTRE_PARCELAS' | 'MULTIPLICAR_VALOR_PELAS_PARCELAS' | null;
  repeticao?: 'QUINZENAL' | 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL' | null;
  quantidade_parcelas?: number | null;
  data_primeira_parcela?: Date | string | null;
  parcelas?: ContaPagarParcela[];
  criado_em?: Date | string;
  atualizado_em?: Date | string;
}

export interface ContaPagarParcela {
  id?: number;
  usuario_id?: number;
  conta_pagar_id?: number;
  numero_parcela: number;
  data_vencimento: Date | string;
  valor: number;
  forma_pagamento_id: number;
  conta_bancaria_id?: number | null;
  pago?: boolean;
  observacao?: string | null;
  forma_pagamento_nome?: string;
  conta_bancaria_nome?: string;
  criado_em?: Date | string;
  atualizado_em?: Date | string;
}
