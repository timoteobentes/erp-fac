import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowBack, Check, InfoOutlined, MonetizationOnOutlined, ReceiptLongOutlined, TuneOutlined } from "@mui/icons-material";
import { Box, Button, CircularProgress, Divider, FormControl, IconButton, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../../../../template/Layout";
import { formaPagamentoSchema, type FormaPagamentoFormData } from "../../../../modules/Financeiro/FormasPagamento/schemas/formaPagamentoSchema";
import { criarFormaPagamentoService } from "../../../../modules/Financeiro/FormasPagamento/services/formasPagamentoService";
import { listarContasBancariasService } from "../../../../modules/Financeiro/ContasBancarias/services/contasBancariasService";
import { premiumInputStyles } from "../../../../modules/Financeiro/FormasPagamento/utils/formatters";
import { CONFIRMACAO_AUTOMATICA_OPTIONS, DISPONIVEL_EM_OPTIONS, MODALIDADE_OPTIONS } from "../../../../modules/Financeiro/FormasPagamento/constants/formaPagamentoOptions";

interface ContaBancariaOption {
  id: number;
  nome: string;
}

const NovoFormaPagamento: React.FC = () => {
  const navigate = useNavigate();
  const [contasBancarias, setContasBancarias] = useState<ContaBancariaOption[]>([]);
  const [loadingContas, setLoadingContas] = useState(true);

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormaPagamentoFormData>({
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
    const carregarContasBancarias = async () => {
      try {
        const response = await listarContasBancariasService();
        const payload = response?.data && response?.success !== undefined ? response.data : response;
        const dataArray = Array.isArray(payload) ? payload : payload?.dados || payload?.data || [];
        setContasBancarias(dataArray);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Erro ao carregar Contas Bancarias");
      } finally {
        setLoadingContas(false);
      }
    };

    carregarContasBancarias();
  }, []);

  const onSubmit = async (data: FormaPagamentoFormData) => {
    try {
      await criarFormaPagamentoService(data);
      toast.success("Forma de Pagamento cadastrada com sucesso");
      navigate("/financeiro/formas-de-pagamento");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao cadastrar Forma de Pagamento");
    }
  };

  return (
    <Layout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center gap-4">
          <IconButton onClick={() => navigate("/financeiro/formas-de-pagamento")} sx={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", color: "#475569", "&:hover": { backgroundColor: "#F8FAFC", color: "#0F172A" } }}>
            <ArrowBack />
          </IconButton>
          <div className="flex flex-col">
            <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Nova Forma de Pagamento
            </Typography>
            <Typography variant="body2" color="#64748B">
              Preencha os dados abaixo para cadastrar uma nova Forma de Pagamento.
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
                <TextField fullWidth label="Nome *" placeholder="Ex: Cartao Loja, PIX Caixa, Boleto Banco X" {...register("nome")} error={!!errors.nome} helperText={errors.nome?.message} sx={premiumInputStyles} />

                <Controller
                  name="conta_bancaria_id"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth sx={premiumInputStyles} error={!!errors.conta_bancaria_id}>
                      <InputLabel id="conta-bancaria-label">Conta bancaria *</InputLabel>
                      <Select labelId="conta-bancaria-label" label="Conta bancaria *" {...field} value={field.value || ""} disabled={loadingContas || contasBancarias.length === 0}>
                        {contasBancarias.length === 0 ? (
                          <MenuItem value="" disabled>Nenhuma Conta Bancaria cadastrada</MenuItem>
                        ) : (
                          contasBancarias.map((conta) => <MenuItem key={conta.id} value={conta.id}>{conta.nome}</MenuItem>)
                        )}
                      </Select>
                      <Typography variant="caption" color={errors.conta_bancaria_id ? "#D32F2F" : "#64748B"} sx={{ mt: 1.1, ml: 1.8 }}>
                        {errors.conta_bancaria_id?.message || (contasBancarias.length === 0 ? "Cadastre uma Conta Bancaria antes de criar a Forma de Pagamento." : "Selecione a Conta Bancaria vinculada.")}
                      </Typography>
                    </FormControl>
                  )}
                />

                <Controller
                  name="disponivel_em"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth sx={premiumInputStyles} error={!!errors.disponivel_em}>
                      <InputLabel id="disponivel-em-label">Disponivel em *</InputLabel>
                      <Select labelId="disponivel-em-label" label="Disponivel em *" {...field}>
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
                      <InputLabel id="confirmacao-automatica-label">Confirmacao automatica *</InputLabel>
                      <Select labelId="confirmacao-automatica-label" label="Confirmacao automatica *" {...field}>
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
                <TextField fullWidth label="Nº maximo de parcelas *" type="number" inputProps={{ min: 1, step: 1 }} {...register("numero_maximo_parcelas", { valueAsNumber: true })} error={!!errors.numero_maximo_parcelas} helperText={errors.numero_maximo_parcelas?.message} sx={premiumInputStyles} />
                <TextField fullWidth label="Intervalo parcelas (dias) *" type="number" inputProps={{ min: 0, step: 1 }} {...register("intervalo_parcelas_dias", { valueAsNumber: true })} error={!!errors.intervalo_parcelas_dias} helperText={errors.intervalo_parcelas_dias?.message} sx={premiumInputStyles} />
                <TextField fullWidth label="1ª parcela (dias) *" type="number" inputProps={{ min: 0, step: 1 }} {...register("primeira_parcela_dias", { valueAsNumber: true })} error={!!errors.primeira_parcela_dias} helperText={errors.primeira_parcela_dias?.message} sx={premiumInputStyles} />
              </div>
            </Box>

            <Divider sx={{ borderColor: "#F1F5F9" }} />

            <Box>
              <div className="flex items-center gap-2 mb-6">
                <MonetizationOnOutlined sx={{ color: "#5B21B6" }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Taxas</Typography>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <TextField fullWidth label="Taxa do banco (R$) *" type="number" inputProps={{ min: 0, step: "0.01" }} InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }} {...register("taxa_banco", { valueAsNumber: true })} error={!!errors.taxa_banco} helperText={errors.taxa_banco?.message} sx={premiumInputStyles} />
                <TextField fullWidth label="Taxa da operadora (%) *" type="number" inputProps={{ min: 0, step: "0.01" }} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} {...register("taxa_operadora", { valueAsNumber: true })} error={!!errors.taxa_operadora} helperText={errors.taxa_operadora?.message} sx={premiumInputStyles} />
                <TextField fullWidth label="Juros de multa (%) *" type="number" inputProps={{ min: 0, step: "0.01" }} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} {...register("juros_multa", { valueAsNumber: true })} error={!!errors.juros_multa} helperText={errors.juros_multa?.message} sx={premiumInputStyles} />
                <TextField fullWidth label="Juros de mora (%) *" type="number" inputProps={{ min: 0, step: "0.01" }} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} {...register("juros_mora", { valueAsNumber: true })} error={!!errors.juros_mora} helperText={errors.juros_mora?.message} sx={premiumInputStyles} />
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
                      <InputLabel id="modalidade-label">Modalidade *</InputLabel>
                      <Select labelId="modalidade-label" label="Modalidade *" {...field}>
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
                {isSubmitting ? "Cadastrando..." : "Cadastrar Forma de Pagamento"}
              </Button>
            </Box>
          </div>
        </Box>
      </form>
    </Layout>
  );
};

export default NovoFormaPagamento;
