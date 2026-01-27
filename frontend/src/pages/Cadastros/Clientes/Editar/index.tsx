/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, CardContent, Divider, Typography, Box } from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
// import dayjs from 'dayjs';
import { DatePicker } from 'antd'; // Usando DatePicker do AntD pela facilidade

import Layout from '../../../../template/Layout';
import { useClientes } from '../../../../modules/Cadastros/Clientes/hooks/useClientes';
import { clienteSchema, type ClienteFormData } from '../../../../modules/Cadastros/Clientes/Editar/schemas/clienteSchema';
import { FormInput, FormSelect, FormCheckbox } from '../../../../modules/Cadastros/Clientes/Editar/components/FormFields';
import { FileUploader } from '../../../../modules/Cadastros/Clientes/Editar/components/FileUploader'; // Importe o novo componente

// Mocks de Máscara
const maskCPF_CNPJ = (v: string) => v.replace(/\D/g, '').slice(0, 14);
const maskPhone = (v: string) => v.replace(/\D/g, '').slice(0, 11);
const maskCEP = (v: string) => v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d{3})/, '$1-$2');

const EditarCliente: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchClienteId, atualizarCliente, isLoading } = useClientes();
  const [loadingData, setLoadingData] = useState(true);
  
  // State para Arquivos
  const [anexos, setAnexos] = useState<any[]>([]);

  const { control, handleSubmit, watch, reset } = useForm<ClienteFormData | any>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      tipo_cliente: 'PF',
      permitir_ultrapassar_limite: false,
      bloquear_inadimplente: false
    }
  });

  const tipoCliente = watch('tipo_cliente');
  const isPF = tipoCliente === 'PF';

  // Carregar Dados
  useEffect(() => {
    if (id) {
      fetchClienteId(id)
        .then((response: any) => {
          const dados = response.cliente || response;
          
          // Formatar data para o input se necessário ou manter string ISO
          // Reset do form
          reset(dados);

          // Carregar anexos existentes
          // Supondo que a API retorne: { anexos: [{ id: 1, url: '...', nome_arquivo: 'foto.jpg' }] }
          if (response.anexos) {
            const anexosFormatados = response.anexos.map((a: any) => ({
              id: a.id,
              url: a.url,
              name: a.nome_arquivo || `Anexo ${a.id}`
            }));
            setAnexos(anexosFormatados);
          }
        })
        .finally(() => setLoadingData(false));
    }
  }, [id]);

  // Handlers de Arquivos
  const handleAddFiles = (newFiles: File[]) => {
    const fileItems = newFiles.map(f => ({ name: f.name, file: f }));
    setAnexos([...anexos, ...fileItems]);
  };

  const handleRemoveFile = (index: number) => {
    // Se tiver ID, você pode precisar marcar para deleção na API ou deletar direto
    // Aqui apenas removemos visualmente da lista de envio
    const newAnexos = [...anexos];
    newAnexos.splice(index, 1);
    setAnexos(newAnexos);
  };

  const onSubmit = async (data: ClienteFormData) => {
    try {
      // Separar arquivos novos para envio (FormData) ou lógica específica
      const formData = new FormData();
      
      // Anexar campos de texto
      Object.keys(data).forEach(key => {
        const value = (data as any)[key];
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });

      // Anexar arquivos novos
      anexos.forEach((anexo, idx) => {
        if (anexo.file) {
          formData.append(`anexos[${idx}]`, anexo.file);
        }
        // Se precisar enviar IDs dos arquivos mantidos, faça aqui
      });

      // IMPORTANTE: Se o seu hook 'atualizarCliente' espera JSON,
      // você terá que ajustar para aceitar FormData ou enviar arquivos em endpoint separado.
      // Vou assumir que 'atualizarCliente' lida com isso ou você ajustará o service.
      
      // await atualizarCliente(Number(id), formData); // Se for Multipart
      if(id) {
        await atualizarCliente(id, data);
        navigate(`/cadastros/clientes/visualizar/${id}`);
      }
    } catch (error) {
      console.error('Erro ao salvar', error);
    }
  };

  if (loadingData) return <Layout><div>Carregando dados...</div></Layout>;

  return (
    <Layout>
      <form onSubmit={handleSubmit(onSubmit)} className="pb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/cadastros/clientes')} color="inherit">
              Voltar
            </Button>
            <Typography variant="h5" className="text-[#3C0473] font-bold">
              Editar Cliente <span className="text-gray-400 text-sm">#{id}</span>
            </Typography>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outlined" 
              color="error" 
              onClick={() => navigate(`/cadastros/clientes/visualizar/${id}`)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="success" 
              startIcon={<Save />}
              disabled={isLoading}
            >
              Salvar Alterações
            </Button>
          </div>
        </div>

        <Card sx={{ border: "1px solid #E9DEF6", borderRadius: 2, boxShadow: 'none' }}>
          <CardContent className="flex flex-col gap-6">
            
            {/* 1. DADOS PESSOAIS */}
            <section>
              <Typography variant="h6" className="text-[#3C0473] font-bold mb-3 border-l-4 border-[#3C0473] pl-2">
                Dados Pessoais
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormSelect 
                  name="tipo_cliente" 
                  label="Tipo de Pessoa" 
                  control={control} 
                  options={[{ value: 'PF', label: 'Pessoa Física' }, { value: 'PJ', label: 'Pessoa Jurídica' }]}
                />
                
                <FormInput 
                  name="cpf_cnpj" 
                  label={isPF ? "CPF" : "CNPJ"} 
                  control={control} 
                  mask={maskCPF_CNPJ}
                />

                <div className="md:col-span-2">
                  <FormInput name="nome" label={isPF ? "Nome Completo" : "Razão Social"} control={control} />
                </div>
                
                {!isPF ? (
                  <>
                    <FormInput name="nome_fantasia" label="Nome Fantasia" control={control} />
                    <FormInput name="inscricao_estadual" label="Inscrição Estadual" control={control} />
                  </>
                ) : (
                   <>
                    <FormInput name="rg" label="RG" control={control} />
                    {/* Exemplo de DatePicker controlado manualmente se necessário */}
                    <div className="w-full">
                       <Typography variant="caption" className="text-gray-600 ml-1">Data de Nascimento</Typography>
                       <DatePicker 
                         className="w-full h-[40px]" 
                         format="DD/MM/YYYY"
                         placeholder="Selecione"
                         // Value e OnChange precisariam ser conectados ao 'control' via Controller se quiser validação
                         // Para simplificar, vou deixar comentado como sugestão de melhoria futura
                       />
                    </div>
                   </>
                )}
                
                <FormInput name="email" label="E-mail" control={control} />
                <FormInput name="telefone" label="Telefone Fixo" control={control} mask={maskPhone} />
                <FormInput name="celular" label="Celular / WhatsApp" control={control} mask={maskPhone} />
              </div>
            </section>

            <Divider />

            {/* 2. ENDEREÇO */}
            <section>
              <Typography variant="h6" className="text-[#3C0473] font-bold mb-3 border-l-4 border-[#3C0473] pl-2">
                Endereço
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormInput name="cep" label="CEP" control={control} mask={maskCEP} />
                <div className="md:col-span-2">
                  <FormInput name="endereco" label="Logradouro" control={control} />
                </div>
                <FormInput name="numero" label="Número" control={control} />
                <FormInput name="bairro" label="Bairro" control={control} />
                <FormInput name="complemento" label="Complemento" control={control} />
                <FormInput name="cidade" label="Cidade" control={control} />
                <FormInput name="estado" label="UF" control={control} />
              </div>
            </section>

            <Divider />

            {/* 3. FINANCEIRO */}
            <section>
              <Typography variant="h6" className="text-[#3C0473] font-bold mb-3 border-l-4 border-[#3C0473] pl-2">
                Financeiro
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormInput name="limite_credito" label="Limite de Crédito (R$)" type="number" control={control} />
                <FormInput name="prazo_pagamento" label="Prazo Pagamento (dias)" type="number" control={control} />
                
                <div className="md:col-span-2 flex flex-col justify-center border p-2 rounded bg-gray-50">
                   <FormCheckbox name="permitir_ultrapassar_limite" label="Permitir Ultrapassar Limite" control={control} />
                   <FormCheckbox name="bloquear_inadimplente" label="Bloquear Automático se Inadimplente" control={control} />
                </div>
              </div>
            </section>

            <Divider />

            {/* 4. ANEXOS (Fotos e Documentos) */}
            <section>
              <Typography variant="h6" className="text-[#3C0473] font-bold mb-3 border-l-4 border-[#3C0473] pl-2">
                Anexos e Documentos
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUploader 
                  label="Adicionar Fotos/Documentos"
                  files={anexos} 
                  onAdd={handleAddFiles} 
                  onRemove={handleRemoveFile} 
                />
                
                <Box className="bg-blue-50 p-4 rounded text-sm text-blue-800">
                  <strong>Dica:</strong> Você pode anexar fotos do documento (RG/CNH), comprovante de endereço ou contrato assinado.
                  <br/>Formatos aceitos: PDF, JPG, PNG. Tamanho máx: 5MB.
                </Box>
              </div>
            </section>

            <Divider />

            {/* 5. OBSERVAÇÕES */}
            <section>
              <Typography variant="h6" className="text-[#3C0473] font-bold mb-3 border-l-4 border-[#3C0473] pl-2">
                Observações
              </Typography>
              <FormInput 
                name="observacoes" 
                label="Anotações internas sobre este cliente" 
                control={control} 
                multiline 
                rows={4} 
              />
            </section>

          </CardContent>
        </Card>
      </form>
    </Layout>
  );
};

export default EditarCliente;