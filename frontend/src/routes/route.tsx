/* eslint-disable react-refresh/only-export-components */
import { Routes, Route, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// --- IMPORTS (Lazy Loading) ---

// Auth & Public
const Login = lazy(() => import('../pages/Login'));
const Cadastro = lazy(() => import('../pages/Cadastro'));
const SolicitarNovaSenha = lazy(() => import('../pages/SolicitarNovaSenha'));
const RedefinirSenha = lazy(() => import('../pages/RedefinirSenha'));

// Core
const Inicio = lazy(() => import('../pages/Inicio'));
const ContratarPlano = lazy(() => import('../pages/ContratarPlano'));

// Módulo: Clientes
const Clientes = lazy(() => import('../pages/Cadastros/Clientes'));
const NovoCliente = lazy(() => import('../pages/Cadastros/Clientes/Novo'));
const VisualizarCliente = lazy(() => import('../pages/Cadastros/Clientes/Visualizar'));
const EditarCliente = lazy(() => import('../pages/Cadastros/Clientes/Editar'));

// Módulo: Produtos
const Produtos = lazy(() => import('../pages/Cadastros/Produtos'));
const NovoProduto = lazy(() => import('../pages/Cadastros/Produtos/Novo'));
const EditarProduto = lazy(() => import('../pages/Cadastros/Produtos/Editar'));
const VisualizarProduto = lazy(() => import('../pages/Cadastros/Produtos/Visualizar'));
const Fornecedores = lazy(() => import('../pages/Cadastros/Fornecedores'));
const NovoFornecedor = lazy(() => import('../pages/Cadastros/Fornecedores/Novo'));
const EditarFornecedor = lazy(() => import('../pages/Cadastros/Fornecedores/Editar'));
const VisualizarFornecedor = lazy(() => import('../pages/Cadastros/Fornecedores/Visualizar'));

// Módulo: Servicos Gerais
const Servicos = lazy(() => import('../pages/Servicos/Cadastro'));
const NovoServico = lazy(() => import('../pages/Servicos/Cadastro/Novo'));
const EditarServico = lazy(() => import('../pages/Servicos/Cadastro/Editar'));

// Módulo: Servicos (Emissão NFSe)
const HistoricoNFSe = lazy(() => import('../pages/Servicos/NFSe'));
const NovaNFSe = lazy(() => import('../pages/Servicos/NFSe/Nova'));

// Módulo: Estoque
const GerenciarEstoque = lazy(() => import('../pages/Estoque/Gerenciar'));
const MovimentacoesEstoque = lazy(() => import('../pages/Estoque/Movimentacoes'));

// Módulo: Financeiro
const ContasPagar = lazy(() => import('../pages/Financeiro/ContasPagar'));
const NovoPagamento = lazy(() => import('../pages/Financeiro/ContasPagar/Novo'));
const VisualizarPagamento = lazy(() => import('../pages/Financeiro/ContasPagar/Visualizar'));
const EditarPagamento = lazy(() => import('../pages/Financeiro/ContasPagar/Editar'));
const ContasReceber = lazy(() => import('../pages/Financeiro/ContasReceber'));
const NovoRecebimento = lazy(() => import('../pages/Financeiro/ContasReceber/Novo'));
const VisualizarRecebimento = lazy(() => import('../pages/Financeiro/ContasReceber/Visualizar'));
const EditarRecebimento = lazy(() => import('../pages/Financeiro/ContasReceber/Editar'));
const DreGerencial = lazy(() => import('../pages/Financeiro/DreGerencial'));
const CategoriasDre = lazy(() => import('../pages/Financeiro/DreGerencial/Categorias'));
const NovaCategoriaDre = lazy(() => import('../pages/Financeiro/DreGerencial/Categorias/Novo'));
const VisualizarCategoriaDre = lazy(() => import('../pages/Financeiro/DreGerencial/Categorias/Visualizar'));
const EditarCategoriaDre = lazy(() => import('../pages/Financeiro/DreGerencial/Categorias/Editar'));
const FluxoCaixa = lazy(() => import('../pages/Financeiro/FluxoCaixa'));
const CentroCustos = lazy(() => import('../pages/Financeiro/CentroCustos'));
const NovoCentroCusto = lazy(() => import('../pages/Financeiro/CentroCustos/Novo'));
const VisualizarCentroCusto = lazy(() => import('../pages/Financeiro/CentroCustos/Visualizar'));
const EditarCentroCusto = lazy(() => import('../pages/Financeiro/CentroCustos/Editar'));
const PlanosContas = lazy(() => import('../pages/Financeiro/PlanosContas'));
const NovoPlanoConta = lazy(() => import('../pages/Financeiro/PlanosContas/Novo'));
const VisualizarPlanoConta = lazy(() => import('../pages/Financeiro/PlanosContas/Visualizar'));
const EditarPlanoConta = lazy(() => import('../pages/Financeiro/PlanosContas/Editar'));
const ContasBancarias = lazy(() => import('../pages/Financeiro/ContasBancarias'));
const NovaContaBancaria = lazy(() => import('../pages/Financeiro/ContasBancarias/Novo'));
const VisualizarContaBancaria = lazy(() => import('../pages/Financeiro/ContasBancarias/Visualizar'));
const EditarContaBancaria = lazy(() => import('../pages/Financeiro/ContasBancarias/Editar'));

// Módulo: PDV
const FormasPagamento = lazy(() => import('../pages/Financeiro/FormasPagamento'));
const NovaFormaPagamento = lazy(() => import('../pages/Financeiro/FormasPagamento/Novo'));
const VisualizarFormaPagamento = lazy(() => import('../pages/Financeiro/FormasPagamento/Visualizar'));
const EditarFormaPagamento = lazy(() => import('../pages/Financeiro/FormasPagamento/Editar'));
const PDV = lazy(() => import('../pages/PDV'));

// Módulo: Perfil
const Perfil = lazy(() => import('../pages/Perfil'));

// Componente de Loading Centralizado
const Loading = () => (
  <div className="flex justify-center items-center min-h-screen bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9842F6]"></div>
  </div>
);

// --- LAYOUTS AUXILIARES ---

// Wrapper para rotas protegidas (evita repetir <ProtectedRoute> mil vezes)
const ProtectedLayout = () => (
  <ProtectedRoute>
    <Outlet />
  </ProtectedRoute>
);

// Wrapper para rotas públicas (Login, etc)
const PublicLayout = () => (
  <PublicRoute>
    <Outlet />
  </PublicRoute>
);

// --- DEFINIÇÃO DAS ROTAS ---

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* === ROTAS PÚBLICAS === */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/solicitar-nova-senha" element={<SolicitarNovaSenha />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        </Route>

        {/* === ROTAS PROTEGIDAS (O Sistema) === */}
        <Route element={<ProtectedLayout />}>
          {/* Dashboard */}
          <Route path="/" element={<Inicio />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/contratar-plano" element={<ContratarPlano />} />

          {/* Módulo: Cadastros -> Clientes */}
          <Route path="/cadastros/clientes">
            <Route index element={<Clientes />} />
            <Route path="novo" element={<NovoCliente />} />
            {/* CORREÇÃO AQUI: Adicionado /:id para capturar o parâmetro */}
            <Route path="visualizar/:id" element={<VisualizarCliente />} />
            <Route path="editar/:id" element={<EditarCliente />} />
          </Route>

          {/* Módulo: Cadastros -> Produtos */}
          <Route path="/cadastros/produtos">
             <Route index element={<Produtos />} />
             <Route path="novo" element={<NovoProduto />} />
             <Route path="editar/:id" element={<EditarProduto />} />
             <Route path="visualizar/:id" element={<VisualizarProduto />} />
          </Route>

          <Route path="/cadastros/fornecedores">
             <Route index element={<Fornecedores />} />
             <Route path="novo" element={<NovoFornecedor />} />
             <Route path="editar/:id" element={<EditarFornecedor />} />
             <Route path="visualizar/:id" element={<VisualizarFornecedor />} />
          </Route>

          {/* Módulo: Serviços Principais */}
          <Route path="/servicos/cadastro">
             <Route index element={<Servicos />} />
             <Route path="novo" element={<NovoServico />} />
             <Route path="editar/:id" element={<EditarServico />} />
          </Route>

          <Route path="/servicos/nfse">
             <Route index element={<HistoricoNFSe />} />
             <Route path="nova" element={<NovaNFSe />} />
          </Route>

          {/* Módulo: Estoque */}
          <Route path="/estoque" element={<GerenciarEstoque />} />
          <Route path="/estoque/movimentacoes" element={<MovimentacoesEstoque />} />

          {/* Módulo: Financeiro */}
          <Route path="/financeiro/pagar">
            <Route index element={<ContasPagar />} />
            <Route path="novo" element={<NovoPagamento />} />
            <Route path="visualizar/:id" element={<VisualizarPagamento />} />
            <Route path="editar/:id" element={<EditarPagamento />} />
          </Route>
          <Route path="/financeiro/receber">
            <Route index element={<ContasReceber />} />
            <Route path="novo" element={<NovoRecebimento />} />
            <Route path="visualizar/:id" element={<VisualizarRecebimento />} />
            <Route path="editar/:id" element={<EditarRecebimento />} />
          </Route>
          <Route path="/financeiro/dre-gerencial">
            <Route index element={<DreGerencial />} />
            <Route path="categorias" element={<CategoriasDre />} />
            <Route path="categorias/novo" element={<NovaCategoriaDre />} />
            <Route path="categorias/visualizar/:id" element={<VisualizarCategoriaDre />} />
            <Route path="categorias/editar/:id" element={<EditarCategoriaDre />} />
          </Route>
          <Route path="/financeiro/fluxo-caixa" element={<FluxoCaixa />} />

          <Route path="/financeiro/centro-custos">
            <Route index element={<CentroCustos />} />
            <Route path="novo" element={<NovoCentroCusto />} />
            <Route path="visualizar/:id" element={<VisualizarCentroCusto />} />
            <Route path="editar/:id" element={<EditarCentroCusto />} />
          </Route>
          <Route path="/financeiro/planos-de-contas">
            <Route index element={<PlanosContas />} />
            <Route path="novo" element={<NovoPlanoConta />} />
            <Route path="visualizar/:id" element={<VisualizarPlanoConta />} />
            <Route path="editar/:id" element={<EditarPlanoConta />} />
          </Route>
          <Route path="/financeiro/contas-bancarias">
            <Route index element={<ContasBancarias />} />
            <Route path="novo" element={<NovaContaBancaria />} />
            <Route path="visualizar/:id" element={<VisualizarContaBancaria />} />
            <Route path="editar/:id" element={<EditarContaBancaria />} />
          </Route>

          {/* Módulo: PDV Frente de Caixa */}
          <Route path="/financeiro/formas-de-pagamento">
            <Route index element={<FormasPagamento />} />
            <Route path="novo" element={<NovaFormaPagamento />} />
            <Route path="visualizar/:id" element={<VisualizarFormaPagamento />} />
            <Route path="editar/:id" element={<EditarFormaPagamento />} />
          </Route>
          <Route path="/pdv" element={<PDV />} />

          {/* Módulo: Perfil e Configurações */}
          <Route path="/perfil" element={<Perfil />} />
        </Route>

        {/* Rota 404 (Opcional, mas recomendada) */}
        <Route path="*" element={<div className="p-10 text-center">Página não encontrada</div>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
