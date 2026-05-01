import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowBack, Check } from "@mui/icons-material";
import { Box, Button, CircularProgress, FormControl, IconButton, InputLabel, MenuItem, Select, Skeleton, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../../../../template/Layout";
import { centroCustoSchema, type CentroCustoFormData } from "../../../../modules/Financeiro/CentroCustos/schemas/centroCustoSchema";
import { atualizarCentroCustoService, buscarCentroCustoPorIdService } from "../../../../modules/Financeiro/CentroCustos/services/centroCustosService";

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

const EditarCentroCusto: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch, reset } = useForm<CentroCustoFormData>({
    resolver: zodResolver(centroCustoSchema),
    defaultValues: { nome: "", status: "ATIVO" },
  });

  useEffect(() => {
    const fetchCentroCusto = async () => {
      try {
        if (!id) return;
        const data = await buscarCentroCustoPorIdService(id);
        reset({ nome: data.nome || "", status: data.status || "ATIVO" });
      } catch {
        toast.error("Erro ao carregar os dados do Centro de Custo");
        navigate("/financeiro/centro-custos");
      } finally {
        setLoading(false);
      }
    };

    fetchCentroCusto();
  }, [id, navigate, reset]);

  const statusSelecionado = watch("status");

  const onSubmit = async (data: CentroCustoFormData) => {
    try {
      if (!id) return;
      await atualizarCentroCustoService(id, data);
      toast.success("Centro de Custo atualizado com sucesso");
      navigate("/financeiro/centro-custos");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao atualizar Centro de Custo");
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
        <Skeleton variant="rounded" width="100%" height={280} sx={{ borderRadius: "24px" }} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center gap-4">
          <IconButton onClick={() => navigate("/financeiro/centro-custos")} sx={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", color: "#475569", "&:hover": { backgroundColor: "#F8FAFC", color: "#0F172A" } }}>
            <ArrowBack />
          </IconButton>
          <div className="flex flex-col">
            <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Editar Centro de Custo
            </Typography>
            <Typography variant="body2" color="#64748B">
              Registro <strong className="text-[#3C0473]">#{id?.padStart(4, "0")}</strong> - ajuste Nome e Status.
            </Typography>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="animate-fadeIn">
        <Box sx={{ backgroundColor: "#FFFFFF", borderRadius: "24px", border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", p: { xs: 3, md: 5 } }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField fullWidth label="Nome *" InputLabelProps={{ shrink: true }} {...register("nome")} error={!!errors.nome} helperText={errors.nome?.message} sx={premiumInputStyles} />

            <FormControl fullWidth error={!!errors.status} sx={premiumInputStyles}>
              <InputLabel id="editar-centro-custo-status-label">Status *</InputLabel>
              <Select
                labelId="editar-centro-custo-status-label"
                value={statusSelecionado}
                label="Status *"
                onChange={(event) => setValue("status", event.target.value as "ATIVO" | "INATIVO", { shouldValidate: true })}
              >
                <MenuItem value="ATIVO">Ativo</MenuItem>
                <MenuItem value="INATIVO">Inativo</MenuItem>
              </Select>
              {errors.status ? <Typography variant="caption" color="error" sx={{ mt: 1, ml: 1.5 }}>{errors.status.message}</Typography> : null}
            </FormControl>
          </div>

          <Box className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-[#F1F5F9]">
            <Button variant="outlined" onClick={() => navigate("/financeiro/centro-custos")} sx={{ borderColor: "#E2E8F0", color: "#475569", textTransform: "none", fontWeight: 600, borderRadius: "8px", px: 4, py: 1.2, "&:hover": { backgroundColor: "#F8FAFC", borderColor: "#CBD5E1" } }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Check />}
              sx={{ background: "linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)", color: "white", textTransform: "none", fontWeight: 600, borderRadius: "8px", px: 6, py: 1.2, boxShadow: "0 4px 14px 0 rgba(91, 33, 182, 0.25)", "&:hover": { background: "linear-gradient(90deg, #28024D 0%, #4C1D95 100%)", boxShadow: "0 6px 20px rgba(91, 33, 182, 0.3)" } }}
            >
              {isSubmitting ? "Salvando..." : "Salvar Alteracoes"}
            </Button>
          </Box>
        </Box>
      </form>
    </Layout>
  );
};

export default EditarCentroCusto;
