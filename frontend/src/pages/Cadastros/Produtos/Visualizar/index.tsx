/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { ConfigProvider, Tabs, message, Table } from 'antd';
import { 
  Button, Box, Card, CardContent, TextField, MenuItem, 
  Skeleton, InputAdornment, Switch, FormControlLabel, Divider
} from "@mui/material";
import { ArrowBack, Search } from "@mui/icons-material";
import Layout from "../../../../template/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { useProdutos } from "../../../../modules/Cadastros/Produtos/hooks/useProdutos";
import {
  listarProdutosComposicaoService,
  listarFornecedoresService
} from "../../../../modules/Cadastros/Produtos/services/produtoService";

const VisualizarProduto: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Using useProdutos hook to fetch and update
  const { fetchProdutoId, carregarAuxiliares, auxiliares } = useProdutos();
  
  const [loadingDados, setLoadingDados] = useState(true);

  // Listas Auxiliares
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [listaProdutos, setListaProdutos] = useState<any[]>([]); 

  const { 
    control, 
    watch,
    reset
  } = useForm<any>({
    defaultValues: {
      situacao: 'ativo',
      tipo_item: 'produto',
      movimenta_estoque: true,
      vendido_separadamente: true,
      comercializavel_pdv: true,
      produto_ativo: true,
      preco_custo: 0,
      despesas_acessorias: 0,
      outras_despesas: 0,
      margem_lucro: 0,
      preco_venda: 0,
      estoque_atual: 0,
      composicao: [],
      conversoes: [],
      imagens: []
    }
  });

  const { fields: conversaoFields } = useFieldArray({
    control, name: "conversoes"
  });
  
  const { fields: composicaoFields } = useFieldArray({
    control, name: "composicao"
  });

  // --- Carregamento Inicial ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        
        await carregarAuxiliares();
        
        const [produtoDados, resProds, resForn]: any = await Promise.all([
          fetchProdutoId(Number(id)),
          listarProdutosComposicaoService(),
          listarFornecedoresService()
        ]);

        if (resProds) setListaProdutos(resProds);
        if (resForn) setFornecedores(resForn);

        if (produtoDados) {
          // Mapper to adjust backend formats before resetting the form
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
        message.error("Erro ao carregar dados do produto.");
      } finally {
        setLoadingDados(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, carregarAuxiliares, fetchProdutoId, reset]);

  // --- Lógica de Cálculo de Valores ---
  const custo = watch('preco_custo');
  const despesas = watch('despesas_acessorias');
  const outras = watch('outras_despesas');
  const tipoItem = watch('tipo_item');

  const custoFinal = Number(custo || 0) + Number(despesas || 0) + Number(outras || 0);

  if (loadingDados) return <Layout><Skeleton variant="rectangular" height={400} /></Layout>;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#9842F6]">Visualizar Produto</h1>
          <p className="text-gray-500">Detalhes do produto em faturamento (Somente leitura)</p>
        </div>
      </div>

      <form>
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
                  type="card"
                  size="large"
                  defaultActiveKey="1"
                  items={[
                    // ====================== ABA 1: DADOS ======================
                    {
                      key: '1',
                      label: 'Dados',
                      children: (
                        <div className="border border-gray-200 border-t-none -mt-4 p-6 bg-white rounded-b-lg">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <Controller name="nome" control={control} render={({ field }) => (
                                <TextField {...field} fullWidth label="Nome" InputProps={{ readOnly: true }} />
                              )} />
                              <Controller name="codigo_interno" control={control} render={({ field }) => (
                                <TextField {...field} fullWidth label="Código Interno" InputProps={{ readOnly: true }} />
                              )} />
                              <Controller name="codigo_barras" control={control} render={({ field }) => (
                                <TextField {...field} fullWidth label="Código de Barras" InputProps={{ readOnly: true }} />
                              )} />
                              <Controller name="tipo_item" control={control} render={({ field }) => (
                                <TextField {...field} select fullWidth label="Grupo do Produto" InputProps={{ readOnly: true }}>
                                    <MenuItem value="produto">Produto</MenuItem>
                                    <MenuItem value="servico">Serviço</MenuItem>
                                    <MenuItem value="kit">Kit</MenuItem>
                                </TextField>
                              )} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <Controller name="categoria_id" control={control} render={({ field }) => (
                                    <TextField {...field} select fullWidth label="Categoria" InputProps={{ readOnly: true }}>
                                        <MenuItem value={0}>Selecione</MenuItem>
                                        {auxiliares.categorias.map(c => <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>)}
                                    </TextField>
                                )} />
                                <Controller name="marca_id" control={control} render={({ field }) => (
                                    <TextField {...field} select fullWidth label="Marca" InputProps={{ readOnly: true }}>
                                        <MenuItem value={0}>Selecione</MenuItem>
                                        {auxiliares.marcas.map(m => <MenuItem key={m.id} value={m.id}>{m.nome}</MenuItem>)}
                                    </TextField>
                                )} />
                                <Controller name="unidade_id" control={control} render={({ field }) => (
                                    <TextField {...field} select fullWidth label="Unidade *" InputProps={{ readOnly: true }}>
                                        {auxiliares.unidades.map(u => <MenuItem key={u.id} value={u.id}>{u.sigla} - {u.descricao}</MenuItem>)}
                                    </TextField>
                                )} />
                            </div>

                            {/* Seção Conversão de Unidade */}
                            <div className="w-full mt-6 p-3 bg-purple-100 rounded-md text-sm text-purple-900 flex justify-between items-center">
                              <span>A conversão permite comprar em uma unidade e vender em outra.</span>
                              {/* Readonly: No add button */}
                            </div>

                            {conversaoFields.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-12 gap-2 mt-2 items-center">
                                    <div className="col-span-1 text-center font-bold text-gray-400">1</div>
                                    <div className="col-span-3">
                                        <Controller name={`conversoes.${index}.unidade_entrada_id` as any} control={control} render={({ field }) => (
                                            <TextField {...field} select fullWidth size="small" label="Unidade Entrada" InputProps={{ readOnly: true }}>
                                                {auxiliares.unidades.map(u => <MenuItem key={u.id} value={u.id}>{u.sigla}</MenuItem>)}
                                            </TextField>
                                        )} />
                                    </div>
                                    <div className="col-span-2 text-center text-sm font-bold text-purple-800">Equivale a</div>
                                    <div className="col-span-2">
                                        <Controller name={`conversoes.${index}.fator_conversao` as any} control={control} render={({ field }) => (
                                            <TextField {...field} type="number" fullWidth size="small" label="Qtd" InputProps={{ readOnly: true }} />
                                        )} />
                                    </div>
                                    <div className="col-span-3 text-sm text-gray-600 pt-2">da unidade principal (Saída)</div>
                                    <div className="col-span-1"></div>
                                </div>
                            ))}
                        </div>
                      )
                    },

                    // ====================== ABA 2: DETALHES ======================
                    {
                      key: '2',
                      label: 'Detalhes',
                      children: (
                        <div className="border border-gray-200 border-t-none -mt-4 p-6 bg-white rounded-b-lg">
                            <h3 className="text-lg font-bold text-purple-900 mb-4">Peso e Dimensões</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Controller name="peso" control={control} render={({ field }) => (
                                    <TextField {...field} type="number" fullWidth label="Peso Bruto (kg)" InputProps={{ readOnly: true }} />
                                )} />
                                <Controller name="largura" control={control} render={({ field }) => (
                                    <TextField {...field} type="number" fullWidth label="Largura (cm)" InputProps={{ readOnly: true }} />
                                )} />
                                <Controller name="altura" control={control} render={({ field }) => (
                                    <TextField {...field} type="number" fullWidth label="Altura (cm)" InputProps={{ readOnly: true }} />
                                )} />
                                <Controller name="comprimento" control={control} render={({ field }) => (
                                    <TextField {...field} type="number" fullWidth label="Comprimento (cm)" InputProps={{ readOnly: true }} />
                                )} />
                            </div>

                            <Divider sx={{ my: 4 }} />

                            <h3 className="text-lg font-bold text-purple-900 mb-4">Configurações</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Controller name="produto_ativo" control={control} render={({ field }) => (
                                    <FormControlLabel control={<Switch checked={field.value} color="secondary" disabled/>} label="Produto Ativo" />
                                )} />
                                <Controller name="vendido_separadamente" control={control} render={({ field }) => (
                                    <FormControlLabel control={<Switch checked={field.value} color="secondary" disabled/>} label="Vendido Separadamente" />
                                )} />
                                <Controller name="comercializavel_pdv" control={control} render={({ field }) => (
                                    <FormControlLabel control={<Switch checked={field.value} color="secondary" disabled/>} label="Comercializável no PDV" />
                                )} />
                            </div>
                            <div className="mt-4 md:w-1/3">
                                <Controller name="comissao" control={control} render={({ field }) => (
                                    <TextField {...field} type="number" fullWidth label="Comissão (%)" InputProps={{ readOnly: true, endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
                                )} />
                            </div>
                        </div>
                      )
                    },

                    // ====================== ABA 3: VALORES ======================
                    {
                      key: '3',
                      label: 'Valores',
                      children: (
                        <div className="border border-gray-200 border-t-none -mt-4 p-6 bg-white rounded-b-lg">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-gray-50 p-4 rounded border border-gray-100">
                                    <h3 className="text-lg font-bold text-purple-900 mb-4">Custos</h3>
                                    <div className="flex flex-col gap-4">
                                        <Controller name="preco_custo" control={control} render={({ field }) => (
                                            <TextField {...field} fullWidth label="Preço de Custo" type="number" InputProps={{ readOnly: true, startAdornment: 'R$' }} />
                                        )} />
                                        <Controller name="despesas_acessorias" control={control} render={({ field }) => (
                                            <TextField {...field} fullWidth label="Despesas Acessórias" type="number" InputProps={{ readOnly: true, startAdornment: 'R$' }} />
                                        )} />
                                        <Controller name="outras_despesas" control={control} render={({ field }) => (
                                            <TextField {...field} fullWidth label="Outras Despesas" type="number" InputProps={{ readOnly: true, startAdornment: 'R$' }} />
                                        )} />
                                        <div className="mt-2 p-3 bg-purple-100 rounded text-purple-900 font-bold flex justify-between">
                                            <span>Custo Final:</span>
                                            <span>R$ {custoFinal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded border border-gray-100">
                                    <h3 className="text-lg font-bold text-purple-900 mb-4">Venda</h3>
                                    <div className="flex flex-col gap-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Controller name="lucro_sugerido" control={control} render={({ field }) => (
                                                <TextField {...field} label="Lucro Sugerido" type="number" disabled InputProps={{ endAdornment: '%' }} placeholder="30" />
                                            )} />
                                            <Controller name="margem_lucro" control={control} render={({ field }) => (
                                                <TextField {...field} label="Lucro Utilizado *" type="number" InputProps={{ readOnly: true, endAdornment: '%' }} />
                                            )} />
                                        </div>
                                        
                                        <Controller name="preco_venda" control={control} render={({ field }) => (
                                            <TextField {...field} fullWidth label="Valor de Venda (R$)" type="number" InputProps={{ readOnly: true, startAdornment: 'R$' }} />
                                        )} />
                                        
                                        <Controller name="preco_promocional" control={control} render={({ field }) => (
                                            <TextField {...field} fullWidth label="Preço Promocional (Opcional)" type="number" InputProps={{ readOnly: true, startAdornment: 'R$' }} />
                                        )} />
                                    </div>
                                </div>
                           </div>
                        </div>
                      )
                    },

                    // ====================== ABA 4: ESTOQUE ======================
                    {
                      key: '4',
                      label: 'Estoque',
                      children: (
                        <div className="border border-gray-200 border-t-none -mt-4 p-6 bg-white rounded-b-lg">
                           <h3 className="text-lg font-bold text-purple-900 mb-4">Loja Matriz</h3>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <Controller name="estoque_minimo" control={control} render={({ field }) => (
                                  <TextField {...field} type="number" label="Estoque Mínimo (UN)" fullWidth InputProps={{ readOnly: true }} />
                              )} />
                              <Controller name="estoque_maximo" control={control} render={({ field }) => (
                                  <TextField {...field} type="number" label="Estoque Máximo (UN)" fullWidth InputProps={{ readOnly: true }} />
                              )} />
                              <Controller name="estoque_atual" control={control} render={({ field }) => (
                                  <TextField {...field} type="number" label="Quantidade Atual (UN)" fullWidth InputProps={{ readOnly: true }} />
                              )} />
                           </div>
                           <div className="mt-4">
                                <Controller name="movimenta_estoque" control={control} render={({ field }) => (
                                    <FormControlLabel control={<Switch checked={field.value} color="primary" disabled/>} label="Este produto controla estoque automaticamente" />
                                )} />
                           </div>
                        </div>
                      )
                    },

                     // ====================== ABA 7: COMPOSIÇÃO (KIT) ======================
                    {
                        key: '7',
                        label: 'Composição',
                        disabled: tipoItem !== 'kit',
                        children: (
                          <div className="border border-gray-200 border-t-none -mt-4 p-6 bg-white rounded-b-lg">
                             {tipoItem !== 'kit' ? (
                                 <div className="text-center text-gray-400 py-10">Este produto não é um Kit.</div>
                             ) : (
                                 <>
                                    <Table 
                                        dataSource={composicaoFields}
                                        rowKey="id"
                                        pagination={false}
                                        columns={[
                                            { 
                                                title: 'Produto', 
                                                dataIndex: 'produto', 
                                                render: (_: any, record: any, index: number) => (
                                                    <Controller name={`composicao.${index}.produto_filho_id` as any} control={control} render={({ field }) => (
                                                        <TextField {...field} select fullWidth size="small" InputProps={{ readOnly: true }}>
                                                            <MenuItem value={0}>Selecione...</MenuItem>
                                                            {listaProdutos.map(p => <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>)}
                                                        </TextField>
                                                    )} />
                                                )
                                            },
                                            { 
                                                title: 'Quantidade', 
                                                width: 150,
                                                render: (_: any, record: any, index: number) => (
                                                    <Controller name={`composicao.${index}.quantidade` as any} control={control} render={({ field }) => (
                                                        <TextField {...field} type="number" size="small" InputProps={{ readOnly: true }} />
                                                    )} />
                                                )
                                            },
                                            // Colunas calculadas (apenas visualização básica por enquanto)
                                            { title: 'Custo (R$)', render: () => "R$ 0,00" }, 
                                            { title: 'Total (R$)', render: () => "R$ 0,00" },
                                        ]}
                                    />
                                 </>
                             )}
                          </div>
                        )
                    },

                    // ====================== ABA 8: FORNECEDORES ======================
                    {
                        key: '8',
                        label: 'Fornecedores',
                        children: (
                          <div className="border border-gray-200 border-t-none -mt-4 p-6 bg-white rounded-b-lg">
                             <h3 className="text-lg font-bold text-purple-900 mb-4">Fornecedor Padrão</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2">
                                <Controller name="fornecedor_padrao_id" control={control} render={({ field }) => (
                                    <TextField {...field} select fullWidth label="Fornecedor" InputProps={{ readOnly: true, startAdornment: <Search color="action" sx={{ mr: 1 }}/> }}>
                                        <MenuItem value={0}><em>Sem fornecedor padrão</em></MenuItem>
                                        {fornecedores.map(f => <MenuItem key={f.id} value={f.id}>{f.nome || f.razao_social}</MenuItem>)}
                                    </TextField>
                                )} />
                             </div>
                          </div>
                        )
                    },
                    { 
                      key: '5', 
                      label: 'Fiscal', 
                      children: (
                        <div className="border border-gray-200 border-t-none -mt-4 p-6 bg-white rounded-b-lg">
                            <h3 className="text-lg font-bold text-purple-900 mb-4">Tributação (NFe/NFCe)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Controller name="ncm" control={control} render={({ field }) => (
                                    <TextField {...field} fullWidth label="NCM" InputProps={{ readOnly: true }} />
                                )} />
                                <Controller name="cest" control={control} render={({ field }) => (
                                    <TextField {...field} fullWidth label="CEST" InputProps={{ readOnly: true }} />
                                )} />
                                <Controller name="cfop_padrao" control={control} render={({ field }) => (
                                    <TextField {...field} fullWidth label="CFOP Padrão" InputProps={{ readOnly: true }} />
                                )} />
                                <Controller name="origem_mercadoria" control={control} render={({ field }) => (
                                    <TextField {...field} select fullWidth label="Origem da Mercadoria" InputProps={{ readOnly: true }}>
                                        <MenuItem value={0}>0 - Nacional</MenuItem>
                                        <MenuItem value={1}>1 - Estrangeira (Imp. Direta)</MenuItem>
                                        <MenuItem value={2}>2 - Estrangeira (Adq. Mercado Interno)</MenuItem>
                                    </TextField>
                                )} />
                            </div>
                        </div>
                      )
                    },
                  ]}
                />
              </ConfigProvider>
            </Box>

             {/* FOOTER ACTIONS */}
             <Box className="flex justify-start gap-3 mt-4 pt-4 border-t">
                <Button variant="contained" color="primary" startIcon={<ArrowBack />} onClick={() => navigate("/cadastros/produtos")}>
                    Voltar para Listagem
                </Button>
             </Box>
          </CardContent>
        </Card>
      </form>
    </Layout>
  );
}

export default VisualizarProduto;
