import { Request, Response } from 'express';
import { EstoqueService } from '../services/estoque.service';
import { MovimentacaoEstoque } from '../models/MovimentacaoEstoque';

interface AuthRequest extends Request {
  usuario?: {
    id: number;
  };
}

export class EstoqueController {
  private estoqueService: EstoqueService;

  constructor() {
    this.estoqueService = new EstoqueService();
  }

  // =========================================================================
  // 1. MOVIMENTAR ESTOQUE MANUAL
  // =========================================================================
  movimentarEstoque = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) {
        res.status(401).json({ message: 'Acesso negado. Usuário não autenticado.' });
        return;
      }

      const dados: MovimentacaoEstoque = req.body;
      
      // Validações básicas de entrada
      if (!dados.produto_id || !dados.tipo || dados.quantidade === undefined) {
        res.status(400).json({ success: false, message: 'Dados insuficientes para movimentação.' });
        return;
      }

      // Se for acionado por esta rota, normalmente é 'ajuste_manual' ou algo da tela de edição/listagem
      dados.origem = dados.origem || 'ajuste_manual';

      await this.estoqueService.movimentarEstoque(dados, usuarioId);

      res.status(200).json({
        success: true,
        message: 'Estoque movimentado com sucesso!'
      });

    } catch (error: any) {
      console.error('Erro ao movimentar estoque:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // =========================================================================
  // 2. LISTAR HISTÓRICO
  // =========================================================================
  listarHistorico = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const produtoId = parseInt(req.params.produto_id);

      if (!usuarioId || isNaN(produtoId)) {
        res.status(400).json({ message: 'Dados inválidos.' });
        return;
      }

      const historico = await this.estoqueService.listarHistoricoProduto(produtoId, usuarioId);

      res.status(200).json({
        success: true,
        data: historico
      });

    } catch (error: any) {
      console.error('Erro ao listar histórico de estoque:', error);
      res.status(500).json({ success: false, message: 'Erro interno.' });
    }
  }
}
