import { Request, Response } from 'express';
import { CategoriaService } from '../services/categoria.service';

interface AuthRequest extends Request {
  usuario?: {
    id: number;
  };
}

export class CategoriaController {
  private service = new CategoriaService();

  criar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) {
        res.status(401).json({ success: false, message: 'Acesso negado.' });
        return;
      }

      const id = await this.service.criar(req.body, usuarioId);
      res.status(201).json({ success: true, id, message: 'Categoria cadastrada com sucesso.' });
    } catch (error: any) {
      res.status(error.message?.includes('Ja existe') ? 409 : 400).json({ success: false, message: error.message });
    }
  };

  listar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) {
        res.status(401).json({ success: false, message: 'Acesso negado.' });
        return;
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const resultado = await this.service.listar(usuarioId, { nome: req.query.nome as string }, { page, limit });

      res.json({
        success: true,
        data: resultado.categorias,
        meta: {
          total: resultado.total,
          page,
          limit,
          totalPages: Math.ceil(resultado.total / limit)
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Erro ao listar categorias.' });
    }
  };

  buscarPorId = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = Number(req.params.id);
      if (!usuarioId || !id) {
        res.status(400).json({ success: false, message: 'Dados invalidos.' });
        return;
      }

      const categoria = await this.service.buscarPorId(id, usuarioId);
      res.json({ success: true, data: categoria });
    } catch (error: any) {
      res.status(error.message?.includes('nao encontrada') ? 404 : 500).json({ success: false, message: error.message });
    }
  };

  atualizar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = Number(req.params.id);
      if (!usuarioId || !id) {
        res.status(400).json({ success: false, message: 'Dados invalidos.' });
        return;
      }

      await this.service.atualizar(id, req.body, usuarioId);
      res.json({ success: true, message: 'Categoria atualizada com sucesso.' });
    } catch (error: any) {
      const status = error.message?.includes('nao encontrada') ? 404 : error.message?.includes('Ja existe') ? 409 : 400;
      res.status(status).json({ success: false, message: error.message });
    }
  };

  excluir = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = Number(req.params.id);
      if (!usuarioId || !id) {
        res.status(400).json({ success: false, message: 'Dados invalidos.' });
        return;
      }

      await this.service.excluir(id, usuarioId);
      res.json({ success: true, message: 'Categoria excluida com sucesso.' });
    } catch (error: any) {
      res.status(error.message?.includes('nao encontrada') ? 404 : 500).json({ success: false, message: error.message });
    }
  };
}
