export interface Venda {
  id?: number;
  usuario_id: number;
  cliente_id?: number | null;
  data_venda?: Date;
  valor_bruto: number;
  desconto: number;
  valor_total: number;
  forma_pagamento: 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | string;
  status: 'concluida' | 'cancelada';
  chave_acesso?: string;
  numero_nfe?: string;
  serie_nfe?: number;
  protocolo?: string;
  xml_autorizado?: string;
  status_sefaz?: 'pendente' | 'autorizado' | 'rejeitado' | string;
  criado_em?: Date;
}

export interface ItemVenda {
  id?: number;
  venda_id?: number;
  produto_id: number;
  quantidade: number;
  valor_unitario: number;
  valor_total: number;
}
