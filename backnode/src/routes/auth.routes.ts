import { Router } from 'express';
import { 
  registrar, 
  login, 
  getPerfil 
} from '../controllers/auth.controller';
import { requestPasswordReset, confirmPasswordReset } from '../controllers/passwordreset.controller';
import { authMiddleware } from '../middleware/auth';
import { loggerMiddleware } from '../middleware/logger';

const authRoutes = Router();

authRoutes.use(loggerMiddleware);

authRoutes.post('/registrar', registrar);
authRoutes.post('/login', login);
authRoutes.get('/perfil', authMiddleware, getPerfil);

// Rotas de reset de senha
authRoutes.post('/reset-password/request', requestPasswordReset);
authRoutes.post('/reset-password/confirm', confirmPasswordReset);

export default authRoutes;