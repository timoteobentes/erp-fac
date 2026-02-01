import { z } from 'zod';

// --- Sub-Schemas (Para os Arrays) ---

const imagemSchema = z.object({
  url_imagem: z.string().url("URL da imagem inválida"),
  principal: z.boolean().default(false),
  ordem: z.number().default(0)
});

const composicaoSchema = z.object({
  produto_filho_id: z.coerce.number().min(1, "Selecione um produto"),
  quantidade: z.coerce.number().min(0.001, "Quantidade deve ser maior que zero")
});

const conversaoSchema = z.object({
  unidade_entrada_id: z.coerce.number().min(1, "Selecione a unidade"),
  fator_conversao: z.coerce.number().min(0.001, "Fator deve ser maior que zero"),
  codigo_barras_entrada: z.string().optional()
});

// --- Schema Principal ---

export const novoProdutoSchema = z.object({
  // 1. Identificação
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").nonempty("Nome é obrigatório"),
  codigo_interno: z.string().optional(),
  codigo_barras: z.string().optional(), // EAN
  tipo_item: z.enum(['produto', 'servico', 'kit']),
  situacao: z.enum(['ativo', 'inativo']).default('ativo'),

  // 2. Classificação (Selects)
  // coerce.number() transforma string "1" em number 1. Se vier vazio, transforma em 0 (tratamos no transform)
  categoria_id: z.coerce.number().optional(),
  marca_id: z.coerce.number().optional(),
  fornecedor_padrao_id: z.coerce.number().optional(),

  // 3. Valores
  preco_custo: z.coerce.number().min(0, "Custo não pode ser negativo").default(0),
  margem_lucro: z.coerce.number().optional().default(0),
  preco_venda: z.coerce.number().min(0.01, "Preço de venda é obrigatório"),
  preco_promocional: z.coerce.number().optional().nullable(),

  // 4. Estoque
  movimenta_estoque: z.boolean().default(true),
  estoque_atual: z.coerce.number().default(0),
  estoque_minimo: z.coerce.number().default(0),
  estoque_maximo: z.coerce.number().optional().nullable(),
  
  // Unidade é OBRIGATÓRIA
  unidade_id: z.coerce.number({ error: "Unidade é obrigatória" }).min(1, "Selecione uma unidade"),

  // 5. Fiscal (Opcionais no cadastro simples, mas recomendados)
  ncm: z.string().optional(), // Backend valida se obrigatório dependendo da regra
  cest: z.string().optional(),
  origem_mercadoria: z.coerce.number().optional(),
  situacao_tributaria: z.string().optional(),

  // 6. Arrays e Listas
  imagens: z.array(imagemSchema).optional().default([]),
  composicao: z.array(composicaoSchema).optional().default([]),
  conversoes: z.array(conversaoSchema).optional().default([]),
})
// --- Validações Cruzadas (Refine) ---
.superRefine((data, ctx) => {
  
  // Regra: Se for KIT, precisa ter composição
  if (data.tipo_item === 'kit' && data.composicao.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Um Kit deve conter pelo menos um item na composição.",
      path: ["composicao"] // Aponta o erro para o campo composição
    });
  }

  // Regra: Se movimenta estoque, NCM é fortemente recomendado (warning ou erro dependendo do rigor)
  if (data.movimenta_estoque && (!data.ncm || data.ncm.length < 2)) {
    // Aqui deixei opcional, mas se quiser bloquear:
    // ctx.addIssue({ code: z.ZodIssueCode.custom, message: "NCM é obrigatório para produtos estocáveis", path: ["ncm"] });
  }
});

export type NovoProdutoFormData = z.infer<typeof novoProdutoSchema>;