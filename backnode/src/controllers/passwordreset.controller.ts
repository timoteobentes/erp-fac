import { Request, Response } from 'express';
import { query } from '../config/database';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { hashPassword } from '../utils/passwordUtils';
import { emailService } from '../services/email.service';

// Email service (simplificado - você deve implementar conforme sua necessidade)
const sendEmail = async (to: string, subject: string, html: string) => {
  // Implemente sua lógica de envio de email aqui
  // Usando Brevo, Nodemailer, etc.
  console.log(`Email enviado para ${to}: ${subject}`);
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Verificar se usuário existe
    const result = await query(
      'SELECT id, email, nome_usuario, nome_empresa FROM usuarios WHERE email = $1 AND (status = $2 OR status = $3)',
      [email, 'ativo', 'pendente']
    );

    if (result.rows.length === 0) {
      // Por segurança, não revelamos se o email existe
      return res.status(200).json({ 
        status: 'success', 
        message: 'Se o email existir em nossa base, você receberá um link para redefinição' 
      });
    }

    const user = result.rows[0];
    
    // Gerar token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(token, 10);
    
    // Definir expiração (15 minutos)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Salvar token no banco
    await query(
      `UPDATE usuarios 
        SET reset_password_token = $1, reset_password_expires = $2, atualizado_em = NOW()
        WHERE id = $3`,
      [hashedToken, expiresAt, user.id]
    );

    // Criar link de reset
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/redefinir-senha?token=${token}&email=${encodeURIComponent(email)}`;
    
    // Enviar email usando o serviço
    await emailService.sendPasswordResetEmail(
      email,
      user.nome_usuario || user.nome_empresa || 'usuário',
      resetLink
    );

    res.status(200).json({
      status: 'success',
      message: 'Link de redefinição enviado para o e-mail'
    });
  } catch (error) {
    console.error('Erro ao solicitar reset de senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const confirmPasswordReset = async (req: Request, res: Response) => {
  try {
    const { token, email, newPassword } = req.body;

    // Verificar se o usuário existe
    const result = await query(
      `SELECT id, reset_password_token, reset_password_expires 
        FROM usuarios 
        WHERE email = $1 AND (status = $2 OR status = $3)`,
      [email, 'ativo', 'pendente']
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    const user = result.rows[0];

    // Verificar se o token existe e não expirou
    if (!user.reset_password_token || !user.reset_password_expires) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    if (new Date(user.reset_password_expires) < new Date()) {
      return res.status(400).json({ message: 'Token expirado' });
    }

    // Verificar o token
    const isValid = await bcrypt.compare(token, user.reset_password_token);
    if (!isValid) {
      return res.status(400).json({ message: 'Token inválido' });
    }

    // Hash da nova senha
    const senhaHash = await hashPassword(newPassword);

    // Atualizar senha e limpar tokens
    await query(
      `UPDATE usuarios 
        SET senha = $1, 
            reset_password_token = NULL, 
            reset_password_expires = NULL,
            atualizado_em = NOW()
        WHERE id = $2`,
      [senhaHash, user.id]
    );

    res.status(200).json({
      status: 'success',
      message: 'Senha redefinida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao confirmar reset de senha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};