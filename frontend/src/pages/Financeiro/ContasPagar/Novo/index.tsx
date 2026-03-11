import React, { useEffect } from "react";
import { Card, CardContent, Button, TextField, Divider, IconButton } from "@mui/material";
import Layout from "../../../../template/Layout";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ContaPagarFormData } from "../../../../modules/Financeiro/ContasPagar/schemas/contaPagarSchema";
import { contaPagarSchema } from "../../../../modules/Financeiro/ContasPagar/schemas/contaPagarSchema";
import { criarContaPagarService } from "../../../../modules/Financeiro/ContasPagar/services/contasPagarService";
import { toast } from "react-toastify";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const NovoPagamento: React.FC = () => {
  const navigate = useNavigate();
  
  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = useForm<ContaPagarFormData>({
    resolver: zodResolver(contaPagarSchema) as any,
    defaultValues: {
      valor_bruto: '' as any,
      juros: 0,
      desconto: 0,
      valor_total: 0,
      status: "pendente",
    }
  });

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
      await criarContaPagarService(data);
      toast.success("Conta a pagar cadastrada com sucesso!");
      navigate("/financeiro/pagar");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao cadastrar conta a pagar");
    }
  };

  return (
    <Layout>
      <div className="w-full text-start mb-6 flex items-center gap-2">
        <IconButton onClick={() => navigate("/financeiro/pagar")}>
          <ArrowBackIcon sx={{ color: '#9842F6' }} />
        </IconButton>
        <span className="text-[#9842F6] font-bold text-2xl">Nova Conta a Pagar</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* BLOCO 1: Dados Gerais */}
        <Card sx={{ boxShadow: "none !important", border: "1px solid #E9DEF6", mb: 4 }}>
          <CardContent>
            <h3 className="text-[#6B00A1] font-semibold mb-4 text-lg">Dados gerais</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <TextField 
                  fullWidth label="Descrição do pagamento *" size="small"
                  {...register("descricao")}
                  error={!!errors.descricao} helperText={errors.descricao?.message}
                />
              </div>
              <div className="md:col-span-1">
                <TextField 
                  fullWidth label="Plano de contas (Categoria)" size="small"
                  {...register("categoria_despesa")}
                />
              </div>
              <div className="md:col-span-1">
                <TextField 
                  fullWidth label="Vencimento *" type="date" InputLabelProps={{ shrink: true }} size="small"
                  {...register("data_vencimento")}
                  error={!!errors.data_vencimento} helperText={errors.data_vencimento?.message}
                />
              </div>
              <div className="md:col-span-1">
                <TextField 
                  fullWidth label="Fornecedor (ID temporário)" type="number" size="small"
                  {...register("fornecedor_id", { valueAsNumber: true })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BLOCO 2: Valores */}
        <Card sx={{ boxShadow: "none !important", border: "1px solid #E9DEF6", mb: 4 }}>
          <CardContent>
            <h3 className="text-[#6B00A1] font-semibold mb-4 text-lg">Valores</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div className="md:col-span-1">
                <TextField 
                  fullWidth label="Valor bruto *" type="number" size="small"
                  {...register("valor_bruto", { valueAsNumber: true })}
                  error={!!errors.valor_bruto} helperText={errors.valor_bruto?.message}
                />
              </div>
              <div className="md:col-span-1">
                <TextField 
                  fullWidth label="Juros (+)" type="number" size="small"
                  {...register("juros", { valueAsNumber: true })}
                />
              </div>
              <div className="md:col-span-1">
                <TextField 
                  fullWidth label="Desconto (-)" type="number" size="small"
                  {...register("desconto", { valueAsNumber: true })}
                />
              </div>
              <div className="md:col-span-1">
                <div className="flex flex-col text-[#3C0473]">
                  <span className="text-sm">Total:</span>
                  <span className="text-xl font-bold">R$ {valorCalculado.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BLOCO 3: Outras Informações & Anexos */}
        <Card sx={{ boxShadow: "none !important", border: "1px solid #E9DEF6", mb: 4 }}>
          <CardContent>
            <h3 className="text-[#6B00A1] font-semibold mb-4 text-lg">Outras informações</h3>
            <div className="grid grid-cols-1 mb-4">
              <TextField 
                fullWidth label="Observações" multiline rows={3} size="small"
                {...register("observacao")}
              />
            </div>

            <Divider sx={{ mb: 4 }} />

            <h3 className="text-[#6B00A1] font-semibold mb-4 text-lg">Anexos</h3>
            <div>
              <Button component="label" variant="contained" sx={{ bgcolor: '#6B00A1', '&:hover': { bgcolor: '#3C0473' } }}>
                Selecionar Arquivo
                <input type="file" hidden />
              </Button>
              <p className="text-xs text-[#9842F6] mt-2">*Utilize este espaço para anexar arquivos e documentos. Tamanho máximo 5Mb.</p>
            </div>
          </CardContent>
        </Card>

        {/* RODAPÉ DO FORMULÁRIO */}
        <div className="flex gap-4">
          <Button 
            type="submit" variant="contained" 
            disabled={isSubmitting}
            sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
          >
            Cadastrar
          </Button>
          <Button 
            variant="contained" 
            sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f' } }}
            onClick={() => navigate('/financeiro/pagar')}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Layout>
  );
};

export default NovoPagamento;
