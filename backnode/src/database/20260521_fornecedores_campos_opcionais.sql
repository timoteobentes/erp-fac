-- Execute manualmente no Supabase SQL Editor.
-- Mantem obrigatorios apenas nome, tipo_fornecedor e situacao no cadastro de fornecedores.

BEGIN;

ALTER TABLE public.enderecos_fornecedor
  ALTER COLUMN logradouro DROP NOT NULL,
  ALTER COLUMN numero DROP NOT NULL,
  ALTER COLUMN bairro DROP NOT NULL,
  ALTER COLUMN cidade DROP NOT NULL,
  ALTER COLUMN uf DROP NOT NULL;

ALTER TABLE public.contatos_fornecedor
  ALTER COLUMN nome DROP NOT NULL,
  ALTER COLUMN contato DROP NOT NULL;

COMMIT;
