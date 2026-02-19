/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { ConfigProvider, Tabs, message, Table } from 'antd';
import { 
  Button, Box, Card, CardContent, TextField, MenuItem, 
  CircularProgress, Skeleton, InputAdornment, Switch, FormControlLabel, Divider
} from "@mui/material";
import { Check, Close, Delete, Add, Search } from "@mui/icons-material";
import Layout from "../../../../template/Layout";
import { useNavigate } from "react-router";
import { novoProdutoSchema, type NovoProdutoFormData } from "../../../../modules/Cadastros/Produtos/Novo/schemas/novoProdutoSchema";
import api from "../../../../api/api";

const NovoProduto: React.FC = () => {
  const navigate = useNavigate();
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);

  // Listas Auxiliares
  const [categorias, setCategorias] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [listaProdutos, setListaProdutos] = useState<any[]>([]); // Para Composição

  const { 
    control, 
    handleSubmit, 
    watch,
    setValue,
    getValues,
    formState: { errors } 
  } = useForm<NovoProdutoFormData | any>({
    resolver: zodResolver(novoProdutoSchema),
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
      estoque_atual: 0
    }
  });

  // Arrays Dinâmicos
  const { fields: conversaoFields, append: appendConversao, remove: removeConversao } = useFieldArray({
    control, name: "conversoes"
  });
  
  const { fields: composicaoFields, append: appendComposicao, remove: removeComposicao } = useFieldArray({
    control, name: "composicao"
  });

  // --- Carregamento Inicial ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Supondo endpoints existentes ou simulando
        const [resAux, resProds, resForn] = await Promise.all([
          api.get('/produtos/auxiliares'), // Categorias, Marcas, Unidades
          api.get('/produtos?limit=100'),  // Lista simples para composição
          api.get('/clientes?tipo=fornecedor') // Lista de fornecedores (adaptar rota)
        ]);

        if (resAux.data.success) {
          setCategorias(resAux.data.data.categorias);
          setMarcas(resAux.data.data.marcas);
          setUnidades(resAux.data.data.unidades);
        }
        if (resProds.data?.data) setListaProdutos(resProds.data.data);
        if (resForn.data?.data) setFornecedores(resForn.data.data); // Adaptar conforme retorno real

      } catch (error) {
        console.error("Erro ao carregar dados", error);
        // Fallback manual se a API falhar para testar o layout
        setUnidades([{id: 1, sigla: 'UN', descricao: 'Unidade'}, {id: 2, sigla: 'CX', descricao: 'Caixa'}]);
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
  const tipoItem = watch('tipo_item');

  // Custo Final Calculado
  const custoFinal = Number(custo || 0) + Number(despesas || 0) + Number(outras || 0);

  // Atualiza Preço de Venda quando muda custo ou margem
  useEffect(() => {
    if (custoFinal > 0) {
        const valorVenda = custoFinal + (custoFinal * (Number(lucroUtilizado || 0) / 100));
        // Evita loop infinito se o valor já for o mesmo
        if (getValues('preco_venda') !== parseFloat(valorVenda.toFixed(2))) {
            setValue('preco_venda', parseFloat(valorVenda.toFixed(2)));
        }
    }
  }, [custoFinal, lucroUtilizado, setValue, getValues]);

  // Função para adicionar item na Composição e puxar dados do produto selecionado
  const handleAddComposicao = () => {
    appendComposicao({ 
        produto_filho_id: 0, 
        quantidade: 1,
        custo_unitario: 0,
        unidade_nome: ''
    });
  };

  const onSubmit = async (data: NovoProdutoFormData) => {
    setLoadingSave(true);
    try {
      // Pequeno ajuste para garantir que flags booleanas vão corretamente
      const payload = {
        ...data,
        situacao: data.produto_ativo ? 'ativo' : 'inativo'
      };
      
      console.log("Enviando Payload:", payload);
      await api.post('/produtos', payload);
      message.success("Produto cadastrado com sucesso!");
      navigate("/cadastros/produtos");
    } catch (error: any) {
      console.error(error);
      message.error(error.response?.data?.message || "Erro ao salvar.");
    } finally {
      setLoadingSave(false);
    }
  };

  if (loadingDados) return <Layout><Skeleton variant="rectangular" height={400} /></Layout>;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#9842F6]">Novo Produto</h1>
          <p className="text-gray-500">Preencha os dados abaixo para criar um novo produto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit, (e) => console.log("Erros form:", e))}>
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
                                <TextField {...field} fullWidth label="Nome" error={!!errors.nome} />
                              )} />
                              <Controller name="codigo_interno" control={control} render={({ field }) => (
                                <TextField {...field} fullWidth label="Código Interno" />
                              )} />
                              <Controller name="codigo_barras" control={control} render={({ field }) => (
                                <TextField {...field} fullWidth label="Código de Barras" />
                              )} />
                              <Controller name="tipo_item" control={control} render={({ field }) => (
                                <TextField {...field} select fullWidth label="Grupo do Produto">
                                    <MenuItem value="produto">Produto</MenuItem>
                                    <MenuItem value="servico">Serviço</MenuItem>
                                    <MenuItem value="kit">Kit</MenuItem>
                                </TextField>
                              )} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <Controller name="categoria_id" control={control} render={({ field }) => (
                                    <TextField {...field} select fullWidth label="Categoria">
                                        <MenuItem value={0}>Selecione</MenuItem>
                                        {categorias.map(c => <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>)}
                                    </TextField>
                                )} />
                                <Controller name="marca_id" control={control} render={({ field }) => (
                                    <TextField {...field} select fullWidth label="Marca">
                                        <MenuItem value={0}>Selecione</MenuItem>
                                        {marcas.map(m => <MenuItem key={m.id} value={m.id}>{m.nome}</MenuItem>)}
                                    </TextField>
                                )} />
                                <Controller name="unidade_id" control={control} render={({ field }) => (
                                    <TextField {...field} select fullWidth label="Unidade *" error={!!errors.unidade_id}>
                                        {unidades.map(u => <MenuItem key={u.id} value={u.id}>{u.sigla} - {u.descricao}</MenuItem>)}
                                    </TextField>
                                )} />
                            </div>

                            {/* Seção Conversão de Unidade */}
                            <div className="w-full mt-6 p-3 bg-purple-100 rounded-md text-sm text-purple-900 flex justify-between items-center">
                              <span>A conversão permite comprar em uma unidade e vender em outra.</span>
                              <Button size="small" onClick={() => appendConversao({ unidade_entrada_id: 0, fator_conversao: 1, codigo_barras_entrada: '' })}>
                                <Add fontSize="small"/> Adicionar
                              </Button>
                            </div>

                            {conversaoFields.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-12 gap-2 mt-2 items-center">
                                    <div className="col-span-1 text-center font-bold text-gray-400">1</div>
                                    <div className="col-span-3">
                                        <Controller name={`conversoes.${index}.unidade_entrada_id` as any} control={control} render={({ field }) => (
                                            <TextField {...field} select fullWidth size="small" label="Unidade Entrada">
                                                {unidades.map(u => <MenuItem key={u.id} value={u.id}>{u.sigla}</MenuItem>)}
                                            </TextField>
                                        )} />
                                    </div>
                                    <div className="col-span-2 text-center text-sm font-bold text-purple-800">Equivale a</div>
                                    <div className="col-span-2">
                                        <Controller name={`conversoes.${index}.fator_conversao` as any} control={control} render={({ field }) => (
                                            <TextField {...field} type="number" fullWidth size="small" label="Qtd" />
                                        )} />
                                    </div>
                                    <div className="col-span-3 text-sm text-gray-600 pt-2">da unidade principal (Saída)</div>
                                    <div className="col-span-1"><Button color="error" onClick={() => removeConversao(index)}><Delete/></Button></div>
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
                            {/* Peso e Dimensões */}
                            <h3 className="text-lg font-bold text-purple-900 mb-4">Peso e Dimensões</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Controller name="peso" control={control} render={({ field }) => (
                                    <TextField {...field} type="number" fullWidth label="Peso Bruto (kg)" />
                                )} />
                                <Controller name="largura" control={control} render={({ field }) => (
                                    <TextField {...field} type="number" fullWidth label="Largura (cm)" />
                                )} />
                                <Controller name="altura" control={control} render={({ field }) => (
                                    <TextField {...field} type="number" fullWidth label="Altura (cm)" />
                                )} />
                                <Controller name="comprimento" control={control} render={({ field }) => (
                                    <TextField {...field} type="number" fullWidth label="Comprimento (cm)" />
                                )} />
                            </div>

                            <Divider sx={{ my: 4 }} />

                            {/* Detalhes Booleanos */}
                            <h3 className="text-lg font-bold text-purple-900 mb-4">Configurações</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Controller name="produto_ativo" control={control} render={({ field }) => (
                                    <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} color="secondary"/>} label="Produto Ativo" />
                                )} />
                                <Controller name="vendido_separadamente" control={control} render={({ field }) => (
                                    <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} color="secondary"/>} label="Vendido Separadamente" />
                                )} />
                                <Controller name="comercializavel_pdv" control={control} render={({ field }) => (
                                    <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} color="secondary"/>} label="Comercializável no PDV" />
                                )} />
                            </div>
                            <div className="mt-4 md:w-1/3">
                                <Controller name="comissao" control={control} render={({ field }) => (
                                    <TextField {...field} type="number" fullWidth label="Comissão (%)" InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
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
                                {/* Coluna Esquerda: CUSTOS */}
                                <div className="bg-gray-50 p-4 rounded border border-gray-100">
                                    <h3 className="text-lg font-bold text-purple-900 mb-4">Custos</h3>
                                    <div className="flex flex-col gap-4">
                                        <Controller name="preco_custo" control={control} render={({ field }) => (
                                            <TextField {...field} fullWidth label="Preço de Custo" type="number" InputProps={{ startAdornment: 'R$' }} />
                                        )} />
                                        <Controller name="despesas_acessorias" control={control} render={({ field }) => (
                                            <TextField {...field} fullWidth label="Despesas Acessórias" type="number" InputProps={{ startAdornment: 'R$' }} />
                                        )} />
                                        <Controller name="outras_despesas" control={control} render={({ field }) => (
                                            <TextField {...field} fullWidth label="Outras Despesas" type="number" InputProps={{ startAdornment: 'R$' }} />
                                        )} />
                                        <div className="mt-2 p-3 bg-purple-100 rounded text-purple-900 font-bold flex justify-between">
                                            <span>Custo Final:</span>
                                            <span>R$ {custoFinal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Coluna Direita: VENDA */}
                                <div className="bg-white p-4 rounded border border-gray-100">
                                    <h3 className="text-lg font-bold text-purple-900 mb-4">Venda</h3>
                                    <div className="flex flex-col gap-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Controller name="lucro_sugerido" control={control} render={({ field }) => (
                                                <TextField {...field} label="Lucro Sugerido" type="number" disabled InputProps={{ endAdornment: '%' }} placeholder="30" />
                                            )} />
                                            <Controller name="margem_lucro" control={control} render={({ field }) => (
                                                <TextField {...field} label="Lucro Utilizado *" type="number" InputProps={{ endAdornment: '%' }} />
                                            )} />
                                        </div>
                                        
                                        <Controller name="preco_venda" control={control} render={({ field }) => (
                                            <TextField {...field} fullWidth label="Valor de Venda (R$)" type="number" InputProps={{ startAdornment: 'R$' }} error={!!errors.preco_venda} />
                                        )} />
                                        
                                        <Controller name="preco_promocional" control={control} render={({ field }) => (
                                            <TextField {...field} fullWidth label="Preço Promocional (Opcional)" type="number" InputProps={{ startAdornment: 'R$' }} />
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
                                  <TextField {...field} type="number" label="Estoque Mínimo (UN)" fullWidth />
                              )} />
                              <Controller name="estoque_maximo" control={control} render={({ field }) => (
                                  <TextField {...field} type="number" label="Estoque Máximo (UN)" fullWidth />
                              )} />
                              <Controller name="estoque_atual" control={control} render={({ field }) => (
                                  <TextField {...field} type="number" label="Quantidade Atual (UN)" fullWidth InputProps={{ readOnly: false }} />
                              )} />
                           </div>
                           <div className="mt-4">
                                <Controller name="movimenta_estoque" control={control} render={({ field }) => (
                                    <FormControlLabel control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} color="primary"/>} label="Este produto controla estoque automaticamente" />
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
                                 <div className="text-center text-gray-400 py-10">Selecione "Kit" na aba Dados para habilitar esta seção.</div>
                             ) : (
                                 <>
                                    <div className="flex justify-end mb-4">
                                        <Button variant="contained" color="secondary" startIcon={<Add/>} onClick={handleAddComposicao}>Adicionar Item</Button>
                                    </div>
                                    <Table 
                                        dataSource={composicaoFields}
                                        rowKey="id"
                                        pagination={false}
                                        columns={[
                                            { 
                                                title: 'Produto', 
                                                dataIndex: 'produto', 
                                                render: (_: any, _record: any, index: number) => (
                                                    <Controller name={`composicao.${index}.produto_filho_id` as any} control={control} render={({ field }) => (
                                                        <TextField {...field} select fullWidth size="small">
                                                            <MenuItem value={0}>Selecione...</MenuItem>
                                                            {listaProdutos.map(p => <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>)}
                                                        </TextField>
                                                    )} />
                                                )
                                            },
                                            { 
                                                title: 'Quantidade', 
                                                width: 150,
                                                render: (_: any, _record: any, index: number) => (
                                                    <Controller name={`composicao.${index}.quantidade` as any} control={control} render={({ field }) => (
                                                        <TextField {...field} type="number" size="small" />
                                                    )} />
                                                )
                                            },
                                            // Colunas calculadas (apenas visualização básica por enquanto)
                                            { title: 'Custo (R$)', render: () => "R$ 0,00" }, 
                                            { title: 'Total (R$)', render: () => "R$ 0,00" },
                                            { 
                                                title: 'Ações', 
                                                width: 80,
                                                render: (_: any, __: any, index: number) => (
                                                    <Button color="error" size="small" onClick={() => removeComposicao(index)}><Delete/></Button>
                                                )
                                            }
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
                             <p className="text-sm text-gray-500 mb-4">Selecione o fornecedor principal para reposição deste produto.</p>
                             <div className="grid grid-cols-1 md:grid-cols-2">
                                <Controller name="fornecedor_padrao_id" control={control} render={({ field }) => (
                                    <TextField {...field} select fullWidth label="Fornecedor" InputProps={{ startAdornment: <Search color="action" sx={{ mr: 1 }}/> }}>
                                        <MenuItem value={0}><em>Sem fornecedor padrão</em></MenuItem>
                                        {fornecedores.map(f => <MenuItem key={f.id} value={f.id}>{f.nome || f.razao_social}</MenuItem>)}
                                    </TextField>
                                )} />
                             </div>
                          </div>
                        )
                    },
                    // Placeholders para abas não solicitadas detalhadamente
                    { key: '5', label: 'Fotos', children: <div className="p-4 bg-white border">Em breve: Upload de imagens</div> },
                    { key: '6', label: 'Fiscal', children: <div className="p-4 bg-white border">Em breve: Campos NCM, CEST, Origem.</div> },
                  ]}
                />
              </ConfigProvider>
            </Box>

             {/* FOOTER ACTIONS */}
             <Box className="flex justify-start gap-3 mt-4 pt-4 border-t">
                <Button type="submit" variant="contained" color="success" disabled={loadingSave} startIcon={loadingSave ? <CircularProgress size={20} color="inherit"/> : <Check />} sx={{ color: 'white', minWidth: 150 }}>
                    {loadingSave ? "Salvando..." : "Cadastrar"}
                </Button>
                <Button variant="contained" color="error" startIcon={<Close />} onClick={() => navigate("/cadastros/produtos")}>
                    Cancelar
                </Button>
             </Box>
          </CardContent>
        </Card>
      </form>
    </Layout>
  );
}

export default NovoProduto;