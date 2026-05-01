export interface PlanoConta {
  id?: number;
  usuario_id: number;
  conta_mae: string;
  nome: string;
  criado_em?: Date | string;
  atualizado_em?: Date | string;
}
