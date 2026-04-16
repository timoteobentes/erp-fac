/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, type SyntheticEvent } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { ConfigProvider, Table } from 'antd';
import { 
  Button, Box, TextField, MenuItem, Skeleton, InputAdornment, 
  Switch, FormControlLabel, Divider, Typography, Tabs, Tab, IconButton
} from "@mui/material";
import { 
  ArrowBack, EditOutlined, CategoryOutlined, StraightenOutlined, 
  MonetizationOnOutlined, Inventory2Outlined, LayersOutlined, 
  LocalShippingOutlined, ReceiptLongOutlined 
} from "@mui/icons-material";
import Layout from "../../../../template/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { useProdutos } from "../../../../modules/Cadastros/Produtos/hooks/useProdutos";
import {
  listarProdutosComposicaoService,
  listarFornecedoresService
} from "../../../../modules/Cadastros/Produtos/services/produtoService";

// Estilo Premium para Inputs em modo de Visualização (ReadOnly)
const readOnlyInputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#F8FAFC',
    '& fieldset': { borderColor: 'transparent' },
    '&:hover fieldset': { borderColor: 'transparent' },
    '&.Mui-focused fieldset': { borderColor: 'transparent' },
    '& input': { color: '#0F172A', fontWeight: 600, WebkitTextFillColor: '#0F172A' },
    '& .MuiSelect-select': { color: '#0F172A', fontWeight: 600, WebkitTextFillColor: '#0F172A' },
    '& .MuiInputAdornment-root p': { color: '#64748B', fontWeight: 600 }
  },
  '& .MuiInputLabel-root': { color: '#64748B' },
  '& .Mui-disabled': { WebkitTextFillColor: '#0F172A !important', color: '#0F172A !important' }
};

// Componente simples para Painel de Abas com Animação
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const CustomTabPanel = ({ children, value, index }: TabPanelProps) => (
  <div role="tabpanel" hidden={value !== index} className={`transition-opacity duration-300 ${value === index ? 'opacity-100 animate-fadeIn' : 'opacity-0 hidden'}`}>
    {value === index && <Box sx={{ p: { xs: 3, md: 5 } }}>{children}</Box>}
  </div>
);

