import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  usuario?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Tentar pegar do header Authorization
  const authHeader = req.header('Authorization');
  
  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else {
      token = authHeader;
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.usuario = decoded;
    
    next();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Erro ao verificar token:', error);
    }
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};