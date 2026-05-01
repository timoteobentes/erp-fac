import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowBack, Check } from "@mui/icons-material";
import { Box, Button, CircularProgress, IconButton, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../../../../template/Layout";
import { contaBancariaSchema, type ContaBancariaFormData } from "../../../../modules/Financeiro/ContasBancarias/schemas/contaBancariaSchema";
import { criarContaBancariaService } from "../../../../modules/Financeiro/ContasBancarias/services/contasBancariasService";

const premiumInputStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: "#F8FAFC",
    transition: "all 0.2s ease-in-out",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
    "&.Mui-focused": {
      backgroundColor: "#FFFFFF",
      boxShadow: "0 0 0 3px rgba(91, 33, 182, 0.1)",
    },
    "&.Mui-focused fieldset": { borderColor: "#5B21B6", borderWidth: "1px" },
  },
};

const NovoContaBancaria: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContaBancariaFormData>({
    resolver: zodResolver(contaBancariaSchema) as any,
    defaultValues: { nome: "", saldo_inicial: 0, data_saldo: "" },
  });

  const onSubmit = async (data: ContaBancariaFormData) => {
    try {
      await criarContaBancariaService(data);
      toast.success("Conta Bancaria cadastrada com sucesso");
      navigate("/financeiro/contas-bancarias");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao cadastrar Conta Bancaria");
    }
  };

  return (
    <Layout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center gap-4">
          <IconButton onClick={() => navigate("/financeiro/contas-bancarias")} sx={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", color: "#475569", "&:hover": { backgroundColor: "#F8FAFC", color: "#0F172A" } }}>
            <ArrowBack />
          </IconButton>
          <div className="flex flex-col">
            <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Nova Conta Bancaria
            </Typography>
            <Typography variant="body2" color="#64748B">
              Preencha os dados abaixo para cadastrar uma nova Conta Bancaria.
            </Typography>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="animate-fadeIn">
        <Box sx={{ backgroundColor: "#FFFFFF", borderRadius: "24px", border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", p: { xs: 3, md: 5 } }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TextField fullWidth label="Nome *" placeholder="Ex: Banco do Brasil, Nubank, Caixa, Conta Principal" {...register("nome")} error={!!errors.nome} helperText={errors.nome?.message} sx={premiumInputStyles} />
            <TextField fullWidth label="Saldo inicial *" type="number" inputProps={{ step: "0.01" }} {...register("saldo_inicial", { valueAsNumber: true })} error={!!errors.saldo_inicial} helperText={errors.saldo_inicial?.message} sx={premiumInputStyles} />
            <TextField fullWidth label="Data do saldo *" type="date" InputLabelProps={{ shrink: true }} {...register("data_saldo")} error={!!errors.data_saldo} helperText={errors.data_saldo?.message} sx={premiumInputStyles} />
          </div>

          <Box className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-[#F1F5F9]">
            <Button variant="outlined" onClick={() => navigate("/financeiro/contas-bancarias")} sx={{ borderColor: "#E2E8F0", color: "#475569", textTransform: "none", fontWeight: 600, borderRadius: "8px", px: 4, py: 1.2, "&:hover": { backgroundColor: "#F8FAFC", borderColor: "#CBD5E1" } }}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Check />} sx={{ background: "linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)", color: "white", textTransform: "none", fontWeight: 600, borderRadius: "8px", px: 6, py: 1.2, boxShadow: "0 4px 14px 0 rgba(91, 33, 182, 0.25)", "&:hover": { background: "linear-gradient(90deg, #28024D 0%, #4C1D95 100%)", boxShadow: "0 6px 20px rgba(91, 33, 182, 0.3)" } }}>
              {isSubmitting ? "Cadastrando..." : "Cadastrar Conta Bancaria"}
            </Button>
          </Box>
        </Box>
      </form>
    </Layout>
  );
};

export default NovoContaBancaria;
