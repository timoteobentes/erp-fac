import React, { useState } from "react";
import { Table, Tag, Tooltip } from "antd";
import type { TablePaginationConfig } from "antd";
import { IconButton } from "@mui/material";
import { DeleteForeverOutlined, EditOutlined, VisibilityOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { StatusConfirmationModal } from "../../../../../components/StatusConfirmationModal";
import type { CentroCusto } from "../../hooks/useCentroCustos";

interface TabelaCentroCustosProps {
  centroCustos: CentroCusto[];
  isLoading: boolean;
  onRefresh: () => void;
  pagination: TablePaginationConfig;
  onDelete: (id: number) => Promise<void>;
}

export const TabelaCentroCustos: React.FC<TabelaCentroCustosProps> = ({
  centroCustos,
  isLoading,
  onRefresh,
  pagination,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [registroSelecionado, setRegistroSelecionado] = useState<CentroCusto | null>(null);

  const handleView = (id: number) => navigate(`/financeiro/centro-custos/visualizar/${id}`);
  const handleEdit = (id: number) => navigate(`/financeiro/centro-custos/editar/${id}`);

  const clickDelete = (record: CentroCusto) => {
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
      title: "Nome",
      dataIndex: "nome",
      key: "nome",
      render: (text: string) => <span className="font-bold text-gray-800">{text}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      width: 140,
      render: (status: string) => <Tag color={status === "ATIVO" ? "success" : "default"}>{status === "ATIVO" ? "Ativo" : "Inativo"}</Tag>,
    },
    {
      title: "Acoes",
      key: "acoes",
      width: 160,
      align: "center" as const,
      fixed: "right" as const,
      render: (_: unknown, record: CentroCusto) => (
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
        {centroCustos.length > 0 ? `Mostrando ${centroCustos.length} registros` : "Nenhum registro encontrado."}
      </div>
      <Table
        dataSource={centroCustos}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ ...pagination, align: "center" }}
        scroll={{ x: 700 }}
        size="middle"
      />

      <StatusConfirmationModal
        open={modalDeleteOpen}
        onClose={() => setModalDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Centro de Custo"
        description={
          registroSelecionado ? (
            <div className="space-y-2">
              <div>Tem certeza que deseja excluir este Centro de Custo?</div>
              <div><strong>Nome:</strong> {registroSelecionado.nome}</div>
              <div><strong>Status:</strong> {registroSelecionado.status === "ATIVO" ? "Ativo" : "Inativo"}</div>
            </div>
          ) : (
            "Tem certeza que deseja excluir este Centro de Custo?"
          )
        }
        confirmText="Sim, Excluir"
        confirmColor="danger"
      />
    </>
  );
};
