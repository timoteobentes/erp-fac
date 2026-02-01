import { Request, Response } from 'express';
import { ProdutoService } from '../services/produto.service';
import { Produto } from '../models/Produto';
import { ProdutoFiltros } from '../repositories/ProdutoRepository';

// Interface para garantir que o request tenha o usuário (Middleware de Auth)
interface AuthRequest extends Request {
  usuario?: {
    id: number;
  };
}

export class ProdutoController {
  private produtoService: ProdutoService;

  constructor() {
    this.produtoService = new ProdutoService();
  }

  // =========================================================================
  // 1. CRIAR PRODUTO
  // =========================================================================
  criar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) {
        res.status(401).json({ message: 'Acesso negado. Usuário não autenticado.' });
        return;
      }

      const dados: Produto = req.body;

      // O Service já faz sanitização e validação (throw Error se falhar)
      const novoId = await this.produtoService.criarProduto(dados, usuarioId);

      res.status(201).json({
        success: true,
        message: 'Produto cadastrado com sucesso!',
        id: novoId
      });

    } catch (error: any) {
      console.error('Erro ao criar produto:', error);
      // Se for erro de validação (regras de negócio), devolve 400
      // Se for erro de banco/sistema, o ideal seria 500, mas aqui simplificamos
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // =========================================================================
  // 2. ATUALIZAR PRODUTO
  // =========================================================================
  atualizar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);

      if (!usuarioId || isNaN(id)) {
        res.status(400).json({ message: 'Dados inválidos.' });
        return;
      }

      const dados: Produto = req.body;
      await this.produtoService.atualizarProduto(id, dados, usuarioId);

      res.status(200).json({
        success: true,
        message: 'Produto atualizado com sucesso!'
      });

    } catch (error: any) {
      if (error.message === 'Produto não encontrado.') {
        res.status(404).json({ success: false, message: error.message });
      } else {
        console.error('Erro ao atualizar produto:', error);
        res.status(400).json({ success: false, message: error.message });
      }
    }
  }

  // =========================================================================
  // 3. EXCLUIR PRODUTO
  // =========================================================================
  excluir = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);

      if (!usuarioId || isNaN(id)) {
        res.status(400).json({ message: 'Dados inválidos.' });
        return;
      }

      await this.produtoService.excluirProduto(id, usuarioId);

      res.status(200).json({
        success: true,
        message: 'Produto excluído com sucesso.'
      });

    } catch (error: any) {
      if (error.message === 'Produto não encontrado.') {
        res.status(404).json({ success: false, message: error.message });
      } else {
        console.error('Erro ao excluir produto:', error);
        res.status(500).json({ success: false, message: 'Erro ao excluir produto.' });
      }
    }
  }

  // =========================================================================
  // 4. BUSCAR POR ID (Detalhes)
  // =========================================================================
  buscarPorId = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);

      if (!usuarioId || isNaN(id)) {
        res.status(400).json({ message: 'Dados inválidos.' });
        return;
      }

      const produto = await this.produtoService.buscarProdutoPorId(id, usuarioId);

      res.status(200).json({
        success: true,
        data: produto
      });

    } catch (error: any) {
      if (error.message === 'Produto não encontrado.') {
        res.status(404).json({ success: false, message: error.message });
      } else {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({ success: false, message: 'Erro interno.' });
      }
    }
  }

  // =========================================================================
  // 5. LISTAR (Com Filtros e Paginação)
  // =========================================================================
  listar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) {
        res.status(401).json({ message: 'Acesso negado.' });
        return;
      }

      // Paginação
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Filtros
      const filtros: ProdutoFiltros = {
        termo: req.query.termo as string,
        situacao: req.query.situacao as string,
        tipo_item: req.query.tipo_item as string,
        categoria_id: req.query.categoria_id ? parseInt(req.query.categoria_id as string) : undefined,
        marca_id: req.query.marca_id ? parseInt(req.query.marca_id as string) : undefined,
      };

      const resultado = await this.produtoService.listarProdutos(usuarioId, filtros, { page, limit });

      res.status(200).json({
        success: true,
        data: resultado.produtos,
        meta: {
          total: resultado.total,
          page,
          limit,
          totalPages: Math.ceil(resultado.total / limit)
        }
      });

    } catch (error: any) {
      console.error('Erro ao listar produtos:', error);
      res.status(500).json({ success: false, message: 'Erro ao listar produtos.' });
    }
  }

  // =========================================================================
  // 6. DADOS AUXILIARES (Para o Form de Cadastro)
  // =========================================================================
  obterDadosAuxiliares = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) {
        res.status(401).json({ message: 'Acesso negado.' });
        return;
      }

      const auxiliares = await this.produtoService.obterDadosAuxiliares(usuarioId);

      res.status(200).json({
        success: true,
        data: auxiliares // Retorna { categorias, marcas, unidades }
      });

    } catch (error: any) {
      console.error('Erro ao obter dados auxiliares:', error);
      res.status(500).json({ success: false, message: 'Erro ao carregar listas de apoio.' });
    }
  }
}