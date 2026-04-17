import { Controller } from 'react-hook-form';
import { 
  TextField, Button, CircularProgress, Switch, FormControlLabel, 
  Box, Typography, Divider, IconButton, InputAdornment, Alert
} from '@mui/material';
import { 
  ArrowBack, Check, DescriptionOutlined, MonetizationOnOutlined, ReceiptLongOutlined
} from '@mui/icons-material';
import { useNovoServico } from '../../../../modules/Servicos/Cadastro/Novo/hooks/useNovoServico';
import Layout from "../../../../template/Layout";

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

export default function NovoServico() {
  const { methods, onSubmit, isLoading, voltar } = useNovoServico();
  const { control, formState: { errors } } = methods;

  return (
    <Layout>
      {/* HEADER DE NAVEGAÇÃO PREMIUM */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center gap-4">
          <IconButton 
            onClick={voltar}
            sx={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', color: '#475569', '&:hover': { backgroundColor: '#F8FAFC', color: '#0F172A' } }}
          >
            <ArrowBack />
          </IconButton>
          <div className="flex flex-col">
            <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Novo Serviço
            </Typography>
            <Typography variant="body2" color="#64748B">
                Preencha as informações para adicionar um novo serviço ao catálogo (Base NFS-e).
            </Typography>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="animate-fadeIn">
        {/* CONTAINER PRINCIPAL (Soft UX) */}
        <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", p: { xs: 3, md: 5 } }}>
          
          <div className="flex flex-col gap-10">
            
            {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS */}
            <Box>
              <div className="flex items-center gap-2 mb-6">
                <DescriptionOutlined sx={{ color: '#5B21B6' }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Informações Básicas</Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <Controller
                    name="nome"
                    control={control}
                    render={({ field }) => (
                      <TextField 
                        {...field} 
                        label="Nome do Serviço" 
                        fullWidth 
                        error={!!errors.nome} 
                        helperText={errors.nome?.message}
                        sx={premiumInputStyles}
                      />
                    )}
                  />
                </div>
                <div className="flex items-center md:pl-4">
                  <Controller
                    name="ativo"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <FormControlLabel
                        control={<Switch checked={!!value} onChange={onChange} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#5B21B6' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#5B21B6' } }} />}
                        label={<Typography variant="body2" fontWeight={600} color="#475569">Serviço Ativo</Typography>}
                      />
                    )}
                  />
                </div>
              </div>
            </Box>

            <Divider sx={{ borderColor: '#F1F5F9' }} />

            {/* SEÇÃO 2: VALORES */}
            <Box>
              <div className="flex items-center gap-2 mb-6">
                <MonetizationOnOutlined sx={{ color: '#5B21B6' }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Valores</Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Controller
                  name="valor_padrao"
                  control={control}
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      value={field.value || ''}
                      label="Valor Padrão" 
                      type="number"
                      inputProps={{ step: "0.01" }}
                      fullWidth 
                      error={!!errors.valor_padrao} 
                      helperText={errors.valor_padrao?.message}
                      InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
                      sx={premiumInputStyles}
                    />
                  )}
                />
              </div>
            </Box>

            <Divider sx={{ borderColor: '#F1F5F9' }} />

            {/* SEÇÃO 3: DADOS FISCAIS */}
            <Box>
              <div className="flex items-center gap-2 mb-6">
                <ReceiptLongOutlined sx={{ color: '#5B21B6' }} />
                <Typography variant="h6" fontWeight={700} color="#0F172A">Dados Fiscais (NFS-e)</Typography>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#F8FAFC] p-6 rounded-2xl border border-[#E2E8F0] mb-4">
                <Controller
                  name="codigo_lc116"
                  control={control}
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      label="Cód. LC 116 (Municipal)" 
                      placeholder="Ex: 14.01"
                      fullWidth 
                      error={!!errors.codigo_lc116} 
                      helperText={errors.codigo_lc116?.message || "Obrigatório para emissão"}
                      sx={premiumInputStyles}
                    />
                  )}
                />

                <Controller
                  name="codigo_tributacao_nacional"
                  control={control}
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      value={field.value || ''}
                      label="Cód. Tributação Nacional" 
                      placeholder="Ex: 14.01.01"
                      fullWidth 
                      error={!!errors.codigo_tributacao_nacional} 
                      helperText={errors.codigo_tributacao_nacional?.message || "Padrão exato de 6 dígitos"}
                      sx={premiumInputStyles}
                    />
                  )}
                />

                <Controller
                  name="cnae"
                  control={control}
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      value={field.value || ''}
                      label="CNAE (Opcional)" 
                      fullWidth 
                      error={!!errors.cnae} 
                      helperText={errors.cnae?.message}
                      sx={premiumInputStyles}
                    />
                  )}
                />

                <Controller
                  name="aliquota_iss"
                  control={control}
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      label="Alíquota ISS" 
                      type="number"
                      inputProps={{ step: "0.01" }}
                      fullWidth 
                      error={!!errors.aliquota_iss} 
                      helperText={errors.aliquota_iss?.message}
                      InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                      sx={premiumInputStyles}
                    />
                  )}
                />
              </div>
              <Alert severity="info" sx={{ borderRadius: '12px', backgroundColor: '#EEF2FF', color: '#4338CA', '& .MuiAlert-icon': { color: '#4338CA' } }}>
                O preenchimento rigoroso destes dados evita a rejeição da NFS-e pelas prefeituras.
              </Alert>
            </Box>

            {/* FOOTER ACTIONS */}
            <Box className="flex justify-end gap-3 mt-4 pt-6 border-t border-[#F1F5F9]">
              <Button 
                type="button" 
                variant="outlined" 
                onClick={voltar}
                sx={{ borderColor: '#E2E8F0', color: '#475569', textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 4, '&:hover': { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' } }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={isLoading} 
                startIcon={isLoading ? <CircularProgress size={20} color="inherit"/> : <Check />} 
                sx={{ background: 'linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)', color: 'white', textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 6, boxShadow: '0 4px 14px 0 rgba(91, 33, 182, 0.25)', '&:hover': { background: 'linear-gradient(90deg, #28024D 0%, #4C1D95 100%)', boxShadow: '0 6px 20px rgba(91, 33, 182, 0.3)' } }}
              >
                {isLoading ? "A Guardar..." : "Cadastrar Serviço"}
              </Button>
            </Box>
            
          </div>
        </Box>
      </form>
    </Layout>
  );
}