import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  usuario?: any;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('🔥 AUTH MIDDLEWARE EXECUTADO:', req.originalUrl);

  let token: string | undefined;

  // Tentar pegar do header Authorization
  const authHeader = req.header('Authorization');
  
  console.log('🔐 Header Authorization recebido:', authHeader); // DEBUG
  
  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else {
      token = authHeader;
    }
  }

  console.log('🔐 Token extraído:', token); // DEBUG

  if (!token) {
    console.log('❌ Token não encontrado'); // DEBUG
    return res.status(401).json({ message: 'Token de acesso não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    console.log('✅ Token decodificado:', decoded); // DEBUG
    
    req.usuario = decoded;
    console.log('✅ Usuário setado no req:', req.usuario); // DEBUG
    
    next();
  } catch (error) {
    console.error('❌ Erro ao verificar token:', error);
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};