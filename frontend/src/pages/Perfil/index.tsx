import React, { useEffect } from 'react';
import { Box, Button, TextField, Divider, IconButton, Typography, CircularProgress, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Tabs, ConfigProvider } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import Layout from '../../template/Layout';
import { useNavigate } from 'react-router-dom';
import { usePerfil } from '../../modules/Perfil/hooks/usePerfil';
import { 
  ArrowBack, Check, PersonOutline, BusinessOutlined, InfoOutlined,
  ReceiptOutlined, CloudUploadOutlined, LockOutlined 
} from '@mui/icons-material';

const { TabPane } = Tabs;

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

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const Perfil: React.FC = () => {
  const navigate = useNavigate();
  const { perfil, loading, submitting, salvarPerfil } = usePerfil();

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      nome: '', nome_completo: '', cpf: '', cnpj: '', razao_social: '', telefone: '', cidade: '', estado: '',
      senha: '', // Para troca opcional
      inscricao_estadual: '', regime_tributario: '', csc_id: '', csc_alfanumerico: '', ambiente_sefaz: '',
      certificado_base64: '', certificado_senha: '',
      inscricao_municipal_nfse: '', codigo_tributacao_nacional: '', codigo_tributacao_municipal: '', cnae_nfse: '', cnbs: '', serie_dps: ''
    }
  });

  useEffect(() => {
    console.log(perfil)
    if (!loading && perfil.usuario) {
      reset({
        nome: perfil.usuario.nome_usuario || '',
        nome_completo: perfil.usuario.nome_completo || '',
        cpf: perfil.usuario.cpf || '',
        cnpj: perfil.usuario.cnpj || '',
        razao_social: perfil.usuario.razao_social || '',
        telefone: perfil.usuario.telefone || '',
        cidade: perfil.usuario.cidade || '',
        estado: perfil.usuario.estado || '',
        senha: '',
        inscricao_estadual: perfil.fiscal?.inscricao_estadual || '',
        regime_tributario: perfil.fiscal?.regime_tributario || '',
        csc_id: perfil.fiscal?.csc_id || '',
        csc_alfanumerico: perfil.fiscal?.csc_alfanumerico || '',
        ambiente_sefaz: perfil.fiscal?.ambiente_sefaz || '',
        certificado_base64: perfil.fiscal?.certificado_base64 || '',
        certificado_senha: perfil.fiscal?.certificado_senha || '',
        inscricao_municipal_nfse: perfil.fiscal_nfse?.inscricao_municipal || '',
        codigo_tributacao_nacional: perfil.fiscal_nfse?.codigo_tributacao_nacional || '',
        codigo_tributacao_municipal: perfil.fiscal_nfse?.codigo_tributacao_municipal || '',
        cnae_nfse: perfil.fiscal_nfse?.cnae || '',
        cnbs: perfil.fiscal_nfse?.cnbs || '',
        serie_dps: perfil.fiscal_nfse?.serie_dps || '1'
      });
    }
  }, [perfil, loading, reset]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        // Extrair apenas a string base64 limpa
        const base64String = result.split(',')[1];
        setValue('certificado_base64', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: any) => {
    await salvarPerfil(data);
  };

  // Renderização de Loading Premium B2B
  if (loading) {
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
            onClick={() => navigate(-1)}
            sx={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', color: '#475569', '&:hover': { backgroundColor: '#F8FAFC', color: '#0F172A' } }}
          >
            <ArrowBack />
          </IconButton>
          <div className="flex flex-col">
            <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Meu Perfil e Configurações
            </Typography>
            <Typography variant="body2" color="#64748B">
                Faça a gestão dos seus dados de acesso, informações da empresa e credenciais fiscais (NFC-e e NFS-e).
            </Typography>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="animate-fadeIn">
        {/* CONTAINER PRINCIPAL (Soft UX) */}
        <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", p: { xs: 3, md: 5 } }}>
          
          <ConfigProvider
            theme={{
              components: {
                Tabs: {
                  colorPrimary: '#5B21B6',
                  itemSelectedColor: '#5B21B6',
                  itemHoverColor: '#3C0473',
                  inkBarColor: '#5B21B6',
                  titleFontSize: 16,
                }
              }
            }}
          >
            <Tabs defaultActiveKey="1" tabBarGutter={32}>
              
              {/* ABA 1: MEUS DADOS */}
              <TabPane tab={<span className="flex items-center gap-2"><PersonOutline fontSize="small"/> Meus Dados</span>} key="1">
                 <div className="mt-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Controller name="nome" control={control} render={({field}) => <TextField {...field} label="Nome de Utilizador (Login)" fullWidth sx={premiumInputStyles} />} />
                      <Controller name="senha" control={control} render={({field}) => <TextField {...field} type="password" label="Nova Senha (deixe em branco para manter)" fullWidth sx={premiumInputStyles} />} />
                      
                      <div className="col-span-1 md:col-span-2">
                         <Divider sx={{ my: 2, borderColor: '#F1F5F9' }} />
                      </div>

                      <div className="md:col-span-2">
                         <Controller name="nome_completo" control={control} render={({field}) => <TextField {...field} label="Nome Completo / Representante Legal" fullWidth sx={premiumInputStyles} />} />
                      </div>
                      <Controller name="cpf" control={control} render={({field}) => <TextField {...field} label="CPF" fullWidth sx={premiumInputStyles} />} />
                   </div>
                 </div>
              </TabPane>

              {/* ABA 2: DADOS DA EMPRESA */}
              <TabPane tab={<span className="flex items-center gap-2"><BusinessOutlined fontSize="small"/> Dados da Empresa</span>} key="2">
                 <div className="mt-6">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-1">
                         <Controller name="cnpj" control={control} render={({field}) => <TextField {...field} label="CNPJ" fullWidth sx={premiumInputStyles} />} />
                      </div>
                      <div className="md:col-span-2">
                         <Controller name="razao_social" control={control} render={({field}) => <TextField {...field} label="Razão Social" fullWidth sx={premiumInputStyles} />} />
                      </div>
                      <Controller name="telefone" control={control} render={({field}) => <TextField {...field} label="Telefone de Contato" fullWidth sx={premiumInputStyles} />} />
                      <Controller name="cidade" control={control} render={({field}) => <TextField {...field} label="Cidade" fullWidth sx={premiumInputStyles} />} />
                      <Controller name="estado" control={control} render={({field}) => <TextField {...field} label="Estado (UF)" fullWidth sx={premiumInputStyles} />} />
                   </div>
                 </div>
              </TabPane>

              {/* ABA 3: CONFIGURAÇÃO FISCAL (NFC-e) */}
              <TabPane tab={<span className="flex items-center gap-2"><ReceiptOutlined fontSize="small"/> Fiscal (NFC-e)</span>} key="3">
                 <div className="mt-6">
                   
                   <Alert 
                       icon={<InfoOutlined fontSize="inherit" />}
                       severity="info" 
                       sx={{ mb: 6, borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', '& .MuiAlert-icon': { color: '#2563EB' } }}
                   >
                       <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>Configuração de PDV Obrigatória</Typography>
                       Para emitir notas fiscais via Ponto de Venda, insira o seu Certificado Digital A1 (.pfx) e os dados do CSC (Código de Segurança do Contribuinte) fornecidos pela Sefaz.
                   </Alert>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Controller name="inscricao_estadual" control={control} render={({field}) => <TextField {...field} label="Inscrição Estadual (IE)" fullWidth sx={premiumInputStyles} />} />
                      
                      <Controller name="regime_tributario" control={control} render={({field}) => (
                          <TextField {...field} select label="Regime Tributário" fullWidth SelectProps={{ native: true }} sx={premiumInputStyles}>
                              <option value=""></option>
                              <option value="Simples Nacional">Simples Nacional</option>
                              <option value="Regime Normal">Regime Normal</option>
                          </TextField>
                      )} />
                      
                      <Controller name="csc_id" control={control} render={({field}) => <TextField {...field} label="ID do CSC" fullWidth sx={premiumInputStyles} />} />
                      <Controller name="csc_alfanumerico" control={control} render={({field}) => <TextField {...field} label="Código CSC Alfanumérico" fullWidth sx={premiumInputStyles} />} />
                      
                      <div className="md:col-span-2">
                          <Controller name="ambiente_sefaz" control={control} render={({field}) => (
                              <TextField {...field} select label="Ambiente Sefaz" fullWidth SelectProps={{ native: true }} sx={premiumInputStyles}>
                                  <option value=""></option>
                                  <option value="Homologação">Homologação (Testes sem validade jurídica)</option>
                                  <option value="Produção">Produção (Com validade jurídica)</option>
                              </TextField>
                          )} />
                      </div>
                   </div>

                   <Divider sx={{ my: 4, borderColor: '#F1F5F9' }} />
                   
                   <div className="flex items-center gap-2 mb-4">
                       <LockOutlined sx={{ color: '#5B21B6' }} />
                       <Typography variant="h6" fontWeight={700} color="#0F172A">Certificado Digital (A1)</Typography>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start bg-[#F8FAFC] p-6 rounded-2xl border border-[#E2E8F0]">
                      <div>
                         <Button 
                             variant="outlined" 
                             component="label" 
                             startIcon={<CloudUploadOutlined />}
                             fullWidth 
                             sx={{ borderColor: '#E2E8F0', color: '#475569', textTransform: 'none', fontWeight: 600, borderRadius: '8px', py: 1.5, backgroundColor: '#FFFFFF', '&:hover': { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' } }}
                         >
                            Carregar Ficheiro (.pfx / .p12)
                            <VisuallyHiddenInput type="file" accept=".pfx,.p12" onChange={handleFileUpload} />
                         </Button>
                         <Controller name="certificado_base64" control={control} render={({field}) => (
                             <Typography variant="caption" display="block" fontWeight={600} mt={1.5} color={field.value && field.value.length > 50 ? "#059669" : "#64748B"}>
                                {field.value && field.value.length > 50 ? "✅ Certificado carregado e pronto para envio seguro." : "⚠️ Nenhum certificado ativo na memória."}
                             </Typography>
                         )} />
                      </div>
                      
                      <Controller name="certificado_senha" control={control} render={({field}) => <TextField {...field} type="password" label="Palavra-passe do Certificado" fullWidth sx={premiumInputStyles} />} />
                   </div>

                 </div>
              </TabPane>

              {/* ABA 4: CONFIGURAÇÕES FISCAIS (NFS-e) */}
              <TabPane tab={<span className="flex items-center gap-2"><ReceiptOutlined fontSize="small"/> Fiscal (NFS-e)</span>} key="4">
                 <div className="mt-6">
                   
                   <Alert 
                       icon={<InfoOutlined fontSize="inherit" />}
                       severity="warning" 
                       sx={{ mb: 6, borderRadius: '12px', backgroundColor: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A', '& .MuiAlert-icon': { color: '#D97706' } }}
                   >
                       <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>Exclusivo para Serviços</Typography>
                       Estas configurações destinam-se exclusivamente à emissão de Notas de Serviço (Padrão Sefin Nacional). Elas não afetam as suas emissões de produtos (NFC-e/NFe).
                   </Alert>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Controller name="inscricao_municipal_nfse" control={control} render={({field}) => <TextField {...field} value={field.value || ''} label="Inscrição Municipal (NFS-e)" helperText="Obrigatória em municípios que exigem inscrição do prestador" fullWidth sx={premiumInputStyles} />} />
                      <Controller name="codigo_tributacao_nacional" control={control} render={({field}) => <TextField {...field} value={field.value || ''} label="Código de Tributação Nacional" helperText="Ex.: 14.01.01" fullWidth sx={premiumInputStyles} />} />
                      <Controller name="codigo_tributacao_municipal" control={control} render={({field}) => <TextField {...field} value={field.value || ''} label="Código de Tributação Municipal" helperText="Se exigido pelo seu município (Ex: 14.01)" fullWidth sx={premiumInputStyles} />} />
                      <Controller name="cnae_nfse" control={control} render={({field}) => <TextField {...field} value={field.value || ''} label="CNAE Padrão (NFS-e)" fullWidth sx={premiumInputStyles} />} />
                      <Controller name="cnbs" control={control} render={({field}) => <TextField {...field} value={field.value || ''} label="CNBS" helperText="Informe se exigido para o serviço prestado" fullWidth sx={premiumInputStyles} />} />
                      <Controller name="serie_dps" control={control} render={({field}) => <TextField {...field} value={field.value || ''} label="Série DPS" helperText="Usada na composição do identificador da DPS" fullWidth sx={premiumInputStyles} />} />
                   </div>
                 </div>
              </TabPane>
            </Tabs>
          </ConfigProvider>

          {/* RODAPÉ DO FORMULÁRIO */}
          <Box className="flex justify-end mt-8 pt-6 border-t border-[#F1F5F9]">
             <Button 
                type="submit" 
                variant="contained" 
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Check />}
                sx={{ 
                  background: 'linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)', 
                  color: 'white', 
                  textTransform: 'none', 
                  fontWeight: 600, 
                  borderRadius: '8px', 
                  px: 6, py: 1.5, fontSize: '1.05rem',
                  boxShadow: '0 4px 14px 0 rgba(91, 33, 182, 0.25)', 
                  '&:hover': { background: 'linear-gradient(90deg, #28024D 0%, #4C1D95 100%)', boxShadow: '0 6px 20px rgba(91, 33, 182, 0.3)' } 
                }}
             >
                {submitting ? 'A Guardar...' : 'Salvar Configurações'}
             </Button>
          </Box>
        </Box>
      </form>
    </Layout>
  );
};

export default Perfil;