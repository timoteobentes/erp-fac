import pool from './src/config/database';

async function diagnostico() {
  try {
    console.log('--- DIAGNÓSTICO DE DUPLICADOS ---');
    
    const duplicadosUnidades = await pool.query(`
      SELECT id, COUNT(*) 
      FROM unidades_medida 
      GROUP BY id 
      HAVING COUNT(*) > 1
    `);
    console.log('Unidades de Medida com ID duplicado:', duplicadosUnidades.rows);

    const duplicadosCategorias = await pool.query(`
      SELECT id, COUNT(*) 
      FROM categorias 
      GROUP BY id 
      HAVING COUNT(*) > 1
    `);
    console.log('Categorias com ID duplicado:', duplicadosCategorias.rows);

    const duplicadosMarcas = await pool.query(`
      SELECT id, COUNT(*) 
      FROM marcas 
      GROUP BY id 
      HAVING COUNT(*) > 1
    `);
    console.log('Marcas com ID duplicado:', duplicadosMarcas.rows);

    console.log('\n--- VERIFICAÇÃO DE CHAVES PRIMÁRIAS ---');
    
    const pks = await pool.query(`
      SELECT tc.table_name, c.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name)
      JOIN information_schema.columns AS c ON c.table_schema = tc.constraint_schema
        AND tc.table_name = c.table_name AND ccu.column_name = c.column_name
      WHERE constraint_type = 'PRIMARY KEY' 
        AND tc.table_name IN ('unidades_medida', 'categorias', 'marcas')
    `);
    console.log('Tabelas e suas Primary Keys:', pks.rows);

    console.log('\n--- QTD REGISTROS NULL ---');
    const uNull = await pool.query(`SELECT COUNT(*) FROM unidades_medida WHERE usuario_id IS NULL;`);
    console.log('Unidades_medida com usuario_id NULL:', uNull.rows[0].count);

  } catch (err) {
    console.error('Erro no diagnóstico:', err);
  } finally {
    process.exit(0);
  }
}

diagnostico();
