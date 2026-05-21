import { PoolClient } from 'pg';

const categoriasProdutos = [
  'Alimentos',
  'Bebida',
  'Cama, Mesa e Banho',
  'Diversos',
  'Eletrodomésticos',
  'Eletrônicos',
  'Informática',
  'Móveis e Decoração',
  'Telefonia',
  'Beleza e Estética',
];

const unidadesMedida = [
  ['UN', 'Unidade', true],
  ['CX', 'Caixa', false],
  ['PCT', 'Pacote', false],
  ['KG', 'Quilograma', false],
  ['G', 'Grama', false],
  ['LT', 'Litro', false],
  ['ML', 'Mililitro', false],
  ['M', 'Metro', false],
  ['M2', 'Metro quadrado', false],
  ['M3', 'Metro cúbico', false],
  ['PC', 'Peça', false],
  ['PAR', 'Par', false],
  ['DZ', 'Dúzia', false],
  ['FD', 'Fardo', false],
  ['SC', 'Saco', false],
  ['RL', 'Rolo', false],
] as const;

const planosContas = [
  ['PAGAMENTO', '1.1 - Despesas administrativas e comerciais'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.1 - Aluguel'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.2 - Assessorias e associações'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.3 - Cartório'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.4 - Combustivel e translados'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.5 - Confraternizações'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.6 - Contabilidade'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.7 - Correios'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.8 - Cursos e treinamentos'],
  ['OUTRAS_DESPESAS', '1.1.9 - Distribuição de lucros'],
  ['OUTRAS_DESPESAS', '1.1.10 - Empréstimos'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.11 - Encargos funcionários - 13o salário'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.12 - Encargos funcionários - alimentação'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.13 - Encargos funcionários - assist. médica e odontol.'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.14 - Encargos funcionários - exames pré e demissionais'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.15 - Encargos funcionários - FGTS'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.16 - Encargos funcionarios - horas extras'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.17 - Encargos funcionários - INSS'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.18 - Encargos funcionários - vale transporte'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.19 - Encargos - rescisões trabalhistas'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.20 - Energia elétrica + água'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.21 - Impostos - alvará'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.22 - Impostos - coleta de lixo'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.23 - Impostos - IPTU'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.24 - Impostos - PIS'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.25 - Licença ou aluguel de softwares'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.26 - Limpeza'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.27 - Manutenção equipamentos'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.28 - Marketing e publicidade'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.29 - Material de escritório'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.30 - Material reforma'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.31 - Remuneração funcionários'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.32 - Segurança'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.33 - Supermercado'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.34 - Telefonia e internet'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.35 - Transportadora'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.36 - Viagens'],
  ['DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS', '1.1.37 - Devolução de vendas'],
  ['PAGAMENTO', '1.2 - Despesas de produtos vendidos'],
  ['DESPESAS_PRODUTOS_VENDIDOS', '1.2.1 - Comissão de vendedores'],
  ['DESPESAS_PRODUTOS_VENDIDOS', '1.2.2 - Compras'],
  ['DESPESAS_PRODUTOS_VENDIDOS', '1.2.3 - Impostos - COFINS'],
  ['DESPESAS_PRODUTOS_VENDIDOS', '1.2.4 - Impostos - CSSL'],
  ['DESPESAS_PRODUTOS_VENDIDOS', '1.2.5 - Impostos - ICMS'],
  ['DESPESAS_PRODUTOS_VENDIDOS', '1.2.6 - Impostos - importação IPI'],
  ['DESPESAS_PRODUTOS_VENDIDOS', '1.2.7 - Impostos - IRPJ'],
  ['DESPESAS_PRODUTOS_VENDIDOS', '1.2.8 - Impostos - ISS'],
  ['PAGAMENTO', '1.3 - Despesas financeiras'],
  ['DESPESAS_FINANCEIRAS', '1.3.1 - Despesas bancárias'],
  ['PAGAMENTO', '1.4 - Investimentos'],
  ['INVESTIMENTOS', '1.4.1 - Aquisição de equipamentos'],
  ['PAGAMENTO', '1.5 - Outras despesas'],
  ['OUTRAS_DESPESAS', '1.5.1 - Adiantamento - funcionários'],
  ['OUTRAS_DESPESAS', '1.5.2 - Ajuste de caixa'],
  ['RECEBIMENTOS', '2.1 - Receitas de vendas'],
  ['RECEITAS_VENDAS', '2.1.1 - Vendas de produtos'],
  ['RECEITAS_VENDAS', '2.1.2 - Vendas no balcão'],
  ['RECEITAS_VENDAS', '2.1.3 - Prestações de serviços'],
  ['RECEITAS_VENDAS', '2.1.4 - Contratos de serviços'],
  ['RECEITAS_VENDAS', '2.1.5 - Locação de equipamentos'],
  ['RECEBIMENTOS', '2.2 - Receitas financeiras'],
  ['RECEITAS_FINANCEIRAS', '2.2.1 - Aplicações financeiras'],
  ['RECEBIMENTOS', '2.3 - Outras receitas'],
  ['OUTRAS_RECEITAS', '2.3.1 - Ajuste de caixa'],
  ['OUTRAS_RECEITAS', '2.3.2 - Devolução de adiantamento'],
] as const;

export class DadosPadraoUsuarioService {
  async inicializar(client: PoolClient, usuarioId: number): Promise<void> {
    await this.inserirCategoriasProdutos(client, usuarioId);
    await this.inserirUnidadesMedida(client, usuarioId);
    await this.inserirPlanosContas(client, usuarioId);
  }

  private async inserirCategoriasProdutos(client: PoolClient, usuarioId: number): Promise<void> {
    await client.query(
      `
        INSERT INTO categorias (usuario_id, nome, ativa)
        SELECT $1, item.nome, true
        FROM unnest($2::text[]) AS item(nome)
        WHERE NOT EXISTS (
          SELECT 1 FROM categorias c
          WHERE c.usuario_id = $1
            AND lower(c.nome) = lower(item.nome)
            AND c.ativa = true
        )
      `,
      [usuarioId, categoriasProdutos]
    );
  }

  private async inserirUnidadesMedida(client: PoolClient, usuarioId: number): Promise<void> {
    await client.query(
      `
        INSERT INTO unidades_medida (usuario_id, sigla, descricao, padrao)
        SELECT $1, item.sigla, item.descricao, item.padrao
        FROM jsonb_to_recordset($2::jsonb) AS item(sigla text, descricao text, padrao boolean)
        WHERE NOT EXISTS (
          SELECT 1 FROM unidades_medida um
          WHERE um.usuario_id = $1
            AND upper(um.sigla) = upper(item.sigla)
        )
      `,
      [usuarioId, JSON.stringify(unidadesMedida.map(([sigla, descricao, padrao]) => ({ sigla, descricao, padrao })))]
    );
  }

  private async inserirPlanosContas(client: PoolClient, usuarioId: number): Promise<void> {
    await client.query(
      `
        INSERT INTO plano_contas (usuario_id, conta_mae, nome)
        SELECT $1, item.conta_mae, item.nome
        FROM jsonb_to_recordset($2::jsonb) AS item(conta_mae text, nome text)
        WHERE NOT EXISTS (
          SELECT 1 FROM plano_contas pc
          WHERE pc.usuario_id = $1
            AND pc.conta_mae = item.conta_mae
            AND pc.nome = item.nome
        )
      `,
      [usuarioId, JSON.stringify(planosContas.map(([conta_mae, nome]) => ({ conta_mae, nome })))]
    );
  }
}
