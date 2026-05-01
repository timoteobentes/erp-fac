import React, { useEffect, useState } from "react";
import { ArrowBack, EditOutlined, InfoOutlined } from "@mui/icons-material";
import { Box, Button, IconButton, Skeleton, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../../../../template/Layout";
import { buscarContaBancariaPorIdService } from "../../../../modules/Financeiro/ContasBancarias/services/contasBancariasService";

interface ContaBancariaDetalhe {
  id: number;
  nome: string;
  saldo_inicial: number | string;
  data_saldo: string;
}

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  return date.toLocaleDateString("pt-BR");
};

const VisualizarContaBancaria: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contaBancaria, setContaBancaria] = useState<ContaBancariaDetalhe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContaBancaria = async () => {
      try {
        if (!id) return;
        const data = await buscarContaBancariaPorIdService(id);
        setContaBancaria(data);
      } catch {
        toast.error("Erro ao carregar os dados da Conta Bancaria");
        navigate("/financeiro/contas-bancarias");
      } finally {
        setLoading(false);
      }
    };

    fetchContaBancaria();
  }, [id, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton variant="circular" width={48} height={48} />
            <div>
              <Skeleton variant="text" width={220} height={40} />
              <Skeleton variant="text" width={300} height={20} />
            </div>
          </div>
          <Skeleton variant="rounded" width={140} height={42} sx={{ borderRadius: "8px" }} />
        </div>
        <Skeleton variant="rounded" width="100%" height={300} sx={{ borderRadius: "24px" }} />
      </Layout>
    );
  }

  if (!contaBancaria) {
    return <Layout><div className="p-8 text-center text-[#64748B]">Conta Bancaria nao encontrada.</div></Layout>;
  }

  return (
    <Layout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center gap-4">
          <IconButton onClick={() => navigate("/financeiro/contas-bancarias")} sx={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", color: "#475569", "&:hover": { backgroundColor: "#F8FAFC", color: "#0F172A" } }}>
            <ArrowBack />
          </IconButton>
          <div className="flex flex-col">
            <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              {contaBancaria.nome}
            </Typography>
            <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
              Codigo <strong className="text-[#3C0473]">#{contaBancaria.id.toString().padStart(4, "0")}</strong> - visualizacao do cadastro.
            </Typography>
          </div>
        </div>

        <Button variant="outlined" startIcon={<EditOutlined />} onClick={() => navigate(`/financeiro/contas-bancarias/editar/${contaBancaria.id}`)} sx={{ borderColor: "#E2E8F0", color: "#0F172A", fontWeight: 600, textTransform: "none", borderRadius: "8px", px: 3, py: 1, backgroundColor: "#FFFFFF", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", "&:hover": { borderColor: "#5B21B6", backgroundColor: "#F8FAFC", color: "#5B21B6" } }}>
          Editar Conta Bancaria
        </Button>
      </div>

      <Box sx={{ backgroundColor: "#FFFFFF", borderRadius: "24px", border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", p: { xs: 3, md: 5 } }}>
        <div className="flex items-center gap-2 mb-6">
          <InfoOutlined sx={{ color: "#5B21B6" }} />
          <Typography variant="h6" fontWeight={700} color="#0F172A">
            Informacoes Gerais
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#F1F5F9]">
            <Typography variant="caption" fontWeight={600} color="#64748B" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Nome
            </Typography>
            <Typography variant="body1" fontWeight={600} color="#0F172A" mt={0.5}>
              {contaBancaria.nome}
            </Typography>
          </div>

          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#F1F5F9]">
            <Typography variant="caption" fontWeight={600} color="#64748B" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Saldo inicial
            </Typography>
            <Typography variant="body1" fontWeight={600} color="#0F172A" mt={0.5}>
              {formatCurrency(contaBancaria.saldo_inicial)}
            </Typography>
          </div>

          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#F1F5F9]">
            <Typography variant="caption" fontWeight={600} color="#64748B" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Data do saldo
            </Typography>
            <Typography variant="body1" fontWeight={600} color="#0F172A" mt={0.5}>
              {formatDate(contaBancaria.data_saldo)}
            </Typography>
          </div>
        </div>
      </Box>
    </Layout>
  );
};

export default VisualizarContaBancaria;
