CREATE TABLE IF NOT EXISTS public.centro_custos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id bigint NOT NULL,
  nome character varying NOT NULL,
  status character varying NOT NULL CHECK (status::text = ANY (ARRAY['ATIVO'::character varying, 'INATIVO'::character varying]::text[])),
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT centro_custos_pkey PRIMARY KEY (id),
  CONSTRAINT fk_centro_custos_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
