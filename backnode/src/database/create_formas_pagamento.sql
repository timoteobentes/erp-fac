CREATE TABLE IF NOT EXISTS public.formas_pagamento (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id bigint NOT NULL,
  nome character varying NOT NULL,
  conta_bancaria_id bigint NOT NULL,
  disponivel_em character varying NOT NULL CHECK (disponivel_em::text = ANY (ARRAY[
    'CONTAS_A_PAGAR_E_RECEBER'::character varying,
    'SOMENTE_CONTAS_A_PAGAR'::character varying,
    'SOMENTE_CONTAS_A_RECEBER'::character varying
  ]::text[])),
  confirmacao_automatica character varying NOT NULL CHECK (confirmacao_automatica::text = ANY (ARRAY[
    'NUNCA_CONFIRMAR_AUTOMATICO'::character varying,
    'SEMPRE_CONFIRMAR_AUTOMATICO'::character varying,
    'CONFIRMAR_SOMENTE_CONTAS_A_RECEBER'::character varying,
    'CONFIRMAR_SOMENTE_CONTAS_A_PAGAR'::character varying
  ]::text[])),
  numero_maximo_parcelas integer NOT NULL DEFAULT 1,
  intervalo_parcelas_dias integer NOT NULL DEFAULT 0,
  primeira_parcela_dias integer NOT NULL DEFAULT 0,
  taxa_banco numeric NOT NULL DEFAULT 0.00,
  taxa_operadora numeric NOT NULL DEFAULT 0.00,
  juros_multa numeric NOT NULL DEFAULT 0.00,
  juros_mora numeric NOT NULL DEFAULT 0.00,
  modalidade character varying NOT NULL CHECK (modalidade::text = ANY (ARRAY[
    'DINHEIRO'::character varying,
    'CARTAO_CREDITO'::character varying,
    'CARTAO_DEBITO'::character varying,
    'CHEQUE'::character varying,
    'CREDITO_LOJA'::character varying,
    'VALE_ALIMENTACAO'::character varying,
    'VALE_REFEICAO'::character varying,
    'VALE_PRESENTE'::character varying,
    'VALE_COMBUSTIVEL'::character varying,
    'DEVOLUCAO_MERCADORIA'::character varying,
    'DUPLICATA_MERCANTIL'::character varying,
    'CARNE'::character varying,
    'BOLETO_BANCARIO'::character varying,
    'DEPOSITO_BANCARIO'::character varying,
    'PAGAMENTO_INSTANTANEO_PIX'::character varying,
    'TRANSFERENCIA_BANCARIA_CARTEIRA_DIGITAL'::character varying,
    'PROGRAMA_FIDELIDADE_CASHBACK_CREDITO_VIRTUAL'::character varying,
    'OUTROS'::character varying
  ]::text[])),
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT formas_pagamento_pkey PRIMARY KEY (id),
  CONSTRAINT fk_formas_pagamento_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT fk_formas_pagamento_conta_bancaria FOREIGN KEY (conta_bancaria_id) REFERENCES public.contas_bancarias(id)
);