const VisualizarProduto: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchProdutoId, carregarAuxiliares, auxiliares } = useProdutos();
  
  const [loadingDados, setLoadingDados] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [listaProdutos, setListaProdutos] = useState<any[]>([]); 

  const { control, watch, reset } = useForm<any>({
    defaultValues: {
      situacao: 'ativo', tipo_item: 'produto', movimenta_estoque: true, vendido_separadamente: true,
      comercializavel_pdv: true, produto_ativo: true, preco_custo: 0, despesas_acessorias: 0,
      outras_despesas: 0, margem_lucro: 0, preco_venda: 0, estoque_atual: 0,
      composicao: [], conversoes: [], imagens: []
    }
  });

  const { fields: conversaoFields } = useFieldArray({ control, name: "conversoes" });
  const { fields: composicaoFields } = useFieldArray({ control, name: "composicao" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        await carregarAuxiliares();
        
        const [produtoDados, resProds, resForn]: any = await Promise.all([
          fetchProdutoId(Number(id)), listarProdutosComposicaoService(), listarFornecedoresService()
        ]);

        if (resProds) setListaProdutos(resProds);
        if (resForn) setFornecedores(resForn);

        if (produtoDados) {
          const formValues = {
            ...produtoDados,
            produto_ativo: produtoDados.situacao === 'ativo',
            preco_custo: Number(produtoDados.preco_custo || 0),
            despesas_acessorias: Number(produtoDados.despesas_acessorias || 0),
            outras_despesas: Number(produtoDados.outras_despesas || 0),
            margem_lucro: Number(produtoDados.margem_lucro || 0),
            preco_venda: Number(produtoDados.preco_venda || 0),
            estoque_atual: Number(produtoDados.estoque_atual || 0),
            estoque_minimo: Number(produtoDados.estoque_minimo || 0),
            estoque_maximo: Number(produtoDados.estoque_maximo || 0),
            peso: Number(produtoDados.peso || 0),
            largura: Number(produtoDados.largura || 0),
            altura: Number(produtoDados.altura || 0),
            comprimento: Number(produtoDados.comprimento || 0),
            comissao: Number(produtoDados.comissao || 0),
            vendido_separadamente: Boolean(produtoDados.vendido_separadamente),
            comercializavel_pdv: Boolean(produtoDados.comercializavel_pdv),
            movimenta_estoque: Boolean(produtoDados.movimenta_estoque),
            composicao: produtoDados.composicao || [],
            conversoes: produtoDados.conversoes || [],
            imagens: produtoDados.imagens || []
          };
          reset(formValues);
        }
      } catch (error) {
        console.error("Erro ao carregar dados", error);
      } finally {
        setLoadingDados(false);
      }
    };
    fetchData();
  }, [id, carregarAuxiliares, fetchProdutoId, reset]);

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const custo = watch('preco_custo');
  const despesas = watch('despesas_acessorias');
  const outras = watch('outras_despesas');
  const tipoItem = watch('tipo_item');
  const nomeProduto = watch('nome');
  const codigoProduto = watch('codigo_interno');

  const custoFinal = Number(custo || 0) + Number(despesas || 0) + Number(outras || 0);

  // LOADING PREMIUM B2B
  if (loadingDados) {
    return (
      <Layout>
        <div className="mb-8 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Skeleton variant="circular" width={48} height={48} />
              <div>
                 <Skeleton variant="text" width={200} height={40} />
                 <Skeleton variant="text" width={300} height={20} />
              </div>
           </div>
           <Skeleton variant="rounded" width={140} height={42} sx={{ borderRadius: '8px' }} />
        </div>
        <Skeleton variant="rounded" width="100%" height={600} sx={{ borderRadius: '24px' }} />
      </Layout>
    );
  }

  return (
    <Layout>
      {/* HEADER DE NAVEGAÇÃO PREMIUM */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center gap-4">
          <IconButton 
            onClick={() => navigate('/cadastros/produtos')}
            sx={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', color: '#475569', '&:hover': { backgroundColor: '#F8FAFC', color: '#0F172A' } }}
          >
            <ArrowBack />
          </IconButton>
          <div className="flex flex-col">
            <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                {nomeProduto || 'Detalhes do Produto'}
            </Typography>
            <Typography variant="body2" color="#64748B">
                Código: <strong className="text-[#3C0473]">#{codigoProduto || '----'}</strong> • Visualização de ficha técnica e valores.
            </Typography>
          </div>
        </div>
        
        <Button 
          variant="outlined" 
          startIcon={<EditOutlined />}
          onClick={() => navigate(`/cadastros/produtos/editar/${id}`)}
          sx={{ 
              borderColor: '#E2E8F0', color: '#0F172A', fontWeight: 600, textTransform: 'none', 
              borderRadius: '8px', px: 3, py: 1, backgroundColor: '#FFFFFF', boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              '&:hover': { borderColor: '#5B21B6', backgroundColor: '#F8FAFC', color: '#5B21B6' }
          }}
        >
          Editar Produto
        </Button>
      </div>

      <form className="animate-fadeIn">
        {/* CONTAINER PRINCIPAL (Soft UX) */}
        <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", overflow: 'hidden' }}>
          
          {/* CABEÇALHO DAS ABAS ESTILIZADO */}
          <Box sx={{ borderBottom: '1px solid #F1F5F9', backgroundColor: '#FCFDFD', px: { xs: 1, md: 3 }, pt: 1 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                  '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, color: '#64748B', fontSize: '0.95rem', minHeight: '60px', marginRight: 2 },
                  '& .Mui-selected': { color: '#5B21B6 !important' },
                  '& .MuiTabs-indicator': { backgroundColor: '#5B21B6', height: '3px', borderTopLeftRadius: '3px', borderTopRightRadius: '3px' }
              }}
            >
              <Tab icon={<CategoryOutlined sx={{ mb: '0 !important', mr: 1 }} />} iconPosition="start" label="Dados" />
              <Tab icon={<StraightenOutlined sx={{ mb: '0 !important', mr: 1 }} />} iconPosition="start" label="Detalhes" />
              <Tab icon={<MonetizationOnOutlined sx={{ mb: '0 !important', mr: 1 }} />} iconPosition="start" label="Valores" />
              <Tab icon={<Inventory2Outlined sx={{ mb: '0 !important', mr: 1 }} />} iconPosition="start" label="Estoque" />
              <Tab icon={<LayersOutlined sx={{ mb: '0 !important', mr: 1 }} />} iconPosition="start" label="Composição" />
              <Tab icon={<LocalShippingOutlined sx={{ mb: '0 !important', mr: 1 }} />} iconPosition="start" label="Fornecedores" />
              <Tab icon={<ReceiptLongOutlined sx={{ mb: '0 !important', mr: 1 }} />} iconPosition="start" label="Fiscal" />
            </Tabs>
          </Box>
          
          <Box sx={{ minHeight: '400px' }}>
            
            {/* ====================== ABA 0: DADOS ====================== */}
            <CustomTabPanel value={tabValue} index={0}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Controller name="nome" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Nome" InputProps={{ readOnly: true }} sx={readOnlyInputStyles} />
                  )} />
                  <Controller name="codigo_interno" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Código Interno" InputProps={{ readOnly: true }} sx={readOnlyInputStyles} />
                  )} />
                  <Controller name="codigo_barras" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Código de Barras" InputProps={{ readOnly: true }} sx={readOnlyInputStyles} />
                  )} />
                  <Controller name="tipo_item" control={control} render={({ field }) => (
                    <TextField {...field} select fullWidth label="Grupo do Produto" InputProps={{ readOnly: true }} sx={readOnlyInputStyles}>
                        <MenuItem value="produto">Produto Acabado</MenuItem>
                        <MenuItem value="servico">Serviço</MenuItem>
                        <MenuItem value="kit">Kit</MenuItem>
                    </TextField>
                  )} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Controller name="categoria_id" control={control} render={({ field }) => (
                      <TextField {...field} select fullWidth label="Categoria" InputProps={{ readOnly: true }} sx={readOnlyInputStyles}>
                          <MenuItem value={0}><em>Selecione</em></MenuItem>
                          {auxiliares.categorias.map(c => <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>)}
                      </TextField>
                  )} />
                  <Controller name="marca_id" control={control} render={({ field }) => (
                      <TextField {...field} select fullWidth label="Marca" InputProps={{ readOnly: true }} sx={readOnlyInputStyles}>
                          <MenuItem value={0}><em>Selecione</em></MenuItem>
                          {auxiliares.marcas.map(m => <MenuItem key={m.id} value={m.id}>{m.nome}</MenuItem>)}
                      </TextField>
                  )} />
                  <Controller name="unidade_id" control={control} render={({ field }) => (
                      <TextField {...field} select fullWidth label="Unidade Base" InputProps={{ readOnly: true }} sx={readOnlyInputStyles}>
                          {auxiliares.unidades.map(u => <MenuItem key={u.id} value={u.id}>{u.sigla} - {u.descricao}</MenuItem>)}
                      </TextField>
                  )} />
              </div>

              {conversaoFields.length > 0 && (
                <>
                  <div className="w-full mt-8 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#475569] font-medium">
                    As regras de conversão ativas para este produto:
                  </div>

                  {conversaoFields.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-4 mt-4 items-center p-4 border border-[#F1F5F9] rounded-xl">
                          <div className="col-span-1 text-center font-bold text-[#94A3B8]">1</div>
                          <div className="col-span-3">
                              <Controller name={`conversoes.${index}.unidade_entrada_id` as any} control={control} render={({ field }) => (
                                  <TextField {...field} select fullWidth size="small" label="Unidade Entrada" InputProps={{ readOnly: true }} sx={readOnlyInputStyles}>
                                      {auxiliares.unidades.map(u => <MenuItem key={u.id} value={u.id}>{u.sigla}</MenuItem>)}
                                  </TextField>
                              )} />
                          </div>
                          <div className="col-span-2 text-center text-sm font-bold text-[#5B21B6]">equivale a</div>
                          <div className="col-span-2">
                              <Controller name={`conversoes.${index}.fator_conversao` as any} control={control} render={({ field }) => (
                                  <TextField {...field} type="number" fullWidth size="small" label="Fator" InputProps={{ readOnly: true }} sx={readOnlyInputStyles} />
                              )} />
                          </div>
                          <div className="col-span-4 text-sm text-[#64748B] font-medium">unidades de saída (Principal)</div>
                      </div>
                  ))}
                </>
              )}
            </CustomTabPanel>

            {/* ====================== ABA 1: DETALHES ====================== */}
            <CustomTabPanel value={tabValue} index={1}>
                <Typography variant="h6" fontWeight={700} color="#0F172A" mb={3}>Peso e Dimensões</Typography>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Controller name="peso" control={control} render={({ field }) => (
                        <TextField {...field} type="number" fullWidth label="Peso Bruto (kg)" InputProps={{ readOnly: true }} sx={readOnlyInputStyles} />
                    )} />
                    <Controller name="largura" control={control} render={({ field }) => (
                        <TextField {...field} type="number" fullWidth label="Largura (cm)" InputProps={{ readOnly: true }} sx={readOnlyInputStyles} />
                    )} />
                    <Controller name="altura" control={control} render={({ field }) => (
                        <TextField {...field} type="number" fullWidth label="Altura (cm)" InputProps={{ readOnly: true }} sx={readOnlyInputStyles} />
                    )} />
                    <Controller name="comprimento" control={control} render={({ field }) => (
                        <TextField {...field} type="number" fullWidth label="Comprimento (cm)" InputProps={{ readOnly: true }} sx={readOnlyInputStyles} />
                    )} />
                </div>

                <Divider sx={{ my: 5, borderColor: '#F1F5F9' }} />

                <Typography variant="h6" fontWeight={700} color="#0F172A" mb={3}>Configurações Adicionais</Typography>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F8FAFC] p-5 rounded-xl border border-[#E2E8F0]">
                    <Controller name="produto_ativo" control={control} render={({ field }) => (
                        <FormControlLabel control={<Switch checked={field.value} color="primary" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#5B21B6' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#5B21B6' } }} disabled/>} label={<Typography variant="body2" fontWeight={600} color="#475569">Produto Ativo no Sistema</Typography>} />
                    )} />
                    <Controller name="vendido_separadamente" control={control} render={({ field }) => (
                        <FormControlLabel control={<Switch checked={field.value} color="primary" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#5B21B6' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#5B21B6' } }} disabled/>} label={<Typography variant="body2" fontWeight={600} color="#475569">Vendido Separadamente</Typography>} />
                    )} />
                    <Controller name="comercializavel_pdv" control={control} render={({ field }) => (
                        <FormControlLabel control={<Switch checked={field.value} color="primary" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#5B21B6' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#5B21B6' } }} disabled/>} label={<Typography variant="body2" fontWeight={600} color="#475569">Comercializável no PDV</Typography>} />
                    )} />
                </div>
                <div className="mt-6 md:w-1/4">
                    <Controller name="comissao" control={control} render={({ field }) => (
                        <TextField {...field} type="number" fullWidth label="Comissão por Venda" InputProps={{ readOnly: true, endAdornment: <InputAdornment position="end">%</InputAdornment> }} sx={readOnlyInputStyles} />
                    )} />
                </div>
            </CustomTabPanel>

            {/* ====================== ABA 2: VALORES ====================== */}
            <CustomTabPanel value={tabValue} index={2}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Bloco Custos */}
                    <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-[#E2E8F0]">
                        <Typography variant="h6" fontWeight={700} color="#0F172A" mb={4}>Estrutura de Custos</Typography>
                        <div className="flex flex-col gap-4">
                            <Controller name="preco_custo" control={control} render={({ field }) => (
                                <TextField {...field} fullWidth label="Preço de Compra/Custo Base" type="number" InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">R$</InputAdornment> }} sx={readOnlyInputStyles} />
                            )} />
                            <Controller name="despesas_acessorias" control={control} render={({ field }) => (
                                <TextField {...field} fullWidth label="Despesas Acessórias" type="number" InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">R$</InputAdornment> }} sx={readOnlyInputStyles} />
                            )} />
                            <Controller name="outras_despesas" control={control} render={({ field }) => (
                                <TextField {...field} fullWidth label="Outras Despesas" type="number" InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">R$</InputAdornment> }} sx={readOnlyInputStyles} />
                            )} />
                            <div className="mt-4 p-4 bg-white border border-[#CBD5E1] rounded-xl flex justify-between items-center shadow-sm">
                                <span className="font-semibold text-[#475569]">Custo Final Apurado:</span>
                                <span className="font-extrabold text-xl text-[#0F172A]">R$ {custoFinal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bloco Venda */}
                    <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0]">
                        <Typography variant="h6" fontWeight={700} color="#0F172A" mb={4}>Formação de Preço</Typography>
                        <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-2 gap-4">
                                <Controller name="lucro_sugerido" control={control} render={({ field }) => (
                                    <TextField {...field} label="Lucro Sugerido" type="number" disabled InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} placeholder="30" sx={readOnlyInputStyles} />
                                )} />
                                <Controller name="margem_lucro" control={control} render={({ field }) => (
                                    <TextField {...field} label="Margem Aplicada" type="number" InputProps={{ readOnly: true, endAdornment: <InputAdornment position="end">%</InputAdornment> }} sx={readOnlyInputStyles} />
                                )} />
                            </div>
                            <Controller name="preco_venda" control={control} render={({ field }) => (
                                <TextField {...field} fullWidth label="Valor Final de Venda" type="number" InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">R$</InputAdornment> }} sx={readOnlyInputStyles} />
                            )} />
                            <Controller name="preco_promocional" control={control} render={({ field }) => (
                                <TextField {...field} fullWidth label="Preço Promocional (Opcional)" type="number" InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">R$</InputAdornment> }} sx={readOnlyInputStyles} />
                            )} />
                        </div>
                    </div>

                </div>
            </CustomTabPanel>

            {/* ====================== ABA 3: ESTOQUE ====================== */}
            <CustomTabPanel value={tabValue} index={3}>
                <Typography variant="h6" fontWeight={700} color="#0F172A" mb={4}>Controle de Estoque</Typography>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#F8FAFC] p-6 rounded-2xl border border-[#E2E8F0]">
                    <Controller name="estoque_minimo" control={control} render={({ field }) => (
                        <TextField {...field} type="number" label="Estoque Mínimo Seg" fullWidth InputProps={{ readOnly: true, endAdornment: <InputAdornment position="end">UN</InputAdornment> }} sx={readOnlyInputStyles} />
                    )} />
                    <Controller name="estoque_maximo" control={control} render={({ field }) => (
                        <TextField {...field} type="number" label="Estoque Máximo Teto" fullWidth InputProps={{ readOnly: true, endAdornment: <InputAdornment position="end">UN</InputAdornment> }} sx={readOnlyInputStyles} />
                    )} />
                    <Controller name="estoque_atual" control={control} render={({ field }) => (
                        <TextField {...field} type="number" label="Estoque Atual (Físico)" fullWidth InputProps={{ readOnly: true, endAdornment: <InputAdornment position="end">UN</InputAdornment> }} sx={{ ...readOnlyInputStyles, '& input': { color: '#10B981 !important', fontSize: '1.2rem' } }} />
                    )} />
                </div>
                <div className="mt-6 ml-2">
                    <Controller name="movimenta_estoque" control={control} render={({ field }) => (
                        <FormControlLabel control={<Switch checked={field.value} color="primary" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#5B21B6' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#5B21B6' } }} disabled/>} label={<Typography variant="body2" fontWeight={600} color="#475569">O sistema movimenta o estoque deste item automaticamente nas vendas e compras.</Typography>} />
                    )} />
                </div>
            </CustomTabPanel>

            {/* ====================== ABA 4: COMPOSIÇÃO ====================== */}
            <CustomTabPanel value={tabValue} index={4}>
                {tipoItem !== 'kit' ? (
                    <div className="text-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl py-16">
                        <LayersOutlined sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
                        <Typography variant="h6" fontWeight={600} color="#0F172A">Não se aplica</Typography>
                        <Typography variant="body2" color="#64748B">Este registro não é configurado como "Kit" ou "Produto Composto".</Typography>
                    </div>
                ) : (
                    <>
                        <Typography variant="h6" fontWeight={700} color="#0F172A" mb={4}>Itens do Kit</Typography>
                        <ConfigProvider
                          theme={{
                            components: { Table: { headerBg: '#F8FAFC', headerColor: '#475569', headerBorderRadius: 8, borderColor: '#F1F5F9' } }
                          }}
                        >
                            <Table 
                                dataSource={composicaoFields}
                                rowKey="id"
                                pagination={false}
                                bordered
                                columns={[
                                    { 
                                        title: 'Produto Vinculado', 
                                        dataIndex: 'produto', 
                                        render: (_: any, _record: any, index: number) => (
                                            <Controller name={`composicao.${index}.produto_filho_id` as any} control={control} render={({ field }) => (
                                                <TextField {...field} select fullWidth size="small" InputProps={{ readOnly: true }} sx={readOnlyInputStyles}>
                                                    <MenuItem value={0}><em>Selecione...</em></MenuItem>
                                                    {listaProdutos.map(p => <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>)}
                                                </TextField>
                                            )} />
                                        )
                                    },
                                    { 
                                        title: 'Qtd Necessária', 
                                        width: 200,
                                        align: 'center',
                                        render: (_: any, _record: any, index: number) => (
                                            <Controller name={`composicao.${index}.quantidade` as any} control={control} render={({ field }) => (
                                                <TextField {...field} type="number" size="small" InputProps={{ readOnly: true }} sx={readOnlyInputStyles} />
                                            )} />
                                        )
                                    }
                                ]}
                            />
                        </ConfigProvider>
                    </>
                )}
            </CustomTabPanel>

            {/* ====================== ABA 5: FORNECEDORES ====================== */}
            <CustomTabPanel value={tabValue} index={5}>
                <Typography variant="h6" fontWeight={700} color="#0F172A" mb={4}>Fornecedor Padrão</Typography>
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <Controller name="fornecedor_padrao_id" control={control} render={({ field }) => (
                        <TextField {...field} select fullWidth label="Selecione o Fornecedor" InputProps={{ readOnly: true }} sx={readOnlyInputStyles}>
                            <MenuItem value={0}><em>Sem fornecedor padrão vinculado</em></MenuItem>
                            {fornecedores.map(f => <MenuItem key={f.id} value={f.id}>{f.nome || f.razao_social}</MenuItem>)}
                        </TextField>
                    )} />
                </div>
            </CustomTabPanel>

            {/* ====================== ABA 6: FISCAL ====================== */}
            <CustomTabPanel value={tabValue} index={6}>
                <Typography variant="h6" fontWeight={700} color="#0F172A" mb={4}>Classificação e Tributação (NF-e/NFC-e)</Typography>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#F8FAFC] p-6 rounded-2xl border border-[#E2E8F0]">
                    <Controller name="ncm" control={control} render={({ field }) => (
                        <TextField {...field} fullWidth label="NCM" InputProps={{ readOnly: true }} sx={readOnlyInputStyles} />
                    )} />
                    <Controller name="cest" control={control} render={({ field }) => (
                        <TextField {...field} fullWidth label="CEST" InputProps={{ readOnly: true }} sx={readOnlyInputStyles} />
                    )} />
                    <Controller name="cfop_padrao" control={control} render={({ field }) => (
                        <TextField {...field} fullWidth label="CFOP Padrão de Venda" InputProps={{ readOnly: true }} sx={readOnlyInputStyles} />
                    )} />
                    <Controller name="origem_mercadoria" control={control} render={({ field }) => (
                        <TextField {...field} select fullWidth label="Origem da Mercadoria" InputProps={{ readOnly: true }} sx={readOnlyInputStyles}>
                            <MenuItem value={0}>0 - Nacional</MenuItem>
                            <MenuItem value={1}>1 - Estrangeira (Imp. Direta)</MenuItem>
                            <MenuItem value={2}>2 - Estrangeira (Adq. Interna)</MenuItem>
                        </TextField>
                    )} />
                </div>
            </CustomTabPanel>
          </Box>
        </Box>
      </form>
    </Layout>
  );
}

export default VisualizarProduto;