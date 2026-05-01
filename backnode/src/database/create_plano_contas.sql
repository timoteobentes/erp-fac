CREATE TABLE IF NOT EXISTS public.plano_contas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id bigint NOT NULL,
  conta_mae character varying NOT NULL CHECK (conta_mae::text = ANY (ARRAY[
    'PAGAMENTO'::character varying,
    'DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS'::character varying,
    'DESPESAS_PRODUTOS_VENDIDOS'::character varying,
    'DESPESAS_FINANCEIRAS'::character varying,
    'INVESTIMENTOS'::character varying,
    'OUTRAS_DESPESAS'::character varying,
    'RECEBIMENTOS'::character varying,
    'RECEITAS_VENDAS'::character varying,
    'RECEITAS_FINANCEIRAS'::character varying,
    'OUTRAS_RECEITAS'::character varying
  ]::text[])),
  nome character varying NOT NULL,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT plano_contas_pkey PRIMARY KEY (id),
  CONSTRAINT fk_plano_contas_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
