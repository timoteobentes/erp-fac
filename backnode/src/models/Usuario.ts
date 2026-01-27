export interface Usuario {
  id?: number;
  email: string;
  senha_hash: string;
  nome: string;
  ativo: boolean;
  grupo_acesso_id: number;
  criado_em?: Date;
  atualizado_em?: Date;
}