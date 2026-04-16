const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/facoaconta'
});

const query = `
CREATE TABLE IF NOT EXISTS public.configuracoes_fiscais_nfse (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id bigint NOT NULL UNIQUE,
  inscricao_municipal character varying,
  codigo_tributacao_nacional character varying,
  codigo_tributacao_municipal character varying,
  cnae character varying,
  cnbs character varying,
  serie_dps character varying DEFAULT '1',
  atualizado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT configuracoes_fiscais_nfse_pkey PRIMARY KEY (id)
);
`;

pool.query(query)
  .then(() => {
    console.log('Migration configuracoes_fiscais_nfse OK');
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
