import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';

export const loggerMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  const originalSend = res.send;
  let responseBody: any;
  
  res.send = function(body: any): Response {
    responseBody = body;
    return originalSend.call(this, body);
  };


  res.on('finish', async () => {
    const duration = Date.now() - start;
    const usuario = (req as any).usuario;

    console.log("usuario logger >> ", usuario);
    console.log("req logger >> ", req);

    try {
      // Especificar os tipos explicitamente na query
      await query(
        `SELECT registrar_log(
          $1::bigint, $2::varchar, $3::varchar, $4::acao_tipo, $5::modulo_sistema, 
          $6::text, $7::varchar, $8::varchar, $9::inet, $10::text, 
          $11::bigint, $12::varchar, $13::jsonb, $14::jsonb, 
          $15::boolean, $16::integer, $17::integer, $18::text
        )`,
        [
          usuario?.id || null,
          req?.body?.email || usuario?.email || null,
          req?.body?.nome_empresa || usuario?.nome_empresa || null,
          getActionType(req.method, res.statusCode),
          getModule(req.path),
          `${req.method} ${req.path} - ${res.statusCode}`,
          req.path,
          req.method,
          req.ip,
          req.get('User-Agent'),
          getRecordId(req, responseBody),
          getAffectedTable(req.path),
          null, // dados_anteriores
          null, // dados_novos
          res.statusCode < 400,
          res.statusCode,
          duration,
          res.statusCode >= 400 ? responseBody?.message : null
        ]
      );
    } catch (error) {
      console.error('Erro ao registrar log:', error);
    }
  });

  next();
};

// Funções auxiliares para determinar ação e módulo
function getActionType(method: string, statusCode: number): string {
  if (statusCode >= 400) return 'erro';
  
  const actions: { [key: string]: string } = {
    'GET': 'visualizacao',
    'POST': 'cadastro',
    'PUT': 'edicao',
    'PATCH': 'edicao',
    'DELETE': 'exclusao'
  };
  
  return actions[method] || 'visualizacao';
}

function getModule(path: string): string {
  if (path.includes('/auth')) return 'autenticacao';
  if (path.includes('/usuarios')) return 'usuarios';
  if (path.includes('/clientes')) return 'clientes';
  if (path.includes('/fornecedores')) return 'fornecedores';
  if (path.includes('/grupo-acesso')) return 'grupo_acesso';
  return 'sistema';
}

function getRecordId(req: Request, responseBody: any): number | null {
  // Lógica para extrair ID do registro criado/alterado
  return responseBody?.id || req.params?.id || null;
}

function getAffectedTable(path: string): string | null {
  if (path.includes('/usuarios')) return 'usuarios';
  if (path.includes('/clientes')) return 'clientes';
  if (path.includes('/fornecedores')) return 'fornecedores';
  return null;
}