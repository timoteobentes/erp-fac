import React, { useEffect, useState } from "react";
import { Box, Collapse, Typography } from "@mui/material";
import { ConfigProvider } from "antd";
import Layout from "../../../template/Layout";
import { useNavigate } from "react-router-dom";
import { useContasBancarias } from "../../../modules/Financeiro/ContasBancarias/hooks/useContasBancarias";
import type { FiltrosContaBancaria } from "../../../modules/Financeiro/ContasBancarias/services/contasBancariasService";
import { ContasBancariasActions } from "../../../modules/Financeiro/ContasBancarias/components/ContasBancariasActions";
import { ContasBancariasFilters } from "../../../modules/Financeiro/ContasBancarias/components/ContasBancariasFilters";
import { TabelaContasBancarias } from "../../../modules/Financeiro/ContasBancarias/components/TabelaContasBancarias";

const ContasBancarias: React.FC = () => {
  const navigate = useNavigate();
  const { contasBancarias, isLoading, fetchContasBancarias, excluirContaBancaria } = useContasBancarias();

  const [mounted, setMounted] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosContaBancaria>({});
  const [pagination] = useState({ pageSize: 12 });

  useEffect(() => {
    fetchContasBancarias();
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, [fetchContasBancarias]);

  const handleBuscar = () => fetchContasBancarias(filtros);

  const handleLimparFiltros = () => {
    setFiltros({});
    fetchContasBancarias({});
  };

  const handleSearchSimple = (term: string) => {
    const novosFiltros = { ...filtros, termo: term };
    setFiltros(novosFiltros);
    fetchContasBancarias(novosFiltros);
  };

  if (isLoading && contasBancarias.length === 0) {
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
            Contas Bancarias
          </Typography>
          <Typography variant="body2" color="#64748B">
            Cadastre e mantenha as Contas Bancarias da empresa para controlar saldos iniciais.
          </Typography>
        </div>

        <Box sx={{ backgroundColor: "#FFFFFF", borderRadius: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", border: "1px solid #E2E8F0", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <Box sx={{ p: 3, borderBottom: "1px solid #F1F5F9", backgroundColor: "#F8FAFC" }}>
            <ContasBancariasActions
              mounted={mounted}
              onAdd={() => navigate("/financeiro/contas-bancarias/novo")}
              onRefresh={() => fetchContasBancarias(filtros)}
              onToggleFilters={() => setOpenFilters(!openFilters)}
              onSearchSimple={handleSearchSimple}
            />
          </Box>

          <Collapse in={openFilters}>
            <Box sx={{ p: 4, borderBottom: "1px solid #E2E8F0", backgroundColor: "#FFFFFF" }}>
              <ContasBancariasFilters filtros={filtros} setFiltros={setFiltros} onBuscar={handleBuscar} onLimpar={handleLimparFiltros} />
            </Box>
          </Collapse>

          <Box sx={{ p: 4 }}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#64748B] text-xs font-bold uppercase tracking-wider bg-[#F1F5F9] px-3 py-1.5 rounded-md">
                {contasBancarias.length > 0 ? `${contasBancarias.length} contas bancarias encontradas` : "Nenhuma conta bancaria encontrada"}
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
              <TabelaContasBancarias
                contasBancarias={contasBancarias}
                isLoading={isLoading}
                onRefresh={() => fetchContasBancarias(filtros)}
                pagination={pagination}
                onDelete={excluirContaBancaria}
              />
            </ConfigProvider>
          </Box>
        </Box>
      </div>
    </Layout>
  );
};

export default ContasBancarias;
