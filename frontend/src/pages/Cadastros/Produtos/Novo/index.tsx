/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, type SyntheticEvent } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { ConfigProvider, Table } from 'antd';
import { 
  Autocomplete,
  Button, Box, TextField, MenuItem, CircularProgress, Skeleton, 
  InputAdornment, Switch, FormControlLabel, Divider, Typography, Tabs, Tab, IconButton, Alert
} from "@mui/material";
import { 
  Check, DeleteOutline, Add, ArrowBack,
  CategoryOutlined, StraightenOutlined, MonetizationOnOutlined, 
  Inventory2Outlined, LayersOutlined, LocalShippingOutlined, ReceiptLongOutlined, AutoAwesome
} from "@mui/icons-material";
import Layout from "../../../../template/Layout";
import { useNavigate } from "react-router-dom";
import { novoProdutoSchema, type NovoProdutoFormData } from "../../../../modules/Cadastros/Produtos/Novo/schemas/novoProdutoSchema";
import { useNovoProduto } from "../../../../modules/Cadastros/Produtos/Novo/hooks/useNovoProduto";
import { calcularCustoFinal, calcularLucroSugerido, calcularMargemAplicada, calcularPrecoVenda } from "../../../../modules/Cadastros/Produtos/utils/precificacao";
import FiscalAutocomplete from "../../../../modules/Cadastros/Produtos/components/FiscalAutocomplete";
import { listarDadosFiscaisService, recomendarDadosFiscaisService, type OpcaoFiscal } from "../../../../modules/Cadastros/Produtos/services/produtoService";
import { toast } from "react-toastify";

// Estilo Premium B2B para os Inputs do MUI
const premiumInputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#F8FAFC',
    transition: 'all 0.2s ease-in-out',
    '& fieldset': { borderColor: '#E2E8F0' },
    '&:hover fieldset': { borderColor: '#CBD5E1' },
    '&.Mui-focused': {
      backgroundColor: '#FFFFFF',
      boxShadow: '0 0 0 3px rgba(91, 33, 182, 0.1)',
    },
    '&.Mui-focused fieldset': { borderColor: '#5B21B6', borderWidth: '1px' },
  }
};

// Componente para Painel de Abas com Animação
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

