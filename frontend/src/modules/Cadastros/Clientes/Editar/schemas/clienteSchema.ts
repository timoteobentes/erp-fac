import { z } from 'zod';

// Sub-schemas
export const enderecoSchema = z.object({
  tipo: z.string().min(1, "Tipo obrigatório"), // comercial, residencial
  cep: z.string().min(8, "CEP inválido"),
  logradouro: z.string().min(1, "Logradouro obrigatório"),
  numero: z.string().min(1, "Número obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Bairro obrigatório"),
  cidade: z.string().min(1, "Cidade obrigatória"),
  uf: z.string().length(2, "UF deve ter 2 letras"),
  pais: z.string().default("Brasil"),
  principal: z.boolean().default(false)
});

export const contatoSchema = z.object({
  tipo: z.string().min(1, "Tipo obrigatório"),
  nome: z.string().min(1, "Nome obrigatório"),
  valor: z.string().min(1, "Contato obrigatório"), // email ou telefone
  cargo: z.string().optional(),
  observacao: z.string().optional(),
  principal: z.boolean().default(false)
});

const anexoSchema = z.object({
  id: z.number().optional(), // Importante para edição (saber se já existe)
  nome: z.string(),
  url: z.string().optional(),
  arquivo: z.any().optional(), // File ou base64
  tipo: z.string().optional()
});

// Schema Base
const baseClienteSchema = z.object({
  tipo_cliente: z.enum(["PF", "PJ", "estrangeiro"]),
  situacao: z.string().default("ativo"),
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido").optional().or(z.literal('')),
  telefone_comercial: z.string().optional(),
  telefone_celular: z.string().optional(),
  site: z.string().optional(),
  vendedor_responsavel: z.string().optional(),
  limite_credito: z.coerce.number().min(0),
  permitir_ultrapassar_limite: z.boolean().default(false),
  foto: z.string().optional(),
  observacoes: z.string().optional(),
  
  // Arrays
  enderecos: z.array(enderecoSchema).min(1, "Adicione pelo menos um endereço"),
  contatos: z.array(contatoSchema).optional(), // Opcional na edição para não travar
  anexos: z.array(anexoSchema).optional()
});

// Extensões
const pfSchema = baseClienteSchema.extend({
  tipo_cliente: z.literal('PF'),
  cpf: z.string().min(11, "CPF obrigatório"),
  rg: z.string().optional(),
  nascimento: z.string().optional(),
  tipo_contribuinte: z.string().optional()
});

const pjSchema = baseClienteSchema.extend({
  tipo_cliente: z.literal('PJ'),
  cnpj: z.string().min(14, "CNPJ obrigatório"),
  razao_social: z.string().min(1, "Razão Social obrigatória"),
  inscricao_estadual: z.string().optional(),
  inscricao_municipal: z.string().optional(),
  inscricao_suframa: z.string().optional(),
  isento: z.boolean().default(false),
  responsavel: z.string().optional(),
  tipo_contribuinte: z.string().optional()
});

const estrangeiroSchema = baseClienteSchema.extend({
  tipo_cliente: z.literal('estrangeiro'),
  documento: z.string().min(1, "Documento obrigatório")
});

// Schema Principal (Discriminated Union)
export const clienteSchema = z.discriminatedUnion('tipo_cliente', [
  pfSchema,
  pjSchema,
  estrangeiroSchema
]);

export type ClienteFormData = z.infer<typeof clienteSchema>;