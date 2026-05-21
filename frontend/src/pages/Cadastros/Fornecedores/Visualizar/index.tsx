/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, type SyntheticEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, IconButton, Skeleton, Tab, Tabs, TextField, Typography } from '@mui/material';
import {
  ArrowBack,
  AttachFile,
  BadgeOutlined,
  ContactsOutlined,
  EditOutlined,
  FormatQuoteOutlined,
  History,
  MapOutlined,
  MonetizationOnOutlined,
  PersonOutline
} from '@mui/icons-material';
import dayjs from 'dayjs';
import Layout from '../../../../template/Layout';
import { useFornecedores } from '../../../../modules/Cadastros/Fornecedores/hooks/useFornecedores';
import { maskRegexCEP, maskRegexCNPJ, maskRegexCPF } from '../../../../types/regex';

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

const readOnlyInputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#F8FAFC',
    minHeight: 48,
    '& fieldset': { borderColor: '#E2E8F0' }
  },
  '& .MuiInputLabel-root': { color: '#64748B' },
  '& .MuiInputBase-input.Mui-readOnly': {
    WebkitTextFillColor: '#0F172A',
    color: '#0F172A',
    fontWeight: 500
  }
};

const ReadOnlyField = ({ label, value, fullWidth = false }: { label: string; value?: any; fullWidth?: boolean }) => (
  <TextField
    label={label}
    value={value || '-'}
    fullWidth={fullWidth}
    InputProps={{ readOnly: true }}
    sx={readOnlyInputStyles}
  />
);

const SectionTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-2 mb-6">
    {icon}
    <Typography variant="h6" fontWeight={700} color="#0F172A">{title}</Typography>
  </div>
);

const tipoFornecedorLabel = (tipo?: string) => {
  if (tipo === 'PF') return 'Pessoa Física';
  if (tipo === 'PJ') return 'Pessoa Jurídica';
  if (tipo === 'estrangeiro') return 'Estrangeiro';
  return tipo || '-';
};

const formatDocumento = (dados: any) => {
  if (dados.tipo_fornecedor === 'PF') return maskRegexCPF(dados.cpf || '');
  if (dados.tipo_fornecedor === 'PJ') return maskRegexCNPJ(dados.cnpj || '');
  return dados.documento || '-';
};

