/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Table, Tag, Tooltip } from "antd";
import type { TablePaginationConfig } from "antd";
import { IconButton } from "@mui/material";
import {
  VisibilityOutlined,
  EditOutlined,
  DeleteForeverOutlined,
  InputOutlined
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { StatusConfirmationModal } from "../../../../../components/StatusConfirmationModal";

export interface ContaReceber {
  id: number;
  descricao: string;
  valor_total: number | string;
  data_vencimento: string;
  status: string;
  venda_id?: number;
}

interface TabelaContasReceberProps {
  contas: ContaReceber[];
  isLoading: boolean;
  onRefresh: () => void;
  pagination?: TablePaginationConfig;
  onDelete: (id: number) => Promise<void>;
  onBaixa: (id: number) => Promise<void>;
}

export const TabelaContasReceber: React.FC<TabelaContasReceberProps> = ({
  contas,
  isLoading,
  onRefresh,
  pagination,
  onDelete,
  onBaixa
}) => {
  const navigate = useNavigate();
  
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [modalBaixaOpen, setModalBaixaOpen] = useState(false);
  const [contaIdSelecionada, setContaIdSelecionada] = useState<number | null>(null);

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString('pt-BR');
  };

  const handleView = (id: number) => navigate(`/financeiro/receber/visualizar/${id}`);
  const handleEdit = (id: number) => navigate(`/financeiro/receber/editar/${id}`);
  
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
      width: 300,
      render: (text: string, record: any) => (
        <div>
           <div className="font-bold text-gray-800">{text}</div>
           {record.venda_id && <div className="text-xs text-gray-500">Origem: PDV (Venda #{record.venda_id})</div>}
        </div>
      )
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
        if (status === 'recebido') color = 'success';
        if (status === 'pendente') color = 'warning';
        if (status === 'atrasado') color = 'error';
        if (status === 'cancelado') color = 'default';
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
          <Tooltip title="Visualizar">
            <IconButton size="small" onClick={() => handleView(record.id)} sx={{ color: '#6B00A1' }}>
              <VisibilityOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          {record.status === 'pendente' && (
            <Tooltip title="Baixar (Registrar Recebimento)">
              <IconButton size="small" color="success" onClick={() => clickBaixa(record.id)}>
                <InputOutlined fontSize="small" />
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
        pagination={pagination ? { ...pagination, align: 'center' } : { pageSize: 12, align: 'center' }}
        scroll={{ x: 1000 }}
        size="middle"
      />

      <StatusConfirmationModal
        open={modalDeleteOpen}
        onClose={() => setModalDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Recebimento"
        description="Tem certeza que deseja excluir permanentemente esta Conta a Receber? Operação arriscada para consistência de fluxo de caixa."
        confirmText="Sim, Excluir"
        confirmColor="danger"
      />

      <StatusConfirmationModal
        open={modalBaixaOpen}
        onClose={() => setModalBaixaOpen(false)}
        onConfirm={confirmBaixa}
        title="Confirmar Recebimento"
        description="Confirma o recebimento desta conta com o valor total e data para hoje?"
        confirmText="Confirmar"
        confirmColor="success"
      />
    </>
  );
};
