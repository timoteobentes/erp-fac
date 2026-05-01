import React, { useEffect, useState } from "react";
import { Box, Collapse, Typography } from "@mui/material";
import { ConfigProvider } from "antd";
import Layout from "../../../template/Layout";
import { useNavigate } from "react-router-dom";
import { useFormasPagamento } from "../../../modules/Financeiro/FormasPagamento/hooks/useFormasPagamento";
import type { FiltrosFormaPagamento } from "../../../modules/Financeiro/FormasPagamento/services/formasPagamentoService";
import { FormasPagamentoActions } from "../../../modules/Financeiro/FormasPagamento/components/FormasPagamentoActions";
import { FormasPagamentoFilters } from "../../../modules/Financeiro/FormasPagamento/components/FormasPagamentoFilters";
import { TabelaFormasPagamento } from "../../../modules/Financeiro/FormasPagamento/components/TabelaFormasPagamento";
import { listarContasBancariasService } from "../../../modules/Financeiro/ContasBancarias/services/contasBancariasService";
import { toast } from "react-toastify";

interface ContaBancariaOption {
  id: number;
  nome: string;
}

const FormasPagamento: React.FC = () => {
  const navigate = useNavigate();
  const { formasPagamento, isLoading, fetchFormasPagamento, excluirFormaPagamento } = useFormasPagamento();

  const [mounted, setMounted] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosFormaPagamento>({});
  const [pagination] = useState({ pageSize: 12 });
  const [contasBancarias, setContasBancarias] = useState<ContaBancariaOption[]>([]);

  useEffect(() => {
    fetchFormasPagamento();
    const carregarContasBancarias = async () => {
      try {
        const response = await listarContasBancariasService();
        const payload = response?.data && response?.success !== undefined ? response.data : response;
        const dataArray = Array.isArray(payload) ? payload : payload?.dados || payload?.data || [];
        setContasBancarias(dataArray);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Erro ao carregar Contas Bancarias");
      }
    };

    carregarContasBancarias();

    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, [fetchFormasPagamento]);

  const handleBuscar = () => fetchFormasPagamento(filtros);

  const handleLimparFiltros = () => {
    setFiltros({});
    fetchFormasPagamento({});
  };

  const handleSearchSimple = (term: string) => {
    const novosFiltros = { ...filtros, termo: term };
    setFiltros(novosFiltros);
    fetchFormasPagamento(novosFiltros);
  };

  if (isLoading && formasPagamento.length === 0) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[calc(100vh-140px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#F1F5F9] border-t-[#5B21B6]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={`transition-all duration-500 ease-in-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} pb-8`}>
        <div className="flex flex-col mb-8">
          <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ letterSpacing: "-0.02em", mb: 1 }}>
            Formas de Pagamento
          </Typography>
          <Typography variant="body2" color="#64748B">
            Cadastre e mantenha as Formas de Pagamento vinculadas as Contas Bancarias da empresa.
          </Typography>
        </div>

        <Box sx={{ backgroundColor: "#FFFFFF", borderRadius: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", border: "1px solid #E2E8F0", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <Box sx={{ p: 3, borderBottom: "1px solid #F1F5F9", backgroundColor: "#F8FAFC" }}>
            <FormasPagamentoActions
              mounted={mounted}
              onAdd={() => navigate("/financeiro/formas-de-pagamento/novo")}
              onRefresh={() => fetchFormasPagamento(filtros)}
              onToggleFilters={() => setOpenFilters(!openFilters)}
              onSearchSimple={handleSearchSimple}
            />
          </Box>

          <Collapse in={openFilters}>
            <Box sx={{ p: 4, borderBottom: "1px solid #E2E8F0", backgroundColor: "#FFFFFF" }}>
              <FormasPagamentoFilters filtros={filtros} setFiltros={setFiltros} onBuscar={handleBuscar} onLimpar={handleLimparFiltros} contasBancarias={contasBancarias} />
            </Box>
          </Collapse>

          <Box sx={{ p: 4 }}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#64748B] text-xs font-bold uppercase tracking-wider bg-[#F1F5F9] px-3 py-1.5 rounded-md">
                {formasPagamento.length > 0 ? `${formasPagamento.length} formas de pagamento encontradas` : "Nenhuma forma de pagamento encontrada"}
              </span>
            </div>

            <ConfigProvider
              theme={{
                components: {
                  Table: {
                    headerBg: "#F8FAFC",
                    headerColor: "#475569",
                    headerBorderRadius: 8,
                    rowHoverBg: "#F8FAFC",
                    rowSelectedBg: "#F3E8FF",
                    rowSelectedHoverBg: "#E9D5FF",
                    borderColor: "#F1F5F9",
                  },
                  Pagination: { colorPrimary: "#5B21B6", colorPrimaryHover: "#3C0473", itemActiveBg: "#F3E8FF" },
                  Spin: { colorPrimary: "#5B21B6" },
                },
              }}
            >
              <TabelaFormasPagamento
                formasPagamento={formasPagamento}
                isLoading={isLoading}
                onRefresh={() => fetchFormasPagamento(filtros)}
                pagination={pagination}
                onDelete={excluirFormaPagamento}
              />
            </ConfigProvider>
          </Box>
        </Box>
      </div>
    </Layout>
  );
};

export default FormasPagamento;