const VisualizarFornecedor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { fornecedor, fetchFornecedorId, isLoading } = useFornecedores();
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (id) fetchFornecedorId(id);
  }, [id]);

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (isLoading && !fornecedor) {
    return (
      <Layout>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton variant="circular" width={48} height={48} />
            <div>
              <Skeleton variant="text" width={240} height={40} />
              <Skeleton variant="text" width={320} height={20} />
            </div>
          </div>
          <Skeleton variant="rounded" width={150} height={42} sx={{ borderRadius: '8px' }} />
        </div>
        <Skeleton variant="rounded" width="100%" height={600} sx={{ borderRadius: '24px' }} />
      </Layout>
    );
  }

  const dados = fornecedor?.fornecedor || {};
  const enderecos = fornecedor?.enderecos || [];
  const contatos = fornecedor?.contatos || [];
  const anexos = fornecedor?.anexos || [];
  const dataNascimento = dados.nascimento ? dayjs(dados.nascimento).format('DD/MM/YYYY') : '-';

  return (
    <Layout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <IconButton
            onClick={() => navigate('/cadastros/fornecedores')}
            sx={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              color: '#475569',
              '&:hover': { backgroundColor: '#F8FAFC', color: '#0F172A' }
            }}
          >
            <ArrowBack />
          </IconButton>
          <div className="flex flex-col">
            <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {dados.nome || dados.razao_social || 'Detalhes do Fornecedor'}
            </Typography>
            <Typography variant="body2" color="#64748B">
              Código: <strong className="text-[#3C0473]">#{dados?.id?.toString().padStart(4, '0') || '----'}</strong> • Visualize ou altere as informações abaixo.
            </Typography>
          </div>
        </div>

        <Button
          variant="outlined"
          startIcon={<EditOutlined />}
          onClick={() => navigate(`/cadastros/fornecedores/editar/${id}`)}
          sx={{
            borderColor: '#E2E8F0',
            color: '#0F172A',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '8px',
            px: 3,
            py: 1,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            '&:hover': { borderColor: '#5B21B6', backgroundColor: '#F8FAFC', color: '#5B21B6' }
          }}
        >
          Editar Fornecedor
        </Button>
      </div>

      <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 24px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
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
            <Tab icon={<PersonOutline sx={{ mb: '0 !important', mr: 1 }} />} iconPosition="start" label="Dados Cadastrais" />
            <Tab icon={<History sx={{ mb: '0 !important', mr: 1 }} />} iconPosition="start" label="Histórico Comercial" />
            <Tab icon={<AttachFile sx={{ mb: '0 !important', mr: 1 }} />} iconPosition="start" label={`Anexos (${anexos.length || 0})`} />
          </Tabs>
        </Box>

        <Box sx={{ minHeight: '400px' }}>
          <CustomTabPanel value={tabValue} index={0}>
            <div className="flex flex-col gap-8 animate-fadeIn">
              <section>
                <SectionTitle icon={<BadgeOutlined sx={{ color: '#5B21B6' }} />} title="Identificação" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-4">
                  <ReadOnlyField label="Tipo de Fornecedor" value={tipoFornecedorLabel(dados.tipo_fornecedor)} />
                  <ReadOnlyField label="Situação" value={dados.situacao === 'ativo' ? 'Ativo' : 'Inativo'} />
                  <ReadOnlyField label={dados.tipo_fornecedor === 'PJ' ? 'Nome Fantasia' : 'Nome'} value={dados.nome} />
                  <ReadOnlyField label="Documento" value={formatDocumento(dados)} />
                  {dados.tipo_fornecedor === 'PJ' && <ReadOnlyField label="Razão Social" value={dados.razao_social} />}
                  {dados.tipo_fornecedor === 'PJ' && <ReadOnlyField label="Responsável" value={dados.responsavel} />}
                  {dados.tipo_fornecedor === 'PF' && <ReadOnlyField label="RG" value={dados.rg} />}
                  {dados.tipo_fornecedor === 'PF' && <ReadOnlyField label="Data de Nascimento" value={dataNascimento} />}
                  {dados.tipo_fornecedor === 'PF' && <ReadOnlyField label="Tipo de Contribuinte" value={dados.tipo_contribuinte} />}
                  {dados.tipo_fornecedor === 'estrangeiro' && <ReadOnlyField label="País de Origem" value={dados.pais_origem} />}
                  <ReadOnlyField label="Site" value={dados.site} />
                </div>
              </section>

              <section>
                <SectionTitle icon={<MapOutlined sx={{ color: '#5B21B6' }} />} title="Endereços Cadastrados" />
                {enderecos.length ? (
                  <div className="grid grid-cols-1 gap-4">
                    {enderecos.map((item: any, index: number) => (
                      <Box key={item.id || index} className="p-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] relative transition-all hover:border-[#CBD5E1]">
                        {item.principal && (
                          <span className="absolute top-4 right-4 bg-[#ECFDF5] text-[#10B981] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border border-[#A7F3D0]">
                            Endereço Principal
                          </span>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-4 mt-2">
                          <ReadOnlyField label="Tipo" value={item.tipo} />
                          <ReadOnlyField label="CEP" value={maskRegexCEP(item.cep || '')} />
                          <ReadOnlyField label="Logradouro" value={item.logradouro} />
                          <ReadOnlyField label="Número" value={item.numero} />
                          <ReadOnlyField label="Bairro" value={item.bairro} />
                          <ReadOnlyField label="Cidade" value={item.cidade} />
                          <ReadOnlyField label="UF" value={item.uf} />
                          <ReadOnlyField label="Complemento" value={item.complemento} />
                        </div>
                      </Box>
                    ))}
                  </div>
                ) : (
                  <Typography variant="body2" color="#94A3B8">Nenhum endereço registrado.</Typography>
                )}
              </section>

              <section>
                <SectionTitle icon={<ContactsOutlined sx={{ color: '#5B21B6' }} />} title="Contatos Adicionais" />
                {contatos.length ? (
                  <div className="grid grid-cols-1 gap-4">
                    {contatos.map((item: any, index: number) => (
                      <Box key={item.id || index} className="p-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] relative transition-all hover:border-[#CBD5E1]">
                        {item.principal && (
                          <span className="absolute top-4 right-4 bg-[#EEF2FF] text-[#6366F1] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border border-[#C7D2FE]">
                            Contato Principal
                          </span>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-4 mt-2">
                          <ReadOnlyField label="Tipo" value={item.tipo} />
                          <ReadOnlyField label="Nome" value={item.nome} />
                          <ReadOnlyField label="Contato" value={item.valor || item.contato} />
                          <ReadOnlyField label="Cargo" value={item.cargo} />
                        </div>
                      </Box>
                    ))}
                  </div>
                ) : (
                  <Typography variant="body2" color="#94A3B8">Nenhum contato adicional registrado.</Typography>
                )}
              </section>

              <section>
                <SectionTitle icon={<MonetizationOnOutlined sx={{ color: '#5B21B6' }} />} title="Condições Comerciais" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-y-6 gap-x-4">
                  <ReadOnlyField label="Responsável Compras" value={dados.responsavel_compras} />
                  <ReadOnlyField label="Prazo de Entrega" value={dados.prazo_entrega ? `${dados.prazo_entrega} dias` : '-'} />
                  <ReadOnlyField label="Condição de Pagamento" value={dados.condicao_pagamento} fullWidth />
                </div>
              </section>

              {dados.observacoes && (
                <section>
                  <SectionTitle icon={<FormatQuoteOutlined sx={{ color: '#5B21B6' }} />} title="Observações" />
                  <ReadOnlyField label="Observações Gerais" value={dados.observacoes} fullWidth />
                </section>
              )}
            </div>
          </CustomTabPanel>

          <CustomTabPanel value={tabValue} index={1}>
            <div className="text-center py-20 px-4">
              <div className="w-20 h-20 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-4">
                <History sx={{ fontSize: 40, color: '#CBD5E1' }} />
              </div>
              <Typography variant="h6" color="#0F172A" fontWeight={600} mb={1}>Histórico em desenvolvimento</Typography>
              <Typography variant="body2" color="#64748B" maxWidth={400} mx="auto">
                Em breve, você poderá visualizar o histórico comercial deste fornecedor aqui.
              </Typography>
            </div>
          </CustomTabPanel>

          <CustomTabPanel value={tabValue} index={2}>
            <div className="text-center py-16 px-4 bg-[#F8FAFC] rounded-2xl border border-dashed border-[#CBD5E1]">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <AttachFile className="text-[#94A3B8] text-3xl" />
              </div>
              <Typography variant="h6" color="#0F172A" fontWeight={600} mb={1}>Nenhum anexo</Typography>
              <Typography variant="body2" color="#64748B">Este fornecedor ainda não possui documentos ou arquivos anexados.</Typography>
            </div>
          </CustomTabPanel>
        </Box>
      </Box>
    </Layout>
  );
};

export default VisualizarFornecedor;
