-- Migration: Suporte a renovação de assinatura e controle de vencimento
-- Executar manualmente no Supabase SQL Editor

BEGIN;

-- Garante que a coluna validade_assinatura existe (já estava no schema original)
ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS validade_assinatura timestamp with time zone;

-- Índice para o job de vencimentos (busca por status + validade)
CREATE INDEX IF NOT EXISTS idx_usuarios_validade_assinatura
  ON public.usuarios (status, validade_assinatura)
  WHERE validade_assinatura IS NOT NULL;

COMMIT;
