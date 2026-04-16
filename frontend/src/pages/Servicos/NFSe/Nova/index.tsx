/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Controller } from 'react-hook-form';
import { 
  TextField, Button, CircularProgress, Box, 
  Autocomplete, Alert, Divider, Typography, IconButton, InputAdornment
} from '@mui/material';
import { 
  ArrowBack, Save, ReceiptLong, PersonOutline, 
  WorkOutline, CalculateOutlined, AccountBalanceWalletOutlined
} from '@mui/icons-material';
import { useNovaNFSe } from '../../../../modules/Servicos/EmissaoNFSe/hooks/useNovaNFSe';
import Layout from "../../../../template/Layout";

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

export default function NovaNFSe() {
  const { 
    methods, isBuscandoDependencies, isLoading, 
    clientes, servicos, servicoSelecionado,
    totalCalculado, issEstimado,
    onSubmitRascunho, onSubmitEmitir, voltar 
  } = useNovaNFSe();

  const { control, formState: { errors }, watch } = methods;
  const clienteSelecionadoId = watch('cliente_id');
  const valorServicoWatch = watch('valor_servico') || 0;

  // Verifica se o cliente selecionado não tem documento
  const clienteAlvo = clientes.find((c: any) => c.id === clienteSelecionadoId);
  const clienteFaltaDoc = clienteAlvo && !clienteAlvo.cpf_cnpj;

  // Renderização de Loading Premium
  if (isBuscandoDependencies) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[calc(100vh-140px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#F1F5F9] border-t-[#5B21B6]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* HEADER DE NAVEGAÇÃO PREMIUM */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center gap-4">
          <IconButton 
            onClick={voltar}
            sx={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', color: '#475569', '&:hover': { backgroundColor: '#F8FAFC', color: '#0F172A' } }}
          >
            <ArrowBack />
          </IconButton>
          <div className="flex flex-col">
            <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Emitir NFS-e
            </Typography>
            <Typography variant="body2" color="#64748B">
                Preencha os dados da prestação para gerar a Nota Fiscal de Serviço eletrónica.
            </Typography>
          </div>
        </div>
      </div>

      <form className="animate-fadeIn">
        {/* CONTAINER PRINCIPAL (Soft UX) */}
        <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", p: { xs: 3, md: 5 } }}>
          
          <div className="flex flex-col gap-8">
            
            {/* SECÇÃO 1: TOMADOR DO SERVIÇO */}
            <Box>
              <div className="flex items-center gap-2 mb-6">
                <PersonOutline sx={{ color: '#5B21B6' }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Tomador do Serviço (Cliente)</Typography>
              </div>

              <Controller
                name="cliente_id"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Autocomplete
                    options={clientes}
                    getOptionLabel={(option: any) => `${option.nome} ${option.cpf_cnpj ? `(${option.cpf_cnpj})` : ''}`}
                    value={clientes.find((c: any) => c.id === value) || null}
                    onChange={(_, data) => onChange(data ? data.id : null)}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Selecione o Cliente" 
                        error={!!errors.cliente_id} 
                        helperText={errors.cliente_id?.message as string} 
                        sx={premiumInputStyles}
                      />
                    )}
                  />
                )}
              />

              {clienteFaltaDoc && (
                <Alert 
                  severity="error" 
                  sx={{ mt: 3, borderRadius: '12px', backgroundColor: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', '& .MuiAlert-icon': { color: '#DC2626' } }}
                >
                  <Typography variant="body2" fontWeight={600}>Atenção!</Typography>
                  O cliente selecionado não tem CPF ou CNPJ registado. A emissão será rejeitada pela prefeitura. Atualize o registo do cliente antes de emitir.
                </Alert>
              )}
            </Box>

            <Divider sx={{ borderColor: '#F1F5F9' }} />

            {/* SECÇÃO 2: DETALHES DA PRESTAÇÃO */}
            <Box>
              <div className="flex items-center gap-2 mb-6">
                <WorkOutline sx={{ color: '#5B21B6' }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Detalhes do Serviço</Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="servico_id"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Autocomplete
                      options={servicos}
                      getOptionLabel={(option: any) => option.nome}
                      value={servicos.find((s: any) => s.id === value) || null}
                      onChange={(_, data) => onChange(data ? data.id : null)}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Selecione o Serviço Base" 
                          error={!!errors.servico_id} 
                          helperText={errors.servico_id?.message as string} 
                          sx={premiumInputStyles}
                        />
                      )}
                    />
                  )}
                />

                <Controller
                  name="valor_servico"
                  control={control}
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      value={field.value || ''}
                      label="Valor da Prestação" 
                      type="number"
                      inputProps={{ step: "0.01" }}
                      error={!!errors.valor_servico} 
                      helperText={errors.valor_servico?.message as string}
                      InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                      sx={premiumInputStyles}
                    />
                  )}
                />
              </div>

              <Box sx={{ mt: 6 }}>
                <Controller
                  name="descricao_servico"
                  control={control}
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      label="Discriminação dos Serviços (Corpo da Nota)" 
                      multiline 
                      rows={4} 
                      fullWidth 
                      error={!!errors.descricao_servico} 
                      helperText={errors.descricao_servico?.message as string} 
                      sx={premiumInputStyles}
                    />
                  )}
                />
              </Box>
            </Box>

            <Divider sx={{ borderColor: '#F1F5F9' }} />

            {/* SECÇÃO 3: RETENÇÕES E IMPOSTOS */}
            <Box>
              <div className="flex justify-between items-end mb-6">
                <div className="flex items-center gap-2">
                  <CalculateOutlined sx={{ color: '#5B21B6' }} />
                  <Typography variant="h6" fontWeight={700} color="#0F172A">Retenções Federais</Typography>
                </div>
                {servicoSelecionado && (
                  <Typography variant="caption" color="#64748B" fontWeight={600} sx={{ backgroundColor: '#F8FAFC', px: 2, py: 1, borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    Alíquota ISS do Serviço: <strong className="text-[#3C0473]">{servicoSelecionado.aliquota_iss}%</strong>
                  </Typography>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 bg-[#F8FAFC] p-6 rounded-2xl border border-[#E2E8F0]">
                {['retencao_ir', 'retencao_inss', 'retencao_csll', 'retencao_cofins', 'retencao_pis', 'retencao_cpp'].map((imposto) => (
                  <Controller
                    key={imposto}
                    name={imposto as any}
                    control={control}
                    render={({ field }) => (
                      <TextField 
                        {...field} 
                        value={field.value || ''}
                        label={imposto.replace('retencao_', '').toUpperCase()} 
                        type="number"
                        inputProps={{ step: "0.01" }}
                        size="small"
                        InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                        sx={premiumInputStyles}
                      />
                    )}
                  />
                ))}
              </div>
            </Box>

            {/* SECÇÃO 4: RESUMO FINANCEIRO (TOTALIZADOR) */}
            <Box className="mt-4 bg-[#1E293B] rounded-2xl overflow-hidden shadow-lg border border-[#334155]">
              <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <div className="flex items-center gap-2 text-[#94A3B8]">
                    <AccountBalanceWalletOutlined fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={600} className="uppercase tracking-widest">Resumo da Nota</Typography>
                  </div>
                  
                  <div className="flex gap-8 mt-2">
                    <div className="flex flex-col">
                      <span className="text-[#64748B] text-xs font-bold uppercase mb-1">Valor Bruto</span>
                      <span className="text-white text-lg font-medium">{Number(valorServicoWatch).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#64748B] text-xs font-bold uppercase mb-1">Total Retenções</span>
                      <span className="text-[#EF4444] text-lg font-medium">- {(Number(valorServicoWatch) - totalCalculado).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#64748B] text-xs font-bold uppercase mb-1">ISS Estimado</span>
                      <span className="text-[#F59E0B] text-lg font-medium">{issEstimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto md:text-right border-t md:border-t-0 md:border-l border-[#334155] pt-6 md:pt-0 md:pl-8">
                  <p className="text-[#94A3B8] text-xs font-bold uppercase tracking-widest mb-1">Valor Líquido a Receber</p>
                  <p className="text-4xl font-extrabold text-[#10B981] tracking-tight">
                    {totalCalculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>

              </div>
            </Box>

            {/* FOOTER ACTIONS */}
            <Box className="flex flex-col sm:flex-row justify-end gap-3 mt-2">
              <Button
                onClick={onSubmitRascunho}
                variant="outlined"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                disabled={isLoading || clienteFaltaDoc}
                sx={{ borderColor: '#E2E8F0', color: '#475569', textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 4, py: 1.5, '&:hover': { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' } }}
              >
                Salvar Rascunho
              </Button>
              
              <Button
                onClick={onSubmitEmitir}
                variant="contained"
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <ReceiptLong />}
                disabled={isLoading || clienteFaltaDoc}
                sx={{ 
                  background: 'linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)', 
                  color: 'white', 
                  textTransform: 'none', 
                  fontWeight: 700, 
                  borderRadius: '8px', 
                  px: 6, py: 1.5, fontSize: '1.05rem',
                  boxShadow: '0 4px 14px 0 rgba(91, 33, 182, 0.25)', 
                  '&:hover': { background: 'linear-gradient(90deg, #28024D 0%, #4C1D95 100%)', boxShadow: '0 6px 20px rgba(91, 33, 182, 0.3)' } 
                }}
              >
                Emitir NFS-e Agora
              </Button>
            </Box>

          </div>
        </Box>
      </form>
    </Layout>
  );
}