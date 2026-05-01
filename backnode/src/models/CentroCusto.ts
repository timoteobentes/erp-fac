export interface CentroCusto {
  id?: number;
  usuario_id: number;
  nome: string;
  status: "ATIVO" | "INATIVO";
  criado_em?: Date | string;
  atualizado_em?: Date | string;
}
