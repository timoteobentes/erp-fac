/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HomeOutlined,
  DashboardOutlined,
  LocalShippingOutlined,
  RequestQuoteOutlined,
  ShoppingBagOutlined,
  StorefrontOutlined,
  Insights,
  ReceiptLongOutlined,
  BorderColor,
  TextSnippet,
  Settings
} from '@mui/icons-material';

// Helper para verificar permissão
const hasAccess = (user: any, adm: boolean) => Boolean(user?.status == "ativo" && adm);

export const getStaticMenuItems = (navigate: any, user: any, adm: boolean) => {
  const access = hasAccess(user, adm);
  const disabled = !access;

  return [
    {
      key: 'inicio',
      icon: <HomeOutlined />,
      label: 'Início',
      onClick: () => navigate('/inicio'),
    },
    {
      key: 'cadastros',
      icon: <DashboardOutlined />,
      label: 'Cadastros',
      disabled,
      children: [
        { key: 'cadastros-clientes', label: 'Clientes', onClick: () => navigate('/cadastros/clientes') },
        {
          key: 'cadastros-produtos',
          label: 'Produtos',
          children: [
            { key: 'cadastros-produtos-gerenciar', label: 'Gerenciar produtos', onClick: () => navigate('/cadastros/produtos') },
            // { key: 'cadastros-produtos-valores', label: 'Valores de produtos' },
            // { key: 'cadastros-produtos-etiquetas', label: 'Etiquetas' },
          ]
        },
      ],
    },
    // ... (Aplique a mesma lógica para os outros itens, removendo a repetição do disabled)
    {
      key: 'servicos',
      icon: <LocalShippingOutlined />,
      label: 'Serviços',
      disabled,
      children: [
        { key: 'servicos-cadastro', label: 'Meus Serviços', onClick: () => navigate('/servicos/cadastro') },
        { key: 'servicos-nfse', label: 'Emissão de NFS-e', onClick: () => navigate('/servicos/nfse') },
        { key: 'servicos-sub1', label: 'Pedidos' },
        { key: 'servicos-sub2', label: 'Orçamentos' },
      ],
    },
    {
      key: 'estoque',
      icon: <StorefrontOutlined />,
      label: 'Estoque',
      disabled,
      children: [
        { key: 'estoque-gerenciar', label: 'Gerenciar Estoque', onClick: () => navigate('/estoque') },
        { key: 'estoque-movimentacoes', label: 'Histórico de Movimentações', onClick: () => navigate('/estoque/movimentacoes') },
      ],
    },
    {
      key: 'financeiro',
      icon: <Insights />,
      label: 'Financeiro',
      disabled,
      children: [
        { key: 'financeiro-pagar', label: 'Contas a Pagar', onClick: () => navigate('/financeiro/pagar') },
        { key: 'financeiro-receber', label: 'Contas a Receber', onClick: () => navigate('/financeiro/receber') },
      ],
    },
    {
      key: 'contabilidade',
      icon: <RequestQuoteOutlined />,
      disabled: true,
      label: 'Contabilidade',
      children: [
        { key: 'contas-pagar', label: 'Contas a Pagar', onClick: () => navigate('/financeiro/pagar') },
        { key: 'contas-receber', label: 'Contas a Receber', onClick: () => navigate('/financeiro/receber') },
        { key: 'fluxo-caixa', label: 'Fluxo de Caixa' },
      ],
    },
    {
      key: 'vendas',
      icon: <ShoppingBagOutlined />,
      label: 'Vendas',
      disabled: true,
      children: [
        { key: 'vendas-sub1', label: 'Pedidos' },
        { key: 'vendas-sub2', label: 'Orçamentos' },
      ],
    },
    // estoque e financeiro
    {
      key: 'nota-fiscal',
      icon: <ReceiptLongOutlined />,
      label: 'Nota Fiscal',
      disabled: true,
      children: [
        { key: 'nota-fiscal-sub1', label: 'Pedidos' },
        { key: 'nota-fiscal-sub2', label: 'Orçamentos' },
      ],
    },
    {
      key: 'contratos',
      icon: <BorderColor />,
      label: 'Contratos',
      disabled: true,
      children: [
        { key: 'contratos-sub1', label: 'Pedidos' },
        { key: 'contratos-sub2', label: 'Orçamentos' },
      ],
    },
    {
      key: 'relatorios',
      icon: <TextSnippet />,
      label: 'Relatórios',
      disabled: true,
      children: [
        { key: 'relatorios-sub1', label: 'Pedidos' },
        { key: 'relatorios-sub2', label: 'Orçamentos' },
      ],
    },
    {
      key: 'configuracoes',
      icon: <Settings />,
      label: 'Configurações',
      disabled: true,
      children: [
        { key: 'configuracoes-sub1', label: 'Pedidos' },
        { key: 'configuracoes-sub2', label: 'Orçamentos' },
      ],
    }
  ];
};