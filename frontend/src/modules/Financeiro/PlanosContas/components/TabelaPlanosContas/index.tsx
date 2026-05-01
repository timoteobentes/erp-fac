import React, { useState } from "react";
import { Table, Tooltip } from "antd";
import type { TablePaginationConfig } from "antd";
import { IconButton } from "@mui/material";
import { DeleteForeverOutlined, EditOutlined, VisibilityOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { StatusConfirmationModal } from "../../../../../components/StatusConfirmationModal";
import type { PlanoConta } from "../../hooks/usePlanosContas";
import { getContaMaeLabel } from "../../constants/contaMaeOptions";

interface TabelaPlanosContasProps {
  planosContas: PlanoConta[];
  isLoading: boolean;
  onRefresh: () => void;
  pagination: TablePaginationConfig;
  onDelete: (id: number) => Promise<void>;
}

export const TabelaPlanosContas: React.FC<TabelaPlanosContasProps> = ({
  planosContas,
  isLoading,
  onRefresh,
  pagination,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [registroSelecionado, setRegistroSelecionado] = useState<PlanoConta | null>(null);

  const handleView = (id: number) => navigate(`/financeiro/planos-de-contas/visualizar/${id}`);
  const handleEdit = (id: number) => navigate(`/financeiro/planos-de-contas/editar/${id}`);

  const clickDelete = (record: PlanoConta) => {
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
      title: "Conta mae",
      dataIndex: "conta_mae",
      key: "conta_mae",
      render: (value: string) => <span className="text-gray-700">{getContaMaeLabel(value)}</span>,
    },
    {
      title: "Nome",
      dataIndex: "nome",
      key: "nome",
      render: (text: string) => <span className="font-bold text-gray-800">{text}</span>,
    },
    {
      title: "Acoes",
      key: "acoes",
      width: 160,
      align: "center" as const,
      fixed: "right" as const,
      render: (_: unknown, record: PlanoConta) => (
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
        {planosContas.length > 0 ? `Mostrando ${planosContas.length} registros` : "Nenhum registro encontrado."}
      </div>
      <Table
        dataSource={planosContas}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ ...pagination, align: "center" }}
        scroll={{ x: 900 }}
        size="middle"
      />

      <StatusConfirmationModal
        open={modalDeleteOpen}
        onClose={() => setModalDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Plano de Conta"
        description={
          registroSelecionado ? (
            <div className="space-y-2">
              <div>Tem certeza que deseja excluir este Plano de Conta?</div>
              <div><strong>Conta mae:</strong> {getContaMaeLabel(registroSelecionado.conta_mae)}</div>
              <div><strong>Nome:</strong> {registroSelecionado.nome}</div>
            </div>
          ) : (
            "Tem certeza que deseja excluir este Plano de Conta?"
          )
        }
        confirmText="Sim, Excluir"
        confirmColor="danger"
      />
    </>
  );
};
