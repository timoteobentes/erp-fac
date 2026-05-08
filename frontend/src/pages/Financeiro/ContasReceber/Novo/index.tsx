import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  ArrowBack,
  Check,
  CloudUploadOutlined,
  InfoOutlined,
  NotesOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../../../../template/Layout";
import { contasReceberService } from "../../../../modules/Financeiro/ContasReceber/services/contasReceberService";
import { listarPlanosContasService } from "../../../../modules/Financeiro/PlanosContas/services/planosContasService";
import { listarCentroCustosService } from "../../../../modules/Financeiro/CentroCustos/services/centroCustosService";
import { listarFormasPagamentoService } from "../../../../modules/Financeiro/FormasPagamento/services/formasPagamentoService";
import { listarContasBancariasService } from "../../../../modules/Financeiro/ContasBancarias/services/contasBancariasService";
import { listarClientesService } from "../../../../modules/Cadastros/Clientes/services/clienteService";
import { listarFornecedoresService } from "../../../../modules/Cadastros/Fornecedores/services/fornecedoresService";

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

type Option = {
  id: number;
  label: string;
};

type EntidadeTipo = 'cliente' | 'fornecedor' | 'transportadora' | 'funcionario' | 'outros' | '';

interface FormDataState {
  descricao: string;
  valor_total: number | '';
  data_vencimento: string;
  plano_conta_id: number | null;
  centro_custo_id: number | null;
  forma_pagamento_id: number | null;
  conta_bancaria_id: number | null;
  recebimento_quitado: 'sim' | 'nao' | '';
  data_compensacao: string;
  entidade_tipo: EntidadeTipo;
  entidade_id: number | null;
  data_competencia: string;
  informacoes_complementares: string;
  anexos: Array<{ nome: string; tamanho: number; tipo: string }>;
}

const entidadeTipoOptions: Array<{ value: EntidadeTipo; label: string }> = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'fornecedor', label: 'Fornecedor' },
  { value: 'transportadora', label: 'Transportadora' },
  { value: 'funcionario', label: 'Funcionário' },
  { value: 'outros', label: 'Outros' },
];

const extractRows = (payload: any): any[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.dados)) return payload.data.dados;
  if (Array.isArray(payload?.dados)) return payload.dados;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.fornecedores)) return payload.fornecedores;
  if (Array.isArray(payload?.clientes)) return payload.clientes;
  return [];
};

