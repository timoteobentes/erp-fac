import React, { useState } from "react";
import { Table, Tooltip } from "antd";
import type { TablePaginationConfig } from "antd";
import { IconButton } from "@mui/material";
import { DeleteForeverOutlined, EditOutlined, VisibilityOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { StatusConfirmationModal } from "../../../../../components/StatusConfirmationModal";
import type { ContaBancaria } from "../../hooks/useContasBancarias";

interface TabelaContasBancariasProps {
  contasBancarias: ContaBancaria[];
  isLoading: boolean;
  onRefresh: () => void;
  pagination: TablePaginationConfig;
  onDelete: (id: number) => Promise<void>;
}

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  return date.toLocaleDateString("pt-BR");
};

export const TabelaContasBancarias: React.FC<TabelaContasBancariasProps> = ({
  contasBancarias,
  isLoading,
  onRefresh,
  pagination,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [registroSelecionado, setRegistroSelecionado] = useState<ContaBancaria | null>(null);

  const handleView = (id: number) => navigate(`/financeiro/contas-bancarias/visualizar/${id}`);
  const handleEdit = (id: number) => navigate(`/financeiro/contas-bancarias/editar/${id}`);

  const clickDelete = (record: ContaBancaria) => {
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
    { title: "Nome", dataIndex: "nome", key: "nome", render: (text: string) => <span className="font-bold text-gray-800">{text}</span> },
    { title: "Saldo inicial", dataIndex: "saldo_inicial", key: "saldo_inicial", render: (value: number | string) => <span className="text-gray-700">{formatCurrency(value)}</span> },
    { title: "Data do saldo", dataIndex: "data_saldo", key: "data_saldo", render: (value: string) => <span className="text-gray-700">{formatDate(value)}</span> },
    {
      title: "Acoes",
      key: "acoes",
      width: 160,
      align: "center" as const,
      fixed: "right" as const,
      render: (_: unknown, record: ContaBancaria) => (
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
        {contasBancarias.length > 0 ? `Mostrando ${contasBancarias.length} registros` : "Nenhum registro encontrado."}
      </div>
      <Table
        dataSource={contasBancarias}
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
        title="Excluir Conta Bancaria"
        description={
          registroSelecionado ? (
            <div className="space-y-2">
              <div>Tem certeza que deseja excluir esta Conta Bancaria?</div>
              <div><strong>Nome:</strong> {registroSelecionado.nome}</div>
              <div><strong>Saldo inicial:</strong> {formatCurrency(registroSelecionado.saldo_inicial)}</div>
              <div><strong>Data do saldo:</strong> {formatDate(registroSelecionado.data_saldo)}</div>
            </div>
          ) : (
            "Tem certeza que deseja excluir esta Conta Bancaria?"
          )
        }
        confirmText="Sim, Excluir"
        confirmColor="danger"
      />
    </>
  );
};
