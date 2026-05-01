import React, { useEffect, useState } from "react";
import { ArrowBack, EditOutlined, InfoOutlined, MonetizationOnOutlined, ReceiptLongOutlined, TuneOutlined } from "@mui/icons-material";
import { Box, Button, IconButton, Skeleton, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../../../../template/Layout";
import { buscarFormaPagamentoPorIdService } from "../../../../modules/Financeiro/FormasPagamento/services/formasPagamentoService";
import { formatCurrency, formatPercent } from "../../../../modules/Financeiro/FormasPagamento/utils/formatters";
import { getConfirmacaoAutomaticaLabel, getDisponivelEmLabel, getModalidadeLabel } from "../../../../modules/Financeiro/FormasPagamento/constants/formaPagamentoOptions";

interface FormaPagamentoDetalhe {
  id: number;
  nome: string;
  conta_bancaria_nome?: string;
  disponivel_em: string;
  confirmacao_automatica: string;
  numero_maximo_parcelas: number;
  intervalo_parcelas_dias: number;
  primeira_parcela_dias: number;
  taxa_banco: number | string;
  taxa_operadora: number | string;
  juros_multa: number | string;
  juros_mora: number | string;
  modalidade: string;
}

const cardClass = "bg-[#F8FAFC] p-4 rounded-xl border border-[#F1F5F9]";

const VisualizarFormaPagamento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoDetalhe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFormaPagamento = async () => {
      try {
        if (!id) return;
        const data = await buscarFormaPagamentoPorIdService(id);
        setFormaPagamento(data);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Erro ao carregar os dados da Forma de Pagamento");
        navigate("/financeiro/formas-de-pagamento");
      } finally {
        setLoading(false);
      }
    };

    fetchFormaPagamento();
  }, [id, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton variant="circular" width={48} height={48} />
            <div>
              <Skeleton variant="text" width={260} height={40} />
              <Skeleton variant="text" width={320} height={20} />
            </div>
          </div>
          <Skeleton variant="rounded" width={180} height={42} sx={{ borderRadius: "8px" }} />
        </div>
        <Skeleton variant="rounded" width="100%" height={540} sx={{ borderRadius: "24px" }} />
      </Layout>
    );
  }

  if (!formaPagamento) {
    return <Layout><div className="p-8 text-center text-[#64748B]">Forma de Pagamento nao encontrada.</div></Layout>;
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
              {formaPagamento.nome}
            </Typography>
            <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
              Codigo <strong className="text-[#3C0473]">#{formaPagamento.id.toString().padStart(4, "0")}</strong> - visualizacao do cadastro.
            </Typography>
          </div>
        </div>

        <Button variant="outlined" startIcon={<EditOutlined />} onClick={() => navigate(`/financeiro/formas-de-pagamento/editar/${formaPagamento.id}`)} sx={{ borderColor: "#E2E8F0", color: "#0F172A", fontWeight: 600, textTransform: "none", borderRadius: "8px", px: 3, py: 1, backgroundColor: "#FFFFFF", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", "&:hover": { borderColor: "#5B21B6", backgroundColor: "#F8FAFC", color: "#5B21B6" } }}>
          Editar Forma de Pagamento
        </Button>
      </div>

      <Box sx={{ backgroundColor: "#FFFFFF", borderRadius: "24px", border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", p: { xs: 3, md: 5 } }}>
        <div className="flex flex-col gap-10">
          <Box>
            <div className="flex items-center gap-2 mb-6">
              <InfoOutlined sx={{ color: "#5B21B6" }} />
              <Typography variant="h6" fontWeight={700} color="#0F172A">Dados Gerais</Typography>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className={cardClass}><Typography variant="caption" fontWeight={600} color="#64748B" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Nome</Typography><Typography variant="body1" fontWeight={600} color="#0F172A" mt={0.5}>{formaPagamento.nome}</Typography></div>
              <div className={cardClass}><Typography variant="caption" fontWeight={600} color="#64748B" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Conta bancaria</Typography><Typography variant="body1" fontWeight={600} color="#0F172A" mt={0.5}>{formaPagamento.conta_bancaria_nome || "-"}</Typography></div>
              <div className={cardClass}><Typography variant="caption" fontWeight={600} color="#64748B" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Disponivel em</Typography><Typography variant="body1" fontWeight={600} color="#0F172A" mt={0.5}>{getDisponivelEmLabel(formaPagamento.disponivel_em)}</Typography></div>
              <div className={cardClass}><Typography variant="caption" fontWeight={600} color="#64748B" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Confirmacao automatica</Typography><Typography variant="body1" fontWeight={600} color="#0F172A" mt={0.5}>{getConfirmacaoAutomaticaLabel(formaPagamento.confirmacao_automatica)}</Typography></div>
            </div>
          </Box>

          <Box>
            <div className="flex items-center gap-2 mb-6">
              <ReceiptLongOutlined sx={{ color: "#5B21B6" }} />
              <Typography variant="h6" fontWeight={700} color="#0F172A">Parcelamento</Typography>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={cardClass}><Typography variant="caption" fontWeight={600} color="#64748B" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Nº maximo de parcelas</Typography><Typography variant="body1" fontWeight={600} color="#0F172A" mt={0.5}>{formaPagamento.numero_maximo_parcelas}</Typography></div>
              <div className={cardClass}><Typography variant="caption" fontWeight={600} color="#64748B" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Intervalo parcelas</Typography><Typography variant="body1" fontWeight={600} color="#0F172A" mt={0.5}>{formaPagamento.intervalo_parcelas_dias} dias</Typography></div>
              <div className={cardClass}><Typography variant="caption" fontWeight={600} color="#64748B" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>1ª parcela</Typography><Typography variant="body1" fontWeight={600} color="#0F172A" mt={0.5}>{formaPagamento.primeira_parcela_dias} dias</Typography></div>
            </div>
          </Box>

          <Box>
            <div className="flex items-center gap-2 mb-6">
              <MonetizationOnOutlined sx={{ color: "#5B21B6" }} />
              <Typography variant="h6" fontWeight={700} color="#0F172A">Taxas</Typography>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className={cardClass}><Typography variant="caption" fontWeight={600} color="#64748B" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Taxa do banco</Typography><Typography variant="body1" fontWeight={600} color="#0F172A" mt={0.5}>{formatCurrency(formaPagamento.taxa_banco)}</Typography></div>
              <div className={cardClass}><Typography variant="caption" fontWeight={600} color="#64748B" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Taxa da operadora</Typography><Typography variant="body1" fontWeight={600} color="#0F172A" mt={0.5}>{formatPercent(formaPagamento.taxa_operadora)}</Typography></div>
              <div className={cardClass}><Typography variant="caption" fontWeight={600} color="#64748B" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Juros de multa</Typography><Typography variant="body1" fontWeight={600} color="#0F172A" mt={0.5}>{formatPercent(formaPagamento.juros_multa)}</Typography></div>
              <div className={cardClass}><Typography variant="caption" fontWeight={600} color="#64748B" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Juros de mora</Typography><Typography variant="body1" fontWeight={600} color="#0F172A" mt={0.5}>{formatPercent(formaPagamento.juros_mora)}</Typography></div>
            </div>
          </Box>

          <Box>
            <div className="flex items-center gap-2 mb-6">
              <TuneOutlined sx={{ color: "#5B21B6" }} />
              <Typography variant="h6" fontWeight={700} color="#0F172A">Modalidade</Typography>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={cardClass}><Typography variant="caption" fontWeight={600} color="#64748B" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Modalidade</Typography><Typography variant="body1" fontWeight={600} color="#0F172A" mt={0.5}>{getModalidadeLabel(formaPagamento.modalidade)}</Typography></div>
            </div>
          </Box>
        </div>
      </Box>
    </Layout>
  );
};

export default VisualizarFormaPagamento;
