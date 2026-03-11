import React, { useState } from "react";
import { Button, Typography, Chip } from "@mui/material";
import { 
  RocketLaunch, 
  CheckCircleOutline, 
  Lock, 
  TrendingUp, 
  People
} from "@mui/icons-material";
import Layout from "../../template/Layout";
import { FluxoCaixaGrafico } from "../../modules/Inicio/components/FluxoCaixaGrafico";
import { useLogin } from "../../modules/Login/hooks/useLogin";
import { ModalCustom } from "../../components/ui/Modal";
import { PaymentFormSteps } from "../../modules/Inicio/components/PaymentFormSteps";

// Adicionando imports formatCurrency e ícones Extras
import { AccountBalanceWallet, RequestQuote, MoneyOff, Receipt } from "@mui/icons-material";
import { useDashboard } from "../../modules/Dashboard/hooks/useDashboard";
import { CircularProgress } from '@mui/material';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const Inicio: React.FC = () => {
  const { user } = useLogin();
  const { resumo, loading } = useDashboard();
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const isAtivo = user?.status === "ativo";

  return (
    <Layout>
      {/* CENÁRIO 1: USUÁRIO ATIVO (DASHBOARD COMPLETO) */}
      {isAtivo ? (
        <div className="animate-fadeIn pb-8">
          <div className="w-full justify-between items-center sm:flex mb-6">
            <div>
               <h1 className="text-[#3C0473] font-bold text-3xl">
                 Olá, {user?.nome_empresa || "Empresa"} 👋
               </h1>
               <p className="text-gray-500 text-sm mt-1">Veja um resumo rápido e decole suas vendas hoje.</p>
            </div>
            {/* Opcional: Filtros ou Botão PDV rápido */}
          </div>

          {loading ? (
             <div className="flex h-64 items-center justify-center"><CircularProgress sx={{ color: '#9842F6' }} /></div>
          ) : (
             <>
                {/* LINHA 1: 4 CARDS DE RESUMO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Card Vendas Hoje */}
                  <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-5 flex flex-col relative overflow-hidden group">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-green-50 rounded-lg text-green-600"><TrendingUp /></div>
                     </div>
                     <span className="text-gray-500 text-sm font-semibold mb-1">Vendas Hoje</span>
                     <span className="text-2xl font-bold text-gray-800">{formatCurrency(resumo?.vendas_hoje || 0)}</span>
                  </div>

                  {/* Card A Receber (Mês) */}
                  <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-5 flex flex-col relative overflow-hidden group">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600"><RequestQuote /></div>
                     </div>
                     <span className="text-gray-500 text-sm font-semibold mb-1">A Receber (Mês)</span>
                     <span className="text-2xl font-bold text-gray-800">{formatCurrency(resumo?.contas_receber_pendente_mes || 0)}</span>
                  </div>

                  {/* Card A Pagar (Mês) */}
                  <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-5 flex flex-col relative overflow-hidden group">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-red-50 rounded-lg text-red-500"><MoneyOff /></div>
                     </div>
                     <span className="text-gray-500 text-sm font-semibold mb-1">A Pagar (Mês)</span>
                     <span className="text-2xl font-bold text-gray-800">{formatCurrency(resumo?.contas_pagar_pendente_mes || 0)}</span>
                  </div>

                  {/* Card Saldo Previsto (VendasHoje + Receber - Pagar) Simples Projecao */}
                  <div className="bg-gradient-to-br from-[#6B00A1] to-[#3C0473] rounded-xl shadow-[0_4px_20px_rgba(107,0,161,0.2)] p-5 flex flex-col relative overflow-hidden text-white">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-white/20 rounded-lg text-white"><AccountBalanceWallet /></div>
                     </div>
                     <span className="text-white/80 text-sm font-semibold mb-1">Saldo Projetado</span>
                     <span className="text-2xl font-bold">{formatCurrency((resumo?.vendas_hoje || 0) + (resumo?.contas_receber_pendente_mes || 0) - (resumo?.contas_pagar_pendente_mes || 0))}</span>
                  </div>
                </div>

                {/* LINHA 2: GRÁFICO E ÚLTIMAS VENDAS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* GRAFICO (2/3 da tela) */}
                  <div className="lg:col-span-2 bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-6 flex flex-col">
                     <h2 className="text-gray-800 font-bold text-lg mb-6 flex items-center gap-2">
                         <div className="w-1.5 h-6 bg-[#9842F6] rounded-full"></div>
                         Vendas (Últimos 7 dias)
                     </h2>
                     <div className="flex-1 w-full min-h-[300px]">
                        <FluxoCaixaGrafico dados={resumo?.graficos_vendas || []} />
                     </div>
                  </div>

                  {/* ÚLTIMAS VENDAS (1/3 da tela) */}
                  <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 p-6 flex flex-col">
                     <h2 className="text-gray-800 font-bold text-lg mb-4 flex items-center gap-2">
                         <div className="w-1.5 h-6 bg-pink-500 rounded-full"></div>
                         Últimas Vendas Hoje
                     </h2>

                     <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {resumo?.ultimas_vendas && resumo.ultimas_vendas.length > 0 ? (
                           resumo.ultimas_vendas.map((venda: any) => (
                              <div key={venda.id} className="flex justify-between items-center bg-gray-50 border border-gray-100 p-3 rounded-lg hover:shadow-sm transition-shadow">
                                 <div className="flex items-center gap-3">
                                    <div className="bg-[#e9d5ff] text-[#6B00A1] p-2 rounded-full hidden sm:block">
                                        <Receipt fontSize="small" />
                                    </div>
                                    <div className="flex flex-col">
                                       <span className="text-sm font-bold text-gray-800">Cód: #{venda.id}</span>
                                       <span className="text-xs text-gray-500 flex items-center gap-1">
                                          Hoje, {venda.hora} • {venda.forma_pagamento}
                                       </span>
                                    </div>
                                 </div>
                                 <div className="font-bold text-green-600 text-sm">
                                    + {formatCurrency(Number(venda.valor_total))}
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="h-full flex flex-col items-center justify-center text-gray-400 mt-10">
                              <Receipt sx={{ fontSize: 40, mb: 2, opacity: 0.2 }} />
                              <span className="text-sm text-center">Nenhuma venda concluída hoje ainda.<br />Bora vender! 🚀</span>
                           </div>
                        )}
                     </div>
                  </div>
                  
                </div>
             </>
          )}
        </div>
      ) : (
        /* ==================================================================
          CENÁRIO 2: USUÁRIO PENDENTE (TELA DE ATIVAÇÃO / LOCK SCREEN)
        ================================================================== */
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <div className="bg-white rounded-[4px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-w-5xl w-full border border-gray-100 animate-fadeInUp">
            
            {/* LADO ESQUERDO: CONTEÚDO E CTA */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <Chip 
                label="Acesso Pendente" 
                color="warning" 
                size="small" 
                icon={<Lock fontSize="small" />}
                sx={{ width: 'fit-content', mb: 3, fontWeight: 'bold' }}
              />
              
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#3C0473] mb-4 leading-tight">
                Potencialize <br/> o seu negócio.
              </h1>
              
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                Você está a um passo de desbloquear o controle total da sua empresa. Ative sua conta para liberar o painel administrativo.
              </p>

              {/* Lista de Benefícios */}
              <div className="space-y-4 mb-8">
                <BenefitItem text="Emissão de Notas Fiscais Ilimitadas" />
                <BenefitItem text="Gestão de Estoque e Clientes" />
                <BenefitItem text="Relatórios Financeiros Detalhados" />
              </div>

              <Button 
                variant="contained"
                size="large"
                endIcon={<RocketLaunch />}
                onClick={handleOpenModal}
                sx={{ 
                  bgcolor: '#6B00A1',
                  py: 1.5,
                  px: 4,
                  fontSize: '1rem',
                  boxShadow: '0 8px 20px -4px rgba(107, 0, 161, 0.4)',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': { bgcolor: '#3C0473', transform: 'translateY(-2px)' },
                  transition: 'all 0.2s'
                }}
              >
                Escolher Plano e Ativar
              </Button>
              
              <p className="mt-4 text-xs text-gray-400 text-center md:text-left">
                Ambiente seguro • Garantia de 7 dias
              </p>
            </div>

            {/* LADO DIREITO: ILUSTRAÇÃO "MOCKUP" DO SISTEMA */}
            <div className="w-full md:w-1/2 bg-gradient-to-br from-[#3C0473] to-[#6B00A1] p-10 flex items-center justify-center relative overflow-hidden">
              {/* Círculos decorativos no fundo */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#9842F6] opacity-20 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>

              {/* Mockup Abstrato do Sistema (CSS puro, sem imagem pesada) */}
              <div className="relative z-10 w-full max-w-xs transform rotate-[-5deg] hover:rotate-0 transition-transform duration-500">
                {/* Card Principal (Simulando Dashboard) */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-2xl">
                  {/* Fake Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-2 w-20 bg-white/40 rounded"></div>
                    <div className="h-6 w-6 bg-white/40 rounded-full"></div>
                  </div>
                  
                  {/* Fake Gráfico */}
                  <div className="flex items-end gap-2 h-24 mb-4 border-b border-white/10 pb-2">
                    <div className="w-1/5 h-[40%] bg-white/30 rounded-t"></div>
                    <div className="w-1/5 h-[60%] bg-white/50 rounded-t"></div>
                    <div className="w-1/5 h-[30%] bg-white/30 rounded-t"></div>
                    <div className="w-1/5 h-[80%] bg-[#9842F6] rounded-t shadow-[0_0_15px_rgba(152,66,246,0.5)]"></div>
                    <div className="w-1/5 h-[50%] bg-white/30 rounded-t"></div>
                  </div>

                  {/* Fake Cards Pequenos */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/20 rounded-lg p-2">
                      <div className="h-1.5 w-8 bg-white/50 mb-1 rounded"></div>
                      <div className="h-3 w-12 bg-white rounded"></div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-2">
                      <div className="h-1.5 w-8 bg-white/50 mb-1 rounded"></div>
                      <div className="h-3 w-12 bg-white rounded"></div>
                    </div>
                  </div>
                </div>

                {/* Card Flutuante 1 (Vendas) */}
                <div className="absolute -right-8 top-10 bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 animate-float">
                  <div className="bg-green-100 p-1.5 rounded-full">
                    <TrendingUp className="text-green-600 text-sm" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Vendas Hoje</div>
                    <div className="text-sm font-bold text-gray-800">R$ 1.250,00</div>
                  </div>
                </div>

                {/* Card Flutuante 2 (Clientes) */}
                <div className="absolute -left-6 bottom-8 bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 animate-float-delayed">
                  <div className="bg-purple-100 p-1.5 rounded-full">
                    <People className="text-purple-600 text-sm" />
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Novos Clientes</div>
                    <div className="text-sm font-bold text-gray-800">+12</div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PAGAMENTO/PLANO */}
      <ModalCustom
        open={modalOpen}
        onClose={handleCloseModal}
        title="Ativação da Assinatura"
        content={<PaymentFormSteps onClose={handleCloseModal} />}
      />
    </Layout>
  );
};

// Componente auxiliar para item da lista
const BenefitItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3">
    <div className="min-w-[20px]">
      <CheckCircleOutline sx={{ color: '#6B00A1', fontSize: 20 }} />
    </div>
    <Typography className="text-gray-700 font-medium">{text}</Typography>
  </div>
);

export default Inicio;