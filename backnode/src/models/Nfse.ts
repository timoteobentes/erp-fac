export interface Nfse {
  id?: number;
  usuario_id: number;
  cliente_id: number;
  servico_id: number;
  competencia?: string;
  valor_servico: number;
  desconto: number;
  valor_total: number;
  aliquota_iss: number;
  valor_iss: number;
  status: 'rascunho' | 'emitida' | 'rejeitada' | 'cancelada' | 'processando_sefaz';
  xml_autorizado?: string;
  chave_acesso?: string;
  mensagem_retorno?: string;
  criado_em?: Date;
  atualizado_em?: Date;
  
  // Virtual properties for UI
  cliente_nome?: string;
  servico_nome?: string;
}

export type CreateNfseDTO = Omit<Nfse, 'id' | 'usuario_id' | 'valor_total' | 'valor_iss' | 'status' | 'xml_autorizado' | 'criado_em' | 'atualizado_em'>;
