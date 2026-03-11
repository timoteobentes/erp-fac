import { Request, Response } from 'express';
import { PerfilService } from '../services/perfil.service';

export class PerfilController {
  private perfilService: PerfilService;

  constructor() {
    this.perfilService = new PerfilService();
    this.getPerfil = this.getPerfil.bind(this);
    this.updatePerfil = this.updatePerfil.bind(this);
  }

  async getPerfil(req: Request, res: Response) {
    try {
      const usuario_id = (req as any).usuario?.id || (req as any).usuarioId;
      if (!usuario_id) return res.status(401).json({ success: false, message: 'Não autorizado: usuário ID não encontrado' });

      const perfil = await this.perfilService.obterPerfil(usuario_id);
      return res.status(200).json({ success: true, data: perfil });

    } catch (error: any) {
      console.error('Erro ao buscar perfil:', error);
      return res.status(500).json({ success: false, message: error.message || 'Erro interno do servidor' });
    }
  }

  async updatePerfil(req: Request, res: Response) {
    try {
      const usuario_id = (req as any).usuario?.id || (req as any).usuarioId;
      if (!usuario_id) return res.status(401).json({ success: false, message: 'Não autorizado: usuário ID não encontrado' });

      const payload = req.body;
      const result = await this.perfilService.atualizarPerfil(usuario_id, payload);
      
      return res.status(200).json(result);

    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      return res.status(500).json({ success: false, message: error.message || 'Erro interno do servidor' });
    }
  }
}
