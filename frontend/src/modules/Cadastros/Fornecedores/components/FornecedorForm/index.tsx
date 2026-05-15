/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Box,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  CircularProgress,
  Typography,
  Divider,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  // ArrowBack,
  Check,
  Search,
  BadgeOutlined,
  ContactsOutlined,
  FormatQuoteOutlined,
  MapOutlined,
  MonetizationOnOutlined
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { message } from 'antd';
import { useConsultaCnpj } from '../../../../Cadastro/hooks/useConsultaCnpj';

interface FornecedorFormProps {
  initialData?: any;
  loading?: boolean;
  submitLabel: string;
  onSubmit: (payload: any) => Promise<void> | void;
  onCancel: () => void;
}

const premiumInputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#F8FAFC',
    minHeight: 48,
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

const emptyFornecedor = {
  tipo_fornecedor: 'PJ',
  situacao: 'ativo',
  nome: '',
  email: '',
  telefone_comercial: '',
  telefone_celular: '',
  site: '',
  responsavel_compras: '',
  prazo_entrega: '',
  condicao_pagamento: '',
  observacoes: '',
  cpf: '',
  rg: '',
  nascimento: '',
  cnpj: '',
  razao_social: '',
  inscricao_estadual: '',
  isento: false,
  tipo_contribuinte: '',
  inscricao_municipal: '',
  inscricao_suframa: '',
  responsavel: '',
  ramo_atividade: '',
  documento: '',
  pais_origem: '',
  enderecos: [{
    tipo: 'comercial',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    principal: true
  }],
  contatos: [{
    tipo: 'comercial',
    nome: '',
    valor: '',
    cargo: '',
    observacao: '',
    principal: true
  }],
  produtos_servicos: [],
  anexos: []
};

const normalizeInitialData = (data?: any) => {
  if (!data) return emptyFornecedor;

  const fornecedor = data.fornecedor || data;
  return {
    ...emptyFornecedor,
    ...fornecedor,
    nascimento: fornecedor.nascimento ? dayjs(fornecedor.nascimento).format('YYYY-MM-DD') : '',
    prazo_entrega: fornecedor.prazo_entrega ?? '',
    enderecos: data.enderecos?.length ? data.enderecos : emptyFornecedor.enderecos,
    contatos: data.contatos?.length
      ? data.contatos.map((contato: any) => ({ ...contato, valor: contato.valor || contato.contato || '' }))
      : emptyFornecedor.contatos,
    produtos_servicos: data.produtos_servicos || [],
    anexos: data.anexos || []
  };
};

const SectionTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-2 mb-6">
    {icon}
    <Typography variant="h6" fontWeight={700} color="#0F172A">{title}</Typography>
  </div>
);

