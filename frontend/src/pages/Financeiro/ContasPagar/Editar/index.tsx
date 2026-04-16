import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Divider, IconButton, Skeleton, Typography, CircularProgress, InputAdornment } from "@mui/material";
import Layout from "../../../../template/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ContaPagarFormData } from "../../../../modules/Financeiro/ContasPagar/schemas/contaPagarSchema";
import { contaPagarSchema } from "../../../../modules/Financeiro/ContasPagar/schemas/contaPagarSchema";
import { atualizarContaPagarService, buscarContaPagarPorIdService } from "../../../../modules/Financeiro/ContasPagar/services/contasPagarService";
import { toast } from "react-toastify";
import { ArrowBack, Check, InfoOutlined, MonetizationOnOutlined, NotesOutlined } from '@mui/icons-material';

// Estilo Premium B2B para os Inputs do MUI
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

const EditarPagamento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const { register, handleSubmit, control, setValue, reset, formState: { errors, isSubmitting } } = useForm<ContaPagarFormData>({
    resolver: zodResolver(contaPagarSchema) as any,
    defaultValues: {
      valor_bruto: '' as any,
      juros: 0,
      desconto: 0,
      valor_total: 0,
      status: "pendente",
    }
  });

  useEffect(() => {
    const fetchConta = async () => {
      try {
        if (!id) return;
        const data = await buscarContaPagarPorIdService(id);
        if (data) {
           reset({
             ...data,
             data_vencimento: data.data_vencimento ? data.data_vencimento.split('T')[0] : '',
             valor_bruto: Number(data.valor_bruto || 0),
             juros: Number(data.juros || 0),
             desconto: Number(data.desconto || 0),
             valor_total: Number(data.valor_total || 0)
           });
        }
      } catch (error) {
        toast.error("Erro ao carregar os dados da conta a pagar.");
        navigate('/financeiro/pagar');
      } finally {
        setLoading(false);
      }
    };
    fetchConta();
  }, [id, navigate, reset]);

  // Watcher para Valores
  const valor_bruto = useWatch({ control, name: "valor_bruto" }) || 0;
  const juros = useWatch({ control, name: "juros" }) || 0;
  const desconto = useWatch({ control, name: "desconto" }) || 0;

  useEffect(() => {
    const calc = Number(valor_bruto) + Number(juros) - Number(desconto);
    setValue("valor_total", calc > 0 ? calc : 0);
  }, [valor_bruto, juros, desconto, setValue]);

  const valorCalculado = useWatch({ control, name: "valor_total" }) || 0;

  const onSubmit = async (data: any) => {
    try {
      if (!id) return;
      await atualizarContaPagarService(id, data);
      toast.success("Conta a pagar atualizada com sucesso!");
      navigate("/financeiro/pagar");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao atualizar conta a pagar");
    }
  };

  // LOADING PREMIUM B2B
  if (loading) {
    return (
      <Layout>
        <div className="mb-8 flex items-center gap-4">
            <Skeleton variant="circular" width={48} height={48} />
            <div>
                <Skeleton variant="text" width={200} height={40} />
                <Skeleton variant="text" width={300} height={20} />
            </div>
        </div>
        <Skeleton variant="rounded" width="100%" height={600} sx={{ borderRadius: '24px' }} />
      </Layout>
    );
  }

  return (
    <Layout>
      {/* HEADER DE NAVEGAÇÃO PREMIUM */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center gap-4">
          <IconButton 
            onClick={() => navigate("/financeiro/pagar")}
            sx={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', color: '#475569', '&:hover': { backgroundColor: '#F8FAFC', color: '#0F172A' } }}
          >
            <ArrowBack />
          </IconButton>
          <div className="flex flex-col">
            <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Editar Despesa
            </Typography>
            <Typography variant="body2" color="#64748B">
                Registo <strong className="text-[#3C0473]">#{id?.padStart(4, '0')}</strong> • Ajuste os dados ou valores da conta abaixo.
            </Typography>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="animate-fadeIn">
        {/* CONTAINER PRINCIPAL (Soft UX) */}
        <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", p: { xs: 3, md: 5 } }}>
          
          <div className="flex flex-col gap-10">
            
            {/* BLOCO 1: Dados Gerais */}
            <Box>
              <div className="flex items-center gap-2 mb-6">
                <InfoOutlined sx={{ color: '#5B21B6' }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Dados Gerais</Typography>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <TextField 
                    fullWidth label="Descrição do pagamento *" 
                    InputLabelProps={{ shrink: true }}
                    {...register("descricao")}
                    error={!!errors.descricao} helperText={errors.descricao?.message}
                    sx={premiumInputStyles}
                  />
                </div>
                <div className="md:col-span-1">
                  <TextField 
                    fullWidth label="Plano de Contas" 
                    InputLabelProps={{ shrink: true }}
                    {...register("categoria_despesa")}
                    sx={premiumInputStyles}
                  />
                </div>
                <div className="md:col-span-1">
                  <TextField 
                    fullWidth label="Vencimento *" type="date" InputLabelProps={{ shrink: true }} 
                    {...register("data_vencimento")}
                    error={!!errors.data_vencimento} helperText={errors.data_vencimento?.message}
                    sx={premiumInputStyles}
                  />
                </div>
                <div className="md:col-span-4 lg:col-span-2">
                  <TextField 
                    fullWidth label="Fornecedor (ID temporário)" type="number" 
                    InputLabelProps={{ shrink: true }}
                    {...register("fornecedor_id", { valueAsNumber: true })}
                    sx={premiumInputStyles}
                  />
                </div>
              </div>
            </Box>

            <Divider sx={{ borderColor: '#F1F5F9' }} />

            {/* BLOCO 2: Valores */}
            <Box>
              <div className="flex items-center gap-2 mb-6">
                <MonetizationOnOutlined sx={{ color: '#5B21B6' }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Estrutura de Valores</Typography>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <TextField 
                  fullWidth label="Valor Bruto Inicial *" type="number" 
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                  {...register("valor_bruto", { valueAsNumber: true })}
                  error={!!errors.valor_bruto} helperText={errors.valor_bruto?.message}
                  sx={premiumInputStyles}
                />
                <TextField 
                  fullWidth label="Juros / Multa (+)" type="number" 
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                  {...register("juros", { valueAsNumber: true })}
                  sx={premiumInputStyles}
                />
                <TextField 
                  fullWidth label="Desconto (-)" type="number" 
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                  {...register("desconto", { valueAsNumber: true })}
                  sx={premiumInputStyles}
                />
              </div>

              {/* TOTALIZADOR */}
              <div className="mt-6 flex justify-between items-center bg-[#F8FAFC] p-5 rounded-2xl border border-[#E2E8F0]">
                <div>
                    <Typography variant="body2" fontWeight={600} color="#64748B" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Valor Total a Pagar</Typography>
                    <Typography variant="caption" color="#94A3B8">Soma do valor bruto com juros, deduzindo os descontos.</Typography>
                </div>
                <Typography variant="h4" fontWeight={900} color="#0F172A" sx={{ letterSpacing: '-0.02em' }}>
                    R$ {valorCalculado.toFixed(2).replace('.', ',')}
                </Typography>
              </div>
            </Box>

            <Divider sx={{ borderColor: '#F1F5F9' }} />

            {/* BLOCO 3: Outras Informações */}
            <Box>
              <div className="flex items-center gap-2 mb-6">
                <NotesOutlined sx={{ color: '#5B21B6' }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Observações Internas</Typography>
              </div>
              <TextField 
                fullWidth label="Adicione notas, links de boletos ou referências" multiline rows={3} 
                InputLabelProps={{ shrink: true }}
                {...register("observacao")}
                sx={premiumInputStyles}
              />
            </Box>

            {/* RODAPÉ DO FORMULÁRIO */}
            <Box className="flex flex-col sm:flex-row justify-end gap-3 mt-4 pt-6 border-t border-[#F1F5F9]">
              <Button 
                variant="outlined" 
                onClick={() => navigate('/financeiro/pagar')}
                sx={{ borderColor: '#E2E8F0', color: '#475569', textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 4, py: 1.2, '&:hover': { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' } }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Check />}
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
                {isSubmitting ? "A guardar..." : "Salvar Alterações"}
              </Button>
            </Box>

          </div>
        </Box>
      </form>
    </Layout>
  );
};

export default EditarPagamento;