import { Controller } from 'react-hook-form';
import { TextField, Button, CircularProgress, Switch, FormControlLabel, Card, CardContent } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useEditarServico } from '../../../../modules/Servicos/Cadastro/Editar/hooks/useEditarServico';
import Layout from "../../../../template/Layout";

export default function EditarServico() {
  const { methods, onSubmit, isLoading, isFetching, voltar } = useEditarServico();
  const { control, formState: { errors } } = methods;

  if (isFetching) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full p-20">
          <CircularProgress />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="transition-opacity duration-500 opacity-100">
        <div className="flex justify-between items-center mb-6">
          <div className="w-full text-start">
            <h1 className="text-[#9842F6] font-bold text-2xl">Editar Serviço</h1>
          </div>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={voltar}>
            Voltar
          </Button>
        </div>

        <Card sx={{ boxShadow: "none !important", borderRadius: "4px", border: "1px solid #E9DEF6" }}>
          <CardContent>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    />
                  )}
                />

                <Controller
                  name="codigo_lc116"
                  control={control}
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      label="Código LC 116 (Municipal)" 
                      placeholder="Ex: 14.01"
                      fullWidth 
                      error={!!errors.codigo_lc116} 
                      helperText={errors.codigo_lc116?.message || "Obrigatório Genérico"} 
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
                      label="Cód. Tributação Nacional (NFS-e)" 
                      placeholder="Ex: 14.01.01"
                      fullWidth 
                      error={!!errors.codigo_tributacao_nacional} 
                      helperText={errors.codigo_tributacao_nacional?.message || "Padrão Nacional exato de 6 dígitos"} 
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
                    />
                  )}
                />

                <Controller
                  name="aliquota_iss"
                  control={control}
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      label="Alíquota ISS (%)" 
                      type="number"
                      inputProps={{ step: "0.01" }}
                      fullWidth 
                      error={!!errors.aliquota_iss} 
                      helperText={errors.aliquota_iss?.message} 
                    />
                  )}
                />

                <Controller
                  name="valor_padrao"
                  control={control}
                  render={({ field }) => (
                    <TextField 
                      {...field} 
                      value={field.value || ''}
                      label="Valor Padrão (R$)" 
                      type="number"
                      inputProps={{ step: "0.01" }}
                      fullWidth 
                      error={!!errors.valor_padrao} 
                      helperText={errors.valor_padrao?.message} 
                    />
                  )}
                />

                <Controller
                  name="ativo"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <FormControlLabel
                      control={<Switch checked={!!value} onChange={onChange} color="primary" />}
                      label="Serviço Ativo"
                      className="mt-2"
                    />
                  )}
                />
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  disabled={isLoading}
                  sx={{ backgroundColor: '#9842F6', textTransform: 'none', '&:hover': { backgroundColor: '#7E2EDF' } }}
                >
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