const NovoProduto: React.FC = () => {
  const navigate = useNavigate();
  const { handleCadastrarProduto, carregarAuxiliares, carregarProdutosComposicao, carregarFornecedores } = useNovoProduto();
  
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [origemPreco, setOrigemPreco] = useState<'margem' | 'preco'>('margem');

  // Listas Auxiliares
  const [categorias, setCategorias] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [listaProdutos, setListaProdutos] = useState<any[]>([]); 
  const [opcoesNcm, setOpcoesNcm] = useState<OpcaoFiscal[]>([]);
  const [opcoesCest, setOpcoesCest] = useState<OpcaoFiscal[]>([]);
  const [opcoesCfop, setOpcoesCfop] = useState<OpcaoFiscal[]>([]);
  const ultimaRecomendacaoFiscal = useRef("");

  const { 
    control, handleSubmit, watch, setValue, getValues, formState: { errors } 
  } = useForm<NovoProdutoFormData | any>({
    resolver: zodResolver(novoProdutoSchema),
    defaultValues: {
      situacao: 'ativo', tipo_item: 'produto', movimenta_estoque: true, vendido_separadamente: true,
      comercializavel_pdv: true, produto_ativo: true, preco_custo: 0, despesas_acessorias: 0,
      outras_despesas: 0, margem_lucro: 0, preco_venda: 0, estoque_atual: 0, estoque_minimo: 0, estoque_maximo: 0,
      peso: 0, largura: 0, altura: 0, comprimento: 0, comissao: 0,
      composicao: [], conversoes: [], imagens: []
    }
  });

  const { fields: conversaoFields, append: appendConversao, remove: removeConversao } = useFieldArray({ control, name: "conversoes" });
  const { fields: composicaoFields, append: appendComposicao, remove: removeComposicao } = useFieldArray({ control, name: "composicao" });

  const carregarFiscal = async (tipo: 'ncm' | 'cest' | 'cfop', termo = '') => {
    try {
      const data = await listarDadosFiscaisService(tipo, termo);
      if (tipo === 'ncm') setOpcoesNcm(data);
      if (tipo === 'cest') setOpcoesCest(data);
      if (tipo === 'cfop') setOpcoesCfop(data);
    } catch (error) {
      console.error(`Erro ao carregar ${tipo}`, error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [auxData, compData, fornData]: any = await Promise.all([
          carregarAuxiliares(),
          carregarProdutosComposicao(),
          carregarFornecedores(),
          carregarFiscal('ncm'),
          carregarFiscal('cest'),
          carregarFiscal('cfop')
        ]);
        if (auxData) {
          setCategorias(auxData.categorias);
          setMarcas(auxData.marcas);
          setUnidades(auxData.unidades);
        }
        if (compData) setListaProdutos(compData);
        if (fornData) setFornecedores(fornData);
      } catch (error) {
        console.error("Erro ao carregar dados", error);
        toast.error("Erro ao carregar dados auxiliares.");
      } finally {
        setLoadingDados(false);
      }
    };
    fetchData();
  }, []);

  // --- Lógica de Cálculo de Valores ---
  const custo = watch('preco_custo');
  const despesas = watch('despesas_acessorias');
  const outras = watch('outras_despesas');
  const lucroUtilizado = watch('margem_lucro');
  const precoVenda = watch('preco_venda');
  const tipoItem = watch('tipo_item');
  const nomeProduto = watch('nome');
  const unidadeSaidaId = watch('unidade_id');
  
  const custoFinal = calcularCustoFinal(custo, despesas, outras);
  const lucroSugerido = calcularLucroSugerido(custo, despesas, outras);

  useEffect(() => {
    if (getValues('lucro_sugerido') !== lucroSugerido) {
      setValue('lucro_sugerido', lucroSugerido, { shouldDirty: false, shouldValidate: false });
    }
  }, [lucroSugerido, setValue, getValues]);

  useEffect(() => {
    if (origemPreco !== 'margem') return;

    const valorVenda = calcularPrecoVenda(custoFinal, lucroUtilizado);
    if (getValues('preco_venda') !== valorVenda) {
      setValue('preco_venda', valorVenda, { shouldDirty: true, shouldValidate: true });
    }
  }, [custoFinal, lucroUtilizado, origemPreco, setValue, getValues]);

  useEffect(() => {
    if (origemPreco !== 'preco') return;

    const margemAplicada = calcularMargemAplicada(custoFinal, precoVenda);
    if (getValues('margem_lucro') !== margemAplicada) {
      setValue('margem_lucro', margemAplicada, { shouldDirty: true, shouldValidate: true });
    }
  }, [custoFinal, precoVenda, origemPreco, setValue, getValues]);

  useEffect(() => {
    const nome = String(nomeProduto || '').trim();
    if (loadingDados || nome.length < 3) return;
    if (getValues('ncm') && getValues('cest') && getValues('cfop_padrao')) return;

    const chave = `${nome}|${tipoItem}`;
    if (ultimaRecomendacaoFiscal.current === chave) return;

    const timer = setTimeout(async () => {
      try {
        const recomendacao = await recomendarDadosFiscaisService(nome, tipoItem);
        const aplicados: string[] = [];

        if (recomendacao.ncm?.codigo && !getValues('ncm')) {
          setValue('ncm', recomendacao.ncm.codigo, { shouldDirty: true, shouldValidate: true });
          setOpcoesNcm((atuais) => [recomendacao.ncm!, ...atuais.filter((item) => item.codigo !== recomendacao.ncm!.codigo)]);
          aplicados.push('NCM');
        }

        if (recomendacao.cest?.codigo && !getValues('cest')) {
          setValue('cest', recomendacao.cest.codigo, { shouldDirty: true, shouldValidate: true });
          setOpcoesCest((atuais) => [recomendacao.cest!, ...atuais.filter((item) => item.codigo !== recomendacao.cest!.codigo)]);
          aplicados.push('CEST');
        }

        if (recomendacao.cfop?.codigo && !getValues('cfop_padrao')) {
          setValue('cfop_padrao', recomendacao.cfop.codigo, { shouldDirty: true, shouldValidate: true });
          setOpcoesCfop((atuais) => [recomendacao.cfop!, ...atuais.filter((item) => item.codigo !== recomendacao.cfop!.codigo)]);
          aplicados.push('CFOP');
        }

        ultimaRecomendacaoFiscal.current = chave;
        if (aplicados.length > 0) toast.info(`Recomendação fiscal aplicada: ${aplicados.join(', ')}.`);
      } catch (error) {
        console.error('Erro ao recomendar dados fiscais', error);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [nomeProduto, tipoItem, loadingDados, setValue, getValues]);

  const handleAddComposicao = () => {
    appendComposicao({ produto_filho_id: 0, quantidade: 1, custo_unitario: 0, unidade_nome: '' });
  };

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleGerarCodigoInterno = () => {
    const codigo = Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('');
    setValue("codigo_interno", codigo, { shouldDirty: true, shouldValidate: true });
  };

  const normalizarConversoes = (conversoes: any[] = []) => conversoes.map((conversao) => {
    const quantidadeEntrada = Number(conversao.quantidade_entrada || 1);
    const quantidadeSaida = Number(conversao.fator_conversao || 0);

    return {
      ...conversao,
      unidade_saida_id: Number(getValues('unidade_id') || conversao.unidade_saida_id || 0),
      fator_conversao: quantidadeEntrada > 0 ? quantidadeSaida / quantidadeEntrada : quantidadeSaida
    };
  });

  const onSubmit = async (data: NovoProdutoFormData) => {
    setLoadingSave(true);
    try {
      const payload = { ...data, situacao: data.produto_ativo ? 'ativo' : 'inativo', conversoes: normalizarConversoes(data.conversoes) };
      await handleCadastrarProduto(payload);
      navigate("/cadastros/produtos");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Erro ao criar o produto.");
    } finally {
      setLoadingSave(false);
    }
  };

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
                Novo Produto
            </Typography>
            <Typography variant="body2" color="#64748B">
                Preencha os dados abaixo para adicionar um novo item ao catálogo.
            </Typography>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="animate-fadeIn">
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
          
          <Box sx={{ minHeight: '350px' }}>
            
            {/* ====================== ABA 0: DADOS ====================== */}
            <CustomTabPanel value={tabValue} index={0}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Controller name="nome" control={control} render={({ field }) => (
                        <TextField {...field} fullWidth label="Nome do Produto *" error={!!errors.nome} helperText={errors.nome?.message as string} sx={premiumInputStyles} />
                    )} />
                    <Controller name="codigo_interno" control={control} render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Código Interno"
                          sx={premiumInputStyles}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton edge="end" title="Gerar código" onClick={handleGerarCodigoInterno}>
                                  <AutoAwesome sx={{ color: '#94A3B8' }} />
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                        />
                    )} />
                    <Controller name="codigo_barras" control={control} render={({ field }) => (
                        <TextField {...field} fullWidth label="Código de Barras (EAN)" sx={premiumInputStyles} />
                    )} />
                    <Controller name="tipo_item" control={control} render={({ field }) => (
                        <TextField {...field} select fullWidth label="Grupo do Produto" sx={premiumInputStyles}>
                            <MenuItem value="produto">Produto Acabado</MenuItem>
                            <MenuItem value="servico">Serviço</MenuItem>
                            <MenuItem value="kit">Kit / Composição</MenuItem>
                        </TextField>
                    )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <Controller name="categoria_id" control={control} render={({ field }) => (
                        <TextField {...field} select fullWidth label="Categoria" sx={premiumInputStyles}>
                            <MenuItem value={0}><em>Selecione a categoria</em></MenuItem>
                            {categorias.map(c => <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>)}
                        </TextField>
                    )} />
                    <Controller name="marca_id" control={control} render={({ field }) => (
                        <TextField {...field} select fullWidth label="Marca" sx={premiumInputStyles}>
                            <MenuItem value={0}><em>Selecione a marca</em></MenuItem>
                            {marcas.map(m => <MenuItem key={m.id} value={m.id}>{m.nome}</MenuItem>)}
                        </TextField>
                    )} />
                    <Controller name="unidade_id" control={control} render={({ field }) => (
                        <TextField {...field} select fullWidth label="Unidade Base *" error={!!errors.unidade_id} helperText={errors.unidade_id?.message as string} sx={premiumInputStyles}>
                            <MenuItem value={0}><em>Selecione a unidade base</em></MenuItem>
                            {unidades.map(u => <MenuItem key={u.id} value={u.id}>{u.sigla} - {u.descricao}</MenuItem>)}
                        </TextField>
                    )} />
                </div>

                {/* Secção de Conversão de Unidade */}
                <div className="w-full mt-8 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex justify-between items-center">
                    <Typography variant="body2" color="#475569" fontWeight={500}>A conversão permite comprar numa unidade (ex: Caixa) e vender noutra (ex: Unidade).</Typography>
                    <Button 
                        size="small" 
                        startIcon={<Add />} 
                        onClick={() => appendConversao({ quantidade_entrada: 1, unidade_entrada_id: 0, fator_conversao: 1, unidade_saida_id: getValues('unidade_id') || 0, codigo_barras_entrada: '' })}
                        sx={{ textTransform: 'none', fontWeight: 600, color: '#5B21B6', backgroundColor: '#F3E8FF', '&:hover': { backgroundColor: '#E9D5FF' }, borderRadius: '8px' }}
                    >
                        Adicionar Conversão
                    </Button>
                </div>

                {conversaoFields.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4 items-center p-4 border border-[#E2E8F0] rounded-xl relative transition-all hover:border-[#CBD5E1]">
                        <div className="lg:col-span-1 text-center font-bold text-[#94A3B8]">{index + 1}</div>
                        <div className="lg:col-span-2">
                            <Controller name={`conversoes.${index}.quantidade_entrada` as any} control={control} render={({ field }) => (
                                <TextField {...field} type="number" fullWidth size="small" label="Qtd. Entrada" sx={premiumInputStyles} />
                            )} />
                        </div>
                        <div className="lg:col-span-3">
                            <Controller name={`conversoes.${index}.unidade_entrada_id` as any} control={control} render={({ field }) => (
                                <TextField {...field} select fullWidth size="small" label="Unidade de Entrada" sx={premiumInputStyles}>
                                    <MenuItem value={0}><em>Selecione...</em></MenuItem>
                                    {unidades.map(u => <MenuItem key={u.id} value={u.id}>{u.sigla}</MenuItem>)}
                                </TextField>
                            )} />
                        </div>
                        <div className="lg:col-span-1 text-center text-sm font-bold text-[#5B21B6]">equivale a</div>
                        <div className="lg:col-span-2">
                            <Controller name={`conversoes.${index}.fator_conversao` as any} control={control} render={({ field }) => (
                                <TextField {...field} type="number" fullWidth size="small" label="Qtd. Saída" sx={premiumInputStyles} />
                            )} />
                        </div>
                        <div className="lg:col-span-2">
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Unidade de SaÃ­da"
                                value={unidadeSaidaId || 0}
                                onChange={(event) => setValue('unidade_id', Number(event.target.value), { shouldDirty: true, shouldValidate: true })}
                                sx={premiumInputStyles}
                            >
                                <MenuItem value={0}><em>Selecione...</em></MenuItem>
                                {unidades.map(u => <MenuItem key={u.id} value={u.id}>{u.sigla}</MenuItem>)}
                            </TextField>
                        </div>
                        <div className="lg:col-span-1 text-right">
                            <IconButton size="small" onClick={() => removeConversao(index)} sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', backgroundColor: '#FEF2F2' } }}>
                                <DeleteOutline fontSize="small" />
                            </IconButton>
                        </div>
                    </div>
                ))}
            </CustomTabPanel>

            {/* ====================== ABA 1: DETALHES ====================== */}
            <CustomTabPanel value={tabValue} index={1}>
                <Typography variant="h6" fontWeight={700} color="#0F172A" mb={3}>Peso e Dimensões</Typography>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Controller name="peso" control={control} render={({ field }) => (
                        <TextField {...field} type="number" fullWidth label="Peso Bruto (kg)" sx={premiumInputStyles} />
                    )} />
                    <Controller name="largura" control={control} render={({ field }) => (
                        <TextField {...field} type="number" fullWidth label="Largura (cm)" sx={premiumInputStyles} />
                    )} />
                    <Controller name="altura" control={control} render={({ field }) => (
                        <TextField {...field} type="number" fullWidth label="Altura (cm)" sx={premiumInputStyles} />
                    )} />
                    <Controller name="comprimento" control={control} render={({ field }) => (
                        <TextField {...field} type="number" fullWidth label="Comprimento (cm)" sx={premiumInputStyles} />
                    )} />
                </div>

                <Divider sx={{ my: 5, borderColor: '#F1F5F9' }} />

                <Typography variant="h6" fontWeight={700} color="#0F172A" mb={3}>Configurações Adicionais</Typography>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F8FAFC] p-5 rounded-xl border border-[#E2E8F0]">
                    <Controller name="produto_ativo" control={control} render={({ field }) => (
                        <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#5B21B6' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#5B21B6' } }} />} label={<Typography variant="body2" fontWeight={600} color="#475569">Produto Ativo no Sistema</Typography>} />
                    )} />
                    <Controller name="vendido_separadamente" control={control} render={({ field }) => (
                        <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#5B21B6' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#5B21B6' } }} />} label={<Typography variant="body2" fontWeight={600} color="#475569">Vendido Separadamente</Typography>} />
                    )} />
                    <Controller name="comercializavel_pdv" control={control} render={({ field }) => (
                        <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#5B21B6' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#5B21B6' } }} />} label={<Typography variant="body2" fontWeight={600} color="#475569">Comercializável no PDV</Typography>} />
                    )} />
                </div>
                <div className="mt-6 md:w-1/4">
                    <Controller name="comissao" control={control} render={({ field }) => (
                        <TextField {...field} type="number" fullWidth label="Comissão por Venda" InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} sx={premiumInputStyles} />
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
                                <TextField {...field} fullWidth label="Preço de Compra/Custo Base" type="number" InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} sx={premiumInputStyles} />
                            )} />
                            <Controller name="despesas_acessorias" control={control} render={({ field }) => (
                                <TextField {...field} fullWidth label="Despesas Acessórias" type="number" InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} sx={premiumInputStyles} />
                            )} />
                            <Controller name="outras_despesas" control={control} render={({ field }) => (
                                <TextField {...field} fullWidth label="Outras Despesas" type="number" InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} sx={premiumInputStyles} />
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
                                    <TextField {...field} label="Lucro Sugerido" type="number" disabled InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} placeholder="30" sx={premiumInputStyles} />
                                )} />
                                <Controller name="margem_lucro" control={control} render={({ field }) => (
                                    <TextField
                                      {...field}
                                      label="Margem de Lucro Desejada"
                                      type="number"
                                      onChange={(event) => {
                                        setOrigemPreco('margem');
                                        field.onChange(event);
                                      }}
                                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                                      sx={premiumInputStyles}
                                    />
                                )} />
                            </div>
                            <Controller name="preco_venda" control={control} render={({ field }) => (
                                <TextField
                                  {...field}
                                  fullWidth
                                  label="Valor Final de Venda"
                                  type="number"
                                  onChange={(event) => {
                                    setOrigemPreco('preco');
                                    field.onChange(event);
                                  }}
                                  InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                                  error={!!errors.preco_venda}
                                  sx={premiumInputStyles}
                                />
                            )} />
                            <Controller name="preco_promocional" control={control} render={({ field }) => (
                                <TextField {...field} fullWidth label="Preço Promocional (Opcional)" type="number" InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} sx={premiumInputStyles} />
                            )} />
                        </div>
                    </div>
                </div>
            </CustomTabPanel>

            {/* ====================== ABA 3: ESTOQUE ====================== */}
            <CustomTabPanel value={tabValue} index={3}>
                <Typography variant="h6" fontWeight={700} color="#0F172A" mb={4}>Controlo de Estoque</Typography>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#F8FAFC] p-6 rounded-2xl border border-[#E2E8F0]">
                    <Controller name="estoque_minimo" control={control} render={({ field }) => (
                        <TextField {...field} type="number" label="Estoque Mínimo Seg" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">UN</InputAdornment> }} sx={premiumInputStyles} />
                    )} />
                    <Controller name="estoque_maximo" control={control} render={({ field }) => (
                        <TextField {...field} type="number" label="Estoque Máximo Teto" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">UN</InputAdornment> }} sx={premiumInputStyles} />
                    )} />
                    <Controller name="estoque_atual" control={control} render={({ field }) => (
                        <TextField {...field} type="number" label="Estoque Atual Inicial" fullWidth InputProps={{ endAdornment: <InputAdornment position="end">UN</InputAdornment> }} sx={premiumInputStyles} />
                    )} />
                </div>
                <div className="mt-6 ml-2">
                    <Controller name="movimenta_estoque" control={control} render={({ field }) => (
                        <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#5B21B6' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#5B21B6' } }} />} label={<Typography variant="body2" fontWeight={600} color="#475569">Movimentar o estoque automaticamente nas vendas e compras.</Typography>} />
                    )} />
                </div>
            </CustomTabPanel>

            {/* ====================== ABA 4: COMPOSIÇÃO ====================== */}
            <CustomTabPanel value={tabValue} index={4}>
                {tipoItem !== 'kit' ? (
                    <div className="text-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl py-16">
                        <LayersOutlined sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
                        <Typography variant="h6" fontWeight={600} color="#0F172A">Não se aplica</Typography>
                        <Typography variant="body2" color="#64748B">Altere o Grupo do Produto na aba 'Dados' para Kit para ativar esta secção.</Typography>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <Typography variant="h6" fontWeight={700} color="#0F172A">Itens do Kit</Typography>
                            <Button 
                                startIcon={<Add />} 
                                onClick={handleAddComposicao}
                                sx={{ textTransform: 'none', fontWeight: 600, color: '#5B21B6', backgroundColor: '#F3E8FF', '&:hover': { backgroundColor: '#E9D5FF' }, borderRadius: '8px' }}
                            >
                                Adicionar Componente
                            </Button>
                        </div>
                        <ConfigProvider theme={{ components: { Table: { headerBg: '#F8FAFC', headerColor: '#475569', headerBorderRadius: 8, borderColor: '#F1F5F9' } } }}>
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
                                                <TextField {...field} select fullWidth size="small" sx={premiumInputStyles}>
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
                                                <TextField {...field} type="number" size="small" sx={premiumInputStyles} />
                                            )} />
                                        )
                                    },
                                    { 
                                        title: 'Ações', 
                                        width: 80,
                                        align: 'center',
                                        render: (_: any, __: any, index: number) => (
                                            <IconButton size="small" onClick={() => removeComposicao(index)} sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', backgroundColor: '#FEF2F2' } }}>
                                                <DeleteOutline fontSize="small" />
                                            </IconButton>
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
                        <Autocomplete
                            options={fornecedores}
                            value={fornecedores.find((fornecedor) => Number(fornecedor.id) === Number(field.value)) || null}
                            onChange={(_, fornecedor) => field.onChange(fornecedor?.id || 0)}
                            getOptionLabel={(fornecedor) => fornecedor?.nome || fornecedor?.razao_social || ''}
                            isOptionEqualToValue={(option, value) => Number(option.id) === Number(value.id)}
                            noOptionsText="Nenhum fornecedor encontrado"
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    label="Selecione o Fornecedor"
                                    placeholder="Digite para buscar"
                                    sx={premiumInputStyles}
                                />
                            )}
                        />
                    )} />
                </div>
            </CustomTabPanel>

            {/* ====================== ABA 6: FISCAL ====================== */}
            <CustomTabPanel value={tabValue} index={6}>
                <Typography variant="h6" fontWeight={700} color="#0F172A" mb={4}>Classificação e Tributação (NF-e/NFC-e)</Typography>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#F8FAFC] p-6 rounded-2xl border border-[#E2E8F0] mb-4">
                    <Controller name="ncm" control={control} render={({ field }) => (
                        <FiscalAutocomplete
                          label="NCM"
                          placeholder="Digite código ou descrição"
                          value={field.value}
                          options={opcoesNcm}
                          sx={premiumInputStyles}
                          onChange={field.onChange}
                          onSearch={(termo) => carregarFiscal('ncm', termo)}
                          onSelectOption={(option) => {
                            if (option.cest) setValue('cest', option.cest, { shouldDirty: true, shouldValidate: true });
                          }}
                        />
                    )} />
                    <Controller name="cest" control={control} render={({ field }) => (
                        <FiscalAutocomplete
                          label="CEST"
                          placeholder="Digite código ou descrição"
                          value={field.value}
                          options={opcoesCest}
                          sx={premiumInputStyles}
                          onChange={field.onChange}
                          onSearch={(termo) => carregarFiscal('cest', termo)}
                        />
                    )} />
                    <Controller name="cfop_padrao" control={control} render={({ field }) => (
                        <FiscalAutocomplete
                          label="CFOP Padrão de Venda"
                          placeholder="Digite código, descrição ou categoria"
                          value={field.value}
                          options={opcoesCfop}
                          sx={premiumInputStyles}
                          onChange={field.onChange}
                          onSearch={(termo) => carregarFiscal('cfop', termo)}
                        />
                    )} />
                    <Controller name="origem_mercadoria" control={control} render={({ field }) => (
                        <TextField {...field} select fullWidth label="Origem da Mercadoria" sx={premiumInputStyles}>
                            <MenuItem value={0}>0 - Nacional</MenuItem>
                            <MenuItem value={1}>1 - Estrangeira (Imp. Direta)</MenuItem>
                            <MenuItem value={2}>2 - Estrangeira (Adq. Interna)</MenuItem>
                        </TextField>
                    )} />
                </div>
                <Alert severity="warning" sx={{ borderRadius: '12px' }}>
                    <strong>Atenção:</strong> O preenchimento incorreto do NCM ou origem pode causar rejeição na emissão de notas fiscais pela SEFAZ.
                </Alert>
            </CustomTabPanel>
            
          </Box>

          {/* FOOTER ACTIONS */}
          <Box sx={{ p: 4, borderTop: '1px solid #F1F5F9', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
                type="button" 
                variant="outlined" 
                onClick={() => navigate("/cadastros/produtos")}
                sx={{ borderColor: '#E2E8F0', color: '#475569', textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 4, '&:hover': { backgroundColor: '#FFFFFF', borderColor: '#CBD5E1' } }}
            >
                Cancelar
            </Button>
            <Button 
                type="submit" 
                variant="contained" 
                disabled={loadingSave} 
                startIcon={loadingSave ? <CircularProgress size={20} color="inherit"/> : <Check />} 
                sx={{ background: 'linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)', color: 'white', textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 6, boxShadow: '0 4px 14px 0 rgba(91, 33, 182, 0.25)', '&:hover': { background: 'linear-gradient(90deg, #28024D 0%, #4C1D95 100%)', boxShadow: '0 6px 20px rgba(91, 33, 182, 0.3)' } }}
            >
                {loadingSave ? "A Guardar..." : "Cadastrar Produto"}
            </Button>
          </Box>
        </Box>
      </form>
    </Layout>
  );
}

export default NovoProduto;
