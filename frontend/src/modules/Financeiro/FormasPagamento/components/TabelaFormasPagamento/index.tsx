import React, { useState } from "react";
import { Table, Tooltip } from "antd";
import type { TablePaginationConfig } from "antd";
import { IconButton } from "@mui/material";
import { DeleteForeverOutlined, EditOutlined, VisibilityOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { StatusConfirmationModal } from "../../../../../components/StatusConfirmationModal";
import type { FormaPagamento } from "../../hooks/useFormasPagamento";
import { getDisponivelEmLabel, getModalidadeLabel } from "../../constants/formaPagamentoOptions";

interface TabelaFormasPagamentoProps {
  formasPagamento: FormaPagamento[];
  isLoading: boolean;
  onRefresh: () => void;
  pagination: TablePaginationConfig;
  onDelete: (id: number) => Promise<void>;
}

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);

export const TabelaFormasPagamento: React.FC<TabelaFormasPagamentoProps> = ({
  formasPagamento,
  isLoading,
  onRefresh,
  pagination,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [registroSelecionado, setRegistroSelecionado] = useState<FormaPagamento | null>(null);

  const handleView = (id: number) => navigate(`/financeiro/formas-de-pagamento/visualizar/${id}`);
  const handleEdit = (id: number) => navigate(`/financeiro/formas-de-pagamento/editar/${id}`);

  const clickDelete = (record: FormaPagamento) => {
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
    { title: "Conta bancaria", dataIndex: "conta_bancaria_nome", key: "conta_bancaria_nome", render: (text?: string) => <span className="text-gray-700">{text || "-"}</span> },
    { title: "Disponivel em", dataIndex: "disponivel_em", key: "disponivel_em", render: (value: string) => <span className="text-gray-700">{getDisponivelEmLabel(value)}</span> },
    { title: "Modalidade", dataIndex: "modalidade", key: "modalidade", render: (value: string) => <span className="text-gray-700">{getModalidadeLabel(value)}</span> },
    {
      title: "Acoes",
      key: "acoes",
      width: 160,
      align: "center" as const,
      fixed: "right" as const,
      render: (_: unknown, record: FormaPagamento) => (
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
        {formasPagamento.length > 0 ? `Mostrando ${formasPagamento.length} registros` : "Nenhum registro encontrado."}
      </div>

      <Table
        dataSource={formasPagamento}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{ ...pagination, align: "center" }}
        scroll={{ x: 1200 }}
        size="middle"
      />

      <StatusConfirmationModal
        open={modalDeleteOpen}
        onClose={() => setModalDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Forma de Pagamento"
        description={
          registroSelecionado ? (
            <div className="space-y-2">
              <div>Tem certeza que deseja excluir esta Forma de Pagamento?</div>
              <div><strong>Nome:</strong> {registroSelecionado.nome}</div>
              <div><strong>Conta bancaria:</strong> {registroSelecionado.conta_bancaria_nome || "-"}</div>
              <div><strong>Modalidade:</strong> {getModalidadeLabel(registroSelecionado.modalidade)}</div>
              <div><strong>Taxa do banco:</strong> {formatCurrency(registroSelecionado.taxa_banco)}</div>
            </div>
          ) : (
            "Tem certeza que deseja excluir esta Forma de Pagamento?"
          )
        }
        confirmText="Sim, Excluir"
        confirmColor="danger"
      />
    </>
  );
};
