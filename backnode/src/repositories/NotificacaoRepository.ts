import pool from '../config/database';

export interface FiltrosNotificacao {
  titulo?: string;
  lida?: 'true' | 'false';
  data_inicio?: string;
  data_fim?: string;
}

export class NotificacaoRepository {
  async criar(dados: any) {
    const result = await pool.query(
      `
        INSERT INTO notificacoes (usuario_id, titulo, mensagem, tipo, origem, link, metadados)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `,
      [
        dados.usuario_id,
        dados.titulo,
        dados.mensagem,
        dados.tipo || 'sistema',
        dados.origem || 'sistema',
        dados.link || null,
        dados.metadados || {}
      ]
    );

    return result.rows[0];
  }

  async listar(usuarioId: number, filtros: FiltrosNotificacao, paginacao: { limit: number; offset: number }) {
    const values: any[] = [usuarioId];
    let index = 2;
    let where = 'WHERE usuario_id = $1';

    if (filtros.titulo) {
      where += ` AND titulo ILIKE $${index}`;
      values.push(`%${filtros.titulo}%`);
      index++;
    }

    if (filtros.lida === 'true') {
      where += ' AND lido_em IS NOT NULL';
    }

    if (filtros.lida === 'false') {
      where += ' AND lido_em IS NULL';
    }

    if (filtros.data_inicio) {
      where += ` AND criado_em >= $${index}`;
      values.push(filtros.data_inicio);
      index++;
    }

    if (filtros.data_fim) {
      where += ` AND criado_em <= $${index}`;
      values.push(filtros.data_fim);
      index++;
    }

    const dataValues = [...values, paginacao.limit, paginacao.offset];
    const [data, count] = await Promise.all([
      pool.query(
        `
          SELECT *
          FROM notificacoes
          ${where}
          ORDER BY criado_em DESC
          LIMIT $${index} OFFSET $${index + 1}
        `,
        dataValues
      ),
      pool.query(`SELECT COUNT(*)::int AS total FROM notificacoes ${where}`, values)
    ]);

    return { notificacoes: data.rows, total: count.rows[0].total };
  }

  async resumo(usuarioId: number, limite = 5) {
    const [lista, contador] = await Promise.all([
      pool.query(
        `SELECT * FROM notificacoes WHERE usuario_id = $1 ORDER BY criado_em DESC LIMIT $2`,
        [usuarioId, limite]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS nao_lidas FROM notificacoes WHERE usuario_id = $1 AND lido_em IS NULL`,
        [usuarioId]
      )
    ]);

    return { notificacoes: lista.rows, nao_lidas: contador.rows[0].nao_lidas };
  }

  async buscarPorIds(usuarioId: number, ids: number[]) {
    if (ids.length === 0) return [];
    const result = await pool.query(
      `SELECT * FROM notificacoes WHERE usuario_id = $1 AND id = ANY($2::bigint[])`,
      [usuarioId, ids]
    );
    return result.rows;
  }

  async marcar(usuarioId: number, ids: number[], lida: boolean) {
    if (ids.length === 0) return [];
    const result = await pool.query(
      `
        UPDATE notificacoes
        SET lido_em = ${lida ? 'COALESCE(lido_em, NOW())' : 'NULL'},
            atualizado_em = NOW()
        WHERE usuario_id = $1 AND id = ANY($2::bigint[])
        RETURNING *
      `,
      [usuarioId, ids]
    );
    return result.rows;
  }

  async marcarTodas(usuarioId: number, lida: boolean) {
    const result = await pool.query(
      `
        UPDATE notificacoes
        SET lido_em = ${lida ? 'COALESCE(lido_em, NOW())' : 'NULL'},
            atualizado_em = NOW()
        WHERE usuario_id = $1
        RETURNING *
      `,
      [usuarioId]
    );
    return result.rows;
  }

  async excluir(usuarioId: number, ids: number[]) {
    if (ids.length === 0) return 0;
    const result = await pool.query(
      `DELETE FROM notificacoes WHERE usuario_id = $1 AND id = ANY($2::bigint[])`,
      [usuarioId, ids]
    );
    return result.rowCount || 0;
  }

  async marcarEmailEnviado(usuarioId: number, ids: number[]) {
    if (ids.length === 0) return;
    await pool.query(
      `UPDATE notificacoes SET email_enviado_em = NOW(), atualizado_em = NOW() WHERE usuario_id = $1 AND id = ANY($2::bigint[])`,
      [usuarioId, ids]
    );
  }

  async buscarUsuario(usuarioId: number) {
    const result = await pool.query(
      `SELECT id, email, nome_usuario, nome_empresa FROM usuarios WHERE id = $1`,
      [usuarioId]
    );
    return result.rows[0] || null;
  }

  async registrarWebhook(dados: any) {
    const result = await pool.query(
      `
        INSERT INTO webhook_eventos (usuario_id, origem, evento, payload, status, processado_em)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *
      `,
      [dados.usuario_id || null, dados.origem, dados.evento, dados.payload || {}, dados.status || 'processado']
    );
    return result.rows[0];
  }
}
