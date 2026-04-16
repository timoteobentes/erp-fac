/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Button, Box, TextField, MenuItem, IconButton, FormControlLabel, Checkbox, Skeleton,
  CircularProgress, InputAdornment, Typography, Divider 
} from "@mui/material";
import { 
  Add, DeleteOutline, Search, CloudUploadOutlined, AttachFile, Check, Close, ArrowBack,
  BadgeOutlined, MapOutlined, ContactsOutlined, MonetizationOnOutlined, FormatQuoteOutlined, ImageOutlined 
} from "@mui/icons-material";
import { styled } from '@mui/material/styles';
import Layout from '../../../../template/Layout';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { useClientes } from '../../../../modules/Cadastros/Clientes/hooks/useClientes';
import { useConsultaCnpj } from '../../../../modules/Cadastro/hooks/useConsultaCnpj'; 
import { novoClienteSchema, type NovoClienteFormData } from '../../../../modules/Cadastros/Clientes/Novo/schemas/clienteSchema';
import { maskRegexCPF, maskRegexCNPJ, maskRegexCEP, maskRegexRG } from '../../../../types/regex';

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

const EditarCliente: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getConsultaCNPJ, loading: loadingConsultaCNPJ } = useConsultaCnpj(); 
  const { fetchClienteId, atualizarCliente, isLoading } = useClientes();
  const [loadingData, setLoadingData] = useState(true);

  // Configuração do Formulário
  const { 
    control, handleSubmit, watch, getValues, setValue, reset, formState: { errors } 
  } = useForm<NovoClienteFormData | any>({
    resolver: zodResolver(novoClienteSchema)
  });

  const tipoCliente = watch('tipo_cliente');

  // Field Arrays
  const { fields: fieldsEnd, append: appendEnd, remove: removeEnd } = useFieldArray({ control, name: "enderecos" });
  const { fields: fieldsCont, append: appendCont, remove: removeCont } = useFieldArray({ control, name: "contatos" });
  const { fields: fieldsPhoto, append: appendPhoto, remove: removePhoto } = useFieldArray({ control, name: "foto" });
  const { fields: fieldsAnex, append: appendAnex, remove: removeAnex } = useFieldArray({ control, name: "anexos" });

  // --- Funções Auxiliares ---
  const handleBuscarCep = async (index: number, cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setValue(`enderecos.${index}.logradouro`, data.logradouro);
        setValue(`enderecos.${index}.bairro`, data.bairro);
        setValue(`enderecos.${index}.cidade`, data.localidade);
        setValue(`enderecos.${index}.uf`, data.uf);
        const numeroInput = document.getElementById(`numero-${index}`);
        if (numeroInput) numeroInput.focus();
      }
    } catch (error) {
      console.error("Erro ao buscar CEP", error);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const base64 = await fileToBase64(file);
      appendAnex({ nome: file.name, arquivo: file, url: base64 });
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Apenas arquivos de imagem (PNG, JPG, JPEG) são permitidos.");
        return;
      }
      const base64 = await fileToBase64(file);
      setValue("foto", []);
      appendPhoto({ nome: file.name, arquivo: file, url: base64 });
    }
  };

  const onSubmit = async (data: NovoClienteFormData) => {
    await atualizarCliente(String(id), data);
  };

  // Carregar Dados
  useEffect(() => {
    if (id) {
      fetchClienteId(id)
        .then((response: any) => {
          const dados = response.cliente || response;
          const info = dados?.data;

          console.log(info);

          reset({
            tipo_cliente: info?.tipo_cliente,
            situacao: info?.situacao,
            nome: info?.nome,
            vendedor_responsavel: info?.vendedor_responsavel,
            foto: info?.foto || [],
            anexos: info?.anexos || [],
            permitir_ultrapassar_limite: info?.permitir_ultrapassar_limite,
            limite_credito: info?.limite_credito,
            enderecos: info?.enderecos?.length > 0 
              ? info.enderecos.map((end: any) => ({
                  tipo: end.tipo, cep: end.cep ? maskRegexCEP(end.cep) : end.cep, logradouro: end.logradouro,
                  numero: end.numero, bairro: end.bairro, cidade: end.cidade, uf: end.uf, pais: end.pais, principal: end.principal
                }))
              : [],
            contatos: info?.contatos?.length > 0
              ? info.contatos.map((ctt: any) => ({
                  tipo: ctt.tipo, nome: ctt.nome, valor: ctt.valor, cargo: ctt.cargo, principal: ctt.principal
                }))
              : [],
            cnpj: info?.cnpj ? maskRegexCNPJ(info?.cnpj) : info?.cnpj,
            razao_social: info?.nome,
            nome_fantasia: info?.nome_fantasia,
            inscricao_estadual: info?.inscricao_estadual || "",
            inscricao_municipal: info?.inscricao_municipal || "",
            inscricao_suframa: info?.inscricao_suframa || "",
            cpf: info?.cpf ? maskRegexCPF(info?.cpf) : info?.cpf,
            rg: info?.rg ? maskRegexRG(info?.rg) : info?.rg,
            data_nascimento: dayjs(info?.data_nascimento).format('YYYY-MM-DD'),
            documento: info?.documento,
            pais_origem: info?.pais_origem,
            observacoes: info?.observacoes
          });
        })
        .catch((error) => console.error("Erro ao buscar cliente:", error))
        .finally(() => setLoadingData(false));
    }
  }, [id]);

  if (loadingData) {
    return (
      <Layout>
        <div className="mb-8 flex items-center gap-4">
            <Skeleton variant="circular" width={48} height={48} />
            <div>
                <Skeleton variant="text" width={200} height={40} />
                <Skeleton variant="text" width={300} height={20} />
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
            onClick={() => navigate('/cadastros/clientes')}
            sx={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', color: '#475569', '&:hover': { backgroundColor: '#F8FAFC', color: '#0F172A' } }}
          >
            <ArrowBack />
          </IconButton>
          <div className="flex flex-col">
            <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Editar Cliente
            </Typography>
            <Typography variant="body2" color="#64748B">
                Atualize as informações cadastrais e comerciais deste registro.
            </Typography>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit, (errors) => console.log("Erros de validação:", errors))} className="animate-fadeIn">
        
        {/* CONTAINER PRINCIPAL (Soft UX) */}
        <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", p: { xs: 3, md: 5 } }}>
          
          <div className="flex flex-col gap-10">
            
            {/* SEÇÃO 1: DADOS GERAIS */}
            <Box>
              <div className="flex items-center gap-2 mb-6">
                <BadgeOutlined sx={{ color: '#5B21B6' }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Dados Gerais</Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Controller
                  name="tipo_cliente"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select fullWidth required label="Tipo de Pessoa" sx={premiumInputStyles}>
                      <MenuItem value="PJ">PESSOA JURÍDICA</MenuItem>
                      <MenuItem value="PF">PESSOA FÍSICA</MenuItem>
                      <MenuItem value="estrangeiro">ESTRANGEIRO</MenuItem>
                    </TextField>
                  )}
                />
                <Controller
                  name="situacao"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select fullWidth required label="Situação" sx={premiumInputStyles}>
                      <MenuItem value="ativo">ATIVO</MenuItem>
                      <MenuItem value="inativo">INATIVO</MenuItem>
                      <MenuItem value="bloqueado">BLOQUEADO</MenuItem>
                    </TextField>
                  )}
                />
                <Controller
                  name="vendedor_responsavel"
                  control={control}
                  render={({ field }) => <TextField {...field} fullWidth required disabled label="Vendedor Responsável" sx={premiumInputStyles} />}
                />

                {/* Renderização Condicional: PESSOA JURÍDICA */}
                {tipoCliente === 'PJ' && (
                  <>
                    <Controller
                      name="cnpj"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field} fullWidth label="CNPJ" required sx={premiumInputStyles}
                          onChange={(e) => field.onChange(maskRegexCNPJ(e.target.value))}
                          error={!!(errors as any).cnpj} helperText={(errors as any).cnpj?.message}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton edge="end" title="Consultar na Receita" onClick={(() => getConsultaCNPJ(getValues("cnpj")))}>
                                  <Search sx={{ color: '#94A3B8' }} />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                    <div className="md:col-span-2">
                      <Controller
                        name="razao_social"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field} fullWidth required label="Razão Social" sx={premiumInputStyles}
                            error={!!(errors as any).razao_social} helperText={(errors as any).razao_social?.message}
                            disabled={loadingConsultaCNPJ}
                            InputProps={{ endAdornment: loadingConsultaCNPJ ? <InputAdornment position="end"><CircularProgress size={20} color="inherit" /></InputAdornment> : null }}
                            InputLabelProps={{ shrink: !!field.value || loadingConsultaCNPJ }}
                          />
                        )}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Controller
                        name="nome_fantasia"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field} fullWidth required label="Nome Fantasia" sx={premiumInputStyles}
                            error={!!(errors as any).nome_fantasia} disabled={loadingConsultaCNPJ}
                            InputProps={{ endAdornment: loadingConsultaCNPJ ? <InputAdornment position="end"><CircularProgress size={20} color="inherit" /></InputAdornment> : null }}
                            InputLabelProps={{ shrink: !!field.value || loadingConsultaCNPJ }}
                          />
                        )}
                      />
                    </div>
                    <Controller name="inscricao_estadual" control={control} render={({ field }) => <TextField {...field} fullWidth label="Inscrição Estadual" sx={premiumInputStyles} />} />
                    <Controller name="inscricao_municipal" control={control} render={({ field }) => <TextField {...field} fullWidth label="Inscrição Municipal" sx={premiumInputStyles} />} />
                    <Controller name="inscricao_suframa" control={control} render={({ field }) => <TextField {...field} fullWidth label="Inscrição Suframa" disabled={loadingConsultaCNPJ} sx={premiumInputStyles} InputProps={{ endAdornment: loadingConsultaCNPJ ? ( <InputAdornment position="end"> <CircularProgress size={20} color="inherit" /> </InputAdornment> ) : null }} InputLabelProps={{ shrink: !!field.value || loadingConsultaCNPJ }} />} />
                    <div className="hidden md:block"></div> 
                  </>
                )}

                {/* Renderização Condicional: PESSOA FÍSICA */}
                {tipoCliente === 'PF' && (
                  <>
                    <Controller name="cpf" control={control} render={({ field }) => <TextField {...field} fullWidth label="CPF" required onChange={(e) => field.onChange(maskRegexCPF(e.target.value))} error={!!(errors as any).cpf} helperText={(errors as any).cpf?.message} sx={premiumInputStyles} />} />
                    <Controller name="rg" control={control} render={({ field }) => <TextField {...field} fullWidth required label="RG" onChange={(e) => field.onChange(maskRegexRG(e.target.value))} sx={premiumInputStyles} />} />
                    <div className="md:col-span-2">
                      <Controller name="nome" control={control} render={({ field }) => <TextField {...field} fullWidth required label="Nome Completo" error={!!(errors as any).nome} helperText={(errors as any).nome?.message} sx={premiumInputStyles} />} />
                    </div>
                    <Controller name="data_nascimento" control={control} render={({ field }) => <TextField {...field} type="date" fullWidth required label="Data Nascimento" InputLabelProps={{ shrink: true }} sx={premiumInputStyles} />} />
                  </>
                )}

                {/* Renderização Condicional: ESTRANGEIRO */}
                {tipoCliente === 'estrangeiro' && (
                  <>
                    <Controller name="documento" control={control} render={({ field }) => <TextField {...field} fullWidth required label="Documento (Passport/ID)" error={!!(errors as any).documento} sx={premiumInputStyles} />} />
                    <Controller name="nome" control={control} render={({ field }) => <TextField {...field} fullWidth required label="Nome Completo" error={!!(errors as any).nome} helperText={(errors as any).nome?.message} sx={premiumInputStyles} />} />
                    <Controller name="pais_origem" control={control} render={({ field }) => <TextField {...field} fullWidth required label="País de Origem" sx={premiumInputStyles} />} />
                  </>
                )}
              </div>
            </Box>

            <Divider sx={{ borderColor: '#F1F5F9' }} />

            {/* SEÇÃO 2: ENDEREÇOS */}
            <Box>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <MapOutlined sx={{ color: '#5B21B6' }} />
                  <Typography variant="h6" fontWeight={700} color="#0F172A">Endereços</Typography>
                </div>
                <Button 
                  startIcon={<Add />} 
                  onClick={() => appendEnd({ tipo: 'comercial', cep: '', logradouro: '', numero: '', bairro: '', cidade: '', uf: '', pais: 'Brasil' })}
                  sx={{ textTransform: 'none', fontWeight: 600, color: '#5B21B6', backgroundColor: '#F3E8FF', '&:hover': { backgroundColor: '#E9D5FF' }, borderRadius: '8px' }}
                >
                  Adicionar
                </Button>
              </div>

              {fieldsEnd.map((item, index) => (
                <Box key={item.id} className="p-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] relative transition-all hover:border-[#CBD5E1] mb-4">
                  <div className="absolute right-4 top-4">
                    <IconButton size="small" onClick={() => removeEnd(index)} sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', backgroundColor: '#FEF2F2' } }}>
                        <DeleteOutline fontSize="small" />
                    </IconButton>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-2">
                    <div className="md:col-span-2">
                      <Controller name={`enderecos.${index}.tipo`} control={control} render={({ field }) => (
                          <TextField {...field} select fullWidth required label="Tipo" sx={premiumInputStyles}>
                            <MenuItem value="comercial">COMERCIAL</MenuItem>
                            <MenuItem value="cobranca">COBRANÇA</MenuItem>
                            <MenuItem value="entrega">ENTREGA</MenuItem>
                            <MenuItem value="residencial">RESIDENCIAL</MenuItem>
                          </TextField>
                        )}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Controller name={`enderecos.${index}.cep`} control={control} render={({ field }) => (
                          <TextField {...field} fullWidth required label="CEP" onChange={(e) => field.onChange(maskRegexCEP(e.target.value))} sx={premiumInputStyles}
                            InputProps={{ endAdornment: ( <InputAdornment position="end"> <IconButton size="small" onClick={() => handleBuscarCep(index, field.value)}> <Search fontSize="small" sx={{ color: '#94A3B8' }}/> </IconButton> </InputAdornment> ) }}
                          />
                        )}
                      />
                    </div>
                    <div className="md:col-span-6">
                      <Controller name={`enderecos.${index}.logradouro`} control={control} render={({ field }) => <TextField {...field} fullWidth required label="Logradouro" sx={premiumInputStyles} />} />
                    </div>
                    <div className="md:col-span-2">
                      <Controller name={`enderecos.${index}.numero`} control={control} render={({ field }) => <TextField {...field} id={`numero-${index}`} fullWidth required label="Número" sx={premiumInputStyles} />} />
                    </div>
                    <div className="md:col-span-3">
                      <Controller name={`enderecos.${index}.bairro`} control={control} render={({ field }) => <TextField {...field} fullWidth required label="Bairro" sx={premiumInputStyles} />} />
                    </div>
                    <div className="md:col-span-4">
                      <Controller name={`enderecos.${index}.cidade`} control={control} render={({ field }) => <TextField {...field} fullWidth required label="Cidade" sx={premiumInputStyles} />} />
                    </div>
                    <div className="md:col-span-2">
                      <Controller name={`enderecos.${index}.uf`} control={control} render={({ field }) => <TextField {...field} fullWidth required label="UF" sx={premiumInputStyles} />} />
                    </div>
                    <div className="md:col-span-3">
                      <Controller name={`enderecos.${index}.complemento`} control={control} render={({ field }) => <TextField {...field} fullWidth label="Complemento" sx={premiumInputStyles} />} />
                    </div>
                    <div className="md:col-span-12">
                        <Controller name={`enderecos.${index}.principal`} control={control} render={({ field }) => (
                            <FormControlLabel control={<Checkbox checked={field.value} onChange={field.onChange} sx={{ color: '#CBD5E1', '&.Mui-checked': { color: '#10B981' } }} />} label={<Typography variant="body2" fontWeight={600} color="#475569">Definir como Endereço Principal</Typography>} />
                        )} />
                    </div>
                  </div>
                </Box>
              ))}
            </Box>

            <Divider sx={{ borderColor: '#F1F5F9' }} />

            {/* SEÇÃO 3: CONTATOS ADICIONAIS */}
            <Box>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <ContactsOutlined sx={{ color: '#5B21B6' }} />
                  <Typography variant="h6" fontWeight={700} color="#0F172A">Contatos</Typography>
                </div>
                <Button 
                  startIcon={<Add />} 
                  onClick={() => appendCont({ tipo: 'email', nome: '', valor: '' })}
                  sx={{ textTransform: 'none', fontWeight: 600, color: '#5B21B6', backgroundColor: '#F3E8FF', '&:hover': { backgroundColor: '#E9D5FF' }, borderRadius: '8px' }}
                >
                   Adicionar
                </Button>
              </div>

              {fieldsCont.map((item, index) => (
                <Box key={item.id} className="p-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] relative transition-all hover:border-[#CBD5E1] mb-4">
                  <div className="absolute right-4 top-4">
                    <IconButton size="small" onClick={() => removeCont(index)} sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', backgroundColor: '#FEF2F2' } }}>
                        <DeleteOutline fontSize="small" />
                    </IconButton>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start mt-2">
                    <Controller name={`contatos.${index}.tipo`} control={control} render={({ field }) => (
                        <TextField {...field} select fullWidth required label="Tipo" sx={premiumInputStyles}>
                          <MenuItem value="email">E-MAIL</MenuItem>
                          <MenuItem value="telefone">TELEFONE</MenuItem>
                          <MenuItem value="celular">CELULAR</MenuItem>
                          <MenuItem value="site">SITE/REDE SOCIAL</MenuItem>
                        </TextField>
                      )}
                    />
                    <Controller name={`contatos.${index}.nome`} control={control} render={({ field }) => <TextField {...field} fullWidth required label="Nome do Contato" sx={premiumInputStyles} />} />
                    <Controller name={`contatos.${index}.valor`} control={control} render={({ field }) => <TextField {...field} fullWidth required label="Contato (Email/Tel)" sx={premiumInputStyles} />} />
                    <Controller name={`contatos.${index}.cargo`} control={control} render={({ field }) => <TextField {...field} fullWidth required label="Cargo/Depto" sx={premiumInputStyles} />} />
                    <div className="md:col-span-4">
                        <Controller name={`contatos.${index}.principal`} control={control} render={({ field }) => (
                            <FormControlLabel control={<Checkbox checked={field.value} onChange={field.onChange} sx={{ color: '#CBD5E1', '&.Mui-checked': { color: '#6366F1' } }} />} label={<Typography variant="body2" fontWeight={600} color="#475569">Definir como Contato Principal</Typography>} />
                        )} />
                    </div>
                  </div>
                </Box>
              ))}
            </Box>

            <Divider sx={{ borderColor: '#F1F5F9' }} />

            {/* SEÇÃO 4: CONFIGURAÇÕES E FINANCEIRO */}
            <Box>
              <div className="flex items-center gap-2 mb-6">
                <MonetizationOnOutlined sx={{ color: '#5B21B6' }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Financeiro</Typography>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Controller name="limite_credito" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth label="Limite de Crédito (R$)" type="number" sx={premiumInputStyles} InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} />
                  )}
                />
                <div className="flex items-center md:col-span-3">
                  <Controller name="permitir_ultrapassar_limite" control={control} render={({ field }) => (
                      <FormControlLabel control={<Checkbox checked={field.value} onChange={field.onChange} sx={{ color: '#CBD5E1', '&.Mui-checked': { color: '#10B981' } }} />} label={<Typography variant="body2" fontWeight={600} color="#475569">Permitir Ultrapassar Limite</Typography>} />
                   )}
                  />
                </div>
              </div>
            </Box>

            <Divider sx={{ borderColor: '#F1F5F9' }} />

            {/* SEÇÃO 5: ANEXOS E FOTOS */}
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ImageOutlined sx={{ color: '#5B21B6' }} />
                    <Typography variant="h6" fontWeight={700} color="#0F172A">Foto/Logo</Typography>
                  </div>
                  <Button component="label" variant="outlined" startIcon={<CloudUploadOutlined />} sx={{ borderColor: '#E2E8F0', color: '#475569', textTransform: 'none', borderRadius: '8px', '&:hover': { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' } }}>
                    Selecionar Foto
                    <VisuallyHiddenInput type="file" accept="image/png, image/jpeg, image/jpg" onChange={handlePhotoUpload} />
                  </Button>
                  <Typography variant="caption" display="block" color="#94A3B8" mt={1}>PNG, JPG (Máx 5MB)</Typography>

                  <div className="mt-4 space-y-2">
                    {fieldsPhoto.map((foto: any, index: any) => (
                      <div key={foto.id} className="flex justify-between items-center bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                          <span className="text-sm font-medium text-[#0F172A] truncate flex items-center gap-2">
                            <AttachFile fontSize="small" sx={{ color: '#94A3B8' }}/> {foto.nome}
                          </span>
                          <IconButton size="small" onClick={() => removePhoto(index)} sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}><DeleteOutline fontSize="small" /></IconButton>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <AttachFile sx={{ color: '#5B21B6' }} />
                    <Typography variant="h6" fontWeight={700} color="#0F172A">Documentos</Typography>
                  </div>
                  <Button component="label" variant="outlined" startIcon={<CloudUploadOutlined />} sx={{ borderColor: '#E2E8F0', color: '#475569', textTransform: 'none', borderRadius: '8px', '&:hover': { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' } }}>
                    Anexar Arquivos
                    <VisuallyHiddenInput type="file" onChange={handleFileUpload} />
                  </Button>
                  <Typography variant="caption" display="block" color="#94A3B8" mt={1}>PDF, PNG, JPG</Typography>

                  <div className="mt-4 space-y-2">
                    {fieldsAnex.map((anexo: any, index: any) => (
                      <div key={anexo.id} className="flex justify-between items-center bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">
                          <span className="text-sm font-medium text-[#0F172A] truncate flex items-center gap-2">
                             <AttachFile fontSize="small" sx={{ color: '#94A3B8' }}/> {anexo.nome}
                          </span>
                          <IconButton size="small" onClick={() => removeAnex(index)} sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}><DeleteOutline fontSize="small" /></IconButton>
                      </div>
                    ))}
                  </div>
                </div>
            </Box>

            <Divider sx={{ borderColor: '#F1F5F9' }} />

            {/* SEÇÃO 6: OBSERVAÇÕES */}
            <Box>
              <div className="flex items-center gap-2 mb-6">
                <FormatQuoteOutlined sx={{ color: '#5B21B6' }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Observações</Typography>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller name="observacoes" control={control} render={({ field }) => (
                    <TextField {...field} fullWidth multiline rows={4} label="Observações Gerais" sx={premiumInputStyles} />
                  )}
                />
              </div>
            </Box>

            {/* FOOTER ACTIONS */}
            <Box className="flex justify-end gap-3 mt-4 pt-6 border-t border-[#F1F5F9]">
              <Button 
                type="button"
                variant="outlined" 
                onClick={() => navigate("/cadastros/clientes")}
                sx={{ borderColor: '#E2E8F0', color: '#475569', textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 4, '&:hover': { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' } }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                variant="contained" 
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : <Check />}
                sx={{ background: 'linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)', color: 'white', textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 6, boxShadow: '0 4px 14px 0 rgba(91, 33, 182, 0.25)', '&:hover': { background: 'linear-gradient(90deg, #28024D 0%, #4C1D95 100%)', boxShadow: '0 6px 20px rgba(91, 33, 182, 0.3)' } }}
              >
                {isLoading ? "Salvando alterações..." : "Salvar Cliente"}
              </Button>
            </Box>

          </div>
        </Box>
      </form>
    </Layout>
  );
};

export default EditarCliente;