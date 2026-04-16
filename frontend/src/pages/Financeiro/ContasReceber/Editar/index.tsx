import React, { useEffect, useState } from "react";
import { Box, Button, TextField, IconButton, Skeleton, Typography, CircularProgress, Alert, Divider, InputAdornment } from "@mui/material";
import { ArrowBack, Check, InfoOutlined, MonetizationOnOutlined, StorefrontOutlined } from '@mui/icons-material';
import Layout from "../../../../template/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { contasReceberService } from "../../../../modules/Financeiro/ContasReceber/services/contasReceberService";

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

const EditarRecebimento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    descricao: '',
    data_vencimento: '',
    valor_total: 0
  });

  useEffect(() => {
    const fetchConta = async () => {
      try {
        if (!id) return;
        const data = await contasReceberService.buscar(id);
        if (data) {
           setFormData({
             descricao: data.descricao || '',
             data_vencimento: data.data_vencimento ? data.data_vencimento.split('T')[0] : '',
             valor_total: Number(data.valor_total || 0)
           });
        }
      } catch (error) {
        toast.error("Erro ao carregar os dados do recebimento.");
        navigate('/financeiro/receber');
      } finally {
        setLoading(false);
      }
    };
    fetchConta();
  }, [id, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!id) return;
      setSubmitting(true);
      await contasReceberService.atualizar(id, formData);
      toast.success("Recebimento atualizado com sucesso!");
      navigate("/financeiro/receber");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao atualizar recebimento");
    } finally {
      setSubmitting(false);
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
        <Skeleton variant="rounded" width="100%" height={400} sx={{ borderRadius: '24px' }} />
      </Layout>
    );
  }

  return (
    <Layout>
      {/* HEADER DE NAVEGAÇÃO PREMIUM */}
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
                Editar Cobrança
            </Typography>
            <Typography variant="body2" color="#64748B">
                Registo a receber <strong className="text-[#3C0473]">#{id?.padStart(4, '0')}</strong> • Ajuste os dados ou valores da cobrança abaixo.
            </Typography>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="animate-fadeIn">
        {/* CONTAINER PRINCIPAL (Soft UX) */}
        <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", p: { xs: 3, md: 5 } }}>
          
          <div className="flex flex-col gap-8">
            
            {/* BLOCO 1: Dados Básicos */}
            <Box>
              <div className="flex items-center gap-2 mb-6">
                <InfoOutlined sx={{ color: '#5B21B6' }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Dados Básicos</Typography>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <TextField 
                      fullWidth label="Descrição do Título *" 
                      InputLabelProps={{ shrink: true }}
                      required
                      value={formData.descricao}
                      onChange={e => setFormData(f => ({...f, descricao: e.target.value}))}
                      sx={premiumInputStyles}
                  />
                </div>
              </div>
            </Box>

            <Divider sx={{ borderColor: '#F1F5F9' }} />

            {/* BLOCO 2: Valores e Datas */}
            <Box>
              <div className="flex items-center gap-2 mb-6">
                <MonetizationOnOutlined sx={{ color: '#5B21B6' }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Valores e Prazos</Typography>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField 
                    fullWidth label="Data de Vencimento *" type="date" 
                    InputLabelProps={{ shrink: true }} 
                    required
                    value={formData.data_vencimento}
                    onChange={e => setFormData(f => ({...f, data_vencimento: e.target.value}))}
                    sx={premiumInputStyles}
                />
                <TextField 
                    fullWidth label="Valor Total a Receber *" type="number" 
                    InputLabelProps={{ shrink: true }}
                    InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                    required
                    value={formData.valor_total}
                    onChange={e => setFormData(f => ({...f, valor_total: Number(e.target.value)}))}
                    sx={premiumInputStyles}
                />
              </div>
            </Box>

            <Alert 
                icon={<StorefrontOutlined fontSize="inherit" />}
                severity="info" 
                sx={{ mt: 2, borderRadius: '12px', backgroundColor: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', '& .MuiAlert-icon': { color: '#2563EB' } }}
            >
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>Bloqueio de Edição (Regra de Negócio)</Typography>
                Campos de <strong>Origem</strong> e <strong>Cliente</strong> estão bloqueados na edição para manter a integridade dos recebimentos provenientes do Ponto de Venda (PDV).
            </Alert>

            {/* RODAPÉ DO FORMULÁRIO */}
            <Box className="flex flex-col sm:flex-row justify-end gap-3 mt-4 pt-6 border-t border-[#F1F5F9]">
              <Button 
                type="button" 
                variant="outlined" 
                onClick={() => navigate('/financeiro/receber')}
                sx={{ borderColor: '#E2E8F0', color: '#475569', textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 4, py: 1.2, '&:hover': { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' } }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={submitting}
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
                {submitting ? "A guardar..." : "Salvar Alterações"}
              </Button>
            </Box>

          </div>
        </Box>
      </form>
    </Layout>
  );
};

export default EditarRecebimento;