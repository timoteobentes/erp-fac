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

// Helper para verificar permissao
const hasAccess = (user: any, adm: boolean) => Boolean(user?.status == "ativo" && adm);

export const getStaticMenuItems = (navigate: any, user: any, adm: boolean) => {
  const access = hasAccess(user, adm);
  const disabled = !access;

  return [
    {
      key: 'inicio',
      icon: <HomeOutlined />,
      label: 'Inicio',
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
          ]
        },
      ],
    },
    {
      key: 'servicos',
      icon: <LocalShippingOutlined />,
      label: 'Servicos',
      disabled,
      children: [
        { key: 'servicos-cadastro', label: 'Meus Servicos', onClick: () => navigate('/servicos/cadastro') },
        { key: 'servicos-nfse', label: 'Emissao de NFS-e', onClick: () => navigate('/servicos/nfse') },
        { key: 'servicos-sub1', label: 'Pedidos' },
        { key: 'servicos-sub2', label: 'Orcamentos' },
      ],
    },
    {
      key: 'estoque',
      icon: <StorefrontOutlined />,
      label: 'Estoque',
      disabled,
      children: [
        { key: 'estoque-gerenciar', label: 'Gerenciar Estoque', onClick: () => navigate('/estoque') },
        { key: 'estoque-movimentacoes', label: 'Historico de Movimentacoes', onClick: () => navigate('/estoque/movimentacoes') },
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
        { key: 'financeiro-dre-gerencial', label: 'DRE Gerencial', onClick: () => navigate('/financeiro/dre-gerencial') },
        { key: 'financeiro-fluxo-caixa', label: 'Fluxo de Caixa', onClick: () => navigate('/financeiro/fluxo-caixa') },
        {
          key: 'financeiro-opcoes-auxiliares',
          label: 'Opções Auxiliares',
          children: [
            { key: 'financeiro-centro-custos', label: 'Centro de Custos', onClick: () => navigate('/financeiro/centro-custos') },
            { key: 'financeiro-planos-contas', label: 'Planos de Contas', onClick: () => navigate('/financeiro/planos-de-contas') },
            { key: 'financeiro-contas-bancarias', label: 'Contas Bancárias', onClick: () => navigate('/financeiro/contas-bancarias') },
            { key: 'financeiro-formas-pagamento', label: 'Formas de Pagamento', onClick: () => navigate('/financeiro/formas-de-pagamento') },
          ]
        },
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
        { key: 'fluxo-caixa', label: 'Fluxo de Caixa', onClick: () => navigate('/financeiro/fluxo-caixa') },
      ],
    },
    {
      key: 'vendas',
      icon: <ShoppingBagOutlined />,
      label: 'Vendas',
      disabled: true,
      children: [
        { key: 'vendas-sub1', label: 'Pedidos' },
        { key: 'vendas-sub2', label: 'Orcamentos' },
      ],
    },
    {
      key: 'nota-fiscal',
      icon: <ReceiptLongOutlined />,
      label: 'Nota Fiscal',
      disabled: true,
      children: [
        { key: 'nota-fiscal-sub1', label: 'Pedidos' },
        { key: 'nota-fiscal-sub2', label: 'Orcamentos' },
      ],
    },
    {
      key: 'contratos',
      icon: <BorderColor />,
      label: 'Contratos',
      disabled: true,
      children: [
        { key: 'contratos-sub1', label: 'Pedidos' },
        { key: 'contratos-sub2', label: 'Orcamentos' },
      ],
    },
    {
      key: 'relatorios',
      icon: <TextSnippet />,
      label: 'Relatorios',
      disabled: true,
      children: [
        { key: 'relatorios-sub1', label: 'Pedidos' },
        { key: 'relatorios-sub2', label: 'Orcamentos' },
      ],
    },
    {
      key: 'configuracoes',
      icon: <Settings />,
      label: 'Configuracoes',
      disabled: true,
      children: [
        { key: 'configuracoes-sub1', label: 'Pedidos' },
        { key: 'configuracoes-sub2', label: 'Orcamentos' },
      ],
    }
  ];
};
