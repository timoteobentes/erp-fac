export interface MovimentacaoEstoque {
  id?: number;
  usuario_id: number;
  produto_id: number;
  tipo: 'entrada' | 'saida' | 'ajuste';
  quantidade: number;
  saldo_apos: number;
  origem: string;
  observacao?: string;
  criado_em?: Date | string;
}
