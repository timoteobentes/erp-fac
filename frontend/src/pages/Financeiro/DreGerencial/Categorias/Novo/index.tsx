import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowBack, Check } from "@mui/icons-material";
import { Box, Button, CircularProgress, FormControl, IconButton, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../../../../../template/Layout";
import { categoriaDreSchema, type CategoriaDreFormData } from "../../../../../modules/Financeiro/DreGerencial/schemas/categoriaDreSchema";
import { criarCategoriaDreService } from "../../../../../modules/Financeiro/DreGerencial/services/categoriasDreService";
import {
  ATIVO_OPTIONS,
  GRUPO_CATEGORIA_DRE_OPTIONS,
  TIPO_CATEGORIA_DRE_OPTIONS,
  premiumInputStyles,
} from "../../../../../modules/Financeiro/DreGerencial/constants/categoriaDreOptions";

const NovoCategoriaDre: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = useForm<CategoriaDreFormData>({
    resolver: zodResolver(categoriaDreSchema),
    defaultValues: { grupo: "NENHUM", nome: "", tipo: "RECEITA", ativo: true },
  });

  const grupoSelecionado = watch("grupo");
  const tipoSelecionado = watch("tipo");
  const ativoSelecionado = watch("ativo");

  const onSubmit = async (data: CategoriaDreFormData) => {
    try {
      await criarCategoriaDreService(data);
      toast.success("Categoria DRE cadastrada com sucesso");
      navigate("/financeiro/dre-gerencial/categorias");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao cadastrar Categoria DRE");
    }
  };

  return (
    <Layout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center gap-4">
          <IconButton onClick={() => navigate("/financeiro/dre-gerencial/categorias")} sx={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", color: "#475569", "&:hover": { backgroundColor: "#F8FAFC", color: "#0F172A" } }}>
            <ArrowBack />
          </IconButton>
          <div className="flex flex-col">
            <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Nova Categoria DRE
            </Typography>
            <Typography variant="body2" color="#64748B">
              Preencha os dados abaixo para cadastrar uma nova Categoria DRE.
            </Typography>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="animate-fadeIn">
        <Box sx={{ backgroundColor: "#FFFFFF", borderRadius: "24px", border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", p: { xs: 3, md: 5 } }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormControl fullWidth error={!!errors.grupo} sx={premiumInputStyles}>
              <InputLabel id="nova-categoria-dre-grupo-label">Grupo *</InputLabel>
              <Select labelId="nova-categoria-dre-grupo-label" value={grupoSelecionado} label="Grupo *" onChange={(event) => setValue("grupo", event.target.value, { shouldValidate: true })}>
                {GRUPO_CATEGORIA_DRE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
              {errors.grupo ? <Typography variant="caption" color="error" sx={{ mt: 1, ml: 1.5 }}>{errors.grupo.message}</Typography> : null}
            </FormControl>

            <TextField fullWidth label="Nome *" {...register("nome")} error={!!errors.nome} helperText={errors.nome?.message} sx={premiumInputStyles} />

            <FormControl fullWidth error={!!errors.tipo} sx={premiumInputStyles}>
              <InputLabel id="nova-categoria-dre-tipo-label">Tipo *</InputLabel>
              <Select labelId="nova-categoria-dre-tipo-label" value={tipoSelecionado} label="Tipo *" onChange={(event) => setValue("tipo", event.target.value as "DESPESA" | "RECEITA" | "TOTALIZADOR", { shouldValidate: true })}>
                {TIPO_CATEGORIA_DRE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
              {errors.tipo ? <Typography variant="caption" color="error" sx={{ mt: 1, ml: 1.5 }}>{errors.tipo.message}</Typography> : null}
            </FormControl>

            <FormControl fullWidth error={!!errors.ativo} sx={premiumInputStyles}>
              <InputLabel id="nova-categoria-dre-ativo-label">Ativo *</InputLabel>
              <Select labelId="nova-categoria-dre-ativo-label" value={String(ativoSelecionado)} label="Ativo *" onChange={(event) => setValue("ativo", event.target.value === "true", { shouldValidate: true })}>
                {ATIVO_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </Select>
              {errors.ativo ? <Typography variant="caption" color="error" sx={{ mt: 1, ml: 1.5 }}>{errors.ativo.message}</Typography> : null}
            </FormControl>
          </div>

          <Box className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-[#F1F5F9]">
            <Button variant="outlined" onClick={() => navigate("/financeiro/dre-gerencial/categorias")} sx={{ borderColor: "#E2E8F0", color: "#475569", textTransform: "none", fontWeight: 600, borderRadius: "8px", px: 4, py: 1.2, "&:hover": { backgroundColor: "#F8FAFC", borderColor: "#CBD5E1" } }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Check />}
              sx={{ background: "linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)", color: "white", textTransform: "none", fontWeight: 600, borderRadius: "8px", px: 6, py: 1.2, boxShadow: "0 4px 14px 0 rgba(91, 33, 182, 0.25)", "&:hover": { background: "linear-gradient(90deg, #28024D 0%, #4C1D95 100%)", boxShadow: "0 6px 20px rgba(91, 33, 182, 0.3)" } }}
            >
              {isSubmitting ? "Cadastrando..." : "Cadastrar Categoria DRE"}
            </Button>
          </Box>
        </Box>
      </form>
    </Layout>
  );
};

export default NovoCategoriaDre;
