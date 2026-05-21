-- Execute manualmente no Supabase SQL Editor.
-- Estrutura de notificacoes, fila de e-mails e eventos recebidos por webhook.

BEGIN;

CREATE TABLE IF NOT EXISTS public.notificacoes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id bigint NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  titulo varchar(180) NOT NULL,
  mensagem text NOT NULL,
  tipo varchar(40) DEFAULT 'sistema',
  origem varchar(80) DEFAULT 'sistema',
  link varchar(500),
  metadados jsonb DEFAULT '{}'::jsonb,
  lido_em timestamptz,
  email_enviado_em timestamptz,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_criado
  ON public.notificacoes (usuario_id, criado_em DESC);

CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_lido
  ON public.notificacoes (usuario_id, lido_em);

CREATE TABLE IF NOT EXISTS public.webhook_eventos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  usuario_id bigint REFERENCES public.usuarios(id) ON DELETE SET NULL,
  origem varchar(80) NOT NULL,
  evento varchar(120) NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status varchar(30) DEFAULT 'recebido',
  erro text,
  processado_em timestamptz,
  criado_em timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_eventos_origem_evento
  ON public.webhook_eventos (origem, evento, criado_em DESC);

COMMIT;
