export interface Transportadora {
  id?: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cnpj: string;
  ativo: boolean;
  criado_em?: Date;
  atualizado_em?: Date;
}