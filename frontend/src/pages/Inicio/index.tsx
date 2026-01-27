import { useState } from "react";
import { Button, Card, CardContent, Typography } from "@mui/material";
import { Login } from "@mui/icons-material";
import { DollarOutlined } from "@ant-design/icons";
import Layout from "../../template/Layout";
import { FluxoCaixaGrafico } from "../../modules/Inicio/components/FluxoCaixaGrafico";
import { useLogin } from "../../modules/Login/hooks/useLogin";
import fac_logo_roxo from '../../assets/FAC_logo_roxo.svg';
import { ModalCustom } from "../../components/ui/Modal";
import { PaymentFormSteps } from "../../modules/Inicio/components/PaymentFormSteps";

const Inicio = () => {
  const { user, adm } = useLogin();
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <Layout>
      {user && (
        <>
          {(user?.pago == true || adm) ? (
            <>
              <div className="w-full text-start mb-6">
                <span className="text-[#9842F6] font-bold text-2xl">Olá, {user?.nome_empresa}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <Card
                  className="relative bg-white p-6 overflow-hidden"
                  sx={{
                    border: "1px solid #E9DEF6",
                    borderRadius: "8px",
                    boxShadow: "none",
                    "&:hover": {
                      boxShadow: "none"
                    }
                  }}
                >
                  <div className="absolute top-18 right-45 opacity-20">
                    <DollarOutlined
                      className="text-[10rem]"
                      style={{ color: "#61CD6F" }}
                    />
                  </div>
                  <div className="absolute -bottom-10 -right-0 opacity-20">
                    <DollarOutlined
                      className="text-[10rem]"
                      style={{ color: "#61CD6F" }}
                    />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h6 className="text-[#3C0473] font-bold text-lg font-heebo">
                          Contas a Receber
                        </h6>
                        <span className="text-[#9842F6] font-semibold">dia</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#9842F6]">
                        <Login className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="mt-2 mb-6">
                      <h4 className="text-4xl font-bold text-[#61CD6F]">
                        R$ 20.000,00
                      </h4>
                    </div>
                  </div>
                </Card>

                <Card
                  className="relative bg-white p-6 overflow-hidden"
                  sx={{
                    border: "1px solid #E9DEF6",
                    borderRadius: "8px",
                    boxShadow: "none",
                    "&:hover": {
                      boxShadow: "none"
                    }
                  }}
                >
                  <div className="absolute -bottom-10 right-45 opacity-20">
                    <DollarOutlined
                      className="text-[10rem]"
                      style={{ color: "#D0214B" }}
                    />
                  </div>
                  <div className="absolute top-18 -right-0 opacity-20">
                    <DollarOutlined
                      className="text-[10rem]"
                      style={{ color: "#D0214B" }}
                    />
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h6 className="text-[#3C0473] font-bold text-lg font-heebo">
                          Contas a Pagar
                        </h6>
                        <span className="text-[#9842F6] font-semibold">dia</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#9842F6]">
                        <Login className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="mt-2 mb-6">
                      <h4 className="text-4xl font-bold text-[#D0214B]">
                        R$ 5.000,00
                      </h4>
                    </div>
                  </div>
                </Card>

                <Card
                  className="md:col-span-2 lg:col-span-1 relative bg-white p-6 overflow-hidden"
                  sx={{
                    border: "1px solid #E9DEF6",
                    borderRadius: "8px",
                    boxShadow: "none",
                    "&:hover": {
                      boxShadow: "none"
                    }
                  }}
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-col items-start gap-2">
                        <h6 className="text-[#3C0473] font-bold text-lg font-heebo">
                          Fluxo de Caixa
                        </h6>
                        <span className="text-[#9842F6] font-semibold">Mensal</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#9842F6]">
                        <Login className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="mt-2 mb-6">
                      <FluxoCaixaGrafico dados={0} />
                    </div>
                  </div>
                </Card>

                <Card
                  className="md:col-span-2 lg:col-span-1 relative bg-white p-6 overflow-hidden"
                  sx={{
                    border: "1px solid #E9DEF6",
                    borderRadius: "8px",
                    boxShadow: "none",
                    "&:hover": {
                      boxShadow: "none"
                    }
                  }}
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-col items-start gap-2">
                        <h6 className="text-[#3C0473] font-bold text-lg font-heebo">
                          Vendas
                        </h6>
                        <span className="text-[#9842F6] font-semibold">Mensal</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#9842F6]">
                        <Login className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="mt-2 mb-6">
                      {/* <FluxoCaixaGrafico dados={0} /> */}
                    </div>
                  </div>
                </Card>

                <Card
                  sx={{
                    border: "1px solid #E9DEF6",
                    borderRadius: "8px",
                    boxShadow: "none"
                  }}
                >
                  <CardContent className="p-6">
                    <Typography variant="h6" className="text-gray-600 mb-4">
                      Pagamentos do Mês
                    </Typography>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Realizado</span>
                        <span className="text-green-600 font-semibold">R$ 3.000,00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Falta</span>
                        <span className="text-yellow-600 font-semibold">R$ 2.000,00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Previsto</span>
                        <span className="text-blue-600 font-semibold">R$ 5.000,00</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    border: "1px solid #E9DEF6",
                    borderRadius: "8px",
                    boxShadow: "none"
                  }}
                >
                  <CardContent className="p-6">
                    <Typography variant="h6" className="text-gray-600 mb-4">
                      Vendas
                    </Typography>
                    {/* <ReactECharts 
                      option={vendasOptions} 
                      style={{ height: '200px' }}
                    /> */}
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    border: "1px solid #E9DEF6",
                    borderRadius: "8px",
                    boxShadow: "none"
                  }}
                >
                  <CardContent className="p-6">
                    <Typography variant="h6" className="text-gray-600 mb-4">
                      Contas Bancárias
                    </Typography>
                    {/* <ReactECharts 
                      option={contasBancariasOptions} 
                      style={{ height: '200px' }}
                    /> */}
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    border: "1px solid #E9DEF6",
                    borderRadius: "8px",
                    boxShadow: "none"
                  }}
                >
                  <CardContent className="p-6">
                    <Typography variant="h6" className="text-gray-600 mb-4">
                      Minhas Contas
                    </Typography>
                    <div className="space-y-3">
                      {[
                        { name: 'Conta bancária 1', value: 'R$ 15.000,00' },
                        { name: 'Conta bancária 2', value: 'R$ 8.500,00' },
                        { name: 'Conta bancária 3', value: 'R$ 3.200,00' },
                        { name: 'Conta bancária 4', value: 'R$ 1.800,00' }
                      ].map((conta, index) => (
                        <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-gray-700">{conta.name}</span>
                          <span className="text-green-600 font-semibold">{conta.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center">
                <div className="font-bold text-5xl text-[#3C0473]">
                  Para acessar o
                </div>
                <img 
                  src={fac_logo_roxo} 
                  alt='FAC Logo' 
                  className='w-64 h-auto'
                />
                <div className="font-bold text-xl text-[#3C0473] -mt-4 mb-4">
                  e aproveitar todas as suas funcionalidades
                </div>
                <Button 
                  variant='contained' 
                  color='success' 
                  sx={{ color: '#FFFFFF' }}
                  onClick={handleOpenModal}
                >
                  Ative sua conta
                </Button>
              </div>

              <ModalCustom
                open={modalOpen}
                onClose={handleCloseModal}
                title="Ativação da Conta"
                content={<PaymentFormSteps onClose={handleCloseModal} />}
              />
            </>
          )}
        </>
      )}
    </Layout>
  )
}

export default Inicio;