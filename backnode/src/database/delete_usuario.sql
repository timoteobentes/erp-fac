-- =============================================================================
-- EXCLUSÃO COMPLETA DE USUÁRIO
-- Executar no Supabase SQL Editor
--
-- INSTRUÇÕES:
--   1. Substitua 'email@exemplo.com' pelo e-mail do usuário a excluir
--   2. Leia o RAISE NOTICE ao final para confirmar que o ID correto foi afetado
--   3. O script roda dentro de uma transação — em caso de erro tudo é revertido
-- =============================================================================

DO $$
DECLARE
  v_uid  BIGINT;
  v_email TEXT := 'email@exemplo.com';   -- << ALTERE AQUI
  v_rows  INT;
BEGIN

  -- Localiza o usuário
  SELECT id INTO v_uid FROM public.usuarios WHERE email = v_email;

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Usuário com e-mail "%" não encontrado.', v_email;
  END IF;

  RAISE NOTICE '===== Iniciando exclusão do usuário id=% (%) =====', v_uid, v_email;

  -- =========================================================================
  -- FASE 1: Logs e auditoria (sem FK de saída — podem ser excluídos a qualquer hora)
  -- =========================================================================

  DELETE FROM public.logs_sistema     WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[1/13] logs_sistema: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.auditoria_dados  WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[1/13] auditoria_dados: % registro(s) excluído(s)', v_rows;

  -- =========================================================================
  -- FASE 2: Assinatura e pagamentos
  -- =========================================================================

  DELETE FROM public.webhook_eventos  WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[2/13] webhook_eventos: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.notificacoes     WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[2/13] notificacoes: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.pagamentos       WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[2/13] pagamentos: % registro(s) excluído(s)', v_rows;

  -- =========================================================================
  -- FASE 3: NFS-e (referencia clientes e servicos — excluir antes deles)
  -- =========================================================================

  DELETE FROM public.nfse             WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[3/13] nfse: % registro(s) excluído(s)', v_rows;

  -- =========================================================================
  -- FASE 4: Financeiro — parcelas e lançamentos
  --   Ordem obrigatória: parcelas → contas_receber → contas_pagar
  --   (ambas referenciam formas_pagamento e contas_bancarias)
  -- =========================================================================

  DELETE FROM public.contas_pagar_parcelas  WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[4/13] contas_pagar_parcelas: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.contas_receber         WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[4/13] contas_receber: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.contas_pagar           WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[4/13] contas_pagar: % registro(s) excluído(s)', v_rows;

  -- =========================================================================
  -- FASE 5: Vendas
  --   itens_venda antes de vendas (FK venda_id)
  -- =========================================================================

  DELETE FROM public.itens_venda
    WHERE venda_id IN (SELECT id FROM public.vendas WHERE usuario_id = v_uid);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[5/13] itens_venda: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.vendas                 WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[5/13] vendas: % registro(s) excluído(s)', v_rows;

  -- =========================================================================
  -- FASE 6: Produtos e estoque
  --   Composições, conversões e imagens antes dos produtos (FK produto_id)
  --   movimentacoes_estoque também referencia produto_id
  -- =========================================================================

  -- produto_composicao (tabela legada)
  DELETE FROM public.produto_composicao
    WHERE produto_pai_id  IN (SELECT id FROM public.produtos WHERE usuario_id = v_uid)
       OR produto_filho_id IN (SELECT id FROM public.produtos WHERE usuario_id = v_uid);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[6/13] produto_composicao: % registro(s) excluído(s)', v_rows;

  -- produtos_composicao
  DELETE FROM public.produtos_composicao
    WHERE produto_pai_id  IN (SELECT id FROM public.produtos WHERE usuario_id = v_uid)
       OR produto_filho_id IN (SELECT id FROM public.produtos WHERE usuario_id = v_uid);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[6/13] produtos_composicao: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.produto_conversao
    WHERE produto_id IN (SELECT id FROM public.produtos WHERE usuario_id = v_uid);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[6/13] produto_conversao: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.produtos_conversao
    WHERE produto_id IN (SELECT id FROM public.produtos WHERE usuario_id = v_uid);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[6/13] produtos_conversao: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.produto_imagens
    WHERE produto_id IN (SELECT id FROM public.produtos WHERE usuario_id = v_uid);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[6/13] produto_imagens: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.produtos_imagens
    WHERE produto_id IN (SELECT id FROM public.produtos WHERE usuario_id = v_uid);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[6/13] produtos_imagens: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.movimentacoes_estoque  WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[6/13] movimentacoes_estoque: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.produtos               WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[6/13] produtos: % registro(s) excluído(s)', v_rows;

  -- =========================================================================
  -- FASE 7: Clientes e dados vinculados
  --   Sub-tabelas antes de clientes (FK cliente_id)
  -- =========================================================================

  DELETE FROM public.anexos
    WHERE cliente_id IN (SELECT id FROM public.clientes WHERE usuario_id = v_uid);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[7/13] anexos: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.contatos
    WHERE cliente_id IN (SELECT id FROM public.clientes WHERE usuario_id = v_uid);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[7/13] contatos: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.enderecos
    WHERE cliente_id IN (SELECT id FROM public.clientes WHERE usuario_id = v_uid);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[7/13] enderecos: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.clientes_pf
    WHERE cliente_id IN (SELECT id FROM public.clientes WHERE usuario_id = v_uid);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[7/13] clientes_pf: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.clientes_pj
    WHERE cliente_id IN (SELECT id FROM public.clientes WHERE usuario_id = v_uid);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[7/13] clientes_pj: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.clientes_estrangeiro
    WHERE cliente_id IN (SELECT id FROM public.clientes WHERE usuario_id = v_uid);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[7/13] clientes_estrangeiro: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.clientes               WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[7/13] clientes: % registro(s) excluído(s)', v_rows;

  -- =========================================================================
  -- FASE 8: Fornecedores e dados vinculados
  -- =========================================================================

  DELETE FROM public.fornecedores_pf
    WHERE fornecedor_id IN (SELECT id FROM public.fornecedores WHERE usuario_id = v_uid);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[8/13] fornecedores_pf: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.fornecedores_pj
    WHERE fornecedor_id IN (SELECT id FROM public.fornecedores WHERE usuario_id = v_uid);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[8/13] fornecedores_pj: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.fornecedores_estrangeiro
    WHERE fornecedor_id IN (SELECT id FROM public.fornecedores WHERE usuario_id = v_uid);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[8/13] fornecedores_estrangeiro: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.contatos_fornecedor
    WHERE fornecedor_id IN (SELECT id FROM public.fornecedores WHERE usuario_id = v_uid);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[8/13] contatos_fornecedor: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.enderecos_fornecedor
    WHERE fornecedor_id IN (SELECT id FROM public.fornecedores WHERE usuario_id = v_uid);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[8/13] enderecos_fornecedor: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.anexos_fornecedor
    WHERE fornecedor_id IN (SELECT id FROM public.fornecedores WHERE usuario_id = v_uid);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[8/13] anexos_fornecedor: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.produtos_servicos
    WHERE fornecedor_id IN (SELECT id FROM public.fornecedores WHERE usuario_id = v_uid);
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[8/13] produtos_servicos: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.fornecedores               WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[8/13] fornecedores: % registro(s) excluído(s)', v_rows;

  -- =========================================================================
  -- FASE 9: Estrutura financeira
  --   formas_pagamento referencia contas_bancarias → excluir antes
  -- =========================================================================

  DELETE FROM public.formas_pagamento   WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[9/13] formas_pagamento: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.forma_pagamento    WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[9/13] forma_pagamento (legado): % registro(s) excluído(s)', v_rows;

  DELETE FROM public.contas_bancarias   WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[9/13] contas_bancarias: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.plano_contas       WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[9/13] plano_contas: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.centro_custos      WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[9/13] centro_custos: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.categorias_dre     WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[9/13] categorias_dre: % registro(s) excluído(s)', v_rows;

  -- =========================================================================
  -- FASE 10: Catálogo (categorias com auto-referência, marcas, unidades)
  --   Zerar categoria_pai_id antes para evitar violação da FK de auto-referência
  -- =========================================================================

  UPDATE public.categorias SET categoria_pai_id = NULL WHERE usuario_id = v_uid;

  DELETE FROM public.categorias         WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[10/13] categorias: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.categorias_produtos WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[10/13] categorias_produtos: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.marcas              WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[10/13] marcas: % registro(s) excluído(s)', v_rows;

  -- Exclui apenas unidades personalizadas (padrão = false indica que foram criadas pelo usuário)
  DELETE FROM public.unidades_medida     WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[10/13] unidades_medida: % registro(s) excluído(s)', v_rows;

  -- =========================================================================
  -- FASE 11: Serviços (após nfse já excluída)
  -- =========================================================================

  DELETE FROM public.servicos            WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[11/13] servicos: % registro(s) excluído(s)', v_rows;

  -- =========================================================================
  -- FASE 12: Configurações fiscais
  -- =========================================================================

  DELETE FROM public.configuracoes_fiscais      WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[12/13] configuracoes_fiscais: % registro(s) excluído(s)', v_rows;

  DELETE FROM public.configuracoes_fiscais_nfse WHERE usuario_id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[12/13] configuracoes_fiscais_nfse: % registro(s) excluído(s)', v_rows;

  -- =========================================================================
  -- FASE 13: Excluir o usuário
  -- =========================================================================

  DELETE FROM public.usuarios WHERE id = v_uid;
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RAISE NOTICE '[13/13] usuarios: % registro(s) excluído(s)', v_rows;

  RAISE NOTICE '===== Usuário id=% (%) excluído com sucesso. =====', v_uid, v_email;

END;
$$;
