import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

interface RequestWithUser extends Request {
  usuario?: {
    id: number;
  };
  usuarioId?: number;
}

export class DashboardController {
  private service: DashboardService;

  constructor() {
    this.service = new DashboardService();
  }

  getResumo = async (req: RequestWithUser, res: Response) => {
    try {
      const usuarioId = req.usuario?.id || req.usuarioId;
      if (!usuarioId) {
        return res.status(401).json({ message: 'Não autorizado.' });
      }

      const resumo = await this.service.obterResumo(usuarioId);
      res.json(resumo);
    } catch (error: any) {
      console.error('Erro em getResumo:', error);
      res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
    }
  };
}
