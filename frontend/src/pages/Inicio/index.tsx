import React, { useState } from "react";
import { Button, Card, CardContent, Typography, Chip } from "@mui/material";
import { 
  RocketLaunch, 
  CheckCircleOutline, 
  Lock, 
  TrendingUp, 
  People
} from "@mui/icons-material";
import { DollarOutlined } from "@ant-design/icons"; // Se estiver usando ant-design icons
import Layout from "../../template/Layout";
import { FluxoCaixaGrafico } from "../../modules/Inicio/components/FluxoCaixaGrafico";
import { useLogin } from "../../modules/Login/hooks/useLogin";
import { ModalCustom } from "../../components/ui/Modal";
import { PaymentFormSteps } from "../../modules/Inicio/components/PaymentFormSteps";

const Inicio: React.FC = () => {
  const { user } = useLogin();
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  // Verificação simples: Se status é ativo E é admin -> Mostra Dashboard
  // Caso contrário -> Mostra tela de ativação
  const isAtivo = user?.status === "ativo";

  return (
    <Layout>
      {/* ==================================================================
          CENÁRIO 1: USUÁRIO ATIVO (DASHBOARD)
      ================================================================== */}
      {isAtivo ? (
        <div className="animate-fadeIn">
          <div className="w-full text-start mb-6">
            <span className="text-[#9842F6] font-bold text-2xl">
              Olá, {user?.nome_empresa || "Empresa"}
            </span>
            <p className="text-gray-500 text-sm">Visão geral do seu negócio hoje.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <DollarOutlined style={{ fontSize: '24px', color: '#6B00A1' }} />
                  </div>
                  <Typography variant="h6" fontWeight="bold" color="#3C0473">
                    Fluxo de Caixa
                  </Typography>
                </div>
                <FluxoCaixaGrafico dados={0} />
              </CardContent>
            </Card>

            {/* Aqui entrariam outros gráficos ou cards de resumo */}
            <Card sx={{ borderRadius: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.05)", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CardContent className="text-center text-gray-400">
                <TrendingUp sx={{ fontSize: 48, opacity: 0.2, mb: 2 }} />
                <Typography>Mais métricas em breve...</Typography>
              </CardContent>
            </Card>
          </div>
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