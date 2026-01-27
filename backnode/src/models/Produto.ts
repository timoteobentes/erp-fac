export interface ProdutoImagem {
  id?: number;
  url_imagem: string;
  ordem: number;
  principal: boolean;
}

export interface ProdutoConversao {
  id?: number;
  unidade_entrada_id: number;
  fator_conversao: number;
  codigo_barras_entrada?: string;
}

export interface ProdutoComposicao {
  id?: number;
  produto_filho_id: number;
  quantidade: number;
}

export interface ProdutoBase {
  id?: number;
  usuario_id: number; // Obrigatório para isolamento
  
  // Dados Básicos
  nome: string;
  descricao?: string;
  codigo_interno?: string;
  codigo_barras?: string;
  tipo_item: 'produto' | 'servico' | 'kit';
  
  // Relacionamentos
  categoria_id?: number;
  marca_id?: number;
  fornecedor_padrao_id?: number;
  
  // Valores
  preco_custo: number;
  margem_lucro: number;
  preco_venda: number;
  preco_promocional?: number;
  
  // Estoque
  movimenta_estoque: boolean;
  estoque_atual: number;
  estoque_minimo: number;
  estoque_maximo?: number;
  unidade_id: number; // ID da tabela unidades_medida
  
  // Fiscal (Obrigatório para NFe)
  ncm: string;
  cest?: string;
  cfop_padrao?: string;
  origem_mercadoria: number; // 0, 1, 2...
  situacao_tributaria?: string; // CSOSN ou CST
  aliquota_icms: number;
  aliquota_ipi: number;
  
  ativo: boolean;
  imagem_capa?: string;
}

export interface NovoProdutoRequest extends Omit<ProdutoBase, 'id' | 'usuario_id'> {
  imagens?: ProdutoImagem[];
  conversoes?: ProdutoConversao[];
  composicao?: ProdutoComposicao[];
}