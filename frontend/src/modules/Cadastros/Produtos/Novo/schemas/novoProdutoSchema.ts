import { z } from 'zod';

export const novoProdutoSchema = z.object({
  // --- Identificação ---
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  codigo_interno: z.string().optional(),
  codigo_barras: z.string().optional(), // EAN
  tipo_item: z.enum(['produto', 'servico', 'kit']),
  
  // --- Classificação (Selects) ---
  categoria_id: z.coerce.number().optional(),
  marca_id: z.coerce.number().optional(),

  // --- Valores (Convertendo string para number) ---
  preco_custo: z.coerce.number().min(0, "Custo não pode ser negativo").optional().default(0),
  margem_lucro: z.coerce.number().optional().default(0),
  preco_venda: z.coerce.number().min(0.01, "Preço de venda é obrigatório"),
  preco_promocional: z.coerce.number().optional(),

  // --- Estoque ---
  movimenta_estoque: z.boolean().default(true),
  estoque_atual: z.coerce.number().default(0),
  estoque_minimo: z.coerce.number().default(0),
  unidade_id: z.coerce.number({ error: "Unidade é obrigatória" }).min(1, "Selecione uma unidade"),

  // --- Fiscal (O Coração da NFe) ---
  ncm: z.string().min(8, "NCM deve ter 8 dígitos").transform(val => val.replace(/\D/g, '')),
  cest: z.string().optional(),
  origem_mercadoria: z.coerce.number().default(0), // 0 - Nacional
  cfop_padrao: z.string().optional(), // Ex: 5102
  aliquota_icms: z.coerce.number().optional(),
  
  ativo: z.boolean().default(true),
  observacoes: z.string().optional()
});

export type NovoProdutoForm = z.infer<typeof novoProdutoSchema>;