/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Collapse, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { AddCircleOutline, DeleteForeverOutlined, EditOutlined, Refresh, Search, VisibilityOutlined } from "@mui/icons-material";
import { ConfigProvider, Modal, Table, Tooltip } from "antd";
import type { TableColumnsType } from "antd";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import Layout from "../../../template/Layout";
import { useCategorias } from "../../../modules/Cadastros/Categorias/hooks/useCategorias";
import type { Categoria } from "../../../modules/Cadastros/Categorias/services/categoriaService";

const Categorias: React.FC = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [busca, setBusca] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [categoriaAlvo, setCategoriaAlvo] = useState<Categoria | null>(null);

  const {
    categorias,
    loading,
    paginacao,
    fetchCategorias,
    excluirCategoria,
    handleTableChange,
    aplicarBusca,
    limparBusca
  } = useCategorias();

  useEffect(() => {
    fetchCategorias();
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const animClass = (delay: number) =>
    `transition-all duration-300 ${mounted ? `opacity-100 translate-y-0 delay-${delay}` : "opacity-0 translate-y-4"}`;

  const handleCleanSimpleSearch = () => {
    setBusca("");
    limparBusca();
    setShowSearch(false);
  };

  const abrirModalExclusao = (categoria: Categoria) => {
    setCategoriaAlvo(categoria);
    setDeleteModalOpen(true);
  };

  const fecharModalExclusao = () => {
    setDeleteModalOpen(false);
    setCategoriaAlvo(null);
  };

  const confirmarExclusao = async () => {
    if (!categoriaAlvo) return;

    setDeleteLoading(true);
    try {
      await excluirCategoria(categoriaAlvo.id);
      fecharModalExclusao();
      await fetchCategorias();
    } catch {
      // O hook exibe a mensagem de erro e mantem o modal aberto para nova tentativa.
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns: TableColumnsType<Categoria> = useMemo(() => [
    {
      title: "Nome",
      dataIndex: "nome",
      key: "nome",
      sorter: true,
      render: (nome) => <span className="font-semibold text-[#0F172A]">{nome}</span>
    },
    {
      title: "Cadastrado em",
      dataIndex: "criado_em",
      key: "criado_em",
      width: 160,
      align: "center",
      render: (data: string) => data ? dayjs(data).format("DD/MM/YYYY") : "-"
    },
    {
      title: "Atualizado em",
      dataIndex: "atualizado_em",
      key: "atualizado_em",
      width: 160,
      align: "center",
      render: (data: string) => data ? dayjs(data).format("DD/MM/YYYY") : "-"
    },
    {
      title: "Acoes",
      key: "acoes",
      width: 150,
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-1">
          <Tooltip title="Visualizar">
            <IconButton size="small" style={{ color: "#6B00A1" }} onClick={() => navigate(`/cadastros/categorias/visualizar/${record.id}`)}>
              <VisibilityOutlined />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton size="small" style={{ color: "#174FE2" }} onClick={() => navigate(`/cadastros/categorias/editar/${record.id}`)}>
              <EditOutlined />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton size="small" style={{ color: "#D0214B" }} onClick={() => abrirModalExclusao(record)}>
              <DeleteForeverOutlined />
            </IconButton>
          </Tooltip>
        </div>
      )
    }
  ], [navigate]);

  return (
    <Layout>
      <div className={`transition-all duration-500 ease-in-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} pb-8`}>
        <div className="flex flex-col mb-8">
          <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ letterSpacing: "-0.02em", mb: 1 }}>
            Categorias
          </Typography>
          <Typography variant="body2" color="#64748B">
            Organize o cadastro de produtos por categorias comerciais.
          </Typography>
        </div>

        <Box
          sx={{
            backgroundColor: "#FFFFFF",
            borderRadius: "24px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.02)",
            border: "1px solid #E2E8F0",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <Box sx={{ p: 3, borderBottom: "1px solid #F1F5F9", backgroundColor: "#F8FAFC" }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex gap-2 flex-wrap">
                <div className={animClass(100)}>
                  <Button variant="contained" color="success" startIcon={<AddCircleOutline />} sx={{ color: "#FFFFFF" }} onClick={() => navigate("/cadastros/categorias/novo")}>
                    Adicionar
                  </Button>
                </div>
                <div className={animClass(150)}>
                  <Button variant="contained" startIcon={<Refresh />} onClick={() => fetchCategorias()}>
                    Atualizar
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <div className={animClass(200)}>
                  <IconButton style={{ color: "#6B00A1" }} onClick={() => setShowSearch(!showSearch)}>
                    <Search />
                  </IconButton>
                </div>
                <Collapse in={showSearch} orientation="horizontal" timeout={300}>
                  <TextField
                    size="small"
                    placeholder="Pesquisar categoria..."
                    value={busca}
                    onChange={(event) => setBusca(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && aplicarBusca(busca)}
                    sx={{ width: 240, backgroundColor: "white" }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <button type="button" onClick={handleCleanSimpleSearch} className="cursor-pointer hover:font-bold">x</button>
                          </InputAdornment>
                        )
                      }
                    }}
                  />
                </Collapse>
              </div>
            </div>
          </Box>

          <Box sx={{ p: 4 }}>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[#64748B] text-xs font-bold uppercase tracking-wider bg-[#F1F5F9] px-3 py-1.5 rounded-md">
                {categorias.length > 0 ? `${categorias.length} de ${paginacao.total || 0} registros` : "Nenhum registro encontrado"}
              </span>
            </div>

            <ConfigProvider
              theme={{
                components: {
                  Checkbox: { colorPrimary: "#5B21B6", colorPrimaryHover: "#3C0473" },
                  Table: {
                    headerBg: "#F8FAFC",
                    headerColor: "#475569",
                    headerBorderRadius: 8,
                    rowHoverBg: "#F8FAFC",
                    rowSelectedBg: "#F3E8FF",
                    rowSelectedHoverBg: "#E9D5FF",
                    borderColor: "#F1F5F9"
                  },
                  Pagination: {
                    colorPrimary: "#5B21B6",
                    colorPrimaryHover: "#3C0473",
                    itemActiveBg: "#F3E8FF"
                  },
                  Spin: { colorPrimary: "#5B21B6" }
                }
              }}
            >
              <Table
                rowKey="id"
                columns={columns}
                dataSource={categorias}
                loading={loading}
                onChange={handleTableChange}
                pagination={{
                  current: paginacao.page,
                  pageSize: paginacao.limit,
                  total: paginacao.total,
                  align: "center",
                  showSizeChanger: true
                }}
                locale={{ emptyText: "Nenhuma categoria encontrada" }}
                style={{ width: "100%" }}
              />
            </ConfigProvider>
          </Box>
        </Box>
      </div>

      <Modal
        title="Excluir Categoria"
        open={deleteModalOpen}
        onOk={confirmarExclusao}
        onCancel={fecharModalExclusao}
        okText="Sim, Excluir"
        cancelText="Cancelar"
        confirmLoading={deleteLoading}
        okButtonProps={{ style: { backgroundColor: "#f5222d", borderColor: "#f5222d" } }}
        centered
      >
        <div className="py-4">
          <p className="text-lg mb-2">
            Deseja excluir a categoria <strong>{categoriaAlvo?.nome}</strong>?
          </p>
          <div className="space-y-2 text-gray-600">
            <p>Esta acao ira:</p>
            <ul className="list-disc list-inside ml-2">
              <li>Remover a categoria das listas de selecao</li>
              <li>Impedir o uso desta categoria em novos cadastros</li>
              <li>Manter o historico dos produtos ja cadastrados</li>
            </ul>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default Categorias;
