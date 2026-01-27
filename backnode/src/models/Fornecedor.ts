export enum TipoFornecedor {
  PF = 'PF',
  PJ = 'PJ',
  ESTRANGEIRO = 'estrangeiro'
}

export enum SituacaoFornecedor {
  ATIVO = 'ativo',
  INATIVO = 'inativo'
}

export enum EnderecoTipo {
  COMERCIAL = 'comercial',
  RESIDENCIAL = 'residencial',
  COBRANCA = 'cobranca',
  ENTREGA = 'entrega'
}

export enum ContatoTipo {
  COMERCIAL = 'comercial',
  FINANCEIRO = 'financeiro',
  TECNICO = 'tecnico',
  COMPRAS = 'compras'
}

// Entidades principais
export interface Fornecedor {
  id: number;
  usuario_id: number;
  tipo_fornecedor: TipoFornecedor;
  situacao: SituacaoFornecedor;
  nome: string;
  email?: string;
  telefone_comercial?: string;
  telefone_celular?: string;
  site?: string;
  responsavel_compras?: string;
  prazo_entrega?: number; // dias
  condicao_pagamento?: string;
  observacoes?: string;
  criado_em: Date;
  atualizado_em: Date;
}

export interface FornecedorPF {
  id: number;
  fornecedor_id: number;
  cpf: string;
  rg?: string;
  nascimento?: Date;
  tipo_contribuinte?: string;
}

export interface FornecedorPJ {
  id: number;
  fornecedor_id: number;
  cnpj: string;
  razao_social: string;
  inscricao_estadual?: string;
  isento: boolean;
  tipo_contribuinte?: string;
  inscricao_municipal?: string;
  inscricao_suframa?: string;
  responsavel: string;
  ramo_atividade?: string;
}

export interface FornecedorEstrangeiro {
  id: number;
  fornecedor_id: number;
  documento?: string;
  pais_origem?: string;
}

export interface EnderecoFornecedor {
  id: number;
  fornecedor_id: number;
  tipo: EnderecoTipo;
  cep?: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  principal: boolean;
  criado_em: Date;
}

export interface ContatoFornecedor {
  id: number;
  fornecedor_id: number;
  tipo: ContatoTipo;
  nome: string;
  valor: string; // email, telefone, etc.
  cargo?: string;
  observacao?: string;
  principal: boolean;
  criado_em: Date;
}

export interface AnexoFornecedor {
  id: number;
  fornecedor_id: number;
  nome: string;
  arquivo: string; // base64
  tipo: string;
  tamanho?: number;
  criado_em: Date;
}

export interface ProdutoServico {
  id: number;
  fornecedor_id: number;
  tipo: 'produto' | 'servico';
  nome: string;
  descricao?: string;
  unidade_medida?: string;
  preco_unitario: number;
  moeda: string;
  estoque_minimo?: number;
  estoque_atual?: number;
  ativo: boolean;
  criado_em: Date;
  atualizado_em: Date;
}

// Request/Response interfaces
export interface NovoFornecedorRequest {
  tipo_fornecedor: TipoFornecedor;
  nome: string;
  email?: string;
  telefone_comercial?: string;
  telefone_celular?: string;
  site?: string;
  responsavel_compras?: string;
  prazo_entrega?: number;
  condicao_pagamento?: string;
  observacoes?: string;
  
  // Dados específicos por tipo
  cpf?: string;
  rg?: string;
  nascimento?: Date;
  cnpj?: string;
  razao_social?: string;
  inscricao_estadual?: string;
  isento?: boolean;
  tipo_contribuinte?: string;
  inscricao_municipal?: string;
  inscricao_suframa?: string;
  responsavel?: string;
  ramo_atividade?: string;
  documento?: string;
  pais_origem?: string;
  
  // Relacionamentos
  enderecos: EnderecoFornecedor[];
  contatos: ContatoFornecedor[];
  produtos_servicos?: ProdutoServico[];
  anexos?: AnexoFornecedor[];
}

export interface FornecedorCompleto {
  fornecedor: Fornecedor & (FornecedorPF | FornecedorPJ | FornecedorEstrangeiro);
  enderecos: EnderecoFornecedor[];
  contatos: ContatoFornecedor[];
  produtos_servicos: ProdutoServico[];
  anexos: AnexoFornecedor[];
}