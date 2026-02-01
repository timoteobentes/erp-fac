// ==========================================
// TABELAS AUXILIARES (Selects do Front)
// ==========================================
export interface Categoria {
  id: number;
  nome: string;
  categoria_pai_id?: number | null;
  ativa: boolean;
}

export interface Marca {
  id: number;
  nome: string;
}

export interface UnidadeMedida {
  id: number;
  sigla: string;     // UN, KG, LT
  descricao: string; // Unidade, Quilograma
  padrao: boolean;
}

// ==========================================
// TABELAS FILHAS (Arrays do Produto)
// ==========================================
export interface ProdutoImagem {
  id?: number;
  // produto_id é injetado pelo backend ao salvar
  url_imagem: string; // URL do Supabase Storage
  principal: boolean;
  ordem: number;
}

export interface ProdutoConversao {
  id?: number;
  unidade_entrada_id: number; // ID da unidade (ex: Caixa)
  fator_conversao: number;    // Ex: 12
  codigo_barras_entrada?: string;
}

export interface ProdutoComposicao {
  id?: number;
  produto_filho_id: number; // ID do produto que compõe o kit
  quantidade: number;
}

// ==========================================
// OBJETO PRINCIPAL (PRODUTO)
// ==========================================
export interface Produto {
  id?: number;
  usuario_id?: number; // Injetado pelo Controller/Auth
  
  // Identificação
  nome: string;
  descricao?: string;
  codigo_interno?: string; // SKU
  codigo_barras?: string;  // EAN
  tipo_item: 'produto' | 'servico' | 'kit';
  situacao: 'ativo' | 'inativo'; // Faltava esse campo!
  
  // Relacionamentos (IDs)
  categoria_id?: number | null;
  marca_id?: number | null;
  unidade_id: number; // Obrigatório (ex: UN)
  fornecedor_padrao_id?: number | null; // ID da tabela CLIENTES
  
  // Precificação
  preco_custo: number;
  margem_lucro: number;
  preco_venda: number;
  preco_promocional?: number | null;
  
  // Estoque
  movimenta_estoque: boolean;
  estoque_atual: number;
  estoque_minimo: number;
  estoque_maximo?: number | null;
  
  // Arrays (Opcionais na listagem, obrigatórios no form completo)
  imagens?: ProdutoImagem[];
  composicao?: ProdutoComposicao[]; // Só usado se tipo_item === 'kit'
  conversoes?: ProdutoConversao[];
  
  // Auditoria (Apenas leitura)
  criado_em?: string;
  atualizado_em?: string;
}