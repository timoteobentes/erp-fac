-- Execute manualmente no Supabase SQL Editor.
-- Prepara tabelas fiscais compartilhadas entre todos os usuarios.
-- Ordem recomendada:
-- 1) Execute backnode/src/database/cfop.sql
-- 2) Execute backnode/src/database/NCM.sql
-- 3) Execute este arquivo
--
-- Os arquivos cfop.sql e NCM.sql contem DROP TABLE, entao eles devem ser
-- executados antes deste script.
--
-- Observacao sobre CEST:
-- O arquivo NCM.sql ja possui a coluna "CEST". Por isso, o CEST pode ser
-- extraido da propria base de NCM e usado como uma tabela compartilhada.

BEGIN;

CREATE TABLE IF NOT EXISTS public.cfop (
  codigo character varying NOT NULL,
  descricao character varying NOT NULL,
  categoria character varying NOT NULL,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT cfop_pkey PRIMARY KEY (codigo)
);

ALTER TABLE public.cfop
  ADD COLUMN IF NOT EXISTS criado_em timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS atualizado_em timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS public."NCM" (
  codigo character varying NOT NULL,
  "CEST" character varying,
  descricao character varying,
  monofasico boolean DEFAULT false NOT NULL,
  "substituicaoTributariaICMS" boolean DEFAULT false NOT NULL,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT "NCM_pkey" PRIMARY KEY (codigo)
);

ALTER TABLE public."NCM"
  ADD COLUMN IF NOT EXISTS criado_em timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS atualizado_em timestamp with time zone DEFAULT now();

CREATE TABLE IF NOT EXISTS public.cest (
  codigo character varying NOT NULL,
  descricao character varying,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT cest_pkey PRIMARY KEY (codigo)
);

CREATE TABLE IF NOT EXISTS public.ncm_cest (
  ncm_codigo character varying NOT NULL,
  cest_codigo character varying NOT NULL,
  criado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT ncm_cest_pkey PRIMARY KEY (ncm_codigo, cest_codigo),
  CONSTRAINT ncm_cest_ncm_fkey FOREIGN KEY (ncm_codigo) REFERENCES public."NCM"(codigo) ON DELETE CASCADE,
  CONSTRAINT ncm_cest_cest_fkey FOREIGN KEY (cest_codigo) REFERENCES public.cest(codigo) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS cfop_categoria_idx ON public.cfop (categoria);
CREATE INDEX IF NOT EXISTS ncm_descricao_idx ON public."NCM" USING gin (to_tsvector('portuguese', coalesce(descricao, '')));
CREATE INDEX IF NOT EXISTS ncm_cest_idx ON public."NCM" ("CEST");
CREATE INDEX IF NOT EXISTS ncm_cest_cest_codigo_idx ON public.ncm_cest (cest_codigo);

COMMIT;

INSERT INTO public.cest (codigo)
SELECT DISTINCT trim("CEST")
FROM public."NCM"
WHERE "CEST" IS NOT NULL AND trim("CEST") <> ''
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO public.ncm_cest (ncm_codigo, cest_codigo)
SELECT codigo, trim("CEST")
FROM public."NCM"
WHERE "CEST" IS NOT NULL AND trim("CEST") <> ''
ON CONFLICT (ncm_codigo, cest_codigo) DO NOTHING;
