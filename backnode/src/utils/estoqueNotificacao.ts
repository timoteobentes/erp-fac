import { notificacaoService } from '../services/notificacao.service';

interface ProdutoEstoqueMinimo {
  id: number;
  nome?: string | null;
  codigo_interno?: string | null;
  estoque_minimo?: number | string | null;
}

interface AlertaEstoqueMinimoParams {
  usuarioId: number;
  produto: ProdutoEstoqueMinimo;
  estoqueAnterior: number;
  estoqueAtual: number;
  origem: string;
  movimentoTipo?: string;
}

export async function notificarEstoqueMinimoSeNecessario(params: AlertaEstoqueMinimoParams): Promise<void> {
  const estoqueMinimo = Number(params.produto.estoque_minimo || 0);
  const estoqueAnterior = Number(params.estoqueAnterior);
  const estoqueAtual = Number(params.estoqueAtual);

  if (!Number.isFinite(estoqueMinimo) || !Number.isFinite(estoqueAnterior) || !Number.isFinite(estoqueAtual)) {
    return;
  }

  if (estoqueMinimo <= 0 || estoqueAtual > estoqueMinimo || estoqueAnterior <= estoqueMinimo) {
    return;
  }

  const nomeProduto = params.produto.nome || `Produto #${params.produto.id}`;

  try {
    await notificacaoService.criar({
      usuario_id: params.usuarioId,
      titulo: 'Estoque minimo atingido',
      mensagem: `O produto ${nomeProduto} atingiu o estoque minimo (${estoqueMinimo}). Saldo atual: ${estoqueAtual}. Renove o estoque.`,
      tipo: 'estoque',
      origem: params.origem,
      link: '/estoque',
      metadados: {
        produto_id: params.produto.id,
        produto_nome: nomeProduto,
        codigo_interno: params.produto.codigo_interno || null,
        estoque_anterior: estoqueAnterior,
        estoque_atual: estoqueAtual,
        estoque_minimo: estoqueMinimo,
        movimento_tipo: params.movimentoTipo || null
      }
    });
  } catch (error) {
    console.error('[EstoqueNotificacao] Falha ao criar alerta de estoque minimo:', error);
  }
}