const NovoRecebimento: React.FC = () => {
  const navigate = useNavigate();
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [planosContas, setPlanosContas] = useState<Option[]>([]);
  const [centrosCustos, setCentrosCustos] = useState<Option[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<Option[]>([]);
  const [contasBancarias, setContasBancarias] = useState<Option[]>([]);
  const [entidades, setEntidades] = useState<Option[]>([]);
  const [formData, setFormData] = useState<FormDataState>({
    descricao: '',
    valor_total: '',
    data_vencimento: '',
    plano_conta_id: null,
    centro_custo_id: null,
    forma_pagamento_id: null,
    conta_bancaria_id: null,
    recebimento_quitado: '',
    data_compensacao: '',
    entidade_tipo: '',
    entidade_id: null,
    data_competencia: '',
    informacoes_complementares: '',
    anexos: [],
  });

  useEffect(() => {
    const carregarOpcoes = async () => {
      try {
        setLoadingOptions(true);
        const [planosRes, centrosRes, formasRes, contasRes] = await Promise.all([
          listarPlanosContasService(),
          listarCentroCustosService(),
          listarFormasPagamentoService(),
          listarContasBancariasService(),
        ]);

        setPlanosContas(
          extractRows(planosRes).map((item: any) => ({ id: Number(item.id), label: item.nome }))
        );
        setCentrosCustos(
          extractRows(centrosRes).map((item: any) => ({ id: Number(item.id), label: item.nome }))
        );
        setFormasPagamento(
          extractRows(formasRes).map((item: any) => ({ id: Number(item.id), label: item.nome }))
        );
        setContasBancarias(
          extractRows(contasRes).map((item: any) => ({ id: Number(item.id), label: item.nome }))
        );
      } catch (error) {
        toast.error("Erro ao carregar dados auxiliares do recebimento.");
      } finally {
        setLoadingOptions(false);
      }
    };

    carregarOpcoes();
  }, []);

  useEffect(() => {
    const carregarEntidades = async () => {
      if (!formData.entidade_tipo) {
        setEntidades([]);
        return;
      }

      try {
        if (formData.entidade_tipo === 'cliente') {
          const response = await listarClientesService(1, 1000, {}, { campo: 'nome', ordem: 'ASC' });
          setEntidades((response.data || []).map((item: any) => ({ id: Number(item.id), label: item.nome })));
          return;
        }

        if (formData.entidade_tipo === 'fornecedor') {
          const response = await listarFornecedoresService(1, 1000, {}, { campo: 'nome', ordem: 'ASC' });
          setEntidades((response.fornecedores || []).map((item: any) => ({ id: Number(item.id), label: item.nome })));
          return;
        }

        setEntidades([]);
      } catch (error) {
        toast.error("Erro ao carregar a entidade selecionada.");
        setEntidades([]);
      }
    };

    setFormData((current) => ({ ...current, entidade_id: null }));
    carregarEntidades();
  }, [formData.entidade_tipo]);

  const entidadeSelecionada = useMemo(
    () => entidades.find((item) => item.id === formData.entidade_id) || null,
    [entidades, formData.entidade_id]
  );

  const planoContaSelecionado = useMemo(
    () => planosContas.find((item) => item.id === formData.plano_conta_id) || null,
    [planosContas, formData.plano_conta_id]
  );

  const centroCustoSelecionado = useMemo(
    () => centrosCustos.find((item) => item.id === formData.centro_custo_id) || null,
    [centrosCustos, formData.centro_custo_id]
  );

  const formaPagamentoSelecionada = useMemo(
    () => formasPagamento.find((item) => item.id === formData.forma_pagamento_id) || null,
    [formasPagamento, formData.forma_pagamento_id]
  );

  const contaBancariaSelecionada = useMemo(
    () => contasBancarias.find((item) => item.id === formData.conta_bancaria_id) || null,
    [contasBancarias, formData.conta_bancaria_id]
  );

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!formData.descricao.trim()) nextErrors.descricao = 'Informe a descrição do recebimento.';
    if (!formData.valor_total || Number(formData.valor_total) <= 0) nextErrors.valor_total = 'Informe um valor maior que zero.';
    if (!formData.data_vencimento) nextErrors.data_vencimento = 'Informe o vencimento.';
    if (!formData.plano_conta_id) nextErrors.plano_conta_id = 'Selecione o plano de contas.';
    if (!formData.centro_custo_id) nextErrors.centro_custo_id = 'Selecione o centro de custo.';
    if (!formData.forma_pagamento_id) nextErrors.forma_pagamento_id = 'Selecione a forma de pagamento.';
    if (!formData.conta_bancaria_id) nextErrors.conta_bancaria_id = 'Selecione a conta bancária.';
    if (!formData.recebimento_quitado) nextErrors.recebimento_quitado = 'Selecione se o recebimento está quitado.';
    if (formData.recebimento_quitado === 'sim' && !formData.data_compensacao) nextErrors.data_compensacao = 'Informe a data de compensação.';
    if (!formData.entidade_tipo) nextErrors.entidade_tipo = 'Selecione a entidade.';
    if ((formData.entidade_tipo === 'cliente' || formData.entidade_tipo === 'fornecedor') && !formData.entidade_id) {
      nextErrors.entidade_id = 'Selecione o registro da entidade.';
    }
    if (!formData.data_competencia) nextErrors.data_competencia = 'Informe a data de competência.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      await contasReceberService.criar({
        descricao: formData.descricao,
        valor_total: Number(formData.valor_total),
        data_vencimento: formData.data_vencimento,
        plano_conta_id: formData.plano_conta_id,
        centro_custo_id: formData.centro_custo_id,
        forma_pagamento_id: formData.forma_pagamento_id,
        conta_bancaria_id: formData.conta_bancaria_id,
        recebimento_quitado: formData.recebimento_quitado === 'sim',
        data_compensacao: formData.data_compensacao || undefined,
        data_recebimento: formData.data_compensacao || undefined,
        entidade_tipo: formData.entidade_tipo,
        entidade_id: formData.entidade_id,
        data_competencia: formData.data_competencia,
        informacoes_complementares: formData.informacoes_complementares,
        observacao: formData.informacoes_complementares,
        anexos: formData.anexos,
        status: formData.recebimento_quitado === 'sim' ? 'recebido' : 'pendente',
      });

      toast.success("Conta a receber cadastrada com sucesso!");
      navigate("/financeiro/receber");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao cadastrar conta a receber.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).map((file) => ({
      nome: file.name,
      tamanho: file.size,
      tipo: file.type,
    }));

    setFormData((current) => ({ ...current, anexos: files }));
  };

  return (
    <Layout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center gap-4">
          <IconButton
            onClick={() => navigate("/financeiro/receber")}
            sx={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', color: '#475569', '&:hover': { backgroundColor: '#F8FAFC', color: '#0F172A' } }}
          >
            <ArrowBack />
          </IconButton>
          <div className="flex flex-col">
            <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Novo Recebimento
            </Typography>
            <Typography variant="body2" color="#64748B">
              Cadastre manualmente uma nova conta a receber e relacione os módulos financeiros auxiliares.
            </Typography>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="animate-fadeIn">
        <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", p: { xs: 3, md: 5 } }}>
          <div className="flex flex-col gap-10">
            <Box>
              <div className="flex items-center gap-2 mb-6">
                <InfoOutlined sx={{ color: '#5B21B6' }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Dados Gerais</Typography>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <TextField
                    fullWidth
                    label="Descrição do recebimento *"
                    value={formData.descricao}
                    onChange={(e) => setFormData((current) => ({ ...current, descricao: e.target.value }))}
                    error={!!errors.descricao}
                    helperText={errors.descricao}
                    sx={premiumInputStyles}
                  />
                </div>
                <div className="md:col-span-1">
                  <TextField
                    fullWidth
                    label="Valor do recebimento *"
                    type="number"
                    value={formData.valor_total}
                    onChange={(e) => setFormData((current) => ({ ...current, valor_total: e.target.value === '' ? '' : Number(e.target.value) }))}
                    error={!!errors.valor_total}
                    helperText={errors.valor_total || 'Campo financeiro essencial para a conta a receber.'}
                    InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                    sx={premiumInputStyles}
                  />
                </div>
                <div className="md:col-span-1">
                  <TextField
                    fullWidth
                    label="Vencimento *"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.data_vencimento}
                    onChange={(e) => setFormData((current) => ({ ...current, data_vencimento: e.target.value }))}
                    error={!!errors.data_vencimento}
                    helperText={errors.data_vencimento}
                    sx={premiumInputStyles}
                  />
                </div>

                <div className="md:col-span-2">
                  <Autocomplete
                    options={planosContas}
                    loading={loadingOptions}
                    value={planoContaSelecionado}
                    onChange={(_, value) => setFormData((current) => ({ ...current, plano_conta_id: value?.id || null }))}
                    getOptionLabel={(option) => option.label}
                    renderInput={(params) => (
                      <TextField {...params} label="Plano de contas *" error={!!errors.plano_conta_id} helperText={errors.plano_conta_id} sx={premiumInputStyles} />
                    )}
                  />
                </div>
                <div className="md:col-span-2">
                  <Autocomplete
                    options={centrosCustos}
                    loading={loadingOptions}
                    value={centroCustoSelecionado}
                    onChange={(_, value) => setFormData((current) => ({ ...current, centro_custo_id: value?.id || null }))}
                    getOptionLabel={(option) => option.label}
                    renderInput={(params) => (
                      <TextField {...params} label="Centro de custo *" error={!!errors.centro_custo_id} helperText={errors.centro_custo_id} sx={premiumInputStyles} />
                    )}
                  />
                </div>

                <div className="md:col-span-2">
                  <Autocomplete
                    options={formasPagamento}
                    loading={loadingOptions}
                    value={formaPagamentoSelecionada}
                    onChange={(_, value) => setFormData((current) => ({ ...current, forma_pagamento_id: value?.id || null }))}
                    getOptionLabel={(option) => option.label}
                    renderInput={(params) => (
                      <TextField {...params} label="Forma de pagamento *" error={!!errors.forma_pagamento_id} helperText={errors.forma_pagamento_id} sx={premiumInputStyles} />
                    )}
                  />
                </div>
                <div className="md:col-span-2">
                  <Autocomplete
                    options={contasBancarias}
                    loading={loadingOptions}
                    value={contaBancariaSelecionada}
                    onChange={(_, value) => setFormData((current) => ({ ...current, conta_bancaria_id: value?.id || null }))}
                    getOptionLabel={(option) => option.label}
                    renderInput={(params) => (
                      <TextField {...params} label="Conta bancária *" error={!!errors.conta_bancaria_id} helperText={errors.conta_bancaria_id} sx={premiumInputStyles} />
                    )}
                  />
                </div>

                <div className="md:col-span-2">
                  <TextField
                    select
                    fullWidth
                    label="Recebimento quitado *"
                    value={formData.recebimento_quitado}
                    onChange={(e) => setFormData((current) => ({ ...current, recebimento_quitado: e.target.value as 'sim' | 'nao' | '' }))}
                    error={!!errors.recebimento_quitado}
                    helperText={errors.recebimento_quitado}
                    SelectProps={{ native: true }}
                    sx={premiumInputStyles}
                  >
                    <option value=""></option>
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                  </TextField>
                </div>
                <div className="md:col-span-2">
                  <TextField
                    fullWidth
                    label="Data de compensação"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.data_compensacao}
                    onChange={(e) => setFormData((current) => ({ ...current, data_compensacao: e.target.value }))}
                    error={!!errors.data_compensacao}
                    helperText={errors.data_compensacao}
                    sx={premiumInputStyles}
                  />
                </div>
              </div>
            </Box>

            <Divider sx={{ borderColor: '#F1F5F9' }} />

            <Box>
              <div className="flex items-center gap-2 mb-6">
                <NotesOutlined sx={{ color: '#5B21B6' }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Outras Informações</Typography>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <TextField
                    select
                    fullWidth
                    label="Entidade *"
                    value={formData.entidade_tipo}
                    onChange={(e) => setFormData((current) => ({ ...current, entidade_tipo: e.target.value as EntidadeTipo }))}
                    error={!!errors.entidade_tipo}
                    helperText={errors.entidade_tipo}
                    SelectProps={{ native: true }}
                    sx={premiumInputStyles}
                  >
                    <option value=""></option>
                    {entidadeTipoOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </TextField>
                </div>
                <div className="md:col-span-2">
                  <Autocomplete
                    options={entidades}
                    value={entidadeSelecionada}
                    disabled={!formData.entidade_tipo || ['transportadora', 'funcionario', 'outros'].includes(formData.entidade_tipo)}
                    onChange={(_, value) => setFormData((current) => ({ ...current, entidade_id: value?.id || null }))}
                    getOptionLabel={(option) => option.label}
                    noOptionsText={
                      ['transportadora', 'funcionario', 'outros'].includes(formData.entidade_tipo)
                        ? 'Nenhum cadastro disponível para esta entidade.'
                        : 'Nenhum registro encontrado.'
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={formData.entidade_tipo ? `${entidadeTipoOptions.find((item) => item.value === formData.entidade_tipo)?.label || 'Entidade'} *` : 'Entidade *'}
                        error={!!errors.entidade_id}
                        helperText={errors.entidade_id}
                        sx={premiumInputStyles}
                      />
                    )}
                  />
                </div>

                <div className="md:col-span-2">
                  <TextField
                    fullWidth
                    label="Data de competência *"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={formData.data_competencia}
                    onChange={(e) => setFormData((current) => ({ ...current, data_competencia: e.target.value }))}
                    error={!!errors.data_competencia}
                    helperText={errors.data_competencia}
                    sx={premiumInputStyles}
                  />
                </div>
                <div className="md:col-span-2">
                  <TextField
                    fullWidth
                    label="Informações complementares"
                    multiline
                    rows={4}
                    value={formData.informacoes_complementares}
                    onChange={(e) => setFormData((current) => ({ ...current, informacoes_complementares: e.target.value }))}
                    sx={premiumInputStyles}
                  />
                </div>
              </div>
            </Box>

            <Divider sx={{ borderColor: '#F1F5F9' }} />

            <Box>
              <div className="flex items-center gap-2 mb-4">
                <CloudUploadOutlined sx={{ color: '#5B21B6' }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Anexos</Typography>
              </div>

              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadOutlined />}
                sx={{ borderColor: '#E2E8F0', color: '#475569', textTransform: 'none', borderRadius: '8px', '&:hover': { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' } }}
              >
                Selecionar arquivos
                <VisuallyHiddenInput type="file" multiple onChange={handleFilesSelected} />
              </Button>

              <Typography variant="caption" display="block" color="#94A3B8" mt={1}>
                Os anexos ficam registrados como metadados do recebimento no fluxo atual.
              </Typography>

              {formData.anexos.length > 0 && (
                <div className="mt-4 flex flex-col gap-2">
                  {formData.anexos.map((anexo) => (
                    <Alert key={anexo.nome} severity="info" sx={{ borderRadius: '12px' }}>
                      {anexo.nome}
                    </Alert>
                  ))}
                </div>
              )}
            </Box>

            <Box className="flex flex-col sm:flex-row justify-end gap-3 mt-4 pt-6 border-t border-[#F1F5F9]">
              <Button
                variant="outlined"
                onClick={() => navigate('/financeiro/receber')}
                sx={{ borderColor: '#E2E8F0', color: '#475569', textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 4, py: 1.2, '&:hover': { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' } }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting || loadingOptions}
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Check />}
                sx={{
                  background: 'linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)',
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '8px',
                  px: 6, py: 1.2,
                  boxShadow: '0 4px 14px 0 rgba(91, 33, 182, 0.25)',
                  '&:hover': { background: 'linear-gradient(90deg, #28024D 0%, #4C1D95 100%)', boxShadow: '0 6px 20px rgba(91, 33, 182, 0.3)' }
                }}
              >
                {submitting ? "Cadastrando..." : "Cadastrar Recebimento"}
              </Button>
            </Box>
          </div>
        </Box>
      </form>
    </Layout>
  );
};

export default NovoRecebimento;
