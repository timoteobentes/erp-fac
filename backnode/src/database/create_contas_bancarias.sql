CREATE TABLE IF NOT EXISTS public.contas_bancarias (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id bigint NOT NULL,
  nome character varying NOT NULL,
  saldo_inicial numeric NOT NULL DEFAULT 0.00,
  data_saldo date NOT NULL,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT contas_bancarias_pkey PRIMARY KEY (id),
  CONSTRAINT fk_contas_bancarias_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
