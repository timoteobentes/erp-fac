import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { notificacaoService } from '../services/notificacao.service';

const parseIds = (ids: any): number[] => Array.isArray(ids)
  ? ids.map(Number).filter(Boolean)
  : [];

export class NotificacaoController {
  listar = async (req: AuthRequest, res: Response) => {
    try {
      const usuarioId = Number(req.usuario?.id);
      const resultado = await notificacaoService.listar(
        usuarioId,
        {
          titulo: req.query.titulo as string,
          lida: req.query.lida as any,
          data_inicio: req.query.data_inicio as string,
          data_fim: req.query.data_fim as string
        },
        Number(req.query.pagina || 1),
        Number(req.query.limite || 10)
      );
      res.json(resultado);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao listar notificações' });
    }
  };

  resumo = async (req: AuthRequest, res: Response) => {
    try {
      const resultado = await notificacaoService.resumo(Number(req.usuario?.id), Number(req.query.limite || 5));
      res.json(resultado);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao buscar notificações' });
    }
  };

  criar = async (req: AuthRequest, res: Response) => {
    try {
      const notificacao = await notificacaoService.criar({
        ...req.body,
        usuario_id: Number(req.usuario?.id)
      });
      res.status(201).json(notificacao);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Erro ao criar notificação' });
    }
  };

  marcar = async (req: AuthRequest, res: Response) => {
    try {
      const ids = parseIds(req.body.ids);
      const resultado = req.body.todas
        ? await notificacaoService.marcarTodas(Number(req.usuario?.id), Boolean(req.body.lida))
        : await notificacaoService.marcar(Number(req.usuario?.id), ids, Boolean(req.body.lida));
      res.json({ notificacoes: resultado });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Erro ao atualizar notificações' });
    }
  };

  excluir = async (req: AuthRequest, res: Response) => {
    try {
      const total = await notificacaoService.excluir(Number(req.usuario?.id), parseIds(req.body.ids));
      res.json({ total });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Erro ao excluir notificações' });
    }
  };

  enviarEmail = async (req: AuthRequest, res: Response) => {
    try {
      const resultado = await notificacaoService.enviarPorEmail(Number(req.usuario?.id), parseIds(req.body.ids));
      res.json(resultado);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Erro ao enviar notificações por e-mail' });
    }
  };

  receberWebhook = async (req: AuthRequest, res: Response) => {
    try {
      const token = req.header('x-webhook-token');
      if (process.env.WEBHOOK_NOTIFICACOES_TOKEN && token !== process.env.WEBHOOK_NOTIFICACOES_TOKEN) {
        res.status(401).json({ error: 'Token de webhook inválido' });
        return;
      }

      const resultado = await notificacaoService.receberWebhook(req.body);
      res.status(202).json(resultado);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Erro ao processar webhook' });
    }
  };
}
