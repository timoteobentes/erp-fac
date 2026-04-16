-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.acoes (
  id bigint NOT NULL DEFAULT nextval('acoes_id_seq'::regclass),
  nome character varying NOT NULL UNIQUE,
  descricao text,
  CONSTRAINT acoes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.anexos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  cliente_id bigint NOT NULL,
  nome_arquivo character varying NOT NULL,
  url_arquivo text NOT NULL,
  tipo_arquivo character varying,
  tamanho bigint,
  criado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT anexos_pkey PRIMARY KEY (id),
  CONSTRAINT fk_anexo_cliente FOREIGN KEY (cliente_id) REFERENCES public.clientes(id)
);
CREATE TABLE public.auditoria_dados (
  id bigint NOT NULL DEFAULT nextval('auditoria_dados_id_seq'::regclass),
  tabela_nome character varying NOT NULL,
  registro_id bigint NOT NULL,
  operacao USER-DEFINED NOT NULL,
  usuario_id bigint,
  usuario_email character varying,
  dados_antes jsonb,
  dados_depois jsonb,
  ip_address inet,
  user_agent text,
  criado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT auditoria_dados_pkey PRIMARY KEY (id)
);
CREATE TABLE public.categorias (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id bigint NOT NULL,
  nome character varying NOT NULL,
  categoria_pai_id bigint,
  ativa boolean DEFAULT true,
  CONSTRAINT categorias_pkey PRIMARY KEY (id),
  CONSTRAINT fk_categorias_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT fk_categorias_pai FOREIGN KEY (categoria_pai_id) REFERENCES public.categorias(id)
);
CREATE TABLE public.categorias_produtos (
  id bigint NOT NULL,
  usuario_id bigint NOT NULL,
  nome character varying NOT NULL,
  ativa boolean DEFAULT true,
  criado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT categorias_produtos_pkey PRIMARY KEY (id),
  CONSTRAINT categorias_produtos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.clientes (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  tipo_cliente character varying NOT NULL CHECK (tipo_cliente::text = ANY (ARRAY['PF'::character varying, 'PJ'::character varying, 'estrangeiro'::character varying]::text[])),
  situacao character varying DEFAULT 'ativo'::character varying,
  nome character varying NOT NULL,
  nome_fantasia character varying,
  cpf character varying,
  rg character varying,
  cnpj character varying,
  documento_estrangeiro character varying,
  inscricao_estadual character varying,
  inscricao_municipal character varying,
  inscricao_suframa character varying,
  isento_ie boolean DEFAULT false,
  data_nascimento date,
  sexo character varying,
  pais_origem character varying,
  email character varying,
  telefone_comercial character varying,
  telefone_celular character varying,
  site character varying,
  responsavel character varying,
  vendedor_responsavel character varying,
  limite_credito numeric DEFAULT 0.00,
  permitir_ultrapassar_limite boolean DEFAULT false,
  observacoes text,
  foto_perfil_url text,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  usuario_id bigint NOT NULL,
  CONSTRAINT clientes_pkey PRIMARY KEY (id),
  CONSTRAINT fk_clientes_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.clientes_estrangeiro (
  id bigint NOT NULL DEFAULT nextval('clientes_estrangeiro_id_seq'::regclass),
  cliente_id bigint NOT NULL,
  documento character varying,
  pais_origem character varying,
  CONSTRAINT clientes_estrangeiro_pkey PRIMARY KEY (id)
);
CREATE TABLE public.clientes_pf (
  id bigint NOT NULL DEFAULT nextval('clientes_pf_id_seq'::regclass),
  cliente_id bigint NOT NULL,
  cpf character varying UNIQUE,
  rg character varying,
  nascimento date,
  tipo_contribuinte character varying,
  CONSTRAINT clientes_pf_pkey PRIMARY KEY (id)
);
CREATE TABLE public.clientes_pj (
  id bigint NOT NULL DEFAULT nextval('clientes_pj_id_seq'::regclass),
  cliente_id bigint NOT NULL,
  cnpj character varying UNIQUE,
  razao_social character varying,
  inscricao_estadual character varying,
  isento boolean DEFAULT false,
  tipo_contribuinte character varying,
  inscricao_municipal character varying,
  inscricao_suframa character varying,
  responsavel character varying,
  CONSTRAINT clientes_pj_pkey PRIMARY KEY (id)
);
CREATE TABLE public.configuracoes_fiscais (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id bigint NOT NULL UNIQUE,
  inscricao_estadual character varying,
  regime_tributario character varying DEFAULT 'simples_nacional'::character varying CHECK (regime_tributario::text = ANY (ARRAY['simples_nacional'::character varying::text, 'regime_normal'::character varying::text])),
  csc_id character varying,
  csc_alfanumerico character varying,
  certificado_nome_arquivo character varying,
  certificado_base64 text,
  certificado_senha character varying,
  ambiente_sefaz character varying DEFAULT 'homologacao'::character varying CHECK (ambiente_sefaz::text = ANY (ARRAY['homologacao'::character varying::text, 'producao'::character varying::text])),
  atualizado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT configuracoes_fiscais_pkey PRIMARY KEY (id),
  CONSTRAINT fk_config_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.configuracoes_fiscais_nfse (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id bigint NOT NULL UNIQUE,
  inscricao_municipal character varying,
  codigo_tributacao_nacional character varying,
  codigo_tributacao_municipal character varying,
  cnae character varying,
  cnbs character varying,
  serie_dps character varying DEFAULT '1'::character varying,
  atualizado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT configuracoes_fiscais_nfse_pkey PRIMARY KEY (id)
);
CREATE TABLE public.contas_pagar (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id bigint NOT NULL,
  fornecedor_id bigint,
  descricao character varying NOT NULL,
  valor_total numeric NOT NULL DEFAULT 0.00,
  data_vencimento date NOT NULL,
  data_pagamento date,
  status character varying DEFAULT 'pendente'::character varying CHECK (status::text = ANY (ARRAY['pendente'::character varying::text, 'pago'::character varying::text, 'atrasado'::character varying::text, 'cancelado'::character varying::text])),
  categoria_despesa character varying,
  observacao text,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT contas_pagar_pkey PRIMARY KEY (id),
  CONSTRAINT fk_cp_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.contas_receber (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id bigint NOT NULL,
  cliente_id bigint,
  venda_id bigint,
  descricao character varying NOT NULL,
  valor_total numeric NOT NULL DEFAULT 0.00,
  data_vencimento date NOT NULL,
  data_recebimento date,
  status character varying DEFAULT 'pendente'::character varying CHECK (status::text = ANY (ARRAY['pendente'::character varying::text, 'recebido'::character varying::text, 'atrasado'::character varying::text, 'cancelado'::character varying::text])),
  forma_pagamento character varying,
  observacao text,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT contas_receber_pkey PRIMARY KEY (id),
  CONSTRAINT fk_cr_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT fk_cr_cliente FOREIGN KEY (cliente_id) REFERENCES public.clientes(id)
);
CREATE TABLE public.contatos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  cliente_id bigint NOT NULL,
  tipo character varying,
  nome character varying NOT NULL,
  valor character varying NOT NULL,
  cargo character varying,
  observacao character varying,
  principal boolean DEFAULT false,
  criado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT contatos_pkey PRIMARY KEY (id),
  CONSTRAINT fk_contato_cliente FOREIGN KEY (cliente_id) REFERENCES public.clientes(id)
);
CREATE TABLE public.contatos_fornecedor (
  id bigint NOT NULL DEFAULT nextval('contatos_fornecedor_id_seq'::regclass),
  fornecedor_id bigint NOT NULL,
  tipo USER-DEFINED DEFAULT 'comercial'::contato_tipo_fornecedor,
  nome character varying NOT NULL,
  contato character varying NOT NULL,
  cargo character varying,
  observacao text,
  principal boolean DEFAULT false,
  criado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT contatos_fornecedor_pkey PRIMARY KEY (id)
);
CREATE TABLE public.enderecos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  cliente_id bigint NOT NULL,
  tipo character varying,
  cep character varying,
  logradouro character varying NOT NULL,
  numero character varying NOT NULL,
  complemento character varying,
  bairro character varying,
  cidade character varying NOT NULL,
  uf character varying,
  pais character varying DEFAULT 'Brasil'::character varying,
  principal boolean DEFAULT false,
  criado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT enderecos_pkey PRIMARY KEY (id),
  CONSTRAINT fk_endereco_cliente FOREIGN KEY (cliente_id) REFERENCES public.clientes(id)
);
CREATE TABLE public.enderecos_fornecedor (
  id bigint NOT NULL DEFAULT nextval('enderecos_fornecedor_id_seq'::regclass),
  fornecedor_id bigint NOT NULL,
  tipo USER-DEFINED DEFAULT 'comercial'::endereco_tipo_fornecedor,
  cep character varying,
  logradouro character varying NOT NULL,
  numero character varying NOT NULL,
  complemento character varying,
  bairro character varying NOT NULL,
  cidade character varying NOT NULL,
  uf character NOT NULL,
  principal boolean DEFAULT false,
  criado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT enderecos_fornecedor_pkey PRIMARY KEY (id)
);
CREATE TABLE public.forma_pagamento (
  id bigint NOT NULL DEFAULT nextval('forma_pagamento_id_seq'::regclass),
  usuario_id bigint NOT NULL,
  tipo USER-DEFINED NOT NULL,
  parcelas integer DEFAULT 1,
  status USER-DEFINED DEFAULT 'ativo'::pagamento_status,
  criado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT forma_pagamento_pkey PRIMARY KEY (id),
  CONSTRAINT forma_pagamento_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.fornecedores_estrangeiro (
  id bigint NOT NULL DEFAULT nextval('fornecedores_estrangeiro_id_seq'::regclass),
  fornecedor_id bigint NOT NULL UNIQUE,
  documento character varying,
  pais_origem character varying,
  CONSTRAINT fornecedores_estrangeiro_pkey PRIMARY KEY (id)
);
CREATE TABLE public.fornecedores_pf (
  id bigint NOT NULL DEFAULT nextval('fornecedores_pf_id_seq'::regclass),
  fornecedor_id bigint NOT NULL UNIQUE,
  cpf character varying UNIQUE,
  rg character varying,
  nascimento date,
  tipo_contribuinte character varying,
  CONSTRAINT fornecedores_pf_pkey PRIMARY KEY (id)
);
CREATE TABLE public.fornecedores_pj (
  id bigint NOT NULL DEFAULT nextval('fornecedores_pj_id_seq'::regclass),
  fornecedor_id bigint NOT NULL UNIQUE,
  cnpj character varying UNIQUE,
  razao_social character varying,
  inscricao_estadual character varying,
  isento boolean DEFAULT false,
  tipo_contribuinte character varying,
  inscricao_municipal character varying,
  inscricao_suframa character varying,
  responsavel character varying,
  ramo_atividade character varying,
  CONSTRAINT fornecedores_pj_pkey PRIMARY KEY (id)
);
CREATE TABLE public.grupo_acesso (
  id bigint NOT NULL DEFAULT nextval('grupo_acesso_id_seq'::regclass),
  nome character varying NOT NULL UNIQUE,
  descricao text,
  nivel integer DEFAULT 1,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT grupo_acesso_pkey PRIMARY KEY (id)
);
CREATE TABLE public.itens_venda (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  venda_id bigint NOT NULL,
  produto_id bigint NOT NULL,
  quantidade numeric NOT NULL,
  valor_unitario numeric NOT NULL,
  valor_total numeric NOT NULL,
  CONSTRAINT itens_venda_pkey PRIMARY KEY (id),
  CONSTRAINT fk_itens_venda FOREIGN KEY (venda_id) REFERENCES public.vendas(id),
  CONSTRAINT fk_itens_produto FOREIGN KEY (produto_id) REFERENCES public.produtos(id)
);
CREATE TABLE public.logs_sistema (
  id bigint NOT NULL DEFAULT nextval('logs_sistema_id_seq'::regclass),
  usuario_id bigint,
  usuario_email character varying,
  usuario_nome character varying,
  acao USER-DEFINED NOT NULL,
  modulo USER-DEFINED NOT NULL,
  descricao text NOT NULL,
  endpoint character varying,
  metodo_http character varying,
  ip_address inet,
  user_agent text,
  registro_id bigint,
  tabela_afetada character varying,
  dados_anteriores jsonb,
  dados_novos jsonb,
  sucesso boolean DEFAULT true,
  codigo_resposta integer,
  tempo_resposta integer,
  erro_mensagem text,
  criado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT logs_sistema_pkey PRIMARY KEY (id)
);
CREATE TABLE public.marcas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id bigint NOT NULL,
  nome character varying NOT NULL,
  CONSTRAINT marcas_pkey PRIMARY KEY (id),
  CONSTRAINT fk_marcas_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.modulos (
  id bigint NOT NULL DEFAULT nextval('modulos_id_seq'::regclass),
  nome character varying NOT NULL UNIQUE,
  descricao text,
  icone character varying,
  ordem integer DEFAULT 0,
  ativo boolean DEFAULT true,
  CONSTRAINT modulos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.movimentacoes_estoque (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id bigint NOT NULL,
  produto_id bigint NOT NULL,
  tipo character varying NOT NULL CHECK (tipo::text = ANY (ARRAY['entrada'::character varying::text, 'saida'::character varying::text, 'ajuste'::character varying::text])),
  quantidade numeric NOT NULL,
  saldo_apos numeric NOT NULL,
  origem character varying NOT NULL,
  observacao text,
  criado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT movimentacoes_estoque_pkey PRIMARY KEY (id),
  CONSTRAINT fk_mov_estoque_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT fk_mov_estoque_produto FOREIGN KEY (produto_id) REFERENCES public.produtos(id)
);
CREATE TABLE public.nfse (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id bigint NOT NULL,
  cliente_id bigint NOT NULL,
  servico_id bigint NOT NULL,
  competencia date DEFAULT CURRENT_DATE,
  valor_servico numeric NOT NULL DEFAULT 0.00,
  desconto numeric DEFAULT 0.00,
  valor_total numeric NOT NULL DEFAULT 0.00,
  aliquota_iss numeric NOT NULL DEFAULT 0.00,
  valor_iss numeric DEFAULT 0.00,
  status character varying DEFAULT 'rascunho'::character varying CHECK (status::text = ANY (ARRAY['rascunho'::character varying, 'emitida'::character varying, 'rejeitada'::character varying, 'cancelada'::character varying]::text[])),
  chave_acesso character varying,
  protocolo character varying,
  xml_autorizado text,
  mensagem_retorno text,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT nfse_pkey PRIMARY KEY (id),
  CONSTRAINT fk_nfse_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT fk_nfse_cliente FOREIGN KEY (cliente_id) REFERENCES public.clientes(id),
  CONSTRAINT fk_nfse_servico FOREIGN KEY (servico_id) REFERENCES public.servicos(id)
);
CREATE TABLE public.pagamentos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id bigint NOT NULL,
  mp_payment_id character varying,
  mp_status character varying,
  mp_status_detail character varying,
  metodo_pagamento character varying NOT NULL,
  valor numeric NOT NULL,
  parcelas integer DEFAULT 1,
  plano_selecionado character varying,
  url_comprovante text,
  qr_code_base64 text,
  qr_code_copia_cola text,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT pagamentos_pkey PRIMARY KEY (id),
  CONSTRAINT fk_pagamentos_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.permissoes (
  id bigint NOT NULL DEFAULT nextval('permissoes_id_seq'::regclass),
  grupo_acesso_id bigint NOT NULL,
  modulo_id bigint NOT NULL,
  acao_id bigint NOT NULL,
  permitido boolean DEFAULT false,
  criado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT permissoes_pkey PRIMARY KEY (id),
  CONSTRAINT permissoes_grupo_acesso_id_fkey FOREIGN KEY (grupo_acesso_id) REFERENCES public.grupo_acesso(id),
  CONSTRAINT permissoes_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.modulos(id),
  CONSTRAINT permissoes_acao_id_fkey FOREIGN KEY (acao_id) REFERENCES public.acoes(id)
);
CREATE TABLE public.produto_composicao (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  produto_pai_id bigint NOT NULL,
  produto_filho_id bigint NOT NULL,
  quantidade numeric NOT NULL,
  CONSTRAINT produto_composicao_pkey PRIMARY KEY (id),
  CONSTRAINT fk_comp_pai FOREIGN KEY (produto_pai_id) REFERENCES public.produtos(id),
  CONSTRAINT fk_comp_filho FOREIGN KEY (produto_filho_id) REFERENCES public.produtos(id)
);
CREATE TABLE public.produto_conversao (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  produto_id bigint NOT NULL,
  unidade_entrada_id bigint NOT NULL,
  fator_conversao numeric NOT NULL,
  codigo_barras_entrada character varying,
  CONSTRAINT produto_conversao_pkey PRIMARY KEY (id),
  CONSTRAINT fk_conv_produto FOREIGN KEY (produto_id) REFERENCES public.produtos(id),
  CONSTRAINT fk_conv_unidade FOREIGN KEY (unidade_entrada_id) REFERENCES public.unidades_medida(id)
);
CREATE TABLE public.produto_imagens (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  produto_id bigint NOT NULL,
  url_imagem text NOT NULL,
  principal boolean DEFAULT false,
  ordem integer DEFAULT 0,
  CONSTRAINT produto_imagens_pkey PRIMARY KEY (id),
  CONSTRAINT fk_imagens_produto FOREIGN KEY (produto_id) REFERENCES public.produtos(id)
);
CREATE TABLE public.produtos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id bigint NOT NULL,
  nome character varying NOT NULL,
  descricao text,
  codigo_interno character varying,
  codigo_barras character varying,
  tipo_item character varying NOT NULL DEFAULT 'produto'::character varying CHECK (tipo_item::text = ANY (ARRAY['produto'::character varying, 'servico'::character varying, 'kit'::character varying]::text[])),
  situacao character varying DEFAULT 'ativo'::character varying,
  categoria_id bigint,
  marca_id bigint,
  unidade_id bigint,
  fornecedor_padrao_id bigint,
  preco_custo numeric DEFAULT 0.00,
  margem_lucro numeric DEFAULT 0.00,
  preco_venda numeric DEFAULT 0.00,
  preco_promocional numeric,
  movimenta_estoque boolean DEFAULT true,
  estoque_atual numeric DEFAULT 0.000,
  estoque_minimo numeric DEFAULT 0.000,
  estoque_maximo numeric,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  peso numeric DEFAULT 0.000,
  largura numeric DEFAULT 0.00,
  altura numeric DEFAULT 0.00,
  comprimento numeric DEFAULT 0.00,
  vendido_separadamente boolean DEFAULT true,
  comercializavel_pdv boolean DEFAULT true,
  comissao numeric DEFAULT 0.00,
  despesas_acessorias numeric DEFAULT 0.00,
  outras_despesas numeric DEFAULT 0.00,
  ncm character varying,
  cest character varying,
  origem_mercadoria integer DEFAULT 0,
  cfop_padrao character varying,
  CONSTRAINT produtos_pkey PRIMARY KEY (id),
  CONSTRAINT fk_produtos_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT fk_produtos_categoria FOREIGN KEY (categoria_id) REFERENCES public.categorias(id),
  CONSTRAINT fk_produtos_marca FOREIGN KEY (marca_id) REFERENCES public.marcas(id),
  CONSTRAINT fk_produtos_unidade FOREIGN KEY (unidade_id) REFERENCES public.unidades_medida(id),
  CONSTRAINT fk_produtos_fornecedor FOREIGN KEY (fornecedor_padrao_id) REFERENCES public.clientes(id)
);
CREATE TABLE public.produtos_composicao (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  produto_pai_id bigint NOT NULL,
  produto_filho_id bigint NOT NULL,
  quantidade numeric NOT NULL,
  CONSTRAINT produtos_composicao_pkey PRIMARY KEY (id)
);
CREATE TABLE public.produtos_conversao (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  produto_id bigint NOT NULL,
  unidade_entrada_id bigint,
  fator_conversao numeric NOT NULL,
  codigo_barras_entrada character varying,
  CONSTRAINT produtos_conversao_pkey PRIMARY KEY (id)
);
CREATE TABLE public.produtos_imagens (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  produto_id bigint NOT NULL,
  url_imagem text NOT NULL,
  ordem integer DEFAULT 0,
  principal boolean DEFAULT false,
  CONSTRAINT produtos_imagens_pkey PRIMARY KEY (id)
);
CREATE TABLE public.servicos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id bigint NOT NULL,
  nome character varying NOT NULL,
  codigo_lc116 character varying NOT NULL,
  cnae character varying,
  aliquota_iss numeric NOT NULL DEFAULT 0.00,
  valor_padrao numeric DEFAULT 0.00,
  ativo boolean DEFAULT true,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  codigo_tributacao_nacional character varying,
  CONSTRAINT servicos_pkey PRIMARY KEY (id),
  CONSTRAINT fk_servicos_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.unidades_medida (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id bigint NOT NULL,
  sigla character varying NOT NULL,
  descricao character varying NOT NULL,
  padrao boolean DEFAULT false,
  CONSTRAINT unidades_medida_pkey PRIMARY KEY (id),
  CONSTRAINT fk_unidades_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.usuarios (
  id bigint NOT NULL DEFAULT nextval('usuarios_id_seq'::regclass),
  cnpj character varying UNIQUE,
  nome_empresa character varying NOT NULL,
  telefone character varying,
  cidade character varying,
  estado character,
  email character varying NOT NULL UNIQUE,
  nome_usuario character varying UNIQUE,
  senha character varying NOT NULL,
  termos_aceitos boolean DEFAULT false,
  plano_selecionado character varying DEFAULT 'basico'::character varying,
  status USER-DEFINED DEFAULT 'pendente'::usuario_status,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now(),
  grupo_acesso_id bigint,
  reset_password_token character varying,
  reset_password_expires timestamp without time zone,
  mp_customer_id character varying,
  status_assinatura character varying DEFAULT 'pendente'::character varying,
  validade_assinatura timestamp with time zone,
  nome_completo character varying,
  cpf character varying,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT usuarios_grupo_acesso_id_fkey FOREIGN KEY (grupo_acesso_id) REFERENCES public.grupo_acesso(id)
);
CREATE TABLE public.vendas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  usuario_id bigint NOT NULL,
  cliente_id bigint,
  valor_bruto numeric NOT NULL DEFAULT 0.00,
  desconto numeric DEFAULT 0.00,
  valor_total numeric NOT NULL DEFAULT 0.00,
  forma_pagamento character varying NOT NULL,
  status character varying DEFAULT 'concluida'::character varying,
  criado_em timestamp with time zone DEFAULT now(),
  chave_acesso character varying,
  numero_nfe bigint,
  serie_nfe integer DEFAULT 1,
  protocolo character varying,
  xml_autorizado text,
  status_sefaz character varying DEFAULT 'pendente'::character varying CHECK (status_sefaz::text = ANY (ARRAY['pendente'::character varying::text, 'autorizado'::character varying::text, 'rejeitado'::character varying::text, 'cancelado'::character varying::text])),
  atualizado_em timestamp with time zone DEFAULT now(),
  CONSTRAINT vendas_pkey PRIMARY KEY (id),
  CONSTRAINT fk_vendas_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id),
  CONSTRAINT fk_vendas_cliente FOREIGN KEY (cliente_id) REFERENCES public.clientes(id)
);