export const FornecedorForm: React.FC<FornecedorFormProps> = ({
  initialData,
  loading = false,
  submitLabel,
  onSubmit,
  onCancel
}) => {
  const initialValues = useMemo(() => normalizeInitialData(initialData), [initialData]);
  const [formData, setFormData] = useState<any>(initialValues);
  const { getConsultaCNPJ, consultaCNPJ, loading: loadingConsultaCNPJ } = useConsultaCnpj();

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  useEffect(() => {
    if (!consultaCNPJ) return;

    const address = consultaCNPJ.address || {};
    setFormData((prev: any) => ({
      ...prev,
      razao_social: consultaCNPJ.company?.name || '',
      nome: consultaCNPJ.alias || consultaCNPJ.company?.name || '',
      inscricao_suframa: consultaCNPJ.suframa?.[0]?.number || '',
      enderecos: [{
        ...(prev.enderecos?.[0] || emptyFornecedor.enderecos[0]),
        cep: address.zip || prev.enderecos?.[0]?.cep || '',
        logradouro: address.street || prev.enderecos?.[0]?.logradouro || '',
        numero: address.number || prev.enderecos?.[0]?.numero || '',
        bairro: address.district || prev.enderecos?.[0]?.bairro || '',
        cidade: address.city || prev.enderecos?.[0]?.cidade || '',
        uf: address.state || prev.enderecos?.[0]?.uf || '',
        principal: true
      }]
    }));

    message.success('Dados da empresa preenchidos pelo CNPJ');
  }, [consultaCNPJ]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleEnderecoChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      enderecos: [{
        ...(prev.enderecos?.[0] || emptyFornecedor.enderecos[0]),
        [field]: value,
        principal: true
      }]
    }));
  };

  const handleContatoChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      contatos: [{
        ...(prev.contatos?.[0] || emptyFornecedor.contatos[0]),
        [field]: value,
        principal: true
      }]
    }));
  };

  const handleBuscarCnpj = async () => {
    const cnpjLimpo = String(formData.cnpj || '').replace(/\D/g, '');

    if (cnpjLimpo.length !== 14) {
      message.warning('Informe um CNPJ válido para consulta');
      return;
    }

    await getConsultaCNPJ(formData.cnpj);
  };

  const handleBuscarCep = async () => {
    const cepLimpo = String(formData.enderecos?.[0]?.cep || '').replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      message.warning('Informe um CEP válido para consulta');
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        message.error('CEP não encontrado');
        return;
      }

      setFormData((prev: any) => ({
        ...prev,
        enderecos: [{
          ...(prev.enderecos?.[0] || emptyFornecedor.enderecos[0]),
          cep: data.cep || prev.enderecos?.[0]?.cep || '',
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          uf: data.uf || '',
          principal: true
        }]
      }));

      message.success('Endereço preenchido pelo CEP');
    } catch {
      message.error('Erro ao buscar CEP');
    }
  };

  const validate = () => {
    if (!formData.nome?.trim()) return 'Informe o nome do fornecedor';
    if (formData.tipo_fornecedor === 'PJ') {
      if (!formData.cnpj?.trim()) return 'Informe o CNPJ';
      if (!formData.razao_social?.trim()) return 'Informe a razão social';
      if (!formData.responsavel?.trim()) return 'Informe o responsável';
    }
    if (formData.tipo_fornecedor === 'PF') {
      if (!formData.cpf?.trim()) return 'Informe o CPF';
      if (!formData.rg?.trim()) return 'Informe o RG';
    }
    if (formData.tipo_fornecedor === 'estrangeiro' && !formData.documento?.trim()) {
      return 'Informe o documento';
    }

    const endereco = formData.enderecos?.[0] || {};
    if (!endereco.cep || !endereco.logradouro || !endereco.numero || !endereco.bairro || !endereco.cidade || !endereco.uf) {
      return 'Preencha o endereço principal';
    }

    const contato = formData.contatos?.[0] || {};
    if (!contato.nome || !contato.valor) return 'Preencha o contato principal';

    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const error = validate();
    if (error) {
      message.warning(error);
      return;
    }

    await onSubmit({
      ...formData,
      prazo_entrega: formData.prazo_entrega === '' ? null : Number(formData.prazo_entrega),
      nascimento: formData.nascimento || null,
      enderecos: formData.enderecos || [],
      contatos: formData.contatos || [],
      produtos_servicos: formData.produtos_servicos || [],
      anexos: formData.anexos || []
    });
  };

  const endereco = formData.enderecos?.[0] || {};
  const contato = formData.contatos?.[0] || {};

  return (
    <form onSubmit={handleSubmit} className="animate-fadeIn">
      <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 24px rgba(0,0,0,0.02)', p: { xs: 3, md: 5 } }}>
        <div className="flex flex-col gap-10">
          <Box>
            <SectionTitle icon={<BadgeOutlined sx={{ color: '#5B21B6' }} />} title="Dados Gerais" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <TextField
                select
                fullWidth
                required
                label="Tipo de fornecedor"
                value={formData.tipo_fornecedor}
                onChange={(e) => handleFieldChange('tipo_fornecedor', e.target.value)}
                sx={premiumInputStyles}
              >
                <MenuItem value="PJ">Pessoa Jurídica</MenuItem>
                <MenuItem value="PF">Pessoa Física</MenuItem>
                <MenuItem value="estrangeiro">Estrangeiro</MenuItem>
              </TextField>

              <TextField
                select
                fullWidth
                required
                label="Situação"
                value={formData.situacao}
                onChange={(e) => handleFieldChange('situacao', e.target.value)}
                sx={premiumInputStyles}
              >
                <MenuItem value="ativo">Ativo</MenuItem>
                <MenuItem value="inativo">Inativo</MenuItem>
              </TextField>

              <div className="md:col-span-2">
                <TextField
                  fullWidth
                  required
                  label={formData.tipo_fornecedor === 'PJ' ? 'Nome Fantasia' : 'Nome'}
                  value={formData.nome}
                  onChange={(e) => handleFieldChange('nome', e.target.value)}
                  sx={premiumInputStyles}
                />
              </div>

              {formData.tipo_fornecedor === 'PJ' && (
                <>
                  <TextField
                    fullWidth
                    required
                    label="CNPJ"
                    value={formData.cnpj}
                    onChange={(e) => handleFieldChange('cnpj', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBuscarCnpj()}
                    sx={premiumInputStyles}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton edge="end" title="Consultar CNPJ" onClick={handleBuscarCnpj}>
                            {loadingConsultaCNPJ ? <CircularProgress size={20} /> : <Search sx={{ color: '#94A3B8' }} />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  <div className="md:col-span-2">
                    <TextField
                      fullWidth
                      required
                      label="Razão Social"
                      value={formData.razao_social}
                      onChange={(e) => handleFieldChange('razao_social', e.target.value)}
                      sx={premiumInputStyles}
                    />
                  </div>
                  <TextField
                    fullWidth
                    required
                    label="Responsável"
                    value={formData.responsavel}
                    onChange={(e) => handleFieldChange('responsavel', e.target.value)}
                    sx={premiumInputStyles}
                  />
                  <TextField fullWidth label="Inscrição Estadual" value={formData.inscricao_estadual || ''} onChange={(e) => handleFieldChange('inscricao_estadual', e.target.value)} sx={premiumInputStyles} />
                  <TextField fullWidth label="Inscrição Municipal" value={formData.inscricao_municipal || ''} onChange={(e) => handleFieldChange('inscricao_municipal', e.target.value)} sx={premiumInputStyles} />
                  <TextField fullWidth label="Inscrição Suframa" value={formData.inscricao_suframa || ''} onChange={(e) => handleFieldChange('inscricao_suframa', e.target.value)} sx={premiumInputStyles} />
                  <TextField fullWidth label="Ramo de atividade" value={formData.ramo_atividade || ''} onChange={(e) => handleFieldChange('ramo_atividade', e.target.value)} sx={premiumInputStyles} />
                  <div className="flex items-center">
                    <FormControlLabel
                      control={<Switch checked={!!formData.isento} onChange={(e) => handleFieldChange('isento', e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#5B21B6' } }} />}
                      label={<Typography variant="body2" fontWeight={600} color="#475569">Isento</Typography>}
                    />
                  </div>
                </>
              )}

              {formData.tipo_fornecedor === 'PF' && (
                <>
                  <TextField fullWidth required label="CPF" value={formData.cpf || ''} onChange={(e) => handleFieldChange('cpf', e.target.value)} sx={premiumInputStyles} />
                  <TextField fullWidth required label="RG" value={formData.rg || ''} onChange={(e) => handleFieldChange('rg', e.target.value)} sx={premiumInputStyles} />
                  <TextField fullWidth label="Nascimento" type="date" value={formData.nascimento || ''} onChange={(e) => handleFieldChange('nascimento', e.target.value)} InputLabelProps={{ shrink: true }} sx={premiumInputStyles} />
                  <TextField fullWidth label="Tipo de contribuinte" value={formData.tipo_contribuinte || ''} onChange={(e) => handleFieldChange('tipo_contribuinte', e.target.value)} sx={premiumInputStyles} />
                </>
              )}

              {formData.tipo_fornecedor === 'estrangeiro' && (
                <>
                  <TextField fullWidth required label="Documento" value={formData.documento || ''} onChange={(e) => handleFieldChange('documento', e.target.value)} sx={premiumInputStyles} />
                  <TextField fullWidth label="País de origem" value={formData.pais_origem || ''} onChange={(e) => handleFieldChange('pais_origem', e.target.value)} sx={premiumInputStyles} />
                </>
              )}

              <TextField fullWidth label="E-mail" type="email" value={formData.email || ''} onChange={(e) => handleFieldChange('email', e.target.value)} sx={premiumInputStyles} />
              <TextField fullWidth label="Telefone comercial" value={formData.telefone_comercial || ''} onChange={(e) => handleFieldChange('telefone_comercial', e.target.value)} sx={premiumInputStyles} />
              <TextField fullWidth label="Celular" value={formData.telefone_celular || ''} onChange={(e) => handleFieldChange('telefone_celular', e.target.value)} sx={premiumInputStyles} />
              <TextField fullWidth label="Site" value={formData.site || ''} onChange={(e) => handleFieldChange('site', e.target.value)} sx={premiumInputStyles} />
            </div>
          </Box>

          <Divider sx={{ borderColor: '#F1F5F9' }} />

          <Box>
            <SectionTitle icon={<MapOutlined sx={{ color: '#5B21B6' }} />} title="Endereço Principal" />
            <Box className="p-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] transition-all hover:border-[#CBD5E1]">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-2">
                  <TextField select fullWidth required label="Tipo" value={endereco.tipo || 'comercial'} onChange={(e) => handleEnderecoChange('tipo', e.target.value)} sx={premiumInputStyles}>
                    <MenuItem value="comercial">Comercial</MenuItem>
                    <MenuItem value="cobranca">Cobrança</MenuItem>
                    <MenuItem value="entrega">Entrega</MenuItem>
                    <MenuItem value="residencial">Residencial</MenuItem>
                  </TextField>
                </div>
                <div className="md:col-span-2">
                  <TextField
                    fullWidth
                    required
                    label="CEP"
                    value={endereco.cep || ''}
                    onChange={(e) => handleEnderecoChange('cep', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBuscarCep()}
                    sx={premiumInputStyles}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton edge="end" title="Consultar CEP" onClick={handleBuscarCep}>
                            <Search sx={{ color: '#94A3B8' }} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                </div>
                <div className="md:col-span-5">
                  <TextField fullWidth required label="Logradouro" value={endereco.logradouro || ''} onChange={(e) => handleEnderecoChange('logradouro', e.target.value)} sx={premiumInputStyles} />
                </div>
                <div className="md:col-span-3">
                  <TextField fullWidth required label="Número" value={endereco.numero || ''} onChange={(e) => handleEnderecoChange('numero', e.target.value)} sx={premiumInputStyles} />
                </div>
                <div className="md:col-span-3">
                  <TextField fullWidth required label="Bairro" value={endereco.bairro || ''} onChange={(e) => handleEnderecoChange('bairro', e.target.value)} sx={premiumInputStyles} />
                </div>
                <div className="md:col-span-4">
                  <TextField fullWidth required label="Cidade" value={endereco.cidade || ''} onChange={(e) => handleEnderecoChange('cidade', e.target.value)} sx={premiumInputStyles} />
                </div>
                <div className="md:col-span-2">
                  <TextField fullWidth required label="UF" value={endereco.uf || ''} onChange={(e) => handleEnderecoChange('uf', e.target.value.toUpperCase().slice(0, 2))} sx={premiumInputStyles} />
                </div>
                <div className="md:col-span-3">
                  <TextField fullWidth label="Complemento" value={endereco.complemento || ''} onChange={(e) => handleEnderecoChange('complemento', e.target.value)} sx={premiumInputStyles} />
                </div>
              </div>
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#F1F5F9' }} />

          <Box>
            <SectionTitle icon={<ContactsOutlined sx={{ color: '#5B21B6' }} />} title="Contato Principal" />
            <Box className="p-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] transition-all hover:border-[#CBD5E1]">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <TextField select fullWidth required label="Tipo" value={contato.tipo || 'comercial'} onChange={(e) => handleContatoChange('tipo', e.target.value)} sx={premiumInputStyles}>
                  <MenuItem value="comercial">Comercial</MenuItem>
                  <MenuItem value="financeiro">Financeiro</MenuItem>
                  <MenuItem value="tecnico">Técnico</MenuItem>
                  <MenuItem value="compras">Compras</MenuItem>
                </TextField>
                <TextField fullWidth required label="Nome do Contato" value={contato.nome || ''} onChange={(e) => handleContatoChange('nome', e.target.value)} sx={premiumInputStyles} />
                <TextField fullWidth required label="Contato (Email/Tel)" value={contato.valor || ''} onChange={(e) => handleContatoChange('valor', e.target.value)} sx={premiumInputStyles} />
                <TextField fullWidth label="Cargo/Depto" value={contato.cargo || ''} onChange={(e) => handleContatoChange('cargo', e.target.value)} sx={premiumInputStyles} />
                <div className="md:col-span-4">
                  <TextField fullWidth multiline rows={2} label="Observação do contato" value={contato.observacao || ''} onChange={(e) => handleContatoChange('observacao', e.target.value)} sx={premiumInputStyles} />
                </div>
              </div>
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#F1F5F9' }} />

          <Box>
            <SectionTitle icon={<MonetizationOnOutlined sx={{ color: '#5B21B6' }} />} title="Condições Comerciais" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <TextField fullWidth label="Responsável compras" value={formData.responsavel_compras || ''} onChange={(e) => handleFieldChange('responsavel_compras', e.target.value)} sx={premiumInputStyles} />
              <TextField fullWidth type="number" label="Prazo de entrega (dias)" value={formData.prazo_entrega ?? ''} onChange={(e) => handleFieldChange('prazo_entrega', e.target.value)} sx={premiumInputStyles} />
              <div className="md:col-span-2">
                <TextField fullWidth label="Condição de pagamento" value={formData.condicao_pagamento || ''} onChange={(e) => handleFieldChange('condicao_pagamento', e.target.value)} sx={premiumInputStyles} />
              </div>
            </div>
          </Box>

          <Divider sx={{ borderColor: '#F1F5F9' }} />

          <Box>
            <SectionTitle icon={<FormatQuoteOutlined sx={{ color: '#5B21B6' }} />} title="Observações" />
            <TextField fullWidth multiline rows={4} label="Observações Gerais" value={formData.observacoes || ''} onChange={(e) => handleFieldChange('observacoes', e.target.value)} sx={premiumInputStyles} />
          </Box>

          <Box className="flex justify-end gap-3 mt-4 pt-6 border-t border-[#F1F5F9]">
            <Button
              type="button"
              variant="outlined"
              // startIcon={<ArrowBack />}
              onClick={onCancel}
              sx={{ borderColor: '#E2E8F0', color: '#475569', textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 4, '&:hover': { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' } }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Check />}
              sx={{ background: 'linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)', color: 'white', textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 6, boxShadow: '0 4px 14px 0 rgba(91, 33, 182, 0.25)', '&:hover': { background: 'linear-gradient(90deg, #28024D 0%, #4C1D95 100%)', boxShadow: '0 6px 20px rgba(91, 33, 182, 0.3)' } }}
            >
              {loading ? 'Salvando...' : submitLabel}
            </Button>
          </Box>
        </div>
      </Box>
    </form>
  );
};
