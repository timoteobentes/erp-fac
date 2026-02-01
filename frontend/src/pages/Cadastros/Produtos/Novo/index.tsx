/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { ConfigProvider, Tabs } from 'antd';
import { 
  Button, Box, Card, CardContent, TextField,
  CircularProgress,  Skeleton
} from "@mui/material";
import { Check, Close } from "@mui/icons-material";
import Layout from "../../../../template/Layout";
import { useNavigate } from "react-router";
import { useNovoProduto } from "../../../../modules/Cadastros/Produtos/Novo/hooks/useNovoProduto";
import { novoProdutoSchema, type NovoProdutoFormData } from "../../../../modules/Cadastros/Produtos/Novo/schemas/novoProdutoSchema";

const NovoProduto: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading } = useNovoProduto();

  const { 
    control, 
    handleSubmit
  } = useForm<NovoProdutoFormData | any>({
    resolver: zodResolver(novoProdutoSchema),
  });

  const onChange = (key: string) => {
    console.log(key);
  };

  const onSubmit = async (data: NovoProdutoFormData) => {
    console.log("data >> ", data)
    // await handleCadastrarCliente(data);
  };

  if (isLoading) {
    return (
      <Layout>
        <Box className="p-4">
          <Skeleton variant="rectangular" height={60} className="mb-4 rounded" />
          <Skeleton variant="rectangular" height={400} className="rounded" />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#9842F6]">Novo Produto</h1>
          <p className="text-gray-500">Preencha os dados abaixo para criar um novo produto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit, (errors) => console.log("Erros de validação:", errors))}>
        <Card sx={{ boxShadow: "none !important", borderRadius: "4px" }}>
          <CardContent className="flex flex-col gap-6" sx={{ padding: "0 !important", borderRadius: "4px" }}>
            <Box>
              <ConfigProvider
                theme={{
                  components: {
                    Tabs: {
                      itemSelectedColor: "#9842F6",
                      itemHoverColor: "#9842F6",
                      cardPaddingLG: "8px 32px",
                      cardBg: "#F3F4F5"
                    }
                  }
                }}
              >
                <Tabs
                  onChange={onChange}
                  type="card"
                  size="large"
                  items={[
                    {
                      key: '1',
                      label: 'Dados',
                      children: (
                        <div className="border border-gray-200 border-t-none -mt-4 p-4">
                          <Box>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <Controller
                                name="nome"
                                control={control}
                                render={({ field }) => <TextField {...field} fullWidth label="Nome" />}
                              />
                              <Controller
                                name="codigo_interno"
                                control={control}
                                render={({ field }) => <TextField {...field} fullWidth label="Código Interno" />}
                              />
                              <Controller
                                name="codigo_barras"
                                control={control}
                                render={({ field }) => <TextField {...field} fullWidth label="Código de Barras" />}
                              />
                              <Controller
                                name="tipo_item"
                                control={control}
                                render={({ field }) => <TextField {...field} fullWidth label="Tipo de Item" />}
                              />
                              <Controller
                                name="situacao"
                                control={control}
                                render={({ field }) => <TextField {...field} fullWidth label="Situação" />}
                              />
                            </div>
                          </Box>

                          {/* FOOTER ACTIONS */}
                          <Box className="flex justify-start gap-3 mt-6 pt-4">
                            <Button 
                              type="submit"
                              variant="contained" 
                              color="success" 
                              disabled={isLoading}
                              startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : <Check />}
                              sx={{ color: 'white', minWidth: 150 }}
                            >
                              {isLoading ? "Salvando..." : "Cadastrar"}
                            </Button>
                            <Button 
                              type="button"
                              variant="contained" 
                              color="error"
                              startIcon={<Close />}
                              onClick={() => navigate("/cadastros/clientes")}
                            >
                              Cancelar
                            </Button>
                          </Box>
                        </div>
                      )
                    },
                    {
                      key: '2',
                      label: 'Detalhes',
                      children: (
                        <div>detalhes</div>
                      )
                    },
                    {
                      key: '3',
                      label: 'Valores',
                      children: (
                        <div>valores</div>
                      )
                    },
                    {
                      key: '4',
                      label: 'Estoque',
                      children: (
                        <div>estoque</div>
                      )
                    },
                    {
                      key: '5',
                      label: 'Fotos',
                      children: (
                        <div>fotos</div>
                      )
                    },
                    {
                      key: '6',
                      label: 'Fiscal',
                      children: (
                        <div>fiscal</div>
                      )
                    },
                    {
                      key: '7',
                      label: 'Composição',
                      children: (
                        <div>composição</div>
                      )
                    },
                    {
                      key: '8',
                      label: 'Fornecedores',
                      children: (
                        <div>fornecedores</div>
                      )
                    },
                  ]}
                />
              </ConfigProvider>
            </Box>
          </CardContent>
        </Card>
      </form>
    </Layout>
  );
}

export default NovoProduto;