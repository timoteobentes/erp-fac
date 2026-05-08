import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { ConfigProvider, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  DownloadOutlined,
  PaidOutlined,
  ReceiptLongOutlined,
  ShowChartOutlined,
} from "@mui/icons-material";
import Layout from "../../../template/Layout";
import { useFluxoCaixa } from "../../../modules/Financeiro/FluxoCaixa/hooks/useFluxoCaixa";
import type {
  FluxoCaixaDemonstrativo,
  FluxoCaixaFiltros,
  FluxoCaixaMovimento,
} from "../../../modules/Financeiro/FluxoCaixa/services/fluxoCaixaService";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);

const formatPercent = (value: number) =>
  `${Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
};

const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDefaultFilters = (): FluxoCaixaFiltros => {
  const hoje = new Date();
  return {
    data_inicio: toInputDate(new Date(hoje.getFullYear(), hoje.getMonth(), 1)),
    data_fim: toInputDate(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)),
  };
};

const summaryCardSx = {
  backgroundColor: "#FFFFFF",
  borderRadius: "20px",
  border: "1px solid #E2E8F0",
  p: 3,
  minHeight: "140px",
  boxShadow: "0 4px 20px rgba(15,23,42,0.04)",
};

const TabPanel = ({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) => (
  <div hidden={value !== index}>
    {value === index ? <Box sx={{ pt: 4 }}>{children}</Box> : null}
  </div>
);

const StatusChip = ({ label }: { label: string }) => {
  const palette: Record<string, { color: string; bg: string }> = {
    recebido: { color: "#047857", bg: "#ECFDF5" },
    pago: { color: "#047857", bg: "#ECFDF5" },
    pendente: { color: "#B45309", bg: "#FFFBEB" },
    atrasado: { color: "#B91C1C", bg: "#FEF2F2" },
    cancelado: { color: "#475569", bg: "#F1F5F9" },
  };

  const styles = palette[label] || { color: "#334155", bg: "#F8FAFC" };

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        textTransform: "capitalize",
        fontWeight: 700,
        color: styles.color,
        backgroundColor: styles.bg,
      }}
    />
  );
};

const FluxoCaixa: React.FC = () => {
  const { fluxoCaixa, isLoading, fetchFluxoCaixa, exportarFluxoCaixa } = useFluxoCaixa();
  const [mounted, setMounted] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [filtros, setFiltros] = useState<FluxoCaixaFiltros>(getDefaultFilters);

  useEffect(() => {
    fetchFluxoCaixa(filtros);
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, [fetchFluxoCaixa]);

  const handleBuscar = () => fetchFluxoCaixa(filtros);

  const movimentosColumns = useMemo<ColumnsType<FluxoCaixaMovimento>>(
    () => [
      { title: "Data", dataIndex: "data_movimento", key: "data_movimento", render: (value) => formatDate(value), width: 110 },
      {
        title: "Tipo",
        dataIndex: "tipo",
        key: "tipo",
        render: (value) => (
          <Chip
            label={value === "RECEBIMENTO" ? "Recebimento" : "Pagamento"}
            size="small"
            sx={{
              fontWeight: 700,
              color: value === "RECEBIMENTO" ? "#0369A1" : "#B91C1C",
              backgroundColor: value === "RECEBIMENTO" ? "#E0F2FE" : "#FEF2F2",
            }}
          />
        ),
        width: 140,
      },
      {
        title: "Origem",
        dataIndex: "origem",
        key: "origem",
        render: (value) => (
          <Chip
            label={value === "REALIZADO" ? "Realizado" : "Previsto"}
            size="small"
            sx={{
              fontWeight: 700,
              color: value === "REALIZADO" ? "#047857" : "#7C3AED",
              backgroundColor: value === "REALIZADO" ? "#ECFDF5" : "#F3E8FF",
            }}
          />
        ),
        width: 120,
      },
      { title: "Descricao", dataIndex: "descricao", key: "descricao", width: 260 },
      { title: "Pessoa", dataIndex: "pessoa_nome", key: "pessoa_nome", render: (value) => value || "-", width: 220 },
      { title: "Forma pgto.", dataIndex: "forma_pagamento", key: "forma_pagamento", render: (value) => value || "-", width: 180 },
      { title: "Status", dataIndex: "status", key: "status", render: (value) => <StatusChip label={value} />, width: 120 },
      { title: "Valor", dataIndex: "valor", key: "valor", render: (value) => formatCurrency(Number(value)), width: 140 },
      {
        title: "Impacto",
        dataIndex: "impacto",
        key: "impacto",
        render: (value) => (
          <span className={Number(value) >= 0 ? "text-emerald-700 font-semibold" : "text-rose-700 font-semibold"}>
            {formatCurrency(Number(value))}
          </span>
        ),
        width: 140,
      },
    ],
    []
  );

  const demonstrativoColumns = useMemo<ColumnsType<FluxoCaixaDemonstrativo>>(
    () => [
      { title: "Data", dataIndex: "data", key: "data", render: (value) => formatDate(value), width: 110 },
      { title: "Entradas realizadas", dataIndex: "entradas_realizadas", key: "entradas_realizadas", render: (value) => formatCurrency(Number(value)), width: 170 },
      { title: "Saidas realizadas", dataIndex: "saidas_realizadas", key: "saidas_realizadas", render: (value) => formatCurrency(Number(value)), width: 170 },
      { title: "Entradas previstas", dataIndex: "entradas_previstas", key: "entradas_previstas", render: (value) => formatCurrency(Number(value)), width: 170 },
      { title: "Saidas previstas", dataIndex: "saidas_previstas", key: "saidas_previstas", render: (value) => formatCurrency(Number(value)), width: 170 },
      { title: "Saldo realizado", dataIndex: "saldo_realizado", key: "saldo_realizado", render: (value) => formatCurrency(Number(value)), width: 170 },
      { title: "Saldo projetado", dataIndex: "saldo_projetado", key: "saldo_projetado", render: (value) => formatCurrency(Number(value)), width: 170 },
    ],
    []
  );

  const contasBancariasColumns = useMemo(
    () => [
      { title: "Codigo", dataIndex: "id", key: "id", width: 90 },
      { title: "Conta bancaria", dataIndex: "nome", key: "nome", width: 220 },
      { title: "Saldo inicial", dataIndex: "saldo_inicial", key: "saldo_inicial", render: (value: number) => formatCurrency(value), width: 160 },
      { title: "Data do saldo", dataIndex: "data_saldo", key: "data_saldo", render: (value: string) => formatDate(value), width: 140 },
      { title: "Formas vinculadas", dataIndex: "formas_pagamento_vinculadas", key: "formas_pagamento_vinculadas", width: 150 },
    ],
    []
  );

  const formasRecebimentoColumns = useMemo(
    () => [
      { title: "Forma de recebimento", dataIndex: "forma_pagamento", key: "forma_pagamento", width: 260 },
      { title: "Quantidade", dataIndex: "quantidade", key: "quantidade", width: 120 },
      { title: "Valor total", dataIndex: "valor_total", key: "valor_total", render: (value: number) => formatCurrency(value), width: 160 },
    ],
    []
  );

  const saldoProjetadoClasse =
    Number(fluxoCaixa?.saldo.saldo_final_previsto || 0) >= 0 ? "text-emerald-700" : "text-rose-700";

  if (isLoading && !fluxoCaixa) {
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
        <div className="flex flex-col gap-6 mb-8">
          <div>
            <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ letterSpacing: "-0.02em", mb: 1 }}>
              Fluxo de Caixa
            </Typography>
            <Typography variant="body2" color="#64748B">
              Acompanhe o caixa consolidado do financeiro com base em contas a receber, contas a pagar e saldos iniciais bancarios.
            </Typography>
          </div>

          <Box
            sx={{
              backgroundColor: "#FFFFFF",
              borderRadius: "24px",
              border: "1px solid #E2E8F0",
              p: 3,
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "end",
            }}
          >
            <TextField
              label="Data inicial"
              type="date"
              size="small"
              value={filtros.data_inicio || ""}
              onChange={(event) => setFiltros((prev) => ({ ...prev, data_inicio: event.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Data final"
              type="date"
              size="small"
              value={filtros.data_fim || ""}
              onChange={(event) => setFiltros((prev) => ({ ...prev, data_fim: event.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <Button variant="contained" onClick={handleBuscar} sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px", px: 3, backgroundColor: "#5B21B6" }}>
              Atualizar fluxo
            </Button>
          </Box>
        </div>

        <Box sx={{ backgroundColor: "#FFFFFF", borderRadius: "24px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <Box sx={{ px: 3, pt: 3, borderBottom: "1px solid #E2E8F0" }}>
            <Tabs
              value={tabValue}
              onChange={(_, nextValue) => setTabValue(nextValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                "& .MuiTabs-indicator": {
                  backgroundColor: "#5B21B6",
                  height: "3px",
                  borderTopLeftRadius: "3px",
                  borderTopRightRadius: "3px",
                },
              }}
            >
              <Tab label="Saldo" />
              <Tab label="Resumo" />
              <Tab label="Diario" />
              <Tab label="Estatisticas" />
              <Tab label="Demonstrativo" />
              <Tab label="Exportar" />
            </Tabs>
          </Box>

          <Box sx={{ p: 4 }}>
            <TabPanel value={tabValue} index={0}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Box sx={summaryCardSx}>
                  <Typography variant="caption" color="#64748B" fontWeight={700}>Saldo inicial do periodo</Typography>
                  <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ mt: 1 }}>
                    {formatCurrency(fluxoCaixa?.saldo.saldo_inicial_periodo || 0)}
                  </Typography>
                </Box>
                <Box sx={summaryCardSx}>
                  <Typography variant="caption" color="#64748B" fontWeight={700}>Saldo final realizado</Typography>
                  <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ mt: 1 }}>
                    {formatCurrency(fluxoCaixa?.saldo.saldo_final_realizado || 0)}
                  </Typography>
                </Box>
                <Box sx={summaryCardSx}>
                  <Typography variant="caption" color="#64748B" fontWeight={700}>Saldo final previsto</Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }} className={saldoProjetadoClasse}>
                    {formatCurrency(fluxoCaixa?.saldo.saldo_final_previsto || 0)}
                  </Typography>
                </Box>
                <Box sx={summaryCardSx}>
                  <Typography variant="caption" color="#64748B" fontWeight={700}>Saldos bancarios cadastrados ate o fim</Typography>
                  <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ mt: 1 }}>
                    {formatCurrency(fluxoCaixa?.saldo.saldo_inicial_contas_ate_fim || 0)}
                  </Typography>
                </Box>
              </div>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 2 }}>
                  Contas bancarias consideradas
                </Typography>
                <ConfigProvider theme={{ components: { Table: { headerBg: "#F8FAFC", headerColor: "#475569", borderColor: "#F1F5F9" } } }}>
                  <Table
                    dataSource={fluxoCaixa?.saldo.contas_bancarias || []}
                    columns={contasBancariasColumns}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 900 }}
                    size="middle"
                  />
                </ConfigProvider>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Box sx={summaryCardSx}>
                  <Typography variant="caption" color="#64748B" fontWeight={700}>A receber hoje</Typography>
                  <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ mt: 1 }}>
                    {formatCurrency(fluxoCaixa?.resumo.a_receber_hoje || 0)}
                  </Typography>
                </Box>
                <Box sx={summaryCardSx}>
                  <Typography variant="caption" color="#64748B" fontWeight={700}>A pagar hoje</Typography>
                  <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ mt: 1 }}>
                    {formatCurrency(fluxoCaixa?.resumo.a_pagar_hoje || 0)}
                  </Typography>
                </Box>
                <Box sx={summaryCardSx}>
                  <Typography variant="caption" color="#64748B" fontWeight={700}>Saldo realizado no periodo</Typography>
                  <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ mt: 1 }}>
                    {formatCurrency(fluxoCaixa?.resumo.saldo_periodo_realizado || 0)}
                  </Typography>
                </Box>
                <Box sx={summaryCardSx}>
                  <Typography variant="caption" color="#64748B" fontWeight={700}>Saldo previsto no periodo</Typography>
                  <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ mt: 1 }}>
                    {formatCurrency(fluxoCaixa?.resumo.saldo_periodo_previsto || 0)}
                  </Typography>
                </Box>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
                <Box sx={summaryCardSx}>
                  <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 2 }}>
                    Recebimentos
                  </Typography>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between"><span>Realizado</span><strong>{formatCurrency(fluxoCaixa?.resumo.recebimentos.realizado || 0)}</strong></div>
                    <div className="flex justify-between"><span>Pendente</span><strong>{formatCurrency(fluxoCaixa?.resumo.recebimentos.pendente || 0)}</strong></div>
                    <div className="flex justify-between"><span>Atrasado</span><strong>{formatCurrency(fluxoCaixa?.resumo.recebimentos.atrasado || 0)}</strong></div>
                    <div className="flex justify-between"><span>Cancelado</span><strong>{formatCurrency(fluxoCaixa?.resumo.recebimentos.cancelado || 0)}</strong></div>
                    <Divider sx={{ my: 1.5 }} />
                    <div className="flex justify-between text-base text-slate-900"><span>Previsto</span><strong>{formatCurrency(fluxoCaixa?.resumo.recebimentos.previsto || 0)}</strong></div>
                  </div>
                </Box>

                <Box sx={summaryCardSx}>
                  <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 2 }}>
                    Pagamentos
                  </Typography>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between"><span>Realizado</span><strong>{formatCurrency(fluxoCaixa?.resumo.pagamentos.realizado || 0)}</strong></div>
                    <div className="flex justify-between"><span>Pendente</span><strong>{formatCurrency(fluxoCaixa?.resumo.pagamentos.pendente || 0)}</strong></div>
                    <div className="flex justify-between"><span>Atrasado</span><strong>{formatCurrency(fluxoCaixa?.resumo.pagamentos.atrasado || 0)}</strong></div>
                    <div className="flex justify-between"><span>Cancelado</span><strong>{formatCurrency(fluxoCaixa?.resumo.pagamentos.cancelado || 0)}</strong></div>
                    <Divider sx={{ my: 1.5 }} />
                    <div className="flex justify-between text-base text-slate-900"><span>Previsto</span><strong>{formatCurrency(fluxoCaixa?.resumo.pagamentos.previsto || 0)}</strong></div>
                  </div>
                </Box>
              </div>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 2 }}>
                Diario do fluxo
              </Typography>
              <ConfigProvider theme={{ components: { Table: { headerBg: "#F8FAFC", headerColor: "#475569", borderColor: "#F1F5F9", rowHoverBg: "#F8FAFC" } } }}>
                <Table
                  dataSource={fluxoCaixa?.diario || []}
                  columns={movimentosColumns}
                  rowKey={(record) => `${record.tipo}-${record.id}-${record.data_movimento}`}
                  pagination={{ pageSize: 12, showSizeChanger: false }}
                  scroll={{ x: 1600 }}
                  size="middle"
                />
              </ConfigProvider>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                <Box sx={summaryCardSx}>
                  <Typography variant="caption" color="#64748B" fontWeight={700}>Movimentos no periodo</Typography>
                  <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ mt: 1 }}>
                    {fluxoCaixa?.estatisticas.total_movimentos_periodo || 0}
                  </Typography>
                </Box>
                <Box sx={summaryCardSx}>
                  <Typography variant="caption" color="#64748B" fontWeight={700}>Ticket medio de recebimento</Typography>
                  <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ mt: 1 }}>
                    {formatCurrency(fluxoCaixa?.estatisticas.ticket_medio_recebimento || 0)}
                  </Typography>
                </Box>
                <Box sx={summaryCardSx}>
                  <Typography variant="caption" color="#64748B" fontWeight={700}>Ticket medio de pagamento</Typography>
                  <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ mt: 1 }}>
                    {formatCurrency(fluxoCaixa?.estatisticas.ticket_medio_pagamento || 0)}
                  </Typography>
                </Box>
                <Box sx={summaryCardSx}>
                  <Typography variant="caption" color="#64748B" fontWeight={700}>Percentual recebido</Typography>
                  <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ mt: 1 }}>
                    {formatPercent(fluxoCaixa?.estatisticas.percentual_recebido_periodo || 0)}
                  </Typography>
                </Box>
                <Box sx={summaryCardSx}>
                  <Typography variant="caption" color="#64748B" fontWeight={700}>Percentual pago</Typography>
                  <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ mt: 1 }}>
                    {formatPercent(fluxoCaixa?.estatisticas.percentual_pago_periodo || 0)}
                  </Typography>
                </Box>
                <Box sx={summaryCardSx}>
                  <Typography variant="caption" color="#64748B" fontWeight={700}>Contas bancarias no fluxo</Typography>
                  <Typography variant="h5" fontWeight={800} color="#0F172A" sx={{ mt: 1 }}>
                    {fluxoCaixa?.estatisticas.total_contas_bancarias || 0}
                  </Typography>
                </Box>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
                <Box sx={summaryCardSx}>
                  <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 2 }}>
                    Estatisticas de recebimentos
                  </Typography>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between"><span>Realizados</span><strong>{fluxoCaixa?.estatisticas.recebimentos.quantidade_realizado || 0}</strong></div>
                    <div className="flex justify-between"><span>Pendentes</span><strong>{fluxoCaixa?.estatisticas.recebimentos.quantidade_pendente || 0}</strong></div>
                    <div className="flex justify-between"><span>Atrasados</span><strong>{fluxoCaixa?.estatisticas.recebimentos.quantidade_atrasado || 0}</strong></div>
                    <div className="flex justify-between"><span>Cancelados</span><strong>{fluxoCaixa?.estatisticas.recebimentos.quantidade_cancelado || 0}</strong></div>
                  </div>
                </Box>

                <Box sx={summaryCardSx}>
                  <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 2 }}>
                    Estatisticas de pagamentos
                  </Typography>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between"><span>Realizados</span><strong>{fluxoCaixa?.estatisticas.pagamentos.quantidade_realizado || 0}</strong></div>
                    <div className="flex justify-between"><span>Pendentes</span><strong>{fluxoCaixa?.estatisticas.pagamentos.quantidade_pendente || 0}</strong></div>
                    <div className="flex justify-between"><span>Atrasados</span><strong>{fluxoCaixa?.estatisticas.pagamentos.quantidade_atrasado || 0}</strong></div>
                    <div className="flex justify-between"><span>Cancelados</span><strong>{fluxoCaixa?.estatisticas.pagamentos.quantidade_cancelado || 0}</strong></div>
                  </div>
                </Box>
              </div>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 2 }}>
                  Top formas de recebimento realizadas
                </Typography>
                <ConfigProvider theme={{ components: { Table: { headerBg: "#F8FAFC", headerColor: "#475569", borderColor: "#F1F5F9" } } }}>
                  <Table
                    dataSource={fluxoCaixa?.estatisticas.formas_recebimento || []}
                    columns={formasRecebimentoColumns}
                    rowKey={(record) => `${record.forma_pagamento}-${record.quantidade}`}
                    pagination={false}
                    scroll={{ x: 800 }}
                    size="middle"
                  />
                </ConfigProvider>
              </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
              <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 2 }}>
                Demonstrativo diario consolidado
              </Typography>
              <ConfigProvider theme={{ components: { Table: { headerBg: "#F8FAFC", headerColor: "#475569", borderColor: "#F1F5F9", rowHoverBg: "#F8FAFC" } } }}>
                <Table
                  dataSource={fluxoCaixa?.demonstrativo || []}
                  columns={demonstrativoColumns}
                  rowKey="data"
                  pagination={{ pageSize: 15, showSizeChanger: false }}
                  scroll={{ x: 1300 }}
                  size="middle"
                />
              </ConfigProvider>
            </TabPanel>

            <TabPanel value={tabValue} index={5}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Box sx={summaryCardSx}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-[#F3E8FF] text-[#5B21B6]"><DownloadOutlined /></div>
                    <div>
                      <Typography variant="h6" fontWeight={800} color="#0F172A">Exportar CSV</Typography>
                      <Typography variant="body2" color="#64748B">Extrai o diario em formato texto estruturado.</Typography>
                    </div>
                  </div>
                  <Button fullWidth variant="outlined" onClick={() => exportarFluxoCaixa("csv", filtros)} sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px" }}>
                    Baixar CSV
                  </Button>
                </Box>

                <Box sx={summaryCardSx}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-[#E0F2FE] text-[#0369A1]"><ReceiptLongOutlined /></div>
                    <div>
                      <Typography variant="h6" fontWeight={800} color="#0F172A">Exportar XLSX</Typography>
                      <Typography variant="body2" color="#64748B">Gera planilha com resumo, diario e demonstrativo.</Typography>
                    </div>
                  </div>
                  <Button fullWidth variant="outlined" onClick={() => exportarFluxoCaixa("xlsx", filtros)} sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px" }}>
                    Baixar XLSX
                  </Button>
                </Box>

                <Box sx={summaryCardSx}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-[#ECFDF5] text-[#047857]"><PaidOutlined /></div>
                    <div>
                      <Typography variant="h6" fontWeight={800} color="#0F172A">Exportar PDF</Typography>
                      <Typography variant="body2" color="#64748B">Entrega um resumo executivo do periodo selecionado.</Typography>
                    </div>
                  </div>
                  <Button fullWidth variant="outlined" onClick={() => exportarFluxoCaixa("pdf", filtros)} sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px" }}>
                    Baixar PDF
                  </Button>
                </Box>
              </div>

              <Box sx={{ mt: 4, p: 3, borderRadius: "20px", backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                <Typography variant="h6" fontWeight={800} color="#0F172A" sx={{ mb: 2 }}>
                  Observacoes do fluxo
                </Typography>
                <div className="space-y-2">
                  {(fluxoCaixa?.observacoes || []).map((observacao) => (
                    <div key={observacao} className="flex items-start gap-2 text-sm text-slate-600">
                      <ShowChartOutlined sx={{ fontSize: 18, color: "#5B21B6", mt: "2px" }} />
                      <span>{observacao}</span>
                    </div>
                  ))}
                </div>
              </Box>
            </TabPanel>
          </Box>
        </Box>
      </div>
    </Layout>
  );
};

export default FluxoCaixa;
