import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const isolamentoMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const usuarioId = req.usuario?.id;
  
  if (!usuarioId) {
    console.log('❌ Isolamento: Usuário não autenticado');
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  // Adicionar usuario_id a todas as requisições para garantir isolamento
  req.usuarioId = usuarioId;
  
  console.log(`🔒 Isolamento: Usuário ${usuarioId} acessando ${req.method} ${req.path}`);
  next();
};

// Extender a interface AuthRequest
declare global {
  namespace Express {
    interface Request {
      usuarioId?: number;
    }
  }
}