/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
  Button, Box, Card, CardContent, Typography, TextField,
  MenuItem, Checkbox, FormControlLabel, Tabs, Tab, InputAdornment
} from "@mui/material";
import { Save, Block, Inventory, AttachMoney, ReceiptLong, Description } from "@mui/icons-material";
import { Controller } from "react-hook-form";
import Layout from '../../../../template/Layout';
import { useNovoProduto } from "./hooks/useNovoProduto";

// Componente auxiliar de Aba (Igual ao seu visualizar-cliente.txt)
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other} className="mt-4">
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const NovoProduto: React.FC = () => {
  const { form, loading, tabIndex, handleChangeTab, onSubmit } = useNovoProduto();
  const { control, handleSubmit, formState: { errors } } = form;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h5" component="h1" sx={{ color: '#3C0473', fontWeight: 'bold' }}>
          Novo Produto
        </Typography>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
          <CardContent>
            
            {/* ABAS DE NAVEGAÇÃO */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabIndex} onChange={handleChangeTab} textColor="secondary" indicatorColor="secondary">
                <Tab icon={<Description />} iconPosition="start" label="Dados Gerais" />
                <Tab icon={<AttachMoney />} iconPosition="start" label="Valores" />
                <Tab icon={<Inventory />} iconPosition="start" label="Estoque" />
                <Tab icon={<ReceiptLong />} iconPosition="start" label="Fiscal (NFe)" />
              </Tabs>
            </Box>

            {/* ABA 0: DADOS GERAIS */}
            <CustomTabPanel value={tabIndex} index={0}>
              <div className="text-[#3C0473] mb-4 font-bold text-lg">Identificação</div>
              
              <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Controller
                  name="nome"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Nome do Produto *" fullWidth error={!!errors.nome} />
                  )}
                />
                
                <Controller
                  name="codigo_barras"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Código de Barras (EAN/GTIN)" fullWidth placeholder="789..." />
                  )}
                />

                <Controller
                  name="codigo_interno"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Código Interno (SKU)" fullWidth />
                  )}
                />

                <Controller
                  name="unidade_id"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Unidade *" fullWidth error={!!errors.unidade_id}>
                      <MenuItem value={1}>UN - Unidade</MenuItem>
                      <MenuItem value={2}>KG - Quilograma</MenuItem>
                      <MenuItem value={3}>CX - Caixa</MenuItem>
                      {/* Futuramente: Carregar da API */}
                    </TextField>
                  )}
                />

                <Controller
                  name="categoria_id"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Categoria" fullWidth>
                      <MenuItem value={1}>Geral</MenuItem>
                      {/* Futuramente: Carregar da API */}
                    </TextField>
                  )}
                />
              </Box>

              <div className="mt-4">
                  <Controller
                    name="ativo"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label="Produto Ativo no Sistema" />
                    )}
                  />
              </div>
            </CustomTabPanel>

            {/* ABA 1: VALORES */}
            <CustomTabPanel value={tabIndex} index={1}>
              <div className="text-[#3C0473] mb-4 font-bold text-lg">Precificação</div>
              <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Controller
                  name="preco_custo"
                  control={control}
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      label="Preço de Custo" 
                      type="number" 
                      fullWidth 
                      InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                    />
                  )}
                />

                <Controller
                  name="margem_lucro"
                  control={control}
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      label="Margem de Lucro (%)" 
                      type="number" 
                      fullWidth 
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                    />
                  )}
                />

                <Controller
                  name="preco_venda"
                  control={control}
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      label="Preço de Venda *" 
                      type="number" 
                      fullWidth 
                      error={!!errors.preco_venda}
                      InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                      sx={{ backgroundColor: '#f3e5f5' }} // Destaque leve roxo
                    />
                  )}
                />
              </Box>
            </CustomTabPanel>

            {/* ABA 2: ESTOQUE */}
            <CustomTabPanel value={tabIndex} index={2}>
              <div className="text-[#3C0473] mb-4 font-bold text-lg">Controle de Estoque</div>
              
              <div className="mb-4">
                <Controller
                  name="movimenta_estoque"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label="Controlar Estoque deste item" />
                  )}
                />
              </div>

              <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Controller
                  name="estoque_atual"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Saldo Atual" type="number" fullWidth />
                  )}
                />
                <Controller
                  name="estoque_minimo"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Estoque Mínimo (Alerta)" type="number" fullWidth />
                  )}
                />
              </Box>
            </CustomTabPanel>

            {/* ABA 3: FISCAL (CRUCIAL PARA O ERP) */}
            <CustomTabPanel value={tabIndex} index={3}>
              <div className="text-[#3C0473] mb-4 font-bold text-lg">Tributação (NFe/NFCe)</div>
              
              <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Controller
                  name="ncm"
                  control={control}
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      label="NCM (Obrigatório) *" 
                      fullWidth 
                      placeholder="Ex: 61051000"
                      error={!!errors.ncm}
                    />
                  )}
                />

                <Controller
                  name="cest"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="CEST" fullWidth placeholder="Ex: 0100100" />
                  )}
                />

                <Controller
                  name="cfop_padrao"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="CFOP Padrão" fullWidth placeholder="Ex: 5102" />
                  )}
                />

                <Controller
                  name="origem_mercadoria"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Origem da Mercadoria" fullWidth>
                      <MenuItem value={0}>0 - Nacional</MenuItem>
                      <MenuItem value={1}>1 - Estrangeira (Imp. Direta)</MenuItem>
                      <MenuItem value={2}>2 - Estrangeira (Adq. no mercado interno)</MenuItem>
                    </TextField>
                  )}
                />
              </Box>

              <div className="mt-4 p-4 bg-gray-50 rounded text-sm text-gray-600 border border-gray-200">
                <strong className="text-orange-600">Atenção:</strong> O preenchimento incorreto do NCM pode causar rejeição na emissão de notas fiscais.
              </div>
            </CustomTabPanel>

            {/* BOTÕES DE AÇÃO */}
            <Box className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-100">
              <Button 
                variant="contained" 
                color="error" 
                startIcon={<Block />}
                onClick={() => window.history.back()}
              >
                Cancelar
              </Button>
              
              <Button 
                type="submit" 
                variant="contained" 
                color="success" 
                sx={{ color: '#FFFFFF' }} // Mantendo seu padrão
                startIcon={<Save />}
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar Produto'}
              </Button>
            </Box>

          </CardContent>
        </Card>
      </form>
    </Layout>
  );
};

export default NovoProduto;