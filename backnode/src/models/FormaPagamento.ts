export interface FormaPagamento {
  id?: number;
  usuario_id: number;
  nome: string;
  conta_bancaria_id: number;
  disponivel_em: string;
  confirmacao_automatica: string;
  numero_maximo_parcelas: number;
  intervalo_parcelas_dias: number;
  primeira_parcela_dias: number;
  taxa_banco: number;
  taxa_operadora: number;
  juros_multa: number;
  juros_mora: number;
  modalidade: string;
  conta_bancaria_nome?: string;
  criado_em?: Date | string;
  atualizado_em?: Date | string;
}
