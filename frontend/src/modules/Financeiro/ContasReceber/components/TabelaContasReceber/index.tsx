/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { DatePicker, InputNumber, Table, Tag, Tooltip } from "antd";
import type { TablePaginationConfig } from "antd";
import dayjs from "dayjs";
import { IconButton } from "@mui/material";
import {
  VisibilityOutlined,
  EditOutlined,
  DeleteForeverOutlined,
  CheckCircleOutline
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { StatusConfirmationModal } from "../../../../../components/StatusConfirmationModal";

export interface ContaReceber {
  id: number;
  descricao: string;
  cliente_nome?: string;
  entidade_nome?: string;
  valor_total: number | string;
  data_vencimento: string;
  data_compensacao?: string;
  plano_conta_nome?: string;
  centro_custo_nome?: string;
  forma_pagamento_nome_relacionada?: string;
  forma_pagamento?: string;
  conta_bancaria_nome?: string;
  recebimento_quitado?: boolean;
  status: string;
  venda_id?: number;
}

interface TabelaContasReceberProps {
  contas: ContaReceber[];
  isLoading: boolean;
  onRefresh: () => void;
  pagination?: TablePaginationConfig;
  onDelete: (id: number) => Promise<void>;
  onBaixa: (id: number, dados?: { valor_recebido?: number; data_recebimento?: string }) => Promise<void>;
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
  const [contaBaixaSelecionada, setContaBaixaSelecionada] = useState<ContaReceber | null>(null);
  const [valorRecebido, setValorRecebido] = useState<number | null>(null);
  const [dataRecebimento, setDataRecebimento] = useState<string>(new Date().toISOString().split('T')[0]);

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
  };

  const formatDate = (dateString?: string) => {
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

  const clickBaixa = (conta: ContaReceber) => {
    setContaIdSelecionada(conta.id);
    setContaBaixaSelecionada(conta);
    setValorRecebido(Number(conta.valor_total));
    setDataRecebimento(new Date().toISOString().split('T')[0]);
    setModalBaixaOpen(true);
  };

  const resetBaixa = () => {
    setModalBaixaOpen(false);
    setContaBaixaSelecionada(null);
    setValorRecebido(null);
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
      await onBaixa(contaIdSelecionada, {
        valor_recebido: valorRecebido || undefined,
        data_recebimento: dataRecebimento
      });
      setContaIdSelecionada(null);
      resetBaixa();
      onRefresh();
    }
  };

  const valorOriginalBaixa = Number(contaBaixaSelecionada?.valor_total || 0);
  const valorRestanteBaixa = Math.max(valorOriginalBaixa - Number(valorRecebido || 0), 0);
  const baixaInvalida = !valorRecebido || valorRecebido <= 0 || valorRecebido > valorOriginalBaixa || !dataRecebimento;

  const columns = [
    {
      title: 'Codigo',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Descricao',
      dataIndex: 'descricao',
      key: 'descricao',
      render: (text: string, record: ContaReceber) => (
        <div>
          <div className="font-bold text-gray-800">{text}</div>
          {record.venda_id && <div className="text-xs text-gray-500">Origem: PDV (Venda #{record.venda_id})</div>}
        </div>
      )
    },
    {
      title: 'Entidade / Cliente',
      dataIndex: 'cliente_nome',
      key: 'cliente_nome',
      render: (text: string, record: ContaReceber) => text || record.entidade_nome || <span className="text-gray-400 italic">Cliente Avulso</span>
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
      title: 'Plano de Contas',
      dataIndex: 'plano_conta_nome',
      key: 'plano_conta_nome',
      render: (text: string) => text || <span className="text-gray-400">-</span>
    },
    {
      title: 'Centro de Custos',
      dataIndex: 'centro_custo_nome',
      key: 'centro_custo_nome',
      render: (text: string) => text || <span className="text-gray-400">-</span>
    },
    {
      title: 'Forma Rec.',
      dataIndex: 'forma_pagamento_nome_relacionada',
      key: 'forma_pagamento_nome_relacionada',
      render: (text: string, record: ContaReceber) => text || record.forma_pagamento || <span className="text-gray-400">-</span>
    },
    {
      title: 'Conta Bancaria',
      dataIndex: 'conta_bancaria_nome',
      key: 'conta_bancaria_nome',
      render: (text: string) => text || <span className="text-gray-400">-</span>
    },
    {
      title: 'Quitado',
      dataIndex: 'recebimento_quitado',
      key: 'recebimento_quitado',
      align: 'center' as const,
      render: (value: boolean, record: ContaReceber) => {
        const quitado = value || record.status === 'recebido';
        return <Tag color={quitado ? 'success' : 'warning'}>{quitado ? 'Sim' : 'Nao'}</Tag>;
      }
    },
    {
      title: 'Compensacao',
      dataIndex: 'data_compensacao',
      key: 'data_compensacao',
      render: (text: string) => formatDate(text)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center' as const,
      width: 120,
      render: (status: string) => {
        let color = 'default';
        if (status === 'recebido') color = 'success';
        if (status === 'pendente') color = 'warning';
        if (status === 'atrasado') color = 'error';
        if (status === 'cancelado') color = 'default';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Acoes',
      key: 'acoes',
      width: 160,
      align: 'center' as const,
      fixed: 'right' as const,
      render: (_: any, record: ContaReceber) => (
        <div className="flex justify-center gap-1">
          <Tooltip title="Visualizar Detalhes">
            <IconButton size="small" onClick={() => handleView(record.id)} sx={{ color: '#6B00A1' }}>
              <VisibilityOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          {record.status !== 'recebido' && record.status !== 'cancelado' && (
            <Tooltip title="Dar Baixa (Registrar Recebimento)">
              <IconButton size="small" onClick={() => clickBaixa(record)} sx={{ color: '#16A34A' }}>
                <CheckCircleOutline fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => handleEdit(record.id)} sx={{ color: '#D97706' }}>
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Excluir">
            <IconButton size="small" onClick={() => clickDelete(record.id)} sx={{ color: '#DC2626' }}>
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
        scroll={{ x: 1800 }}
        size="middle"
      />

      <StatusConfirmationModal
        open={modalDeleteOpen}
        onClose={() => setModalDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Recebimento"
        description="Tem certeza que deseja excluir permanentemente esta Conta a Receber? Operacao arriscada para consistencia de fluxo de caixa."
        confirmText="Sim, Excluir"
        confirmColor="danger"
      />

      <StatusConfirmationModal
        open={modalBaixaOpen}
        onClose={resetBaixa}
        onConfirm={confirmBaixa}
        title="Confirmar Recebimento"
        description={
          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold uppercase text-gray-500 mb-1">Valor original</div>
              <div className="text-lg font-bold text-gray-900">{formatCurrency(valorOriginalBaixa)}</div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Valor recebido</label>
              <InputNumber
                min={0.01}
                max={valorOriginalBaixa || undefined}
                precision={2}
                decimalSeparator=","
                value={valorRecebido}
                onChange={(value) => setValorRecebido(Number(value || 0))}
                style={{ width: '100%' }}
                prefix="R$"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">Data de recebimento</label>
              <DatePicker
                value={dataRecebimento ? dayjs(dataRecebimento) : undefined}
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                onChange={(date) => setDataRecebimento(date ? date.format('YYYY-MM-DD') : '')}
                placeholder="Selecione a data"
              />
            </div>

            {valorRestanteBaixa > 0 && (
              <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                Sera criado um novo recebimento em aberto com saldo de <strong>{formatCurrency(valorRestanteBaixa)}</strong>.
              </div>
            )}
          </div>
        }
        confirmText="Confirmar Baixa"
        confirmColor="success"
        confirmDisabled={baixaInvalida}
      />
    </>
  );
};
