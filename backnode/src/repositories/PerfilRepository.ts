import pool from '../config/database';
import { Usuario } from '../models/Usuario';
import { ConfiguracaoFiscal } from '../models/ConfiguracaoFiscal';

export class PerfilRepository {
  async getPerfilCompleto(usuario_id: number): Promise<{ usuario: Partial<Usuario>, fiscal: ConfiguracaoFiscal | null, fiscal_nfse: any }> {
    const queryUser = `
      SELECT id, email, nome_usuario, nome_completo, cpf, cnpj, nome_empresa, telefone, cidade, estado, status, grupo_acesso_id
      FROM usuarios
      WHERE id = $1
    `;
    const resultUser = await pool.query(queryUser, [usuario_id]);
    
    if (resultUser.rows.length === 0) {
      throw new Error("Usuário não encontrado.");
    }

    const queryFiscal = `
      SELECT * FROM configuracoes_fiscais
      WHERE usuario_id = $1
    `;
    const resultFiscal = await pool.query(queryFiscal, [usuario_id]);

    const queryFiscalNfse = `
      SELECT * FROM configuracoes_fiscais_nfse
      WHERE usuario_id = $1
    `;
    const resultFiscalNfse = await pool.query(queryFiscalNfse, [usuario_id]);

    return {
      usuario: resultUser.rows[0],
      fiscal: resultFiscal.rows[0] || null,
      fiscal_nfse: resultFiscalNfse.rows[0] || null
    };
  }

  async atualizarPerfilTransacional(usuario_id: number, dadosUser: Partial<Usuario>, dadosFiscal: Partial<ConfiguracaoFiscal>, dadosFiscalNfse: any) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Atualizar a tabela Usuarios
      const queryUpdateUser = `
        UPDATE usuarios
        SET 
          nome_usuario = COALESCE($1, nome_usuario),
          nome_completo = COALESCE($2, nome_completo),
          cpf = COALESCE($3, cpf),
          cnpj = COALESCE($4, cnpj),
          nome_empresa = COALESCE($5, nome_empresa),
          telefone = COALESCE($6, telefone),
          cidade = COALESCE($7, cidade),
          estado = COALESCE($8, estado),
          atualizado_em = CURRENT_TIMESTAMP
        WHERE id = $9
      `;
      
      const valuesUser = [
        dadosUser.nome_usuario || null,
        dadosUser.nome_completo || null,
        dadosUser.cpf || null,
        dadosUser.cnpj || null,
        dadosUser.nome_empresa || null,
        dadosUser.telefone || null,
        dadosUser.cidade || null,
        dadosUser.estado || null,
        usuario_id
      ];

      await client.query(queryUpdateUser, valuesUser);

      // Se houver uma tentativa de trocar de senha...
      if (dadosUser.senha) {
          await client.query('UPDATE usuarios SET senha = $1 WHERE id = $2', [dadosUser.senha, usuario_id]);
      }

      // 2. Verificar se já existe config fiscal
      const checkFiscal = await client.query('SELECT id FROM configuracoes_fiscais WHERE usuario_id = $1', [usuario_id]);
      
      if (checkFiscal.rows.length > 0) {
        // Atualizar
        const queryUpdateFiscal = `
          UPDATE configuracoes_fiscais
          SET 
            inscricao_estadual = COALESCE($1, inscricao_estadual),
            regime_tributario = COALESCE($2, regime_tributario),
            csc_id = COALESCE($3, csc_id),
            csc_alfanumerico = COALESCE($4, csc_alfanumerico),
            ambiente_sefaz = COALESCE($5, ambiente_sefaz),
            certificado_base64 = COALESCE($6, certificado_base64),
            certificado_nome_arquivo = COALESCE($7, certificado_nome_arquivo),
            certificado_senha = COALESCE($8, certificado_senha),
            atualizado_em = CURRENT_TIMESTAMP
          WHERE usuario_id = $9
        `;
        const valuesFiscal = [
          dadosFiscal.inscricao_estadual || null,
          dadosFiscal.regime_tributario || null,
          dadosFiscal.csc_id || null,
          dadosFiscal.csc_alfanumerico || null,
          dadosFiscal.ambiente_sefaz || null,
          dadosFiscal.certificado_base64 || null,
          dadosFiscal.certificado_nome_arquivo || null,
          dadosFiscal.certificado_senha || null,
          usuario_id
        ];
        await client.query(queryUpdateFiscal, valuesFiscal);
      } else {
        // Inserir
        const queryInsertFiscal = `
          INSERT INTO configuracoes_fiscais (
             usuario_id, inscricao_estadual, regime_tributario, csc_id, csc_alfanumerico, 
             ambiente_sefaz, certificado_base64, certificado_nome_arquivo, certificado_senha
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        const valuesFiscalInsert = [
          usuario_id,
          dadosFiscal.inscricao_estadual || null,
          dadosFiscal.regime_tributario || null,
          dadosFiscal.csc_id || null,
          dadosFiscal.csc_alfanumerico || null,
          dadosFiscal.ambiente_sefaz || null,
          dadosFiscal.certificado_base64 || null,
          dadosFiscal.certificado_nome_arquivo || null,
          dadosFiscal.certificado_senha || null
        ];
        await client.query(queryInsertFiscal, valuesFiscalInsert);
      }

      // 3. Verificar se já existe config fiscal NFS-e
      if (dadosFiscalNfse) {
          const checkFiscalNfse = await client.query('SELECT id FROM configuracoes_fiscais_nfse WHERE usuario_id = $1', [usuario_id]);
          
          if (checkFiscalNfse.rows.length > 0) {
            // Atualizar
            const queryUpdateNfse = `
              UPDATE configuracoes_fiscais_nfse
              SET 
                inscricao_municipal = COALESCE($1, inscricao_municipal),
                codigo_tributacao_nacional = COALESCE($2, codigo_tributacao_nacional),
                codigo_tributacao_municipal = COALESCE($3, codigo_tributacao_municipal),
                cnae = COALESCE($4, cnae),
                cnbs = COALESCE($5, cnbs),
                serie_dps = COALESCE($6, serie_dps),
                atualizado_em = CURRENT_TIMESTAMP
              WHERE usuario_id = $7
            `;
            const valuesNfse = [
              dadosFiscalNfse.inscricao_municipal || null,
              dadosFiscalNfse.codigo_tributacao_nacional || null,
              dadosFiscalNfse.codigo_tributacao_municipal || null,
              dadosFiscalNfse.cnae || null,
              dadosFiscalNfse.cnbs || null,
              dadosFiscalNfse.serie_dps || null,
              usuario_id
            ];
            await client.query(queryUpdateNfse, valuesNfse);
          } else {
            // Inserir
            const queryInsertNfse = `
              INSERT INTO configuracoes_fiscais_nfse (
                 usuario_id, inscricao_municipal, codigo_tributacao_nacional, 
                 codigo_tributacao_municipal, cnae, cnbs, serie_dps
              ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
            const valuesInsertNfse = [
              usuario_id,
              dadosFiscalNfse.inscricao_municipal || null,
              dadosFiscalNfse.codigo_tributacao_nacional || null,
              dadosFiscalNfse.codigo_tributacao_municipal || null,
              dadosFiscalNfse.cnae || null,
              dadosFiscalNfse.cnbs || null,
              dadosFiscalNfse.serie_dps || '1'
            ];
            await client.query(queryInsertNfse, valuesInsertNfse);
          }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
