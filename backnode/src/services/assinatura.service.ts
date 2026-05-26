import pool from '../config/database';
import { emailService } from './email.service';

const DURACAO_PLANO_DIAS: Record<string, number> = {
  mei: 30,
  controle: 30,
  essencial: 30,
  anual: 365,
};

export function getDuracaoPlanoDias(planId: string): number {
  return DURACAO_PLANO_DIAS[planId?.toLowerCase()] ?? 30;
}

export async function setValidadeAssinatura(usuarioId: string | number, planId: string): Promise<void> {
  const dias = getDuracaoPlanoDias(planId);
  await pool.query(
    `UPDATE usuarios
     SET validade_assinatura = NOW() + ($1 || ' days')::interval, atualizado_em = NOW()
     WHERE id = $2`,
    [dias, usuarioId]
  );
  console.log(`📅 Validade da assinatura definida: usuário [${usuarioId}] — ${dias} dias`);
}

export async function verificarVencimentos(): Promise<void> {
  console.log('🔄 Verificando vencimentos de assinaturas...');
  await enviarAvisosVencimento();
  await bloquearAssinaturasVencidas();
}

async function enviarAvisosVencimento(): Promise<void> {
  // Usuários com vencimento em ~7 dias que ainda não receberam aviso recente
  const { rows } = await pool.query(`
    SELECT u.id, u.email, u.nome_empresa, u.validade_assinatura, u.plano_selecionado
    FROM usuarios u
    WHERE u.status = 'ativo'
      AND u.validade_assinatura BETWEEN NOW() + INTERVAL '6 days' AND NOW() + INTERVAL '8 days'
      AND NOT EXISTS (
        SELECT 1 FROM notificacoes n
        WHERE n.usuario_id = u.id
          AND n.tipo = 'vencimento_aviso'
          AND n.criado_em > NOW() - INTERVAL '6 days'
      )
  `);

  for (const user of rows) {
    const msRestantes = new Date(user.validade_assinatura).getTime() - Date.now();
    const diasRestantes = Math.max(1, Math.ceil(msRestantes / (1000 * 60 * 60 * 24)));
    const titulo = `Sua assinatura vence em ${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''}`;
    const mensagem = `A assinatura do plano ${(user.plano_selecionado ?? '').toUpperCase()} vence em ${diasRestantes} dia(s). Renove agora para não perder o acesso ao sistema.`;

    // Notificação in-app
    await pool.query(
      `INSERT INTO notificacoes (usuario_id, titulo, mensagem, tipo, origem, link)
       VALUES ($1, $2, $3, 'vencimento_aviso', 'sistema', '/inicio')`,
      [user.id, titulo, mensagem]
    );

    // Email de aviso
    try {
      await emailService.sendSubscriptionWarningEmail(
        user.email,
        user.nome_empresa ?? 'Cliente',
        user.plano_selecionado ?? '',
        diasRestantes,
        new Date(user.validade_assinatura)
      );
      await pool.query(
        `UPDATE notificacoes SET email_enviado_em = NOW()
         WHERE usuario_id = $1 AND tipo = 'vencimento_aviso' AND email_enviado_em IS NULL`,
        [user.id]
      );
    } catch (err) {
      console.error(`❌ Erro ao enviar email de aviso para ${user.email}:`, err);
    }

    console.log(`📧 Aviso de vencimento enviado — usuário [${user.id}] — ${diasRestantes} dias restantes`);
  }
}

async function bloquearAssinaturasVencidas(): Promise<void> {
  // Bloqueia contas com vencimento há mais de 5 dias sem renovação
  const { rows } = await pool.query(`
    UPDATE usuarios
    SET status = 'bloqueado', atualizado_em = NOW()
    WHERE status = 'ativo'
      AND validade_assinatura IS NOT NULL
      AND validade_assinatura < NOW() - INTERVAL '5 days'
    RETURNING id, email, nome_empresa, plano_selecionado
  `);

  for (const user of rows) {
    await pool.query(
      `INSERT INTO notificacoes (usuario_id, titulo, mensagem, tipo, origem, link)
       VALUES ($1, $2, $3, 'acesso_bloqueado', 'sistema', '/inicio')`,
      [
        user.id,
        'Acesso suspenso — Assinatura vencida',
        'Sua assinatura expirou e o acesso foi suspenso. Renove sua assinatura para retomar o uso do sistema.',
      ]
    );
    console.log(`🔒 Usuário [${user.id}] bloqueado por inadimplência.`);
  }

  if (rows.length > 0) {
    console.log(`🔒 ${rows.length} conta(s) bloqueada(s) por vencimento de assinatura.`);
  }
}
