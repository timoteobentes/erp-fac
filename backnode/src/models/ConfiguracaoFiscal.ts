export interface ConfiguracaoFiscal {
  id?: number;
  usuario_id: number;
  inscricao_estadual?: string | null;
  regime_tributario?: 'simples_nacional' | 'regime_normal' | null;
  csc_id?: string | null;
  csc_alfanumerico?: string | null;
  certificado_nome_arquivo?: string | null;
  certificado_base64?: string | null;
  certificado_senha?: string | null;
  ambiente_sefaz?: 'homologacao' | 'producao' | null;
  atualizado_em?: Date;
}
