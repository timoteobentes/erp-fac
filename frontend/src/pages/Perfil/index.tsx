import React, { useEffect } from 'react';
import { Card, Button, TextField, Divider, IconButton, CircularProgress } from '@mui/material';
import { Tabs } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import Layout from '../../template/Layout';
import { useNavigate } from 'react-router-dom';
import { usePerfil } from '../../modules/Perfil/hooks/usePerfil';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const { TabPane } = Tabs;

const Perfil: React.FC = () => {
  const navigate = useNavigate();
  const { perfil, loading, submitting, salvarPerfil } = usePerfil();

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      nome: '', nome_completo: '', cpf: '', cnpj: '', razao_social: '', telefone: '', cidade: '', estado: '',
      senha: '', // Para troca opcional
      inscricao_estadual: '', regime_tributario: '', csc_id: '', csc_alfanumerico: '', ambiente_sefaz: '',
      certificado_base64: '', certificado_senha: ''
    }
  });

  useEffect(() => {
    if (!loading && perfil.usuario) {
      reset({
        nome: perfil.usuario.nome || '',
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
        certificado_senha: perfil.fiscal?.certificado_senha || ''
      });
    }
  }, [perfil, loading, reset]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        // O result do readAsDataURL vem no formato "data:application/x-pkcs12;base64,MIIG..."
        // Vamos extrair apenas a string base64 limpa
        const base64String = result.split(',')[1];
        setValue('certificado_base64', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: any) => {
    await salvarPerfil(data);
  };

  if (loading) {
     return (
       <Layout>
          <div className="flex h-full items-center justify-center"><CircularProgress /></div>
       </Layout>
     )
  }

  return (
    <Layout>
      <div className="w-full text-start mb-6 flex items-center gap-2">
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon sx={{ color: '#9842F6' }} />
        </IconButton>
        <span className="text-[#9842F6] font-bold text-2xl">Meu Perfil e Configurações</span>
      </div>

      <Card sx={{ p: 4, mb: 4, borderRadius: '8px' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultActiveKey="1">
            
            {/* ABA 1: MEUS DADOS */}
            <TabPane tab={<span className="font-semibold text-lg">Meus Dados</span>} key="1">
               <div className="mt-4">
                 <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 md:col-span-6">
                       <Controller name="nome" control={control} render={({field}) => <TextField {...field} label="Nome de Usuário (Login)" fullWidth size="small" />} />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                       <Controller name="senha" control={control} render={({field}) => <TextField {...field} type="password" label="Nova Senha (deixe em branco para não alterar)" fullWidth size="small" />} />
                    </div>
                    <div className="col-span-12">
                       <Divider sx={{ my: 1 }} />
                    </div>
                    <div className="col-span-12 md:col-span-8">
                       <Controller name="nome_completo" control={control} render={({field}) => <TextField {...field} label="Nome Completo / Representante Legal" fullWidth size="small" />} />
                    </div>
                    <div className="col-span-12 md:col-span-4">
                       <Controller name="cpf" control={control} render={({field}) => <TextField {...field} label="CPF" fullWidth size="small" />} />
                    </div>
                 </div>
               </div>
            </TabPane>

            {/* ABA 2: DADOS DA EMPRESA */}
            <TabPane tab={<span className="font-semibold text-lg">Dados da Empresa</span>} key="2">
               <div className="mt-4">
                 <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 md:col-span-4">
                       <Controller name="cnpj" control={control} render={({field}) => <TextField {...field} label="CNPJ" fullWidth size="small" />} />
                    </div>
                    <div className="col-span-12 md:col-span-8">
                       <Controller name="razao_social" control={control} render={({field}) => <TextField {...field} label="Razão Social" fullWidth size="small" />} />
                    </div>
                    <div className="col-span-12 md:col-span-4">
                       <Controller name="telefone" control={control} render={({field}) => <TextField {...field} label="Telefone de Contato" fullWidth size="small" />} />
                    </div>
                    <div className="col-span-12 md:col-span-4">
                       <Controller name="cidade" control={control} render={({field}) => <TextField {...field} label="Cidade" fullWidth size="small" />} />
                    </div>
                    <div className="col-span-12 md:col-span-4">
                       <Controller name="estado" control={control} render={({field}) => <TextField {...field} label="Estado (UF)" fullWidth size="small" />} />
                    </div>
                 </div>
               </div>
            </TabPane>

            {/* ABA 3: CONFIGURAÇÃO FISCAL (NFC-e) */}
            <TabPane tab={<span className="font-semibold text-lg">Configurações Fiscais (NFC-e)</span>} key="3">
               <div className="mt-4">
                 
                 <div className="bg-[#f0f9ff] border border-[#bae6fd] p-4 rounded mb-6 text-[#0369a1] text-sm">
                    <strong>Importante:</strong> Para emitir notas fiscais via PDV, insira seu Certificado Digital A1 (.pfx) e os dados do CSC (Código de Segurança do Contribuinte) do seu estado.
                 </div>

                 <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 md:col-span-6">
                       <Controller name="inscricao_estadual" control={control} render={({field}) => <TextField {...field} label="Inscrição Estadual (IE)" fullWidth size="small" />} />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                       <Controller name="regime_tributario" control={control} render={({field}) => (
                           <TextField {...field} select label="Regime Tributário" fullWidth size="small" SelectProps={{ native: true }}>
                              <option value=""></option>
                              <option value="Simples Nacional">Simples Nacional</option>
                              <option value="Regime Normal">Regime Normal</option>
                           </TextField>
                       )} />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                       <Controller name="csc_id" control={control} render={({field}) => <TextField {...field} label="ID do CSC" fullWidth size="small" />} />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                       <Controller name="csc_alfanumerico" control={control} render={({field}) => <TextField {...field} label="Código CSC Alfanumérico" fullWidth size="small" />} />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                       <Controller name="ambiente_sefaz" control={control} render={({field}) => (
                           <TextField {...field} select label="Ambiente Sefaz" fullWidth size="small" SelectProps={{ native: true }}>
                              <option value=""></option>
                              <option value="Homologação">Homologação (Testes)</option>
                              <option value="Produção">Produção (Validade Jurídica)</option>
                           </TextField>
                       )} />
                    </div>
                 </div>

                 <Divider sx={{ my: 4 }} />
                 <h3 className="font-bold text-[#6B00A1] text-lg mb-4">Certificado Digital (A1)</h3>

                 <div className="grid grid-cols-12 gap-6 items-center">
                    <div className="col-span-12 md:col-span-6">
                       <Button variant="outlined" component="label" fullWidth sx={{ textTransform: 'none', py: 1, borderColor: '#6B00A1', color: '#6B00A1' }}>
                          Selecionar Arquivo .PFX
                          <input type="file" hidden accept=".pfx,.p12" onChange={handleFileUpload} />
                       </Button>
                       <Controller name="certificado_base64" control={control} render={({field}) => (
                           <span className="block text-xs text-green-600 font-bold mt-2">
                              {field.value && field.value.length > 50 ? "✅ Certificado carregado e pronto para envio." : "Nenhum arquivo na memória."}
                           </span>
                       )} />
                    </div>
                    <div className="col-span-12 md:col-span-6">
                       <Controller name="certificado_senha" control={control} render={({field}) => <TextField {...field} type="password" label="Senha do Certificado" fullWidth size="small" />} />
                    </div>
                 </div>

               </div>
            </TabPane>
          </Tabs>

          <div className="flex justify-end mt-8 border-t pt-4">
             <Button 
                type="submit" 
                variant="contained" 
                disabled={submitting}
                sx={{ bgcolor: '#4fb462', '&:hover': { bgcolor: '#44a155' }, textTransform: 'none', fontSize: '1.1rem', px: 4 }}
             >
                {submitting ? 'Salvando...' : 'Salvar Módulos'}
             </Button>
          </div>
        </form>
      </Card>
    </Layout>
  );
};

export default Perfil;
