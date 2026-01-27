import * as Brevo from '@getbrevo/brevo';
import * as fs from 'fs';

export interface EmailAttachment {
  content: string; // Base64 encoded
  name: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  htmlContent: string;
  attachments?: EmailAttachment[];
  cc?: string[];
  bcc?: string[];
}

export class EmailService {
  private apiInstance: Brevo.TransactionalEmailsApi;
  private senderEmail: string;
  private senderName: string;

  constructor() {
    // Configurar a API do Brevo
    this.apiInstance = new Brevo.TransactionalEmailsApi();
    this.apiInstance.setApiKey(0, process.env.BREVO_API_KEY || '');
    
    // Configurar remetente
    this.senderEmail = process.env.BREVO_SENDER_EMAIL || 'facoacontatech@gmail.com';
    this.senderName = process.env.BREVO_SENDER_NAME || 'Faço a Conta';
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      // Converter destinatário para array se for string único
      const toArray = Array.isArray(options.to)
        ? options.to.map(email => ({ email }))
        : [{ email: options.to }];

      // Configurar email SMTP
      const emailData: Brevo.SendSmtpEmail = {
        sender: {
          email: this.senderEmail,
          name: this.senderName
        },
        to: toArray,
        subject: options.subject,
        htmlContent: options.htmlContent,
        attachment: options.attachments,
        cc: options.cc?.map(email => ({ email })),
        bcc: options.bcc?.map(email => ({ email }))
      };

      // Enviar email
      const response: any = await this.apiInstance.sendTransacEmail(emailData);
      console.log(`✅ Email enviado para ${options.to} | Message ID: ${response.messageId}`);
      
    } catch (error: any) {
      console.error('❌ Erro ao enviar email:', {
        message: error.message,
        code: error.code,
        response: error.response?.body
      });
      throw new Error(`Falha ao enviar email: ${error.message}`);
    }
  }

  // Método helper para enviar email de reset de senha
  async sendPasswordResetEmail(email: string, nomeUsuario: string, resetLink: string): Promise<void> {
    const subject = 'Redefinição de Senha - Faço a Conta';
    
    // Versão ultra compatível (funciona em todos os clientes)
    const htmlContent = `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Redefinição de Senha</title>
      </head>
      <body style="margin:0; padding:0; font-family:Arial, sans-serif; background-color:#f9f9f9;">
          <center>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f9f9f9">
                  <tr>
                      <td align="center" style="padding:40px 0;">
                          <!-- Container -->
                          <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px; background-color:#ffffff; border-radius:5px; overflow:hidden; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                              <!-- Header com logo -->
                              <tr>
                                  <td bgcolor="#2a003f" style="padding:25px; text-align:center;">
                                      <img src="https://analisa.facoaconta.com.br/simples/fac_logo.png" alt="Faço a Conta" width="200" style="max-width:200px; height:auto;" />
                                  </td>
                              </tr>
                              
                              <!-- Conteúdo -->
                              <tr>
                                  <td style="padding:30px;">
                                      <h2 style="color:#333333; margin-top:0; margin-bottom:20px;">Redefinição de Senha</h2>
                                      
                                      <p style="color:#333333; margin-bottom:15px;">
                                          Olá <strong style="color:#2a003f;">${nomeUsuario || 'usuário'}</strong>,
                                      </p>
                                      
                                      <p style="color:#333333; margin-bottom:20px;">
                                          Você solicitou a redefinição da sua senha no sistema Faço a Conta.
                                      </p>
                                      
                                      <!-- Botão de ação -->
                                      <table border="0" cellpadding="0" cellspacing="0" style="margin:20px 0; text-align:center;">
                                          <tr>
                                              <td align="center">
                                                  <a href="${resetLink}" style="background-color:#2a003f; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:5px; font-weight:bold; display:inline-block;">
                                                      Redefinir Senha
                                                  </a>
                                              </td>
                                          </tr>
                                      </table>
                                      
                                      <!-- Link alternativo -->
                                      <p style="color:#666666; font-size:14px; margin-bottom:10px;">
                                          Se o botão não funcionar, copie e cole este link:
                                      </p>
                                      
                                      <table border="0" cellpadding="10" cellspacing="0" width="100%" bgcolor="#f4f4f4" style="border-radius:3px; margin-bottom:20px;">
                                          <tr>
                                              <td style="font-family:monospace; font-size:12px; color:#333333; word-break:break-all;">
                                                  ${resetLink}
                                              </td>
                                          </tr>
                                      </table>
                                      
                                      <!-- Aviso de expiração -->
                                      <table border="0" cellpadding="12" cellspacing="0" width="100%" bgcolor="#fff3cd" style="border:1px solid #ffecb5; border-radius:4px; margin-bottom:20px;">
                                          <tr>
                                              <td style="color:#856404; font-size:14px;">
                                                  <strong>⚠️ Importante:</strong> Este link expira em <strong>15 minutos</strong>.
                                              </td>
                                          </tr>
                                      </table>
                                      
                                      <p style="color:#666666; font-size:14px; margin-bottom:0;">
                                          Se não foi você quem solicitou, ignore este email.
                                      </p>
                                  </td>
                              </tr>
                              
                              <!-- Footer -->
                              <tr>
                                  <td style="padding:20px; border-top:1px solid #dddddd; background-color:#f9f9f9;">
                                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                          <tr>
                                              <td align="center" style="padding-bottom:10px;">
                                                  <img src="https://analisa.facoaconta.com.br/simples/fac_logo.png" alt="Faço a Conta" width="100" style="max-width:100px; height:auto; opacity:0.7;" />
                                              </td>
                                          </tr>
                                          <tr>
                                              <td align="center" style="color:#666666; font-size:12px; line-height:1.6;">
                                                  <p style="margin:0 0 5px 0;">
                                                      <strong style="color:#2a003f;">Equipe Faço a Conta</strong>
                                                  </p>
                                                  <p style="margin:0 0 5px 0;">
                                                      Este é um email automático
                                                  </p>
                                                  <p style="margin:0;">
                                                      © ${new Date().getFullYear()} Faço a Conta
                                                  </p>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
              </table>
          </center>
      </body>
      </html>
          `;

          await this.sendEmail({
            to: email,
            subject,
            htmlContent
          });
      }

  // Método para enviar email de boas-vindas
  async sendWelcomeEmail(email: string, nomeUsuario: string): Promise<void> {
    const subject = 'Bem-vindo ao Analisa!';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Bem-vindo</title>
        </head>
        <body>
          <h1>Bem-vindo ao Analisa, ${nomeUsuario}!</h1>
          <p>Sua conta foi criada com sucesso.</p>
          <p>Comece agora mesmo a usar todas as funcionalidades da nossa plataforma.</p>
          <p>Se tiver dúvidas, entre em contato com nosso suporte.</p>
          <br>
          <p>Atenciosamente,<br>Equipe Analisa</p>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject,
      htmlContent
    });
  }

  // Método para enviar email com anexos
  async sendEmailWithAttachments(
    to: string,
    subject: string,
    htmlContent: string,
    attachments: Express.Multer.File[]
  ): Promise<void> {
    const emailAttachments: EmailAttachment[] = attachments.map(file => ({
      content: file.buffer.toString('base64'),
      name: file.originalname
    }));

    await this.sendEmail({
      to,
      subject,
      htmlContent,
      attachments: emailAttachments
    });
  }

  // Método para ler arquivo do sistema e converter para anexo
  async createAttachmentFromFile(filePath: string, fileName?: string): Promise<EmailAttachment> {
    const content = fs.readFileSync(filePath, { encoding: 'base64' });
    return {
      content,
      name: fileName || filePath.split('/').pop() || 'attachment'
    };
  }
}

// Instância singleton para uso em toda a aplicação
export const emailService = new EmailService();

// Função simplificada para uso rápido
export const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string,
  attachments?: Express.Multer.File[]
): Promise<void> => {
  const service = new EmailService();
  if (attachments) {
    await service.sendEmailWithAttachments(to, subject, htmlContent, attachments);
  } else {
    await service.sendEmail({ to, subject, htmlContent });
  }
};