/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import { Table, Tag, Tooltip, Avatar } from "antd";
import type { TableColumnsType, TablePaginationConfig } from "antd";
import dayjs from "dayjs";
import { IconButton } from "@mui/material";
import {
  VisibilityOutlined,
  EditOutlined,
  DeleteForeverOutlined,
  ImageNotSupported,
  Inventory2
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { StatusConfirmationModal } from "../../../../../components/StatusConfirmationModal";

export interface Produto {
  id: number;
  nome: string;
  codigo_interno?: string; // SKU
  codigo_barras?: string;  // EAN
  categoria_nome?: string;
  marca_nome?: string;
  unidade_sigla: string;
  preco_venda: number;
  estoque_atual: number;
  imagem_capa?: { url_imagem: string };
  situacao: 'ativo' | 'inativo';
  criado_em?: string;
}

interface TabelaProdutosProps {
  produtos: Produto[];
  isLoading: boolean;
  onRefresh: () => void;
  onChange: (pagination: any, filters: any, sorter: any) => void;
  pagination: TablePaginationConfig;
  onDelete: (id: number) => Promise<void>; // Função de delete passada pelo pai
}

export const TabelaProdutos: React.FC<TabelaProdutosProps> = ({
  produtos,
  isLoading,
  onRefresh,
  onChange,
  pagination,
  onDelete
}) => {
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // Estados do Modal de Exclusão
  const [modalOpen, setModalOpen] = useState(false);
  const [produtoParaDeletar, setProdutoParaDeletar] = useState<number | null>(null);

  // --- Handlers ---
  const handleView = (id: number) => navigate(`/cadastros/produtos/visualizar/${id}`);
  const handleEdit = (id: number) => navigate(`/cadastros/produtos/editar/${id}`);
  
  const clickDelete = (id: number) => {
    setProdutoParaDeletar(id);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (produtoParaDeletar) {
      await onDelete(produtoParaDeletar);
      setModalOpen(false);
      setProdutoParaDeletar(null);
      onRefresh(); // Recarrega a lista
    }
  };

  // --- Definição das Colunas ---
  const columns: TableColumnsType<any> = useMemo(() => [
    {
      title: 'Produto',
      dataIndex: 'produto_info',
      key: 'nome',
      width: 300,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          {/* Avatar / Imagem */}
          <Avatar 
            shape="square" 
            size={48} 
            src={record.imagem_capa?.url_imagem}
            icon={<ImageNotSupported className="text-gray-400" />}
            className="bg-gray-100 border border-gray-200 flex-shrink-0"
          />
          
          {/* Nome e SKU */}
          <div className="flex flex-col">
            <span className="font-bold text-gray-800 line-clamp-2 leading-tight">
              {record.nome}
            </span>
            <div className="flex gap-2 text-xs text-gray-500 mt-0.5">
              {record.codigo_interno && (
                <span className="bg-gray-100 px-1 rounded border">SKU: {record.codigo_interno}</span>
              )}
              {record.marca_nome && <span>{record.marca_nome}</span>}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Categoria',
      dataIndex: 'categoria_nome',
      key: 'categoria',
      width: 150,
      render: (val) => val ? <Tag color="blue">{val}</Tag> : '-'
    },
    {
      title: 'Preço Venda',
      dataIndex: 'preco_venda',
      key: 'preco_venda',
      width: 140,
      render: (val) => (
        <span className="font-medium text-gray-700">
          {Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      )
    },
    {
      title: 'Estoque',
      key: 'estoque',
      width: 140,
      render: (_, record) => {
        const estoque = Number(record.estoque_atual);
        const isBaixo = estoque <= (record.estoque_minimo || 0);
        const color = estoque <= 0 ? 'red' : isBaixo ? 'orange' : 'green';
        
        return (
          <div className="flex items-center gap-1">
            <Inventory2 sx={{ fontSize: 16, color: estoque <= 0 ? '#ef4444' : '#9ca3af' }} />
            <span className={`font-semibold text-${color}-600`}>
              {estoque.toLocaleString('pt-BR')} {record.unidade_sigla}
            </span>
          </div>
        )
      }
    },
    {
      title: 'Situação',
      dataIndex: 'situacao',
      key: 'situacao',
      width: 100,
      align: 'center',
      render: (situacao: string) => {
        const color = situacao === 'ativo' ? 'success' : 'error';
        return <Tag color={color}>{situacao.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Cadastrado em',
      dataIndex: 'data_cadastro',
      width: 150,
      render: (val) => val ? dayjs(val).format('DD/MM/YYYY') : '-'
    },
    {
      title: 'Ações',
      key: 'acoes',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <div className="flex justify-center gap-1">
          <Tooltip title="Visualizar Detalhes">
            <IconButton size="small" onClick={() => handleView(record.id)} sx={{ color: '#6B00A1' }}>
              <VisibilityOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => handleEdit(record.id)} color="primary">
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Excluir">
            <IconButton 
              size="small" 
              onClick={() => clickDelete(record.id)} 
              color="error"
            >
              <DeleteForeverOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      )
    }
  ], [navigate, onDelete, onRefresh]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedKeys: React.Key[]) => setSelectedRowKeys(newSelectedKeys),
  };

  return (
    <>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={produtos}
        loading={isLoading}
        onChange={onChange}
        pagination={{ 
          ...pagination, 
          showSizeChanger: true, 
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `Total de ${total} produtos`
        }}
        rowSelection={rowSelection}
        scroll={{ x: 1000 }}
        size="middle"
      />

      {/* Modal de Confirmação de Exclusão */}
      <StatusConfirmationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmDelete}
        title="Excluir Produto"
        description="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
        confirmText="Sim, Excluir"
        confirmColor="danger" // Botão Vermelho
      />
    </>
  );
};