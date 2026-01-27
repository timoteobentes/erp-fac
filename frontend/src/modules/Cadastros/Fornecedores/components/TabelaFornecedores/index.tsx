/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Table,
  Modal,
  Tag,
  Tooltip,
  message,
  // Dropdown,
  // Menu
} from "antd";
import type { TableColumnsType, TableProps } from "antd";
import dayjs from "dayjs";
import { IconButton, Button } from "@mui/material";
import {
  Close,
  Check,
  VisibilityOutlined,
  EditOutlined,
  DeleteForeverOutlined
  // MoreVert
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useFornecedores } from "../../hooks/useFornecedores";

interface TabelaFornecedoresProps {
  fornecedores: any;
  isLoading: boolean;
  onRefresh: () => void;
  onChange: (e: any) => void;
  pagination?: any;
}

export const TabelaFornecedores: React.FC<TabelaFornecedoresProps> = ({
  fornecedores,
  isLoading,
  onRefresh,
  onChange,
  pagination
}) => {
  const navigate = useNavigate();
  const { mudarStatusFornecedor } = useFornecedores();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'ativar' | 'desativar' | null>(null);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<any>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showModal = (fornecedor: any, type: 'ativar' | 'desativar') => {
    setFornecedorSelecionado(fornecedor);
    setModalType(type);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (!fornecedorSelecionado || !modalType) return;
    
    setConfirmLoading(true);
    try {
      const situacao = modalType === 'ativar' ? 'ativo' : 'inativo';
      await mudarStatusFornecedor(fornecedorSelecionado.key, situacao);
      
      message.success(`Fornecedor ${modalType === 'ativar' ? 'ativado' : 'desativado'} com sucesso!`);
      onRefresh();
      setIsModalVisible(false);
      setFornecedorSelecionado(null);
      setModalType(null);
      
      // Limpar seleção se o fornecedor estava selecionado
      setSelectedRowKeys(prev => prev.filter(key => key !== fornecedorSelecionado.key));
      setSelectedRows(prev => prev.filter(row => row.key !== fornecedorSelecionado.key));
    } catch (error: any) {
      message.error(`Erro ao ${modalType === 'ativar' ? 'ativar' : 'desativar'} fornecedor: ${error.message}`);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setFornecedorSelecionado(null);
    setModalType(null);
  };

  const handleVisualizar = (fornecedorId: string) => {
    navigate('/cadastros/fornecedores/visualizar', {
      state: { fornecedorId }
    });
  };

  const handleEditar = (fornecedorId: string) => {
    navigate('/cadastros/fornecedores/editar', {
      state: { fornecedorId }
    });
  };

  const rowSelection: TableProps<any>['rowSelection'] = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[], selectedRows: any[]) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
    getCheckboxProps: (record: any) => ({
      disabled: record.situacao === 'inativo', // Não permite selecionar fornecedores inativos
      name: record.nome,
    }),
  };

  // Função para ativar/desativar múltiplos fornecedores
  const handleBulkStatusChange = async (situacao: 'ativo' | 'inativo') => {
    if (selectedRows.length === 0) {
      message.warning('Selecione pelo menos um fornecedor');
      return;
    }

    const isAtivar = situacao === 'ativo';
    Modal.confirm({
      title: `${isAtivar ? 'Ativar' : 'Desativar'} Múltiplos Fornecedores`,
      content: `Deseja ${isAtivar ? 'ativar' : 'desativar'} ${selectedRows.length} fornecedor(es) selecionado(s)?`,
      okText: `Sim, ${isAtivar ? 'Ativar' : 'Desativar'}`,
      cancelText: 'Cancelar',
      okButtonProps: {
        style: { backgroundColor: isAtivar ? '#52c41a' : '#f5222d', borderColor: isAtivar ? '#52c41a' : '#f5222d' }
      },
      centered: true,
      async onOk() {
        try {
          const promises = selectedRows.map(row =>
            mudarStatusFornecedor(row.key, situacao)
          );
          
          await Promise.all(promises);
          message.success(`${selectedRows.length} fornecedor(es) ${isAtivar ? 'ativado(s)' : 'desativado(s)'} com sucesso!`);
          onRefresh();
          
          // Limpar seleção após operação
          setSelectedRowKeys([]);
          setSelectedRows([]);
        } catch (error: any) {
          message.error(`Erro ao ${isAtivar ? 'ativar' : 'desativar'} fornecedores: ${error.message}`);
        }
      }
    });
  };

  const renderSituacao = (situacao: string) => {
    const isAtivo = situacao === 'ativo';
    return (
      <span className={`${isAtivo ? 'text-[#61CD6F]' : 'text-[#D0214B]'}`}>
        {isAtivo ? <Check /> : <Close />}
      </span>
    );
  };

  const renderTipoFornecedor = (tipo: string) => {
    const tiposConfig: Record<string, { color: string; label: string }> = {
      'PF': { color: 'blue', label: 'Pessoa Física' },
      'PJ': { color: 'purple', label: 'Pessoa Jurídica' },
      'estrangeiro': { color: 'orange', label: 'Estrangeiro' }
    };
    
    const config = tiposConfig[tipo] || { color: 'default', label: tipo };
    return <Tag color={config.color}>{config.label}</Tag>;
  };

  // const renderDocumento = (fornecedor: any) => {
  //   if (fornecedor.tipo_fornecedor === 'PF') return fornecedor.cpf || '-';
  //   if (fornecedor.tipo_fornecedor === 'PJ') return fornecedor.cnpj || '-';
  //   if (fornecedor.tipo_fornecedor === 'estrangeiro') return fornecedor.documento || '-';
  //   return '-';
  // };

  const columns: TableColumnsType = [
    // {
    //   title: 'Código',
    //   dataIndex: 'id',
    //   key: 'id',
    //   width: 80,
    //   sorter: true
    // },
    {
      title: 'Nome',
      dataIndex: 'nome',
      key: 'nome',
      sorter: true
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo_fornecedor',
      key: 'tipo_fornecedor',
      // width: 120,
      render: (tipo: string) => renderTipoFornecedor(tipo)
    },
    {
      title: 'Situação',
      dataIndex: 'situacao',
      key: 'situacao',
      // width: 100,
      render: (situacao: string) => renderSituacao(situacao),
      // filters: [
      //   { text: 'Ativo', value: 'ativo' },
      //   { text: 'Inativo', value: 'inativo' }
      // ],
      // onFilter: (value, record) => record.situacao === value
    },
    {
      title: 'Telefone',
      dataIndex: 'telefone_comercial',
      key: 'telefone_comercial',
      // width: 120
    },
    {
      title: 'Celular',
      dataIndex: 'telefone_celular',
      key: 'telefone_celular',
      // width: 120
    },
    {
      title: 'E-mail',
      dataIndex: 'email',
      key: 'email',
      // width: 200,
      ellipsis: true
    },
    {
      title: 'Cadastrado em',
      dataIndex: 'criado_em',
      key: 'criado_em',
      // width: 120,
      align: 'center',
      render: (data: string) => dayjs(data).format("DD/MM/YYYY"),
      sorter: (a, b) => dayjs(a.criado_em).unix() - dayjs(b.criado_em).unix()
    },
    {
      title: 'Ações',
      dataIndex: 'acoes',
      key: 'acoes',
      // width: 150,
      align: 'center',
      render: (_: any, record: any) => {
        const isAtivo = record.situacao === 'ativo';
        
        // const menuItems = [
        //   {
        //     key: 'view',
        //     label: 'Visualizar',
        //     icon: <VisibilityOutlined />,
        //     onClick: () => handleVisualizar(record.key)
        //   },
        //   {
        //     key: 'edit',
        //     label: 'Editar',
        //     icon: <EditOutlined />,
        //     disabled: !isAtivo,
        //     onClick: () => handleEditar(record.key)
        //   },
        //   {
        //     key: 'status',
        //     label: isAtivo ? 'Desativar' : 'Ativar',
        //     icon: isAtivo ? <Close /> : <Check />,
        //     danger: isAtivo,
        //     onClick: () => showModal(record, isAtivo ? 'desativar' : 'ativar')
        //   }
        // ];

        // const menu = (
        //   <Menu>
        //     {menuItems.map(item => (
        //       <Menu.Item 
        //         key={item.key} 
        //         icon={item.icon} 
        //         disabled={item.disabled}
        //         danger={item.danger}
        //         onClick={item.onClick}
        //       >
        //         {item.label}
        //       </Menu.Item>
        //     ))}
        //   </Menu>
        // );

        return (
          <div className="flex items-center justify-center gap-1">
            <Tooltip title="Visualizar">
              <IconButton
                size="small"
                style={{ color: '#6B00A1' }}
                onClick={() => handleVisualizar(record.key)}
              >
                <VisibilityOutlined />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={isAtivo ? "Editar" : "Edição bloqueada para fornecedores inativos"}>
              <span>
                <IconButton
                  size="small"
                  style={{ 
                    color: isAtivo ? '#174FE2' : '#ccc',
                    cursor: isAtivo ? 'pointer' : 'not-allowed'
                  }}
                  onClick={() => isAtivo && handleEditar(record.key)}
                  disabled={!isAtivo}
                >
                  <EditOutlined />
                </IconButton>
              </span>
            </Tooltip>
            
            <Tooltip title={isAtivo ? "Desativar" : "Ativar"}>
              <IconButton
                size="small"
                style={{ 
                  color: isAtivo ? '#D0214B' : '#52c41a',
                }}
                onClick={() => showModal(record, isAtivo ? 'desativar' : 'ativar')}
              >
                {isAtivo ? <DeleteForeverOutlined /> : <Check />}
              </IconButton>
            </Tooltip>
            
            {/* Dropdown alternativo */}
            {/* <Dropdown overlay={menu} trigger={['click']}>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Dropdown> */}
          </div>
        );
      }
    }
  ];

  const rows: any = fornecedores?.map((fornecedor: any) => ({
    key: fornecedor.id,
    id: fornecedor.id,
    nome: fornecedor.nome,
    tipo_fornecedor: fornecedor.tipo_fornecedor,
    cpf: fornecedor.cpf,
    cnpj: fornecedor.cnpj,
    documento: fornecedor.documento || fornecedor.documento_principal,
    situacao: fornecedor.situacao,
    telefone_comercial: fornecedor.telefone_comercial || "-",
    telefone_celular: fornecedor.telefone_celular || "-",
    email: fornecedor.email || "-",
    criado_em: fornecedor.criado_em,
    atualizado_em: fornecedor.atualizado_em,
    vendedor_responsavel: fornecedor.vendedor_responsavel,
    limite_credito: fornecedor.limite_credito,
    permitir_ultrapassar_limite: fornecedor.permitir_ultrapassar_limite
  }));

  // Toolbar com ações em lote
  const BulkActionsToolbar = () => {
    if (selectedRows.length === 0) return null;

    const todosInativos = selectedRows.every(row => row.situacao === 'inativo');
    const todosAtivos = selectedRows.every(row => row.situacao === 'ativo');
    
    return (
      <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {selectedRows.length} fornecedor(es) selecionado(s)
          </span>
          <Tag color="blue">{selectedRows.length}</Tag>
        </div>
        
        <div className="flex gap-2">
          {todosInativos && (
            <Tooltip title="Ativar fornecedores selecionados">
              <Button
                // type="primary"
                startIcon={<Check />}
                onClick={() => handleBulkStatusChange('ativo')}
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Ativar
              </Button>
            </Tooltip>
          )}
          
          {todosAtivos && (
            <Tooltip title="Desativar fornecedores selecionados">
              <Button
                // type="primary"
                startIcon={<Close />}
                onClick={() => handleBulkStatusChange('inativo')}
                style={{ backgroundColor: '#f5222d', borderColor: '#f5222d' }}
              >
                Desativar
              </Button>
            </Tooltip>
          )}
          
          <Button
            onClick={() => {
              setSelectedRowKeys([]);
              setSelectedRows([]);
            }}
          >
            Limpar seleção
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Toolbar de ações em lote */}
      <BulkActionsToolbar />

      <Table
        rowSelection={{
          type: 'checkbox',
          ...rowSelection,
          selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
          ]
        }}
        columns={columns}
        dataSource={rows}
        loading={isLoading}
        pagination={{
          ...pagination,
          // showSizeChanger: true,
          // showQuickJumper: true,
          // showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} fornecedores`,
          // pageSizeOptions: ['10', '20', '50', '100']
        }}
        onChange={onChange}
        rowKey="key"
        style={{ width: "100%" }}
        scroll={{ x: 1300 }}
        rowClassName={(record) => {
          if (record.situacao === 'inativo') {
            return 'bg-gray-50 hover:bg-gray-100';
          }
          return '';
        }}
        locale={{
          emptyText: 'Nenhum fornecedor encontrado'
        }}
      />

      {/* Modal de confirmação para ativar/desativar */}
      <Modal
        title={modalType === 'ativar' ? 'Ativar Fornecedor' : 'Desativar Fornecedor'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={modalType === 'ativar' ? 'Sim, Ativar' : 'Sim, Desativar'}
        cancelText="Cancelar"
        confirmLoading={confirmLoading}
        okButtonProps={{
          style: { 
            backgroundColor: modalType === 'ativar' ? '#52c41a' : '#f5222d', 
            borderColor: modalType === 'ativar' ? '#52c41a' : '#f5222d' 
          }
        }}
        centered
      >
        <div className="py-4">
          {modalType === 'ativar' ? (
            <>
              <p className="text-lg mb-2">
                Deseja ativar o fornecedor <strong>{fornecedorSelecionado?.nome}</strong>?
              </p>
              <p className="text-gray-600">
                O fornecedor voltará a aparecer nas listas e poderá ser selecionado para novas operações.
              </p>
            </>
          ) : (
            <>
              <p className="text-lg mb-2">
                Deseja desativar o fornecedor <strong>{fornecedorSelecionado?.nome}</strong>?
              </p>
              <div className="space-y-2 text-gray-600">
                <p>⚠️ Esta ação irá:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>Marcar o fornecedor como inativo</li>
                  <li>Remover das listas de fornecedores ativos</li>
                  <li>Bloquear edições no cadastro</li>
                  <li>Impedir novas operações com este fornecedor</li>
                </ul>
                <p className="mt-2">
                  <strong>Observação:</strong> O histórico permanecerá disponível para consulta.
                </p>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};