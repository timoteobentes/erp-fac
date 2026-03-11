export interface Usuario {
  id?: number;
  email: string;
  senha?: string;
  nome_usuario?: string;
  nome_completo?: string | null;
  cpf?: string | null;
  cnpj?: string | null;
  nome_empresa?: string | null;
  telefone?: string | null;
  cidade?: string | null;
  estado?: string | null;
  status?: string;
  grupo_acesso_id?: number | null;
  criado_em?: Date;
  atualizado_em?: Date;
}