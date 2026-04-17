import React, { useState } from "react";
import { Button, Typography, Chip, CircularProgress } from "@mui/material";
import { 
  RocketLaunch, 
  CheckCircleOutline, 
  Lock, 
  TrendingUp, 
  AccountBalanceWallet, 
  RequestQuote, 
  MoneyOff, 
  Receipt 
} from "@mui/icons-material";
import Layout from "../../template/Layout";
import { FluxoCaixaGrafico } from "../../modules/Inicio/components/FluxoCaixaGrafico";
import { useLogin } from "../../modules/Login/hooks/useLogin";
import { ModalCustom } from "../../components/ui/Modal";
import { PaymentFormSteps } from "../../modules/Inicio/components/PaymentFormSteps";
import { useDashboard } from "../../modules/Dashboard/hooks/useDashboard";
import dayjs from "dayjs";

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
  const dataAtual = dayjs().format("DD[ de ]MMMM[, ]YYYY");

  return (
    <Layout>
      {/* ==================================================================
          CENÁRIO 1: USUÁRIO ATIVO (DASHBOARD COMPLETO)
      ================================================================== */}
      {isAtivo ? (
        <div className="animate-fadeIn pb-8">
          <div className="w-full justify-between items-end sm:flex mb-8">
            <div>
               <h1 className="text-[#0F172A] font-extrabold text-3xl tracking-tight mb-1">
                 Visão Geral
               </h1>
               <p className="text-[#64748B] text-sm">
                 Bem-vindo de volta, <strong className="text-[#3C0473]">{user?.nome_empresa || "Empresa"}</strong>. Hoje é {dataAtual}.
               </p>
            </div>
            {/* Opcional: Filtros rápidos de data podem entrar aqui no futuro */}
          </div>

          {loading ? (
             <div className="flex h-64 items-center justify-center">
                 <CircularProgress sx={{ color: '#5B21B6' }} />
             </div>
          ) : (
             <>
                {/* LINHA 1: 4 CARDS DE RESUMO (SOFT UX) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  
                  {/* Card Vendas Hoje */}
                  <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#E2E8F0] p-6 flex flex-col relative overflow-hidden transition-all hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-[#ECFDF5] rounded-xl text-[#10B981]"><TrendingUp /></div>
                     </div>
                     <span className="text-[#64748B] text-sm font-semibold mb-1">Vendas Hoje</span>
                     <span className="text-3xl font-bold text-[#0F172A] tracking-tight">{formatCurrency(resumo?.vendas_hoje || 0)}</span>
                  </div>

                  {/* Card A Receber (Mês) */}
                  <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#E2E8F0] p-6 flex flex-col relative overflow-hidden transition-all hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-[#EEF2FF] rounded-xl text-[#6366F1]"><RequestQuote /></div>
                     </div>
                     <span className="text-[#64748B] text-sm font-semibold mb-1">A Receber (Mês)</span>
                     <span className="text-3xl font-bold text-[#0F172A] tracking-tight">{formatCurrency(resumo?.contas_receber_pendente_mes || 0)}</span>
                  </div>

                  {/* Card A Pagar (Mês) */}
                  <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#E2E8F0] p-6 flex flex-col relative overflow-hidden transition-all hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1">
                     <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-[#FFF1F2] rounded-xl text-[#F43F5E]"><MoneyOff /></div>
                     </div>
                     <span className="text-[#64748B] text-sm font-semibold mb-1">A Pagar (Mês)</span>
                     <span className="text-3xl font-bold text-[#0F172A] tracking-tight">{formatCurrency(resumo?.contas_pagar_pendente_mes || 0)}</span>
                  </div>

                  {/* Card Saldo Previsto (HERO CARD) */}
                  <div className="bg-gradient-to-r from-[#3C0473] to-[#5B21B6] rounded-2xl shadow-[0_10px_25px_-5px_rgba(91,33,182,0.4)] p-6 flex flex-col relative overflow-hidden text-white transition-all hover:-translate-y-1">
                     {/* Elemento de background pra dar luxo */}
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
                     
                     <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-white"><AccountBalanceWallet /></div>
                     </div>
                     <span className="text-[#E2E8F0] text-sm font-semibold mb-1 relative z-10">Saldo Projetado</span>
                     <span className="text-3xl font-bold tracking-tight relative z-10">
                        {formatCurrency((resumo?.vendas_hoje || 0) + (resumo?.contas_receber_pendente_mes || 0) - (resumo?.contas_pagar_pendente_mes || 0))}
                     </span>
                  </div>
                </div>

                {/* LINHA 2: GRÁFICO E ÚLTIMAS VENDAS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* GRAFICO (2/3 da tela) */}
                  <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#E2E8F0] p-6 flex flex-col">
                     <h2 className="text-[#0F172A] font-bold text-lg mb-6 flex items-center gap-3">
                         <div className="w-1.5 h-6 bg-[#5B21B6] rounded-full"></div>
                         Receita nos últimos 7 dias
                     </h2>
                     <div className="flex-1 w-full min-h-[300px]">
                         <FluxoCaixaGrafico dados={resumo?.graficos_vendas || []} />
                     </div>
                  </div>

                  {/* ÚLTIMAS VENDAS (1/3 da tela - Padrão Stripe) */}
                  <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#E2E8F0] flex flex-col overflow-hidden">
                      <div className="p-6 border-b border-[#F1F5F9]">
                         <h2 className="text-[#0F172A] font-bold text-lg flex items-center gap-3">
                             <div className="w-1.5 h-6 bg-[#10B981] rounded-full"></div>
                             Atividade Recente
                         </h2>
                     </div>

                     <div className="flex-1 overflow-y-auto">
                        {resumo?.ultimas_vendas && resumo.ultimas_vendas.length > 0 ? (
                           <div className="flex flex-col">
                               {resumo.ultimas_vendas.map((venda: any) => (
                                  <div key={venda.id} className="flex justify-between items-center p-4 border-b border-[#F8FAFC] hover:bg-[#F8FAFC] transition-colors cursor-default">
                                     <div className="flex items-center gap-4">
                                        <div className="bg-[#F1F5F9] text-[#475569] p-2.5 rounded-full hidden sm:flex items-center justify-center">
                                           <Receipt fontSize="small" />
                                        </div>
                                        <div className="flex flex-col">
                                           <span className="text-sm font-bold text-[#0F172A]">Venda #{venda.id}</span>
                                           <span className="text-xs text-[#64748B]">
                                              Hoje às {venda.hora} • {venda.forma_pagamento}
                                           </span>
                                        </div>
                                     </div>
                                     <div className="font-bold text-[#10B981] text-sm">
                                        +{formatCurrency(Number(venda.valor_total))}
                                     </div>
                                  </div>
                               ))}
                           </div>
                        ) : (
                           <div className="h-full flex flex-col items-center justify-center text-[#94A3B8] p-8">
                              <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-4">
                                 <Receipt sx={{ fontSize: 32, opacity: 0.5 }} />
                              </div>
                              <span className="text-sm font-medium text-[#475569] mb-1">Nenhuma venda hoje</span>
                              <span className="text-xs text-center">As suas transações de hoje aparecerão aqui. Bora vender! 🚀</span>
                           </div>
                        )}
                     </div>
                     {/* Botão de Ver Todas (Opcional para o futuro) */}
                     {resumo?.ultimas_vendas && resumo.ultimas_vendas.length > 0 && (
                        <div className="p-3 border-t border-[#F1F5F9] bg-[#F8FAFC] text-center">
                            <Button size="small" sx={{ textTransform: 'none', color: '#5B21B6', fontWeight: 600 }}>Ver todas as transações</Button>
                        </div>
                     )}
                  </div>
                  
                </div>
             </>
          )}
        </div>
      ) : (
        /* ==================================================================
          CENÁRIO 2: USUÁRIO PENDENTE (TELA DE ATIVAÇÃO LIVRE E ESPAÇOSA)
        ================================================================== */
        <div className="min-h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-12 lg:gap-20 items-center py-8 animate-fadeInUp">
          
          {/* LADO ESQUERDO: CONTEÚDO E CTA (Livre no Layout) */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <Chip 
              label="Acesso Restrito - Assinatura Pendente" 
              size="medium" 
              icon={<Lock fontSize="small" sx={{ color: '#991B1B !important' }} />}
              sx={{ width: 'fit-content', mb: 4, fontWeight: 700, backgroundColor: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5', px: 1, py: 2.5, fontSize: '0.875rem' }}
            />
            
            <h1 className="text-4xl lg:text-6xl font-extrabold text-[#0F172A] mb-6 leading-[1.1] tracking-tight">
              Potencialize <br className="hidden lg:block" /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3C0473] to-[#7E22CE]">o seu negócio.</span>
            </h1>
            
            <p className="text-[#475569] mb-10 text-lg lg:text-xl leading-relaxed max-w-xl">
              Você está a um passo de desbloquear o controle financeiro total. Ative a sua assinatura e liberte todo o poder do ERP Faço a Conta.
            </p>

            {/* Lista de Benefícios Espaçada */}
            <div className="space-y-5 mb-12">
              <BenefitItem text="Emissão de NFC-e Rápida e Ilimitada" />
              <BenefitItem text="Gestão Inteligente e Automatizada de Estoque" />
              <BenefitItem text="Painel Financeiro B2B e Fluxo de Caixa Integrado" />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
                <Button 
                  variant="contained"
                  size="large"
                  endIcon={<RocketLaunch />}
                  onClick={handleOpenModal}
                  sx={{ 
                    background: 'linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)',
                    color: '#fff',
                    py: 2,
                    px: 6,
                    fontSize: '1.1rem',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px -5px rgba(91, 33, 182, 0.4)',
                    textTransform: 'none',
                    fontWeight: 800,
                    width: { xs: '100%', sm: 'auto' },
                    '&:hover': { background: 'linear-gradient(90deg, #28024D 0%, #4C1D95 100%)', transform: 'translateY(-2px)', boxShadow: '0 15px 30px -5px rgba(91, 33, 182, 0.5)' },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Escolher Plano e Ativar
                </Button>
                
                <p className="text-sm font-semibold text-[#64748B] flex items-center gap-2">
                   <CheckCircleOutline sx={{ fontSize: 18, color: '#10B981' }} /> Ambiente 100% seguro.
                </p>
            </div>
          </div>

          {/* LADO DIREITO: ILUSTRAÇÃO "MOCKUP" (Painel Gigante) */}
          <div className="w-full lg:w-1/2 relative bg-gradient-to-br from-[#1A013A] via-[#3C0473] to-[#5B21B6] rounded-[2.5rem] lg:rounded-[3rem] p-10 lg:p-16 shadow-[0_20px_50px_-12px_rgba(91,33,182,0.5)] flex items-center justify-center overflow-hidden min-h-[450px] lg:min-h-[650px]">
            {/* Círculos decorativos no fundo */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#7E22CE] opacity-40 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#10B981] opacity-20 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>

            {/* Mockup Abstrato do Sistema (Escalado e Sofisticado) */}
            <div className="relative z-10 w-full max-w-md transform -rotate-2 hover:rotate-0 transition-transform duration-700 ease-out scale-105 lg:scale-110">
              
              {/* Card Principal (Simulando Dashboard) */}
              <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 shadow-2xl">
                {/* Fake Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="h-3 w-32 bg-white/30 rounded-full"></div>
                  <div className="h-10 w-10 bg-white/20 rounded-full"></div>
                </div>
                
                {/* Fake Gráfico */}
                <div className="flex items-end gap-3 h-32 mb-6 border-b border-white/10 pb-4">
                  <div className="w-full h-[40%] bg-white/20 rounded-t-sm hover:bg-white/30 transition-colors"></div>
                  <div className="w-full h-[60%] bg-white/40 rounded-t-sm hover:bg-white/50 transition-colors"></div>
                  <div className="w-full h-[30%] bg-white/20 rounded-t-sm hover:bg-white/30 transition-colors"></div>
                  <div className="w-full h-[90%] bg-gradient-to-t from-[#10B981] to-[#34D399] rounded-t-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                  </div>
                  <div className="w-full h-[50%] bg-white/30 rounded-t-sm hover:bg-white/40 transition-colors"></div>
                </div>

                {/* Fake Cards Pequenos */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                    <div className="h-2 w-12 bg-white/30 mb-3 rounded-full"></div>
                    <div className="h-4 w-20 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]"></div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                    <div className="h-2 w-12 bg-white/30 mb-3 rounded-full"></div>
                    <div className="h-4 w-20 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]"></div>
                  </div>
                </div>
              </div>

              {/* Card Flutuante 1 (Vendas) */}
              <div className="absolute -right-12 top-16 bg-white p-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-[#E2E8F0] flex items-center gap-4 animate-[float_4s_ease-in-out_infinite]">
                <div className="bg-[#ECFDF5] p-2.5 rounded-xl">
                  <TrendingUp className="text-[#10B981]" fontSize="small" />
                </div>
                <div>
                  <div className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest mb-1">Faturamento</div>
                  <div className="text-base font-black text-[#0F172A]">R$ 4.250,00</div>
                </div>
              </div>

              {/* Card Flutuante 2 (Clientes) */}
              <div className="absolute -left-10 bottom-16 bg-white p-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] border border-[#E2E8F0] flex items-center gap-4 animate-[float_5s_ease-in-out_infinite_reverse]">
                <div className="bg-[#F3E8FF] p-2.5 rounded-xl">
                  <CheckCircleOutline className="text-[#7E22CE]" fontSize="small" />
                </div>
                <div>
                  <div className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-widest mb-1">Status do Sistema</div>
                  <div className="text-base font-black text-[#0F172A]">Ativo e Seguro</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PAGAMENTO/PLANO (Vai herdar nosso ModalCustom novo) */}
      <ModalCustom
        maxWidth="xl"
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
  <div className="flex items-center gap-4">
    <div className="min-w-[24px]">
      <CheckCircleOutline sx={{ color: '#10B981', fontSize: 26 }} />
    </div>
    <Typography className="text-[#475569] font-medium text-[16px] lg:text-[17px]">{text}</Typography>
  </div>
);

export default Inicio;