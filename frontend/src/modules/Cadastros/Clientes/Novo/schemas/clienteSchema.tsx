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

export const fotoSchema = z.object({
  id: z.string().optional(),
  nome: z.string(),
  url: z.string().optional(),
  arquivo: z.any().optional()
});

export const anexoSchema = z.object({
  id: z.string().optional(),
  nome: z.string(),
  url: z.string().optional(),
  arquivo: z.any().optional()
});

const baseSchema = z.object({
  tipo_cliente: z.enum(["PF", "PJ", "estrangeiro"]),
  situacao: z.string().min(1, "Situacao e obrigatoria").default("ativo"),
  nome: optionalString,
  vendedor_responsavel: optionalString,
  limite_credito: z.coerce.number().min(0).default(0),
  permitir_ultrapassar_limite: z.boolean().default(false),
  observacoes: optionalString,
  enderecos: z.array(enderecoSchema).optional(),
  contatos: z.array(contatoSchema).optional(),
  foto: z.array(fotoSchema).optional(),
  anexos: z.array(anexoSchema).optional()
});

export const novoClienteSchema = z.discriminatedUnion('tipo_cliente', [
  baseSchema.extend({
    tipo_cliente: z.literal('PJ'),
    cnpj: optionalString,
    razao_social: z.string().min(1, "Nome e obrigatorio"),
    nome_fantasia: optionalString,
    inscricao_estadual: optionalString,
    inscricao_municipal: optionalString,
    inscricao_suframa: optionalString,
    responsavel: optionalString,
  }),
  baseSchema.extend({
    tipo_cliente: z.literal('PF'),
    cpf: optionalString,
    rg: optionalString,
    nome: z.string().min(1, "Nome completo e obrigatorio"),
    data_nascimento: optionalString,
    sexo: optionalString
  }),
  baseSchema.extend({
    tipo_cliente: z.literal('estrangeiro'),
    documento: optionalString,
    nome: z.string().min(1, "Nome e obrigatorio"),
    pais_origem: optionalString
  })
]);

export type NovoClienteFormData = z.infer<typeof novoClienteSchema>;
