-- Migration: Integração InfinityPay (substitui Mercado Pago)
-- Executar manualmente no Supabase SQL Editor
-- As colunas mp_* são mantidas para histórico de dados existentes

BEGIN;

ALTER TABLE public.pagamentos
  ADD COLUMN IF NOT EXISTS ip_order_nsu     character varying,
  ADD COLUMN IF NOT EXISTS ip_transaction_nsu character varying,
  ADD COLUMN IF NOT EXISTS ip_invoice_slug  character varying,
  ADD COLUMN IF NOT EXISTS ip_status        character varying DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS ip_capture_method character varying,
  ADD COLUMN IF NOT EXISTS ip_receipt_url   text,
  ADD COLUMN IF NOT EXISTS ip_checkout_url  text;

-- Índice para buscas rápidas por order_nsu (usado no processamento do webhook)
CREATE UNIQUE INDEX IF NOT EXISTS idx_pagamentos_ip_order_nsu
  ON public.pagamentos (ip_order_nsu)
  WHERE ip_order_nsu IS NOT NULL;

COMMIT;
