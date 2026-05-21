/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useState } from "react";
import { Table, Tag, Tooltip, message } from "antd";
import type { TableColumnsType, TablePaginationConfig, TableProps } from "antd";
import dayjs from "dayjs";
import { IconButton } from "@mui/material";
import { Check, Close, DeleteForeverOutlined, EditOutlined, VisibilityOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useFornecedores } from "../../hooks/useFornecedores";
import { StatusConfirmationModal } from "../../../../../components/StatusConfirmationModal";

interface TabelaFornecedoresProps {
  fornecedores: any[];
  isLoading: boolean;
  onRefresh: () => void;
  onChange: TableProps<any>["onChange"];
  pagination?: TablePaginationConfig;
}

const formatDocumento = (doc: string) => {
  if (!doc) return "-";
  const clean = doc.replace(/\D/g, "");
  if (clean.length === 11) return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (clean.length === 14) return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return doc;
};

const formatPhone = (phone: string) => {
  if (!phone) return "-";
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 11) return clean.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  if (clean.length === 10) return clean.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  return phone;
};

export const TabelaFornecedores: React.FC<TabelaFornecedoresProps> = ({
  fornecedores,
  isLoading,
  onRefresh,
  onChange,
  pagination
}) => {
  const navigate = useNavigate();
  const { mudarStatusFornecedor } = useFornecedores();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"ativar" | "desativar" | null>(null);
  const [fornecedorAlvo, setFornecedorAlvo] = useState<any>(null);
  const [, setActionLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const abrirModalStatus = (fornecedor: any) => {
    setFornecedorAlvo(fornecedor);
    setModalType(fornecedor.situacao === "ativo" ? "desativar" : "ativar");
    setModalVisible(true);
  };

  const confirmarMudancaStatus = async () => {
    if (!fornecedorAlvo || !modalType) return;

    setActionLoading(true);
    try {
      const novoStatus = modalType === "ativar" ? "ativo" : "inativo";
      await mudarStatusFornecedor(String(fornecedorAlvo.id), novoStatus);
      message.success(`Fornecedor ${modalType === "ativar" ? "ativado" : "desativado"} com sucesso!`);
      setModalVisible(false);
      setSelectedRowKeys((keys) => keys.filter((key) => key !== fornecedorAlvo.id));
      onRefresh();
    } catch (error) {
      console.error(error);
      message.error("Erro ao alterar status do fornecedor.");
    } finally {
      setActionLoading(false);
    }
  };

  const renderSituacao = (situacao: string) => {
    const isAtivo = situacao === "ativo";
    return (
      <Tooltip title={isAtivo ? "Ativo" : "Inativo"}>
        <span className={isAtivo ? "text-[#61CD6F]" : "text-[#D0214B]"}>
          {isAtivo ? <Check /> : <Close />}
        </span>
      </Tooltip>
    );
  };

  const renderTipoFornecedor = (tipo: string) => {
    const tiposConfig: Record<string, { color: string; label: string }> = {
      PF: { color: "blue", label: "PESSOA FÍSICA" },
      PJ: { color: "purple", label: "PESSOA JURÍDICA" },
      estrangeiro: { color: "orange", label: "ESTRANGEIRO" }
    };

    const config = tiposConfig[tipo] || { color: "default", label: tipo || "-" };
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  const rows = (fornecedores || []).map((fornecedor: any) => ({
    key: fornecedor.id,
    id: fornecedor.id,
    nome: fornecedor.nome,
    razao_social: fornecedor.razao_social,
    tipo_fornecedor: fornecedor.tipo_fornecedor,
    documento: fornecedor.documento || fornecedor.documento_principal || fornecedor.cpf || fornecedor.cnpj || "",
    situacao: fornecedor.situacao,
    telefone_comercial: fornecedor.telefone_comercial || "",
    telefone_celular: fornecedor.telefone_celular || "",
    email: fornecedor.email || "",
    criado_em: fornecedor.criado_em
  }));

  const columns: TableColumnsType<any> = useMemo(() => [
    {
      title: "Nome",
      dataIndex: "nome",
      sorter: true,
      fixed: "left",
      width: 250,
      render: (text, record) => (
        <div className="flex flex-col">
          <span className="font-bold text-[#3C0473] text-base">{text || "-"}</span>
          {record.razao_social && <span className="text-xs text-gray-500">{record.razao_social}</span>}
        </div>
      )
    },
    {
      title: "Tipo",
      dataIndex: "tipo_fornecedor",
      width: 130,
      align: "center",
      render: renderTipoFornecedor
    },
    {
      title: "Documento",
      dataIndex: "documento",
      width: 175,
      render: (val) => <span className="font-mono text-gray-700">{formatDocumento(val)}</span>
    },
    {
      title: "Telefone",
      dataIndex: "telefone_comercial",
      width: 140,
      render: formatPhone
    },
    {
      title: "Celular",
      dataIndex: "telefone_celular",
      width: 140,
      render: formatPhone
    },
    {
      title: "E-mail",
      dataIndex: "email",
      width: 200,
      ellipsis: true,
      render: (val) => val ? <span className="text-gray-600" title={val}>{val}</span> : "-"
    },
    {
      title: "Cadastrado em",
      dataIndex: "criado_em",
      width: 150,
      render: (val) => val ? dayjs(val).format("DD/MM/YYYY") : "-"
    },
    {
      title: "Status",
      dataIndex: "situacao",
      width: 100,
      align: "center",
      fixed: "right",
      render: renderSituacao
    },
    {
      title: "Ações",
      key: "acoes",
      width: 120,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <div className="flex justify-center gap-1">
          <Tooltip title="Visualizar">
            <IconButton size="small" onClick={() => navigate(`/cadastros/fornecedores/visualizar/${record.id}`)} color="primary">
              <VisibilityOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => navigate(`/cadastros/fornecedores/editar/${record.id}`)} color="warning">
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={record.situacao === "ativo" ? "Desativar" : "Ativar"}>
            <IconButton size="small" onClick={() => abrirModalStatus(record)} color={record.situacao === "ativo" ? "error" : "success"}>
              {record.situacao === "ativo" ? <DeleteForeverOutlined fontSize="small" /> : <Check fontSize="small" />}
            </IconButton>
          </Tooltip>
        </div>
      )
    }
  ], [navigate]);

  return (
    <>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={rows}
        loading={isLoading}
        onChange={onChange}
        pagination={{ ...pagination }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys)
        }}
        scroll={{ x: 1300 }}
        locale={{ emptyText: "Nenhum fornecedor encontrado" }}
      />

      <StatusConfirmationModal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={confirmarMudancaStatus}
        title={modalType === "ativar" ? "Ativar Fornecedor" : "Inativar Fornecedor"}
        description={
          <span>
            Deseja alterar o status de <strong>{fornecedorAlvo?.nome}</strong> para {modalType}?
          </span>
        }
        confirmText="Confirmar Alteração"
        confirmColor={modalType === "ativar" ? "success" : "danger"}
      />
    </>
  );
};
