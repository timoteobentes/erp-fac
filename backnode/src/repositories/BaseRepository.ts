import pool from '../config/database';

export abstract class BaseRepository {
  protected async queryWithIsolation(
    query: string, 
    values: any[] = [], 
    usuarioId?: number,
    isolationField: string = 'usuario_id'
  ) {
    try {
      // Se usuarioId foi fornecido e a query é de SELECT/UPDATE/DELETE, adicionar isolamento
      if (usuarioId && this.requiresIsolation(query)) {
        const { modifiedQuery, modifiedValues } = this.addIsolationClause(
          query, 
          values, 
          usuarioId, 
          isolationField
        );
        return await pool.query(modifiedQuery, modifiedValues);
      }
      
      return await pool.query(query, values);
    } catch (error) {
      console.error('Erro na query com isolamento:', error);
      throw error;
    }
  }

  private requiresIsolation(query: string): boolean {
    const upperQuery = query.toUpperCase().trim();
    return upperQuery.startsWith('SELECT') || 
            upperQuery.startsWith('UPDATE') || 
            upperQuery.startsWith('DELETE');
  }

  private addIsolationClause(
    query: string, 
    values: any[], 
    usuarioId: number, 
    isolationField: string
  ) {
    const upperQuery = query.toUpperCase();
    
    if (upperQuery.includes('WHERE')) {
      // Já tem WHERE, adicionar AND usuario_id = ?
      const modifiedQuery = query.replace(/WHERE/i, `WHERE ${isolationField} = $${values.length + 1} AND`);
      return {
        modifiedQuery,
        modifiedValues: [...values, usuarioId]
      };
    } else if (upperQuery.startsWith('SELECT')) {
      // Adicionar WHERE usuario_id = ?
      const modifiedQuery = `${query} WHERE ${isolationField} = $${values.length + 1}`;
      return {
        modifiedQuery,
        modifiedValues: [...values, usuarioId]
      };
    }

    return { modifiedQuery: query, modifiedValues: values };
  }

  // Verificar propriedade do recurso
  protected async verificarPropriedade(
    tabela: string, 
    id: number, 
    usuarioId: number,
    idField: string = 'id',
    usuarioIdField: string = 'usuario_id'
  ): Promise<boolean> {
    const query = `SELECT 1 FROM ${tabela} WHERE ${idField} = $1 AND ${usuarioIdField} = $2`;
    const result = await pool.query(query, [id, usuarioId]);
    return result.rows.length > 0;
  }
}