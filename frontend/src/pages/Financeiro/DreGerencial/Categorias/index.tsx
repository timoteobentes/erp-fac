import React, { useEffect, useState } from "react";
import { Box, Collapse, Typography } from "@mui/material";
import { ConfigProvider } from "antd";
import Layout from "../../../../template/Layout";
import { useNavigate } from "react-router-dom";
import { useCategoriasDre } from "../../../../modules/Financeiro/DreGerencial/hooks/useCategoriasDre";
import type { FiltrosCategoriaDre } from "../../../../modules/Financeiro/DreGerencial/services/categoriasDreService";
import { CategoriasDreActions } from "../../../../modules/Financeiro/DreGerencial/components/CategoriasDreActions";
import { CategoriasDreFilters } from "../../../../modules/Financeiro/DreGerencial/components/CategoriasDreFilters";
import { TabelaCategoriasDre } from "../../../../modules/Financeiro/DreGerencial/components/TabelaCategoriasDre";

const CategoriasDre: React.FC = () => {
  const navigate = useNavigate();
  const { categoriasDre, isLoading, fetchCategoriasDre, excluirCategoriaDre } = useCategoriasDre();

  const [mounted, setMounted] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosCategoriaDre>({});
  const [pagination] = useState({ pageSize: 12 });

  useEffect(() => {
    fetchCategoriasDre();
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, [fetchCategoriasDre]);

  const handleBuscar = () => fetchCategoriasDre(filtros);

  const handleLimparFiltros = () => {
    setFiltros({});
    fetchCategoriasDre({});
  };

  const handleSearchSimple = (term: string) => {
    const novosFiltros = { ...filtros, termo: term };
    setFiltros(novosFiltros);
    fetchCategoriasDre(novosFiltros);
  };

  if (isLoading && categoriasDre.length === 0) {
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
            Categorias DRE
          </Typography>
          <Typography variant="body2" color="#64748B">
            Configure as categorias usadas na composicao do DRE Gerencial.
          </Typography>
        </div>

        <Box sx={{ backgroundColor: "#FFFFFF", borderRadius: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", border: "1px solid #E2E8F0", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <Box sx={{ p: 3, borderBottom: "1px solid #F1F5F9", backgroundColor: "#F8FAFC" }}>
            <CategoriasDreActions
              mounted={mounted}
              onAdd={() => navigate("/financeiro/dre-gerencial/categorias/novo")}
              onRefresh={() => fetchCategoriasDre(filtros)}
              onToggleFilters={() => setOpenFilters(!openFilters)}
              onSearchSimple={handleSearchSimple}
            />
          </Box>

          <Collapse in={openFilters}>
            <Box sx={{ p: 4, borderBottom: "1px solid #E2E8F0", backgroundColor: "#FFFFFF" }}>
              <CategoriasDreFilters filtros={filtros} setFiltros={setFiltros} onBuscar={handleBuscar} onLimpar={handleLimparFiltros} />
            </Box>
          </Collapse>

          <Box sx={{ p: 4 }}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#64748B] text-xs font-bold uppercase tracking-wider bg-[#F1F5F9] px-3 py-1.5 rounded-md">
                {categoriasDre.length > 0 ? `${categoriasDre.length} categorias DRE encontradas` : "Nenhuma Categoria DRE encontrada"}
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
              <TabelaCategoriasDre
                categoriasDre={categoriasDre}
                isLoading={isLoading}
                onRefresh={() => fetchCategoriasDre(filtros)}
                pagination={pagination}
                onDelete={excluirCategoriaDre}
              />
            </ConfigProvider>
          </Box>
        </Box>
      </div>
    </Layout>
  );
};

export default CategoriasDre;
