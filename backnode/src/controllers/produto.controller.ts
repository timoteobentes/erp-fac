import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ProdutoService } from '../services/produto.service';
import { NovoProdutoRequest } from '../models/Produto';

export class ProdutoController {
  private produtoService: ProdutoService;

  constructor() {
    this.produtoService = new ProdutoService();
  }

  criarProduto = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) {
        res.status(401).json({ error: 'Usuário não identificado' });
        return;
      }

      const produtoData: NovoProdutoRequest = req.body;
      
      const novoProdutoId = await this.produtoService.criarProduto(produtoData, usuarioId);

      res.status(201).json({
        message: 'Produto cadastrado com sucesso',
        id: novoProdutoId
      });

    } catch (error: any) {
      console.error('Erro ao criar produto:', error);
      res.status(400).json({ 
        error: 'Erro ao processar requisição',
        details: error.message 
      });
    }
  }

  listarProdutos = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id!;
      const produtos = await this.produtoService.listarProdutos(usuarioId);
      res.json(produtos);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar produtos' });
    }
  }
}