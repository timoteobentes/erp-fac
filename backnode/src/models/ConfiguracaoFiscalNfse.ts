export interface ConfiguracaoFiscalNfse {
  id: number;
  usuario_id: number;
  inscricao_municipal?: string;
  codigo_tributacao_nacional?: string;
  codigo_tributacao_municipal?: string;
  cnae?: string;
  cnbs?: string;
  serie_dps?: string;
  atualizado_em?: Date;
}
