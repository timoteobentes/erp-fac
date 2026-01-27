import { z } from 'zod';

export const enderecoSchema = z.object({
  tipo: z.string().min(1, "Selecione o tipo"),
  cep: z.string().min(8, "CEP inválido"),
  logradouro: z.string().min(1, "Logradouro obrigatório"),
  numero: z.string().min(1, "Número obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(1, "Bairro obrigatório"),
  cidade: z.string().min(1, "Cidade obrigatória"),
  uf: z.string().length(2, "UF inválida"),
  pais: z.string().default("Brasil"),
  principal: z.boolean().default(false)
});

export const contatoSchema = z.object({
  tipo: z.string().min(1, "Selecione o tipo"),
  nome: z.string().min(1, "Nome obrigatório"),
  valor: z.string().min(1, "Contato obrigatório"),
  cargo: z.string().optional(),
  observacao: z.string().optional(),
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
  situacao: z.string().default("ativo"),
  nome: z.string(),
  vendedor_responsavel: z.string().optional(),
  limite_credito: z.coerce.number().min(0).default(0),
  permitir_ultrapassar_limite: z.boolean().default(false),
  observacoes: z.string().optional(),
  // Arrays
  enderecos: z.array(enderecoSchema).min(1, "Adicione pelo menos um endereço"),
  contatos: z.array(contatoSchema).min(1, "Adicione pelo menos um contato"),
  foto: z.array(fotoSchema).optional(),
  anexos: z.array(anexoSchema).optional()
});

export const novoClienteSchema = z.discriminatedUnion('tipo_cliente', [
  // Pessoa Jurídica
  baseSchema.extend({
    tipo_cliente: z.literal('PJ'),
    cnpj: z.string().min(14, "CNPJ incompleto"),
    razao_social: z.string().min(1, "Razão Social é obrigatória"),
    nome_fantasia: z.string().min(1, "Nome Fantasia é obrigatório"),
    inscricao_estadual: z.string().optional(),
    inscricao_municipal: z.string().optional(),
    inscricao_suframa: z.string().optional(),
    responsavel: z.string().optional(),
  }),
  // Pessoa Física
  baseSchema.extend({
    tipo_cliente: z.literal('PF'),
    cpf: z.string().min(11, "CPF incompleto"),
    rg: z.string().optional(),
    nome: z.string().min(1, "Nome completo é obrigatório"),
    data_nascimento: z.string().optional(),
    sexo: z.string().optional()
  }),
  // Estrangeiro
  baseSchema.extend({
    tipo_cliente: z.literal('estrangeiro'),
    documento: z.string().min(1, "Documento/Passport é obrigatório"),
    nome: z.string().min(1, "Nome é obrigatório"),
    pais_origem: z.string().min(1, "País é obrigatório")
  })
]);

export type NovoClienteFormData = z.infer<typeof novoClienteSchema>;