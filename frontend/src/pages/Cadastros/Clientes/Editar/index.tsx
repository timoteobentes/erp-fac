/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Button, Box, Card, CardContent, TextField, MenuItem, 
  IconButton, FormControlLabel, Checkbox, Skeleton,
  CircularProgress, InputAdornment 
} from "@mui/material";
import { Add, Delete, Search, CloudUpload, AttachFile, Check, Close } from "@mui/icons-material";
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

const EditarCliente: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getConsultaCNPJ, loading: loadingConsultaCNPJ } = useConsultaCnpj(); 
  const { fetchClienteId, atualizarCliente, isLoading } = useClientes();
  const [loadingData, setLoadingData] = useState(true);

// Configuração do Formulário
  const { 
    control, 
    handleSubmit, 
    watch,
    getValues,
    setValue,
    reset,
    formState: { errors } 
  } = useForm<NovoClienteFormData | any>({
    resolver: zodResolver(novoClienteSchema)
  });

  const tipoCliente = watch('tipo_cliente');

  // Field Arrays
  const { fields: fieldsEnd, append: appendEnd, remove: removeEnd } = useFieldArray({
    control,
    name: "enderecos"
  });

  const { fields: fieldsCont, append: appendCont, remove: removeCont } = useFieldArray({
    control,
    name: "contatos"
  });

  const { fields: fieldsPhoto, append: appendPhoto, remove: removePhoto } = useFieldArray({
    control,
    name: "foto"
  });

  const { fields: fieldsAnex, append: appendAnex, remove: removeAnex } = useFieldArray({
    control,
    name: "anexos"
  });

  // --- Funções Auxiliares ---

  const handleBuscarCep = async (index: number, cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    try {
      // Exemplo de chamada de API pública (substitua pela sua lógica interna se houver)
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setValue(`enderecos.${index}.logradouro`, data.logradouro);
        setValue(`enderecos.${index}.bairro`, data.bairro);
        setValue(`enderecos.${index}.cidade`, data.localidade);
        setValue(`enderecos.${index}.uf`, data.uf);
        // Foca no número
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
      appendAnex({
        nome: file.name,
        arquivo: file,
        url: base64
      });
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
      appendPhoto({
        nome: file.name,
        arquivo: file,
        url: base64
      });
    }
  };

  const onSubmit = async (data: NovoClienteFormData) => {
    console.log("data >> ", data)
    await atualizarCliente(String(id), data);
  };

  // Carregar Dados
  useEffect(() => {
    if (id) {
      fetchClienteId(id)
        .then((response: any) => {
          const dados = response.cliente || response;
          const info = dados?.data;

          reset({
            // Campos simples
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
                  tipo: end.tipo,
                  cep: end.cep ? maskRegexCEP(end.cep) : end.cep,
                  logradouro: end.logradouro,
                  numero: end.numero,
                  bairro: end.bairro,
                  cidade: end.cidade,
                  uf: end.uf,
                  pais: end.pais,
                  principal: end.principal
                }))
              : [],
            contatos: info?.contatos?.length > 0
              ? info.contatos.map((ctt: any) => ({
                  tipo: ctt.tipo,
                  nome: ctt.nome,
                  valor: ctt.valor,
                  cargo: ctt.cargo,
                  principal: ctt.principal
                }))
              : [],
            cnpj: info?.cnpj ? maskRegexCNPJ(info?.cnpj) : info?.cnpj,
            razao_social: info?.razao_social,
            nome_fantasia: info?.nome_fantasia,
            inscricao_estadual: info?.inscricao_estadual,
            inscricao_municipal: info?.inscricao_municipal,
            inscricao_suframa: info?.inscricao_suframa,
            cpf: info?.cpf ? maskRegexCPF(info?.cpf) : info?.cpf,
            rg: info?.rg ? maskRegexRG(info?.rg) : info?.rg,
            data_nascimento: dayjs(info?.data_nascimento).format('YYYY-MM-DD'),
            documento: info?.documento,
            pais_origem: info?.pais_origem,
            observacoes: info?.observacoes
          });

          console.log("Dados carregados e formulário resetado >> ", dados);
        })
        .catch((error) => {
          console.error("Erro ao buscar cliente:", error);
        })
        .finally(() => setLoadingData(false));
    }
  }, [id]);

  if (loadingData) {
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
          <h1 className="text-2xl font-bold text-[#9842F6]">Editar Cliente</h1>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit, (errors) => console.log("Erros de validação:", errors))}>
        <Card sx={{ boxShadow: "none !important", borderRadius: "4px", border: "1px solid #E9DEF6" }}>
          <CardContent className="flex flex-col gap-6">
            {/* SEÇÃO 1: DADOS PRINCIPAIS */}
            <Box>
              <h3 className="text-[#3C0473] text-lg font-bold mb-8">
                Dados Gerais
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Controller
                  name="tipo_cliente"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select fullWidth required label="Tipo de Pessoa">
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
                    <TextField {...field} select fullWidth required label="Situação">
                      <MenuItem value="ativo">ATIVO</MenuItem>
                      <MenuItem value="inativo">INATIVO</MenuItem>
                      <MenuItem value="bloqueado">BLOQUEADO</MenuItem>
                    </TextField>
                  )}
                />
                <Controller
                  name="vendedor_responsavel"
                  control={control}
                  render={({ field }) => <TextField {...field} fullWidth required disabled label="Vendedor Responsável" />}
                />

                {/* Renderização Condicional: PESSOA JURÍDICA */}
                {tipoCliente === 'PJ' && (
                  <>
                    <Controller
                      name="cnpj"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          fullWidth 
                          label="CNPJ"
                          required
                          onChange={(e) => field.onChange(maskRegexCNPJ(e.target.value))}
                          error={!!(errors as any).cnpj}
                          helperText={(errors as any).cnpj?.message}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton edge="end" title="Consultar na Receita" onClick={(() => getConsultaCNPJ(getValues("cnpj")))}>
                                  <Search />
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
                            {...field}
                            value={field.value}
                            fullWidth
                            required
                            label="Razão Social"
                            error={!!(errors as any).razao_social}
                            helperText={(errors as any).razao_social?.message}
                            disabled={loadingConsultaCNPJ}
                            InputProps={{
                              endAdornment: loadingConsultaCNPJ ? (
                                <InputAdornment position="end">
                                  <CircularProgress size={20} color="inherit" />
                                </InputAdornment>
                              ) : null,
                            }}
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
                            {...field}
                            fullWidth
                            required
                            label="Nome Fantasia"
                            error={!!(errors as any).nome_fantasia}
                            disabled={loadingConsultaCNPJ}
                            InputProps={{
                              endAdornment: loadingConsultaCNPJ ? (
                                <InputAdornment position="end">
                                  <CircularProgress size={20} color="inherit" />
                                </InputAdornment>
                              ) : null,
                            }}
                            InputLabelProps={{ shrink: !!field.value || loadingConsultaCNPJ }}
                          />
                        )}
                      />
                    </div>
                    <Controller
                      name="inscricao_estadual"
                      control={control}
                      render={({ field }) => <TextField {...field} fullWidth label="Inscrição Estadual" />}
                    />
                    <Controller
                      name="inscricao_municipal"
                      control={control}
                      render={({ field }) => <TextField {...field} fullWidth label="Inscrição Municipal" />}
                    />
                    <Controller
                      name="inscricao_suframa"
                      control={control}
                      render={({ field }) => <TextField {...field} fullWidth label="Inscrição Suframa" disabled={loadingConsultaCNPJ} InputProps={{ endAdornment: loadingConsultaCNPJ ? ( <InputAdornment position="end"> <CircularProgress size={20} color="inherit" /> </InputAdornment> ) : null, }} InputLabelProps={{ shrink: !!field.value || loadingConsultaCNPJ }} />}
                    />
                    {/* Placeholder para completar a linha de 4 se necessário */}
                    <div className="hidden md:block"></div> 
                  </>
                )}

                {/* Renderização Condicional: PESSOA FÍSICA */}
                {tipoCliente === 'PF' && (
                  <>
                    <Controller
                      name="cpf"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          fullWidth 
                          label="CPF" 
                          required
                          onChange={(e) => field.onChange(maskRegexCPF(e.target.value))}
                          error={!!(errors as any).cpf}
                          helperText={(errors as any).cpf?.message}
                        />
                      )}
                    />
                    <Controller
                      name="rg"
                      control={control}
                      render={({ field }) => (
                        <TextField 
                          {...field} 
                          fullWidth 
                          required
                          label="RG" 
                          onChange={(e) => field.onChange(maskRegexRG(e.target.value))}
                        />
                      )}
                    />
                    {/* Nome ocupa 2 espaços */}
                    <div className="md:col-span-2">
                      <Controller
                        name="nome"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} fullWidth required label="Nome Completo" error={!!(errors as any).nome} helperText={(errors as any).nome?.message} />
                        )}
                      />
                    </div>
                    <Controller
                      name="data_nascimento"
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} type="date" fullWidth required label="Data Nascimento" InputLabelProps={{ shrink: true }} />
                      )}
                    />
                  </>
                )}

                {/* Renderização Condicional: ESTRANGEIRO */}
                {tipoCliente === 'estrangeiro' && (
                  <>
                    <Controller
                      name="documento"
                      control={control}
                      render={({ field }) => <TextField {...field} fullWidth required label="Documento (Passport/ID)" error={!!(errors as any).documento} />}
                    />
                    <Controller
                      name="nome"
                      control={control}
                      render={({ field }) => <TextField {...field} fullWidth required label="Nome Completo" error={!!(errors as any).nome} />}
                    />
                    <Controller
                      name="pais_origem"
                      control={control}
                      render={({ field }) => <TextField {...field} fullWidth required label="País de Origem" />}
                    />
                  </>
                )}
              </div>
            </Box>

            {/* SEÇÃO 2: ENDEREÇOS */}
            <Box>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#3C0473] text-lg font-bold">
                  Endereço
                </h3>
                <Button startIcon={<Add />} onClick={() => appendEnd({ tipo: 'comercial', cep: '', logradouro: '', numero: '', bairro: '', cidade: '', uf: '', pais: 'Brasil' })}>
                  Adicionar
                </Button>
              </div>

              {fieldsEnd.map((item, index) => (
                <Box key={item.id} className="bg-gray-50 p-4 rounded mb-4 relative border border-gray-200">
                  <div className="absolute right-2 bottom-2">
                    <IconButton size="small" color="error" onClick={() => removeEnd(index)}><Delete /></IconButton>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-2">
                      <Controller
                        name={`enderecos.${index}.tipo`}
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} select fullWidth required label="Tipo" size="small">
                            <MenuItem value="comercial">COMERCIAL</MenuItem>
                            <MenuItem value="cobranca">COBRANÇA</MenuItem>
                            <MenuItem value="entrega">ENTREGA</MenuItem>
                            <MenuItem value="residencial">RESIDENCIAL</MenuItem>
                          </TextField>
                        )}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Controller
                        name={`enderecos.${index}.cep`}
                        control={control}
                        render={({ field }) => (
                          <TextField 
                            {...field} 
                            fullWidth 
                            required
                            label="CEP" 
                            size="small"
                            onChange={(e) => field.onChange(maskRegexCEP(e.target.value))}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton size="small" onClick={() => handleBuscarCep(index, field.value)}>
                                    <Search fontSize="small"/>
                                  </IconButton>
                                </InputAdornment>
                              )
                            }}
                          />
                        )}
                      />
                    </div>
                    <div className="md:col-span-6">
                      <Controller
                        name={`enderecos.${index}.logradouro`}
                        control={control}
                        render={({ field }) => <TextField {...field} fullWidth required label="Logradouro" size="small" />}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Controller
                        name={`enderecos.${index}.numero`}
                        control={control}
                        render={({ field }) => <TextField {...field} id={`numero-${index}`} fullWidth required label="Número" size="small" />}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Controller
                        name={`enderecos.${index}.bairro`}
                        control={control}
                        render={({ field }) => <TextField {...field} fullWidth required label="Bairro" size="small" />}
                      />
                    </div>
                    <div className="md:col-span-4">
                      <Controller
                        name={`enderecos.${index}.cidade`}
                        control={control}
                        render={({ field }) => <TextField {...field} fullWidth required label="Cidade" size="small" />}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Controller
                        name={`enderecos.${index}.uf`}
                        control={control}
                        render={({ field }) => <TextField {...field} fullWidth required label="UF" size="small" />}
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Controller
                        name={`enderecos.${index}.complemento`}
                        control={control}
                        render={({ field }) => <TextField {...field} fullWidth label="Complemento" size="small" />}
                      />
                    </div>
                    <Controller
                      name={`enderecos.${index}.principal`}
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel 
                          control={<Checkbox checked={field.value} onChange={field.onChange} />} 
                          label="Principal" 
                        />
                      )}
                    />
                  </div>
                  {/* {errors.enderecos?.[index] && (
                    <Typography variant="caption" color="error">Preencha os dados obrigatórios do endereço.</Typography>
                  )} */}
                </Box>
              ))}
            </Box>

            {/* SEÇÃO 3: CONTATOS ADICIONAIS */}
            <Box>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[#3C0473] text-lg font-bold">
                  Contato
                </h3>
                <Button startIcon={<Add />} onClick={() => appendCont({ tipo: 'email', nome: '', valor: '' })}>
                  Adicionar
                </Button>
              </div>

              {fieldsCont.map((item, index) => (
                <Box key={item.id} className="bg-gray-50 p-3 rounded mb-2 border border-gray-200 relative">
                  <div className="absolute right-1 bottom-1">
                    <IconButton size="small" color="error" onClick={() => removeCont(index)}><Delete fontSize="small" /></IconButton>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                    <Controller
                      name={`contatos.${index}.tipo`}
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} select fullWidth required label="Tipo" size="small">
                          <MenuItem value="email">E-MAIL</MenuItem>
                          <MenuItem value="telefone">TELEFONE</MenuItem>
                          <MenuItem value="celular">CELULAR</MenuItem>
                          <MenuItem value="site">SITE/REDE SOCIAL</MenuItem>
                        </TextField>
                      )}
                    />
                    <Controller
                      name={`contatos.${index}.nome`}
                      control={control}
                      render={({ field }) => <TextField {...field} fullWidth required label="Nome do Contato" size="small" />}
                    />
                    <Controller
                      name={`contatos.${index}.valor`}
                      control={control}
                      render={({ field }) => <TextField {...field} fullWidth required label="Contato (Email/Tel)" size="small" />}
                    />
                    <Controller
                      name={`contatos.${index}.cargo`}
                      control={control}
                      render={({ field }) => <TextField {...field} fullWidth required label="Cargo/Depto" size="small" />}
                    />
                    <Controller
                      name={`contatos.${index}.principal`}
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel 
                          control={<Checkbox checked={field.value} onChange={field.onChange} />} 
                          label="Principal" 
                        />
                      )}
                    />
                  </div>
                </Box>
              ))}
            </Box>

            {/* SEÇÃO 4: CONFIGURAÇÕES E FINANCEIRO */}
            <Box>
              <h3 className="text-[#3C0473] text-lg font-bold mb-4">
                Financeiro
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Controller
                  name="limite_credito"
                  control={control}
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      fullWidth 
                      label="Limite de Crédito (R$)" 
                      type="number"
                      InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                    />
                  )}
                />
                <div className="flex items-center">
                  <Controller
                    name="permitir_ultrapassar_limite"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel 
                        control={<Checkbox checked={field.value} onChange={field.onChange} />} 
                        label="Permitir Ultrapassar Limite" 
                      />
                    )}
                  />
                </div>
              </div>
            </Box>

            <Box>
              <h3 className="text-[#3C0473] text-lg font-bold mb-4">
                Foto
              </h3>
              <div className="flex items-start">
                <div className="text-center h-full flex justify-center">
                  <div>
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<CloudUpload />}
                      sx={{ backgroundColor: '#3C0473' }}
                    >
                      Selecionar Foto
                      <VisuallyHiddenInput type="file" accept="image/png, image/jpeg, image/jpg" onChange={handlePhotoUpload} />
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG (Máx 5MB)</p>
                  </div>

                  <div className="ml-4 text-left max-h-32 overflow-y-auto">
                    {fieldsPhoto.map((foto: any, index: any) => (
                      <div key={foto.id} className="flex justify-between items-center bg-white p-2 mb-1 rounded border">
                          <span className="text-sm truncate flex items-center gap-2">
                            <AttachFile fontSize="small"/> {foto.nome}
                          </span>
                          <IconButton size="small" onClick={() => removePhoto(index)}><Delete fontSize="small" color="error"/></IconButton>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Box>

            <Box>
              <h3 className="text-[#3C0473] text-lg font-bold mb-4">
                Anexos
              </h3>
              <div className="flex items-start">
                <div className="text-center h-full flex justify-center">
                  <div>
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<CloudUpload />}
                      sx={{ backgroundColor: '#3C0473' }}
                    >
                      Selecionar Arquivos
                      <VisuallyHiddenInput type="file" onChange={handleFileUpload} />
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">PDF, PNG, JPG</p>
                  </div>

                  <div className="ml-4 text-left max-h-32 overflow-y-auto">
                    {fieldsAnex.map((anexo: any, index: any) => (
                      <div key={anexo.id} className="flex justify-between items-center bg-white p-2 mb-1 rounded border">
                          <span className="text-sm truncate flex items-center gap-2">
                            <AttachFile fontSize="small"/> {anexo.nome}
                          </span>
                          <IconButton size="small" onClick={() => removeAnex(index)}><Delete fontSize="small" color="error"/></IconButton>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Box>

            {/* SEÇÃO 5: OBSERVAÇÕES E ANEXOS */}
            <Box>
              <h3 className="text-[#3C0473] text-lg font-bold mb-4">
                Observações
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="observacoes"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth multiline rows={4} label="Observações Gerais" />
                  )}
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
                {isLoading ? "Salvando..." : "Salvar"}
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
          </CardContent>
        </Card>
      </form>
    </Layout>
  );
};

export default EditarCliente;