export interface GrupoAcesso {
  id?: number;
  nome: string;
  permissoes: string[];
  descricao: string;
  criado_em?: Date;
  atualizado_em?: Date;
}