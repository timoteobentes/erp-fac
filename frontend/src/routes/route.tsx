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

// Módulo: Fornecedores
const Fornecedores = lazy(() => import('../pages/Cadastros/Fornecedores'));

// Módulo: Produtos
const ProdutoNovo = lazy(() => import('../modules/Cadastros/Produtos/Novo'));

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
          <Route path="/esqueci-senha" element={<SolicitarNovaSenha />} />
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

          {/* Módulo: Cadastros -> Fornecedores */}
          <Route path="/cadastros/fornecedores" element={<Fornecedores />} />

          {/* Módulo: Cadastros -> Produtos */}
          <Route path="/cadastros/produtos/novo" element={<ProdutoNovo />} />
        </Route>

        {/* Rota 404 (Opcional, mas recomendada) */}
        <Route path="*" element={<div className="p-10 text-center">Página não encontrada</div>} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;