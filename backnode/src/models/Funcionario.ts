export interface Funcionario {
  id?: number;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  salario: number;
  data_admissao: Date;
  ativo: boolean;
  criado_em?: Date;
  atualizado_em?: Date;
}