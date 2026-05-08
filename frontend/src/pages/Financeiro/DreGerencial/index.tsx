import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Collapse,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import {
  KeyboardArrowDown,
  MoreHoriz,
  PrintOutlined,
  Refresh,
  SettingsOutlined,
  Tune,
} from "@mui/icons-material";
import { ConfigProvider, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import Layout from "../../../template/Layout";
import { useNavigate } from "react-router-dom";
import { useDreGerencial } from "../../../modules/Financeiro/DreGerencial/hooks/useDreGerencial";
import type {
  DreGerencialFiltros,
  DreGerencialLinha,
} from "../../../modules/Financeiro/DreGerencial/services/dreGerencialService";
import { premiumInputStyles } from "../../../modules/Financeiro/DreGerencial/constants/categoriaDreOptions";

const formatCurrency = (value: number | string) =>
  Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDefaultFilters = (): DreGerencialFiltros => {
  const hoje = new Date();
  return {
    data_inicial: toInputDate(new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1)),
    data_final: toInputDate(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)),
  };
};

const DreGerencial: React.FC = () => {
  const navigate = useNavigate();
  const { dreGerencial, isLoading, fetchDreGerencial, exportarDreGerencial } = useDreGerencial();

  const [mounted, setMounted] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [filtros, setFiltros] = useState<DreGerencialFiltros>(getDefaultFilters);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    fetchDreGerencial(filtros);
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, [fetchDreGerencial]);

  const columns = useMemo<ColumnsType<DreGerencialLinha>>(() => {
    const dynamicColumns = (dreGerencial?.meses || []).map((mes) => ({
      title: mes.label,
      dataIndex: mes.key,
      key: mes.key,
      align: "center" as const,
      width: 140,
      render: (value: number) => <span className="font-medium text-[#0F172A]">{formatCurrency(value)}</span>,
    }));

    return [
      {
        title: "Categorias",
        dataIndex: "categoria",
        key: "categoria",
        fixed: "left" as const,
        width: 360,
        render: (_: string, record: DreGerencialLinha) => {
          const isChild = record.tipoLinha === "linha-filha";
          const isTotal = record.tipoLinha === "totalizador";
          return (
            <div className={`flex items-center gap-2 ${isChild ? "pl-5" : ""}`}>
              {isTotal ? <span className="font-black text-[#2563EB]">=</span> : null}
              <span className={`${isChild ? "font-medium text-[#334155]" : "font-bold text-[#0F172A]"}`}>
                {record.categoria}
              </span>
            </div>
          );
        },
      },
      ...dynamicColumns,
      {
        title: "Total",
        dataIndex: "total",
        key: "total",
        align: "center" as const,
        width: 150,
        render: (value: number) => <span className="font-bold text-[#0F172A]">{formatCurrency(value)}</span>,
      },
    ];
  }, [dreGerencial]);

  const handleBuscar = () => fetchDreGerencial(filtros);

  const handleLimparFiltros = () => {
    const defaults = getDefaultFilters();
    setFiltros(defaults);
    fetchDreGerencial(defaults);
  };

  const handlePrint = () => {
    window.print();
    setMenuAnchor(null);
  };

  const handleExport = (formato: "csv" | "xlsx") => {
    exportarDreGerencial(formato, filtros);
    setMenuAnchor(null);
  };

  if (isLoading && !dreGerencial) {
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
      <style>{`
        .dre-row-receita > td { background: #ecfdf5 !important; }
        .dre-row-despesa > td { background: #fff1f2 !important; }
        .dre-row-totalizador > td { background: #eff6ff !important; }
        .dre-row-neutro > td { background: #f8fafc !important; }
        @media print {
          button, .MuiIconButton-root, .MuiTabs-root, .no-print { display: none !important; }
        }
      `}</style>

      <div className={`transition-all duration-500 ease-in-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} pb-8`}>
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex flex-col">
              <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ letterSpacing: "-0.02em", mb: 1 }}>
                DRE Gerencial
              </Typography>
              <Typography variant="body2" color="#64748B">
                Demonstrativo gerencial com estrutura hierarquica pronta para evolucao futura dos calculos financeiros.
              </Typography>
            </div>

            <div className="flex flex-wrap gap-2 no-print">
              <Button variant="contained" startIcon={<SettingsOutlined />} onClick={() => navigate("/financeiro/dre-gerencial/categorias")} sx={{ background: "linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)", textTransform: "none", fontWeight: 700 }}>
                Configurar DRE
              </Button>
              <Button variant="outlined" startIcon={<MoreHoriz />} endIcon={<KeyboardArrowDown />} onClick={(event) => setMenuAnchor(event.currentTarget)} sx={{ textTransform: "none", fontWeight: 700, borderColor: "#E2E8F0", color: "#475569" }}>
                Mais opcoes
              </Button>
              <Button variant="contained" startIcon={<Tune />} onClick={() => setOpenFilters(!openFilters)} sx={{ bgcolor: "#6B00A1", "&:hover": { bgcolor: "#3C0473" }, textTransform: "none", fontWeight: 700 }}>
                Busca avancada
              </Button>
            </div>
          </div>

          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
            <MenuItem onClick={handlePrint}>
              <PrintOutlined fontSize="small" sx={{ mr: 1 }} /> Imprimir
            </MenuItem>
            <MenuItem onClick={() => handleExport("xlsx")}>Exportar Excel</MenuItem>
            <MenuItem onClick={() => handleExport("csv")}>Exportar CSV</MenuItem>
          </Menu>

          <Collapse in={openFilters}>
            <Box sx={{ backgroundColor: "#FFFFFF", borderRadius: "24px", border: "1px solid #E2E8F0", p: 4 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  label="Data inicial"
                  value={filtros.data_inicial || ""}
                  onChange={(event) => setFiltros((prev) => ({ ...prev, data_inicial: event.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  sx={premiumInputStyles}
                />
                <TextField
                  fullWidth
                  type="date"
                  size="small"
                  label="Data final"
                  value={filtros.data_final || ""}
                  onChange={(event) => setFiltros((prev) => ({ ...prev, data_final: event.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  sx={premiumInputStyles}
                />
              </div>
              <div className="mt-4 flex gap-3 justify-end border-t border-[#F1F5F9] pt-4">
                <Button variant="outlined" onClick={handleLimparFiltros} sx={{ borderColor: "#E2E8F0", color: "#64748B", textTransform: "none", fontWeight: 600 }}>
                  Limpar Filtros
                </Button>
                <Button variant="contained" startIcon={<Refresh />} onClick={handleBuscar} sx={{ background: "linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)", textTransform: "none", fontWeight: 700 }}>
                  Aplicar Filtros
                </Button>
              </div>
            </Box>
          </Collapse>
        </div>

        <Box sx={{ backgroundColor: "#FFFFFF", borderRadius: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <Box sx={{ p: 3, borderBottom: "1px solid #F1F5F9", backgroundColor: "#F8FAFC" }}>
            <Typography variant="subtitle2" color="#475569" fontWeight={700}>
              Periodo analisado: {dreGerencial?.periodo.dataInicial || "-"} ate {dreGerencial?.periodo.dataFinal || "-"}
            </Typography>
          </Box>

          <Box sx={{ p: 4 }}>
            <ConfigProvider
              theme={{
                components: {
                  Table: {
                    headerBg: "#F8FAFC",
                    headerColor: "#475569",
                    headerBorderRadius: 8,
                    rowHoverBg: "#F8FAFC",
                    borderColor: "#E2E8F0",
                  },
                },
              }}
            >
              <Table
                dataSource={dreGerencial?.linhas || []}
                columns={columns}
                rowKey="key"
                loading={isLoading}
                pagination={false}
                bordered
                expandable={{ defaultExpandAllRows: true }}
                scroll={{ x: "max-content" }}
                rowClassName={(record) => {
                  if (record.tipoLinha === "receita") return "dre-row-receita";
                  if (record.tipoLinha === "despesa") return "dre-row-despesa";
                  if (record.tipoLinha === "totalizador") return "dre-row-totalizador";
                  return "dre-row-neutro";
                }}
              />
            </ConfigProvider>
          </Box>
        </Box>
      </div>
    </Layout>
  );
};

export default DreGerencial;
