import React, { useEffect, useState } from "react";
import { ArrowBack, EditOutlined, InfoOutlined } from "@mui/icons-material";
import { Box, Button, IconButton, Skeleton, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Layout from "../../../../template/Layout";
import { buscarCentroCustoPorIdService } from "../../../../modules/Financeiro/CentroCustos/services/centroCustosService";

interface CentroCustoDetalhe {
  id: number;
  nome: string;
  status: "ATIVO" | "INATIVO";
}

const VisualizarCentroCusto: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [centroCusto, setCentroCusto] = useState<CentroCustoDetalhe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCentroCusto = async () => {
      try {
        if (!id) return;
        const data = await buscarCentroCustoPorIdService(id);
        setCentroCusto(data);
      } catch {
        toast.error("Erro ao carregar os dados do Centro de Custo");
        navigate("/financeiro/centro-custos");
      } finally {
        setLoading(false);
      }
    };

    fetchCentroCusto();
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

  if (!centroCusto) {
    return <Layout><div className="p-8 text-center text-[#64748B]">Centro de Custo nao encontrado.</div></Layout>;
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
              {centroCusto.nome}
            </Typography>
            <Typography variant="body2" color="#64748B" sx={{ mt: 0.5 }}>
              Codigo <strong className="text-[#3C0473]">#{centroCusto.id.toString().padStart(4, "0")}</strong> - visualizacao do cadastro.
            </Typography>
          </div>
        </div>

        <Button variant="outlined" startIcon={<EditOutlined />} onClick={() => navigate(`/financeiro/centro-custos/editar/${centroCusto.id}`)} sx={{ borderColor: "#E2E8F0", color: "#0F172A", fontWeight: 600, textTransform: "none", borderRadius: "8px", px: 3, py: 1, backgroundColor: "#FFFFFF", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", "&:hover": { borderColor: "#5B21B6", backgroundColor: "#F8FAFC", color: "#5B21B6" } }}>
          Editar Centro de Custo
        </Button>
      </div>

      <Box sx={{ backgroundColor: "#FFFFFF", borderRadius: "24px", border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", p: { xs: 3, md: 5 } }}>
        <div className="flex items-center gap-2 mb-6">
          <InfoOutlined sx={{ color: "#5B21B6" }} />
          <Typography variant="h6" fontWeight={700} color="#0F172A">
            Informacoes Gerais
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#F1F5F9]">
            <Typography variant="caption" fontWeight={600} color="#64748B" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Nome
            </Typography>
            <Typography variant="body1" fontWeight={600} color="#0F172A" mt={0.5}>
              {centroCusto.nome}
            </Typography>
          </div>

          <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#F1F5F9]">
            <Typography variant="caption" fontWeight={600} color="#64748B" sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Status
            </Typography>
            <Typography variant="body1" fontWeight={600} color="#0F172A" mt={0.5}>
              {centroCusto.status === "ATIVO" ? "Ativo" : "Inativo"}
            </Typography>
          </div>
        </div>
      </Box>
    </Layout>
  );
};

export default VisualizarCentroCusto;
