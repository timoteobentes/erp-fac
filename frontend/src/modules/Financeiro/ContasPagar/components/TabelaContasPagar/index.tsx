/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Table, Tag, Tooltip } from "antd";
import type { TablePaginationConfig } from "antd";
import { IconButton } from "@mui/material";
import {
  VisibilityOutlined,
  EditOutlined,
  DeleteForeverOutlined,
  CheckCircleOutline
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { StatusConfirmationModal } from "../../../../../components/StatusConfirmationModal";

export interface ContaPagar {
  id: number;
  descricao: string;
  fornecedor_nome?: string;
  valor_total: number | string;
  data_vencimento: string;
  status: string;
}

interface TabelaContasPagarProps {
  contas: ContaPagar[];
  isLoading: boolean;
  onRefresh: () => void;
  // onChange: (pagination: any, filters: any, sorter: any) => void;
  pagination: TablePaginationConfig;
  onDelete: (id: number) => Promise<void>;
  onBaixa: (id: number) => Promise<void>;
}

export const TabelaContasPagar: React.FC<TabelaContasPagarProps> = ({
  contas,
  isLoading,
  onRefresh,
  pagination,
  onDelete,
  onBaixa
}) => {
  const navigate = useNavigate();
  
  // Modal states
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [modalBaixaOpen, setModalBaixaOpen] = useState(false);
  const [contaIdSelecionada, setContaIdSelecionada] = useState<number | null>(null);

  // Formatting helpers
  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('pt-BR');
  };

  // Actions Let
  const handleView = (id: number) => navigate(`/financeiro/pagar/visualizar/${id}`);
  const handleEdit = (id: number) => navigate(`/financeiro/pagar/editar/${id}`);
  
  const clickDelete = (id: number) => {
    setContaIdSelecionada(id);
    setModalDeleteOpen(true);
  };

  const clickBaixa = (id: number) => {
    setContaIdSelecionada(id);
    setModalBaixaOpen(true);
  };

  const confirmDelete = async () => {
    if (contaIdSelecionada) {
      await onDelete(contaIdSelecionada);
      setModalDeleteOpen(false);
      setContaIdSelecionada(null);
      onRefresh();
    }
  };

  const confirmBaixa = async () => {
    if (contaIdSelecionada) {
      await onBaixa(contaIdSelecionada);
      setModalBaixaOpen(false);
      setContaIdSelecionada(null);
      onRefresh();
    }
  };

  const columns = [
    {
      title: 'Código',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Descrição',
      dataIndex: 'descricao',
      key: 'descricao',
      render: (text: string) => <span className="font-bold text-gray-800">{text}</span>
    },
    {
      title: 'Entidade / Fornecedor',
      dataIndex: 'fornecedor_nome',
      key: 'fornecedor_nome',
      render: (text: string) => text || <span className="text-gray-400 italic">Fornecedor Avulso</span>
    },
    {
      title: 'Data Venc.',
      dataIndex: 'data_vencimento',
      key: 'data_vencimento',
      render: (text: string) => formatDate(text)
    },
    {
      title: 'Valor Total',
      dataIndex: 'valor_total',
      key: 'valor_total',
      render: (val: number | string) => (
        <span className="font-semibold text-gray-700">{formatCurrency(val)}</span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center' as const,
      width: 120,
      render: (status: string) => {
        let color = 'default';
        let text = status;
        if (status === 'pago') color = 'success';
        if (status === 'pendente') color = 'warning';
        if (status === 'cancelado') color = 'error';
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Ações',
      key: 'acoes',
      width: 160,
      align: 'center' as const,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <div className="flex justify-center gap-1">
          <Tooltip title="Visualizar Detalhes">
            <IconButton size="small" onClick={() => handleView(record.id)} sx={{ color: '#6B00A1' }}>
              <VisibilityOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          {record.status !== 'pago' && record.status !== 'cancelado' && (
            <Tooltip title="Dar Baixa (Registrar Pagamento)">
              <IconButton size="small" color="success" onClick={() => clickBaixa(record.id)}>
                <CheckCircleOutline fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => handleEdit(record.id)} color="warning">
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Excluir">
            <IconButton size="small" onClick={() => clickDelete(record.id)} color="error">
              <DeleteForeverOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="text-[#3C0473] font-normal text-sm mb-4">
        {contas.length > 0 ? `Mostrando ${contas.length} registros` : 'Nenhum registro encontrado.'}
      </div>
      <Table 
        dataSource={contas} 
        columns={columns} 
        rowKey="id"
        loading={isLoading}
        pagination={{ ...pagination, align: 'center' }}
        scroll={{ x: 1000 }}
        size="middle"
      />

      <StatusConfirmationModal
        open={modalDeleteOpen}
        onClose={() => setModalDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Despesa"
        description="Tem certeza que deseja excluir permanentemente esta Conta a Pagar? Esta operação não pode ser desfeita nos registros do caixa."
        confirmText="Sim, Excluir"
        confirmColor="danger"
      />

      <StatusConfirmationModal
        open={modalBaixaOpen}
        onClose={() => setModalBaixaOpen(false)}
        onConfirm={confirmBaixa}
        title="Confirmar Baixa"
        description="Confirma o pagamento/baixa desta conta com o valor total e data de pagamento para hoje?"
        confirmText="Confirmar Baixa"
        confirmColor="success"
      />
    </>
  );
};
