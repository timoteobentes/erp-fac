export interface NovoClienteDTO {
  tipo_cliente: 'PF' | 'PJ' | 'estrangeiro';
  situacao: string;
  nome: string; // Nome (PF) ou Razão Social (PJ)
  
  // Opcionais (PJ)
  nome_fantasia?: string;
  cnpj?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  inscricao_suframa?: string;
  isento_ie?: boolean;
  responsavel?: string; // Contato na empresa

  // Opcionais (PF)
  cpf?: string;
  rg?: string;
  data_nascimento?: string | Date;
  sexo?: string;

  // Opcionais (Estrangeiro)
  documento?: string;
  pais_origem?: string;
  
  // Contato Principal e Config
  email: string;
  telefone_comercial?: string;
  telefone_celular?: string;
  site?: string;
  vendedor_responsavel?: string;
  
  // Financeiro
  limite_credito?: number;
  permitir_ultrapassar_limite?: boolean;
  
  // Extras
  observacoes?: string;
  foto?: any; // URL da foto se já tiver feito upload

  // Arrays
  enderecos: Array<{
    tipo: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    pais?: string;
    principal?: boolean;
  }>;
  contatos: Array<{
    tipo: string;
    nome: string;
    valor: string;
    cargo?: string;
    observacao?: string;
    principal?: boolean;
  }>;
  anexos: Array<{
    nome: string;
    url?: string;
    tipo?: string;
  }>;
}