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
const hasAccess = (user: any, adm: boolean) => Boolean(user?.pago || adm);

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
        { key: 'cadastros-fornecedores', label: 'Fornecedores', onClick: () => navigate('/cadastros/fornecedores') },
        {
          key: 'cadastros-produtos',
          label: 'Produtos',
          children: [
            { key: 'cadastros-produtos-gerenciar', label: 'Gerenciar produtos' },
            { key: 'cadastros-produtos-valores', label: 'Valores de produtos' },
            { key: 'cadastros-produtos-etiquetas', label: 'Etiquetas' },
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
        { key: 'servicos-sub1', label: 'Pedidos' },
        { key: 'servicos-sub2', label: 'Orçamentos' },
      ],
    },
    {
      key: 'contabilidade',
      icon: <RequestQuoteOutlined />,
      label: 'Contabilidade',
      disabled,
      children: [
        { key: 'contas-pagar', label: 'Contas a Pagar' },
        { key: 'contas-receber', label: 'Contas a Receber' },
        { key: 'fluxo-caixa', label: 'Fluxo de Caixa' },
      ],
    },
    {
      key: 'vendas',
      icon: <ShoppingBagOutlined />,
      label: 'Vendas',
      disabled,
      children: [
        { key: 'vendas-sub1', label: 'Pedidos' },
        { key: 'vendas-sub2', label: 'Orçamentos' },
      ],
    },
    {
      key: 'estoque',
      icon: <StorefrontOutlined />,
      label: 'Estoque',
      disabled,
      children: [
        { key: 'estoque-sub1', label: 'Pedidos' },
        { key: 'estoque-sub2', label: 'Orçamentos' },
      ],
    },
    {
      key: 'financeiro',
      icon: <Insights />,
      label: 'Financeiro',
      disabled,
      children: [
        { key: 'financeiro-sub1', label: 'Pedidos' },
        { key: 'financeiro-sub2', label: 'Orçamentos' },
      ],
    },
    {
      key: 'nota-fiscal',
      icon: <ReceiptLongOutlined />,
      label: 'Nota Fiscal',
      disabled,
      children: [
        { key: 'nota-fiscal-sub1', label: 'Pedidos' },
        { key: 'nota-fiscal-sub2', label: 'Orçamentos' },
      ],
    },
    {
      key: 'contratos',
      icon: <BorderColor />,
      label: 'Contratos',
      disabled,
      children: [
        { key: 'contratos-sub1', label: 'Pedidos' },
        { key: 'contratos-sub2', label: 'Orçamentos' },
      ],
    },
    {
      key: 'relatorios',
      icon: <TextSnippet />,
      label: 'Relatórios',
      disabled,
      children: [
        { key: 'relatorios-sub1', label: 'Pedidos' },
        { key: 'relatorios-sub2', label: 'Orçamentos' },
      ],
    },
    {
      key: 'configuracoes',
      icon: <Settings />,
      label: 'Configurações',
      disabled,
      children: [
        { key: 'configuracoes-sub1', label: 'Pedidos' },
        { key: 'configuracoes-sub2', label: 'Orçamentos' },
      ],
    }
  ];
};