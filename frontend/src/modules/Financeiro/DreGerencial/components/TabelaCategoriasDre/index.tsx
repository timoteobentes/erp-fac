import React, { useState } from "react";
import { Table, Tag, Tooltip } from "antd";
import type { TablePaginationConfig } from "antd";
import { IconButton } from "@mui/material";
import { DeleteForeverOutlined, EditOutlined, VisibilityOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { StatusConfirmationModal } from "../../../../../components/StatusConfirmationModal";
import type { CategoriaDre } from "../../hooks/useCategoriasDre";
import { GRUPO_CATEGORIA_DRE_LABELS, TIPO_CATEGORIA_DRE_LABELS } from "../../constants/categoriaDreOptions";

interface TabelaCategoriasDreProps {
  categoriasDre: CategoriaDre[];
  isLoading: boolean;
  onRefresh: () => void;
  pagination: TablePaginationConfig;
  onDelete: (id: number) => Promise<void>;
}

export const TabelaCategoriasDre: React.FC<TabelaCategoriasDreProps> = ({
  categoriasDre,
  isLoading,
  onRefresh,
  pagination,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [registroSelecionado, setRegistroSelecionado] = useState<CategoriaDre | null>(null);

  const handleView = (id: number) => navigate(`/financeiro/dre-gerencial/categorias/visualizar/${id}`);
  const handleEdit = (id: number) => navigate(`/financeiro/dre-gerencial/categorias/editar/${id}`);

  const clickDelete = (record: CategoriaDre) => {
    setRegistroSelecionado(record);
    setModalDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (registroSelecionado) {
      await onDelete(registroSelecionado.id);
      setModalDeleteOpen(false);
      setRegistroSelecionado(null);
      onRefresh();
    }
  };

  const columns = [
    { title: "Codigo", dataIndex: "id", key: "id", width: 90 },
    {
      title: "Grupo",
      dataIndex: "grupo",
      key: "grupo",
      render: (value: string) => GRUPO_CATEGORIA_DRE_LABELS[value] || value,
    },
    {
      title: "Nome",
      dataIndex: "nome",
      key: "nome",
      render: (text: string) => <span className="font-bold text-gray-800">{text}</span>,
    },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
      align: "center" as const,
      width: 160,
      render: (value: string) => {
        const color = value === "RECEITA" ? "success" : value === "DESPESA" ? "error" : "processing";
        return <Tag color={color}>{TIPO_CATEGORIA_DRE_LABELS[value] || value}</Tag>;
      },
    },
    {
      title: "Ativo",
      dataIndex: "ativo",
      key: "ativo",
      align: "center" as const,
      width: 120,
      render: (value: boolean) => <Tag color={value ? "success" : "default"}>{value ? "Sim" : "Nao"}</Tag>,
    },
    {
      title: "Acoes",
      key: "acoes",
      width: 160,
      align: "center" as const,
      fixed: "right" as const,
      render: (_: unknown, record: CategoriaDre) => (
        <div className="flex justify-center gap-1">
          <Tooltip title="Visualizar Detalhes">
            <IconButton size="small" onClick={() => handleView(record.id)} sx={{ color: "#6B00A1" }}>
              <VisibilityOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => handleEdit(record.id)} color="warning">
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton size="small" onClick={() => clickDelete(record)} color="error">
              <DeleteForeverOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="text-[#3C0473] font-normal text-sm mb-4">
        {categoriasDre.length > 0 ? `Mostrando ${categoriasDre.length} registros` : "Nenhum registro encontrado."}
      </div>
      <Table
        dataSource={categoriasDre}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ ...pagination, align: "center" }}
        scroll={{ x: 1000 }}
        size="middle"
      />

      <StatusConfirmationModal
        open={modalDeleteOpen}
        onClose={() => setModalDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Categoria DRE"
        description={
          registroSelecionado ? (
            <div className="space-y-2">
              <div>Deseja realmente excluir esta Categoria DRE?</div>
              <div><strong>Nome:</strong> {registroSelecionado.nome}</div>
              <div><strong>Grupo:</strong> {GRUPO_CATEGORIA_DRE_LABELS[registroSelecionado.grupo] || registroSelecionado.grupo}</div>
              <div><strong>Tipo:</strong> {TIPO_CATEGORIA_DRE_LABELS[registroSelecionado.tipo] || registroSelecionado.tipo}</div>
              <div><strong>Ativo:</strong> {registroSelecionado.ativo ? "Sim" : "Nao"}</div>
            </div>
          ) : (
            "Deseja realmente excluir esta Categoria DRE?"
          )
        }
        confirmText="Sim, Excluir"
        confirmColor="danger"
      />
    </>
  );
};
