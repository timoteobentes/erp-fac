import { Router, Request, Response } from 'express';
import multer from 'multer';
import { emailService } from '../services/email.service';

const emailRoutes = Router();
const upload = multer({ storage: multer.memoryStorage() });

interface SendEmailRequest {
  to: string;
  subject: string;
  message: string;
  cc?: string[];
  bcc?: string[];
}

emailRoutes.post('/send', upload.array('attachments'), async (req: Request, res: Response) => {
  try {
    const { to, subject, message, cc, bcc }: SendEmailRequest = req.body;
    const attachments = req.files as Express.Multer.File[];

    if (!to || !subject || !message) {
      return res.status(400).json({ message: 'To, subject e message são obrigatórios' });
    }

    await emailService.sendEmail({
      to,
      subject,
      htmlContent: message,
      attachments: attachments?.map(file => ({
        content: file.buffer.toString('base64'),
        name: file.originalname
      })),
      cc,
      bcc
    });

    res.json({ message: 'Email enviado com sucesso!' });
  } catch (error: any) {
    console.error('Erro ao enviar email:', error);
    res.status(500).json({ message: `Erro ao enviar email: ${error.message}` });
  }
});

emailRoutes.post('/send-reset-password', async (req: Request, res: Response) => {
  try {
    const { email, nomeUsuario, resetLink } = req.body;

    if (!email || !resetLink) {
      return res.status(400).json({ message: 'Email e resetLink são obrigatórios' });
    }

    await emailService.sendPasswordResetEmail(
      email,
      nomeUsuario || 'usuário',
      resetLink
    );

    res.json({ message: 'Email de reset de senha enviado com sucesso!' });
  } catch (error: any) {
    console.error('Erro ao enviar email de reset:', error);
    res.status(500).json({ message: `Erro ao enviar email: ${error.message}` });
  }
});

export default emailRoutes;