import { z } from 'zod';

// --- Sub-Schemas ---
const imagemSchema = z.object({
  url_imagem: z.string().optional(), // Deixei opcional para evitar erro se vier vazio na edição
  principal: z.boolean().default(false),
  ordem: z.number().default(0)
});

const composicaoSchema = z.object({
  produto_filho_id: z.coerce.number().min(1, "Selecione um produto"),
  quantidade: z.coerce.number().min(0.001, "Quantidade inválida"),
  // Campos virtuais para exibição (não salvos no banco, mas úteis no form)
  custo_unitario: z.number().optional(), 
  unidade_nome: z.string().optional()
});

const conversaoSchema = z.object({
  unidade_entrada_id: z.coerce.number().min(1, "Selecione a unidade"),
  fator_conversao: z.coerce.number().min(0.001, "Fator deve ser maior que zero"),
  codigo_barras_entrada: z.string().optional()
});

// --- Schema Principal ---
export const novoProdutoSchema = z.object({
  // 1. Identificação
  nome: z.string().min(3, "Mínimo 3 caracteres").nonempty("Nome é obrigatório"),
  codigo_interno: z.string().optional(),
  codigo_barras: z.string().optional(),
  tipo_item: z.enum(['produto', 'servico', 'kit']),
  situacao: z.enum(['ativo', 'inativo']).default('ativo'),

  // 2. Classificação
  categoria_id: z.coerce.number().optional(),
  marca_id: z.coerce.number().optional(),
  
  // 3. Unidade (Obrigatória)
  unidade_id: z.coerce.number({ error: "Obrigatório" }).min(1, "Selecione uma unidade"),

  // [cite_start]// 4. Detalhes (Novos Campos) [cite: 54, 134]
  peso: z.coerce.number().optional().default(0),
  largura: z.coerce.number().optional().default(0),
  altura: z.coerce.number().optional().default(0),
  comprimento: z.coerce.number().optional().default(0),
  
  vendido_separadamente: z.boolean().optional().default(true),
  comercializavel_pdv: z.boolean().optional().default(true),
  produto_ativo: z.boolean().optional().default(true), // Redundante com 'situacao', mas pedido no layout
  comissao: z.coerce.number().optional().default(0),

  // [cite_start]// 5. Valores (Novos Campos de Custo Detalhado) [cite: 122, 146]
  preco_custo: z.coerce.number().min(0).default(0),
  despesas_acessorias: z.coerce.number().default(0),
  outras_despesas: z.coerce.number().default(0),
  // custo_final é calculado, não necessariamente salvo, mas pode ir no payload
  
  margem_lucro: z.coerce.number().default(0), // Lucro Utilizado
  lucro_sugerido: z.coerce.number().optional(), // Apenas visual/calculo
  
  preco_venda: z.coerce.number().min(0.01, "Preço de venda obrigatório"),
  preco_promocional: z.coerce.number().optional().nullable(),

  // 6. Estoque
  movimenta_estoque: z.boolean().default(true),
  estoque_atual: z.coerce.number().default(0),
  estoque_minimo: z.coerce.number().default(0),
  estoque_maximo: z.coerce.number().optional().nullable(),

  // 7. Relacionamentos
  fornecedor_padrao_id: z.coerce.number().optional(), // Aba Fornecedores
  
  // 8. Fiscal
  ncm: z.string().optional(),
  cest: z.string().optional(),
  origem_mercadoria: z.coerce.number().optional(),
  situacao_tributaria: z.string().optional(),

  // Arrays
  imagens: z.array(imagemSchema).optional().default([]),
  composicao: z.array(composicaoSchema).optional().default([]),
  conversoes: z.array(conversaoSchema).optional().default([]),
})
.superRefine((data, ctx) => {
  if (data.tipo_item === 'kit' && data.composicao.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Um Kit deve conter itens na composição.",
      path: ["composicao"]
    });
  }
});

export type NovoProdutoFormData = z.infer<typeof novoProdutoSchema>;