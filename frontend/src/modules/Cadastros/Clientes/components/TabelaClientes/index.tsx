/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import { Table, Tag, Tooltip, message } from "antd";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import dayjs from "dayjs";
import { IconButton } from "@mui/material";
import {
  VisibilityOutlined,
  EditOutlined,
  DeleteForeverOutlined,
  Check,
  Close,
  Block
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useClientes } from "../../hooks/useClientes";
import { StatusConfirmationModal } from "../../../../../components/StatusConfirmationModal";

// Interface atualizada com os campos novos
export interface Cliente {
  id: number;
  nome: string;
  nome_fantasia?: string;
  tipo: string; // Ex: 'PF', 'PJ', 'Física', 'Jurídica'
  cpf_cnpj: string;
  telefone?: string; // Usaremos como Celular
  email?: string;
  cidade?: string;
  estado?: string;
  situacao: 'ativo' | 'inativo';
  data_cadastro?: string;
}

// Helpers de formatação
const formatDocumento = (doc: string) => {
  if (!doc) return '-';
  const clean = doc.replace(/\D/g, '');
  if (clean.length === 11) return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (clean.length === 14) return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return doc;
};

const formatPhone = (phone: string) => {
  if (!phone) return '-';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 11) return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (clean.length === 10) return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return phone;
};

interface TabelaClientesProps {
  clientes: Cliente[];
  isLoading: boolean;
  onRefresh: () => void;
  onChange: (pagination: any, filters: any, sorter: any) => void;
  pagination: TablePaginationConfig;
}

export const TabelaClientes: React.FC<TabelaClientesProps> = ({
  clientes,
  isLoading,
  onRefresh,
  onChange,
  pagination
}) => {
  const navigate = useNavigate();
  const { mudarStatusCliente } = useClientes();
  
  // States Modal e Seleção
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'ativar' | 'desativar' | null>(null);
  const [clienteAlvo, setClienteAlvo] = useState<Cliente | null>(null);
  const [, setActionLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // Handlers
  const handleEdit = (id: number) => navigate(`/cadastros/clientes/editar/${id}`);
  const handleView = (id: number) => navigate(`/cadastros/clientes/visualizar/${id}`);

  const abrirModalStatus = (cliente: Cliente) => {
    setClienteAlvo(cliente);
    setModalType(cliente.situacao === 'ativo' ? 'desativar' : 'ativar');
    setModalVisible(true);
  };

  const confirmarMudancaStatus = async () => {
    if (!clienteAlvo || !modalType) return;
    setActionLoading(true);
    try {
      const novoStatus = modalType === 'ativar' ? 'ativo' : 'inativo';
      await mudarStatusCliente(String(clienteAlvo.id), novoStatus);
      message.success(`Cliente ${modalType === 'ativar' ? 'ativado' : 'desativado'} com sucesso!`);
      setModalVisible(false);
      onRefresh();
    } catch (error) {
      console.error(error)
      message.error("Erro ao alterar status do cliente.");
    } finally {
      setActionLoading(false);
    }
  };

  const renderSituacao = (situacao: string) => {
    const isAtivo = situacao === 'ativo';
    return (
      <Tooltip title={isAtivo ? "Ativo" : situacao == "bloqueado" ? "Bloqueado" : "Inativo"}>
        <span className={`${isAtivo ? 'text-[#61CD6F]' : situacao == "bloqueado" ? 'text-[#000000]' : 'text-[#D0214B]'}`}>
          {isAtivo ? <Check /> : situacao == "bloqueado" ? <Block /> : <Close />}
        </span>
      </Tooltip>
    );
  };

  const renderTipoCliente = (tipo: string) => {
    const tiposConfig: Record<string, { color: string; label: string }> = {
      'PF': { color: 'blue', label: 'PESSOA FÍSICA' },
      'PJ': { color: 'purple', label: 'PESSOA JURÍDICA' },
      'estrangeiro': { color: 'orange', label: 'ESTRANGEIRO' }
    };
    
    const config = tiposConfig[tipo] || { color: 'default', label: tipo };
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  // Definição das Colunas
  const columns: TableColumnsType<Cliente> = useMemo(() => [
    {
      title: 'Nome',
      dataIndex: 'nome',
      sorter: true,
      fixed: 'left',
      width: 250,
      render: (text, record) => (
        <div className="flex flex-col">
          <span className="font-bold text-[#3C0473] text-base">{text}</span>
          {record.nome_fantasia && (
            <span className="text-xs text-gray-500">{record.nome_fantasia}</span>
          )}
        </div>
      )
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo_cliente',
      width: 130,
      align: 'center',
      render: (tipo: string) => renderTipoCliente(tipo)
    },
    {
      title: 'Documento',
      dataIndex: 'cpf_cnpj',
      width: 175,
      render: (val) => <span className="font-mono text-gray-700">{formatDocumento(val)}</span>
    },
    {
      title: 'Celular',
      dataIndex: 'telefone',
      width: 140,
      render: (val) => formatPhone(val)
    },
    {
      title: 'E-mail',
      dataIndex: 'email',
      width: 200,
      ellipsis: true, // Corta textos muito longos com "..."
      render: (val) => val ? <span className="text-gray-600" title={val}>{val}</span> : '-'
    },
    {
      title: 'Localização',
      dataIndex: 'localizacao',
      width: 180
    },
    {
      title: 'Cadastrado em',
      dataIndex: 'data_cadastro',
      width: 150,
      render: (val) => val ? dayjs(val).format('DD/MM/YYYY') : '-'
    },
    {
      title: 'Status',
      dataIndex: 'situacao',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (situacao: string) => renderSituacao(situacao),
    },
    {
      title: 'Ações',
      key: 'acoes',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <div className="flex justify-center gap-1">
          <Tooltip title="Visualizar">
            <IconButton size="small" onClick={() => handleView(record.id)} color="primary">
              <VisibilityOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => handleEdit(record.id)} color="warning">
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={record.situacao === 'ativo' ? "Desativar" : "Ativar"}>
            <IconButton 
              size="small" 
              onClick={() => abrirModalStatus(record)}
              color={record.situacao === 'ativo' ? "error" : "success"}
            >
              {record.situacao === 'ativo' 
                ? <DeleteForeverOutlined fontSize="small" /> 
                : <Check fontSize="small" />
              }
            </IconButton>
          </Tooltip>
        </div>
      )
    }
  ], [handleView, handleEdit]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedKeys: React.Key[]) => setSelectedRowKeys(newSelectedKeys),
  };

  const rows: any = clientes?.map((cliente: any) => ({
    key: cliente.id,
    id: cliente.id,
    nome: cliente.nome,
    tipo_cliente: cliente.tipo_cliente,
    cpf_cnpj: cliente.cpf || cliente.cnpj || '',
    telefone: cliente.telefone_principal,
    email: cliente.email,
    data_cadastro: cliente.criado_em,
    situacao: cliente.situacao,
    localizacao: cliente.localizacao || "-"
  }));

  return (
    <>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={rows}
        loading={isLoading}
        onChange={onChange}
        pagination={{ ...pagination }}
        rowSelection={rowSelection}
        scroll={{ x: 1300 }}
      />

      <StatusConfirmationModal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={confirmarMudancaStatus}
        title={modalType === 'ativar' ? "Ativar Cliente" : "Inativar Cliente"}
        description={
          <span>
            Deseja alterar o status de <strong>{clienteAlvo?.nome}</strong> para {modalType}?
          </span>
        }
        confirmText="Confirmar Alteração"
        confirmColor={modalType === 'ativar' ? 'success' : 'danger'}
      />
    </>
  );
};