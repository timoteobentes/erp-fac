import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowBack, Check, InfoOutlined, MonetizationOnOutlined, ReceiptLongOutlined, TuneOutlined } from "@mui/icons-material";
import { Box, Button, CircularProgress, Divider, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Select, Skeleton, TextField, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../../../../template/Layout";
import { formaPagamentoSchema, type FormaPagamentoFormData } from "../../../../modules/Financeiro/FormasPagamento/schemas/formaPagamentoSchema";
import { atualizarFormaPagamentoService, buscarFormaPagamentoPorIdService } from "../../../../modules/Financeiro/FormasPagamento/services/formasPagamentoService";
import { listarContasBancariasService } from "../../../../modules/Financeiro/ContasBancarias/services/contasBancariasService";
import { premiumInputStyles } from "../../../../modules/Financeiro/FormasPagamento/utils/formatters";
import { CONFIRMACAO_AUTOMATICA_OPTIONS, DISPONIVEL_EM_OPTIONS, MODALIDADE_OPTIONS } from "../../../../modules/Financeiro/FormasPagamento/constants/formaPagamentoOptions";

interface ContaBancariaOption {
  id: number;
  nome: string;
}

const EditarFormaPagamento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contasBancarias, setContasBancarias] = useState<ContaBancariaOption[]>([]);

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<FormaPagamentoFormData>({
    resolver: zodResolver(formaPagamentoSchema) as any,
    defaultValues: {
      nome: "",
      conta_bancaria_id: 0,
      disponivel_em: "CONTAS_A_PAGAR_E_RECEBER",
      confirmacao_automatica: "NUNCA_CONFIRMAR_AUTOMATICO",
      numero_maximo_parcelas: 1,
      intervalo_parcelas_dias: 0,
      primeira_parcela_dias: 0,
      taxa_banco: 0,
      taxa_operadora: 0,
      juros_multa: 0,
      juros_mora: 0,
      modalidade: "DINHEIRO",
    },
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        if (!id) return;

        const [formaPagamento, contasResponse] = await Promise.all([
          buscarFormaPagamentoPorIdService(id),
          listarContasBancariasService(),
        ]);

        const payload = contasResponse?.data && contasResponse?.success !== undefined ? contasResponse.data : contasResponse;
        const dataArray = Array.isArray(payload) ? payload : payload?.dados || payload?.data || [];
        setContasBancarias(dataArray);

        reset({
          nome: formaPagamento.nome || "",
          conta_bancaria_id: Number(formaPagamento.conta_bancaria_id || 0),
          disponivel_em: formaPagamento.disponivel_em,
          confirmacao_automatica: formaPagamento.confirmacao_automatica,
          numero_maximo_parcelas: Number(formaPagamento.numero_maximo_parcelas || 1),
          intervalo_parcelas_dias: Number(formaPagamento.intervalo_parcelas_dias || 0),
          primeira_parcela_dias: Number(formaPagamento.primeira_parcela_dias || 0),
          taxa_banco: Number(formaPagamento.taxa_banco || 0),
          taxa_operadora: Number(formaPagamento.taxa_operadora || 0),
          juros_multa: Number(formaPagamento.juros_multa || 0),
          juros_mora: Number(formaPagamento.juros_mora || 0),
          modalidade: formaPagamento.modalidade,
        });
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Erro ao carregar os dados da Forma de Pagamento");
        navigate("/financeiro/formas-de-pagamento");
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [id, navigate, reset]);

  const onSubmit = async (data: FormaPagamentoFormData) => {
    try {
      if (!id) return;
      await atualizarFormaPagamentoService(id, data);
      toast.success("Forma de Pagamento atualizada com sucesso");
      navigate("/financeiro/formas-de-pagamento");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao atualizar Forma de Pagamento");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="mb-8 flex items-center gap-4">
          <Skeleton variant="circular" width={48} height={48} />
          <div>
            <Skeleton variant="text" width={260} height={40} />
            <Skeleton variant="text" width={320} height={20} />
          </div>
        </div>
        <Skeleton variant="rounded" width="100%" height={520} sx={{ borderRadius: "24px" }} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center gap-4">
          <IconButton onClick={() => navigate("/financeiro/formas-de-pagamento")} sx={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", color: "#475569", "&:hover": { backgroundColor: "#F8FAFC", color: "#0F172A" } }}>
            <ArrowBack />
          </IconButton>
          <div className="flex flex-col">
            <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Editar Forma de Pagamento
            </Typography>
            <Typography variant="body2" color="#64748B">
              Registro <strong className="text-[#3C0473]">#{id?.padStart(4, "0")}</strong> - ajuste os dados da Forma de Pagamento.
            </Typography>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="animate-fadeIn">
        <Box sx={{ backgroundColor: "#FFFFFF", borderRadius: "24px", border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", p: { xs: 3, md: 5 } }}>
          <div className="flex flex-col gap-10">
            <Box>
              <div className="flex items-center gap-2 mb-6">
                <InfoOutlined sx={{ color: "#5B21B6" }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Dados Gerais</Typography>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField fullWidth label="Nome *" InputLabelProps={{ shrink: true }} {...register("nome")} error={!!errors.nome} helperText={errors.nome?.message} sx={premiumInputStyles} />

                <Controller
                  name="conta_bancaria_id"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth sx={premiumInputStyles} error={!!errors.conta_bancaria_id}>
                      <InputLabel id="conta-bancaria-label-editar">Conta bancaria *</InputLabel>
                      <Select labelId="conta-bancaria-label-editar" label="Conta bancaria *" {...field} value={field.value || ""} disabled={contasBancarias.length === 0}>
                        {contasBancarias.length === 0 ? (
                          <MenuItem value="" disabled>Nenhuma Conta Bancaria cadastrada</MenuItem>
                        ) : (
                          contasBancarias.map((conta) => <MenuItem key={conta.id} value={conta.id}>{conta.nome}</MenuItem>)
                        )}
                      </Select>
                      <Typography variant="caption" color={errors.conta_bancaria_id ? "#D32F2F" : "#64748B"} sx={{ mt: 1.1, ml: 1.8 }}>
                        {errors.conta_bancaria_id?.message || (contasBancarias.length === 0 ? "Cadastre uma Conta Bancaria antes de vincular esta Forma de Pagamento." : "Selecione a Conta Bancaria vinculada.")}
                      </Typography>
                    </FormControl>
                  )}
                />

                <Controller
                  name="disponivel_em"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth sx={premiumInputStyles} error={!!errors.disponivel_em}>
                      <InputLabel id="disponivel-em-label-editar">Disponivel em *</InputLabel>
                      <Select labelId="disponivel-em-label-editar" label="Disponivel em *" {...field}>
                        {DISPONIVEL_EM_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name="confirmacao_automatica"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth sx={premiumInputStyles} error={!!errors.confirmacao_automatica}>
                      <InputLabel id="confirmacao-automatica-label-editar">Confirmacao automatica *</InputLabel>
                      <Select labelId="confirmacao-automatica-label-editar" label="Confirmacao automatica *" {...field}>
                        {CONFIRMACAO_AUTOMATICA_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  )}
                />
              </div>
            </Box>

            <Divider sx={{ borderColor: "#F1F5F9" }} />

            <Box>
              <div className="flex items-center gap-2 mb-6">
                <ReceiptLongOutlined sx={{ color: "#5B21B6" }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Parcelamento</Typography>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextField fullWidth label="Nº maximo de parcelas *" type="number" InputLabelProps={{ shrink: true }} inputProps={{ min: 1, step: 1 }} {...register("numero_maximo_parcelas", { valueAsNumber: true })} error={!!errors.numero_maximo_parcelas} helperText={errors.numero_maximo_parcelas?.message} sx={premiumInputStyles} />
                <TextField fullWidth label="Intervalo parcelas (dias) *" type="number" InputLabelProps={{ shrink: true }} inputProps={{ min: 0, step: 1 }} {...register("intervalo_parcelas_dias", { valueAsNumber: true })} error={!!errors.intervalo_parcelas_dias} helperText={errors.intervalo_parcelas_dias?.message} sx={premiumInputStyles} />
                <TextField fullWidth label="1ª parcela (dias) *" type="number" InputLabelProps={{ shrink: true }} inputProps={{ min: 0, step: 1 }} {...register("primeira_parcela_dias", { valueAsNumber: true })} error={!!errors.primeira_parcela_dias} helperText={errors.primeira_parcela_dias?.message} sx={premiumInputStyles} />
              </div>
            </Box>

            <Divider sx={{ borderColor: "#F1F5F9" }} />

            <Box>
              <div className="flex items-center gap-2 mb-6">
                <MonetizationOnOutlined sx={{ color: "#5B21B6" }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Taxas</Typography>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <TextField fullWidth label="Taxa do banco (R$) *" type="number" InputLabelProps={{ shrink: true }} inputProps={{ min: 0, step: "0.01" }} InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} {...register("taxa_banco", { valueAsNumber: true })} error={!!errors.taxa_banco} helperText={errors.taxa_banco?.message} sx={premiumInputStyles} />
                <TextField fullWidth label="Taxa da operadora (%) *" type="number" InputLabelProps={{ shrink: true }} inputProps={{ min: 0, step: "0.01" }} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} {...register("taxa_operadora", { valueAsNumber: true })} error={!!errors.taxa_operadora} helperText={errors.taxa_operadora?.message} sx={premiumInputStyles} />
                <TextField fullWidth label="Juros de multa (%) *" type="number" InputLabelProps={{ shrink: true }} inputProps={{ min: 0, step: "0.01" }} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} {...register("juros_multa", { valueAsNumber: true })} error={!!errors.juros_multa} helperText={errors.juros_multa?.message} sx={premiumInputStyles} />
                <TextField fullWidth label="Juros de mora (%) *" type="number" InputLabelProps={{ shrink: true }} inputProps={{ min: 0, step: "0.01" }} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} {...register("juros_mora", { valueAsNumber: true })} error={!!errors.juros_mora} helperText={errors.juros_mora?.message} sx={premiumInputStyles} />
              </div>
            </Box>

            <Divider sx={{ borderColor: "#F1F5F9" }} />

            <Box>
              <div className="flex items-center gap-2 mb-6">
                <TuneOutlined sx={{ color: "#5B21B6" }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Modalidade</Typography>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name="modalidade"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth sx={premiumInputStyles} error={!!errors.modalidade}>
                      <InputLabel id="modalidade-label-editar">Modalidade *</InputLabel>
                      <Select labelId="modalidade-label-editar" label="Modalidade *" {...field}>
                        {MODALIDADE_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                      </Select>
                    </FormControl>
                  )}
                />
              </div>
            </Box>

            <Box className="flex flex-col sm:flex-row justify-end gap-3 mt-4 pt-6 border-t border-[#F1F5F9]">
              <Button variant="outlined" onClick={() => navigate("/financeiro/formas-de-pagamento")} sx={{ borderColor: "#E2E8F0", color: "#475569", textTransform: "none", fontWeight: 600, borderRadius: "8px", px: 4, py: 1.2, "&:hover": { backgroundColor: "#F8FAFC", borderColor: "#CBD5E1" } }}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting || contasBancarias.length === 0} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Check />} sx={{ background: "linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)", color: "white", textTransform: "none", fontWeight: 600, borderRadius: "8px", px: 6, py: 1.2, boxShadow: "0 4px 14px 0 rgba(91, 33, 182, 0.25)", "&:hover": { background: "linear-gradient(90deg, #28024D 0%, #4C1D95 100%)", boxShadow: "0 6px 20px rgba(91, 33, 182, 0.3)" } }}>
                {isSubmitting ? "Salvando..." : "Salvar Alteracoes"}
              </Button>
            </Box>
          </div>
        </Box>
      </form>
    </Layout>
  );
};

export default EditarFormaPagamento;
