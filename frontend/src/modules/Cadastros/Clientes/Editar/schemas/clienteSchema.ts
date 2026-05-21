import { z } from 'zod';

const optionalString = z.preprocess(
  (value) => value === null ? undefined : value,
  z.string().optional()
);

export const enderecoSchema = z.object({
  tipo: optionalString,
  cep: optionalString,
  logradouro: optionalString,
  numero: optionalString,
  complemento: optionalString,
  bairro: optionalString,
  cidade: optionalString,
  uf: optionalString,
  pais: z.string().default("Brasil"),
  principal: z.boolean().default(false)
});

export const contatoSchema = z.object({
  tipo: optionalString,
  nome: optionalString,
  valor: optionalString,
  cargo: optionalString,
  observacao: optionalString,
  principal: z.boolean().default(false)
});

const anexoSchema = z.object({
  id: z.number().optional(),
  nome: z.string(),
  url: z.string().optional(),
  arquivo: z.any().optional(),
  tipo: z.string().optional()
});

const baseClienteSchema = z.object({
  tipo_cliente: z.enum(["PF", "PJ", "estrangeiro"]),
  situacao: z.string().min(1, "Situacao e obrigatoria").default("ativo"),
  nome: z.string().min(1, "Nome e obrigatorio"),
  email: z.preprocess((value) => value === null ? '' : value, z.string().email("E-mail invalido").optional().or(z.literal(''))),
  telefone_comercial: optionalString,
  telefone_celular: optionalString,
  site: optionalString,
  vendedor_responsavel: optionalString,
  limite_credito: z.coerce.number().min(0),
  permitir_ultrapassar_limite: z.boolean().default(false),
  foto: optionalString,
  observacoes: optionalString,
  enderecos: z.array(enderecoSchema).optional(),
  contatos: z.array(contatoSchema).optional(),
  anexos: z.array(anexoSchema).optional()
});

const pfSchema = baseClienteSchema.extend({
  tipo_cliente: z.literal('PF'),
  cpf: optionalString,
  rg: optionalString,
  nascimento: optionalString,
  tipo_contribuinte: optionalString
});

const pjSchema = baseClienteSchema.extend({
  tipo_cliente: z.literal('PJ'),
  cnpj: optionalString,
  razao_social: z.string().min(1, "Nome e obrigatorio"),
  inscricao_estadual: optionalString,
  inscricao_municipal: optionalString,
  inscricao_suframa: optionalString,
  isento: z.boolean().default(false),
  responsavel: optionalString,
  tipo_contribuinte: optionalString
});

const estrangeiroSchema = baseClienteSchema.extend({
  tipo_cliente: z.literal('estrangeiro'),
  documento: optionalString
});

export const clienteSchema = z.discriminatedUnion('tipo_cliente', [
  pfSchema,
  pjSchema,
  estrangeiroSchema
]);

export type ClienteFormData = z.infer<typeof clienteSchema>;
