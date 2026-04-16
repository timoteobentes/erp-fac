import { Request, Response } from 'express';
import { EstoqueService } from '../services/estoque.service';
import { MovimentacaoEstoque } from '../models/MovimentacaoEstoque';
import { EstoqueRepository } from '../repositories/EstoqueRepository';

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

  // =========================================================================
  // 3. LISTAR HISTÓRICO GLOBAL
  // =========================================================================
  listarHistoricoGlobal = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) {
        res.status(401).json({ message: 'Acesso negado. Usuário não autenticado.' });
        return;
      }

      const estoqueRepository = new EstoqueRepository();
      const historico = await estoqueRepository.listarHistoricoGlobal(usuarioId);

      res.status(200).json({
        success: true,
        data: historico
      });

    } catch (error: any) {
      console.error('Erro ao listar histórico global de estoque:', error);
      res.status(500).json({ success: false, message: 'Erro interno.' });
    }
  }
  // =========================================================================
  // 4. EXPORTAR HISTÓRICO GLOBAL
  // =========================================================================
  exportarMovimentacoes = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) {
        res.status(401).json({ message: 'Acesso negado.' });
        return;
      }

      const formato = (req.query.formato as 'csv' | 'xlsx' | 'pdf') || 'csv';

      const bufferOrString = await this.estoqueService.exportarMovimentacoes(usuarioId, { formato });
      const filename = `relatorio_movimentacoes_estoque_${new Date().toISOString().split('T')[0]}`;

      if (formato === 'csv') {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
        res.send(bufferOrString);
      } else if (formato === 'xlsx') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
        res.send(bufferOrString);
      } else if (formato === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
        res.send(bufferOrString);
      }
    } catch (error: any) {
      console.error('Erro na exportação do histórico de estoque:', error);
      res.status(500).json({ success: false, message: 'Erro ao gerar arquivo de exportação.' });
    }
  }
}

