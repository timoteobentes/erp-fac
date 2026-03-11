import React, { useState, useEffect } from "react";
import { Card, CardContent, Collapse, Button, TextField, MenuItem, IconButton, Tooltip } from "@mui/material";
import { ConfigProvider, Table, Tag } from "antd";
import Layout from "../../../template/Layout";
import { useNavigate } from "react-router-dom";
import { useContasPagar } from "../../../modules/Financeiro/ContasPagar/hooks/useContasPagar";
import type { FiltrosContaPagar } from "../../../modules/Financeiro/ContasPagar/services/contasPagarService";
import { FilterList, Add, Payments, Visibility, Delete } from "@mui/icons-material";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  // workaround fuso horário simples
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  return date.toLocaleDateString('pt-BR');
};

const ContasPagar: React.FC = () => {
  const navigate = useNavigate();
  const { contas, isLoading, resumo, fetchContas, darBaixa, excluirConta } = useContasPagar();
  const [mounted, setMounted] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [filtros, setFiltros] = useState<FiltrosContaPagar>({});

  useEffect(() => {
    fetchContas();
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, [fetchContas]);

  const handleBuscar = () => {
    fetchContas(filtros);
  };

  const handleLimparFiltros = () => {
    setFiltros({});
    fetchContas({});
  };

  const confirmarBaixa = (id: number) => {
    if (window.confirm('Deseja realmente dar baixa nesta conta com a data de hoje?')) {
      darBaixa(id);
    }
  };

  const confirmarExclusao = (id: number) => {
    if (window.confirm('Esta ação não pode ser desfeita! Tem certeza que deseja excluir esta conta?')) {
      excluirConta(id);
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
    },
    {
      title: 'Entidade / Fornecedor',
      dataIndex: 'fornecedor_nome',
      key: 'fornecedor_nome',
      render: (text: string) => text || 'Avulso'
    },
    {
      title: 'Data Venc.',
      dataIndex: 'data_vencimento',
      key: 'data_vencimento',
      render: (text: string) => formatDate(text)
    },
    {
      title: 'Valor',
      dataIndex: 'valor_total',
      key: 'valor_total',
      render: (val: number) => formatCurrency(val)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let text = status.toUpperCase();
        if (status === 'pago') color = 'success';
        if (status === 'pendente') color = 'warning';
        if (status === 'cancelado') color = 'error';
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Ações',
      key: 'acoes',
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          {record.status !== 'pago' && record.status !== 'cancelado' && (
            <Tooltip title="Dar Baixa (Pagar)">
              <IconButton size="small" color="success" onClick={() => confirmarBaixa(record.id)}>
                <Payments fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Visualizar/Despesas">
            <IconButton size="small" color="info" onClick={() => {}}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir">
            <IconButton size="small" color="error" onClick={() => confirmarExclusao(record.id)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <div className={`transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-full text-start mb-6">
          <span className="text-[#9842F6] font-bold text-2xl">Contas a Pagar</span>
        </div>

        {/* CARDS DE RESUMO */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card sx={{ border: "1px solid #E9DEF6", boxShadow: "none" }}>
            <CardContent>
              <div className="text-sm font-semibold text-gray-500 mb-2 flex justify-between">
                A vencer <span className="text-[#9842F6]">➔</span>
              </div>
              <div className="text-2xl font-bold text-[#9842F6]">{formatCurrency(resumo.aVencer)}</div>
            </CardContent>
          </Card>
          <Card sx={{ border: "1px solid #E9DEF6", boxShadow: "none" }}>
            <CardContent>
              <div className="text-sm font-semibold text-gray-500 mb-2 flex justify-between">
                Vence hoje <span className="text-[#9842F6]">➔</span>
              </div>
              <div className="text-2xl font-bold text-[#f44336]">{formatCurrency(resumo.venceHoje)}</div>
            </CardContent>
          </Card>
          <Card sx={{ border: "1px solid #E9DEF6", boxShadow: "none" }}>
            <CardContent>
              <div className="text-sm font-semibold text-gray-500 mb-2 flex justify-between">
                Vencidos <span className="text-[#9842F6]">➔</span>
              </div>
              <div className="text-2xl font-bold text-[#6B00A1]">{formatCurrency(resumo.vencidos)}</div>
            </CardContent>
          </Card>
          <Card sx={{ border: "1px solid #E9DEF6", boxShadow: "none" }}>
            <CardContent>
              <div className="text-sm font-semibold text-gray-500 mb-2 flex justify-between">
                Pagos <span className="text-[#9842F6]">➔</span>
              </div>
              <div className="text-2xl font-bold text-[#4caf50]">{formatCurrency(resumo.pagos)}</div>
            </CardContent>
          </Card>
          <Card sx={{ border: "1px solid #E9DEF6", boxShadow: "none" }}>
            <CardContent>
              <div className="text-sm font-semibold text-gray-500 mb-2 flex justify-between">
                Total <span className="text-[#9842F6]">➔</span>
              </div>
              <div className="text-2xl font-bold text-[#6B00A1]">{formatCurrency(resumo.total)}</div>
            </CardContent>
          </Card>
        </div>

        {/* AÇÕES E FILTROS */}
        <Card sx={{ boxShadow: "none !important", borderRadius: "4px", border: "1px solid #E9DEF6", mb: 4 }}>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
              <div className="flex gap-2 w-full md:w-auto">
                <Button 
                  variant="contained" 
                  startIcon={<Add />} 
                  sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' }, textTransform: 'none' }}
                  onClick={() => navigate('/financeiro/pagar/novo')}
                >
                  Adicionar
                </Button>
                {/* Outros botões como Transferir, etc */}
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  variant="contained"
                  startIcon={<FilterList />}
                  sx={{ bgcolor: '#6B00A1', '&:hover': { bgcolor: '#3C0473' }, textTransform: 'none' }}
                  onClick={() => setOpenFilters(!openFilters)}
                >
                  Busca avançada
                </Button>
              </div>
            </div>

            <Collapse in={openFilters}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded mb-4 border border-gray-200">
                <TextField
                  label="Status"
                  select
                  size="small"
                  value={filtros.status || ''}
                  onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="pago">Pago</MenuItem>
                  <MenuItem value="vencido">Vencido</MenuItem>
                </TextField>
                <TextField
                  label="Data Início (Venc.)"
                  type="date"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={filtros.data_vencimento_inicio || ''}
                  onChange={(e) => setFiltros({ ...filtros, data_vencimento_inicio: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="Data Fim (Venc.)"
                  type="date"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={filtros.data_vencimento_fim || ''}
                  onChange={(e) => setFiltros({ ...filtros, data_vencimento_fim: e.target.value })}
                  fullWidth
                />
                <div className="flex gap-2">
                  <Button variant="contained" color="primary" onClick={handleBuscar} sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}>Buscar</Button>
                  <Button variant="outlined" color="error" onClick={handleLimparFiltros}>Limpar</Button>
                </div>
              </div>
            </Collapse>

            {/* TABELA */}
            <ConfigProvider
              theme={{
                components: {
                  Table: { rowSelectedBg: '#f4dfff', rowSelectedHoverBg: '#ecc6ff' },
                  Pagination: { colorPrimary: '#6B00A1', colorPrimaryHover: '#1a0027' },
                  Spin: { colorPrimary: '#3C0473' }
                }
              }}
            >
              <div className="text-[#3C0473] font-normal text-sm mb-4">
                {contas.length > 0 ? `Mostrando ${contas.length} registros` : 'Nenhum registro encontrado'}
              </div>
              <Table 
                dataSource={contas} 
                columns={columns} 
                rowKey="id"
                loading={isLoading}
                pagination={{ pageSize: 10, align: 'center' }}
                scroll={{ x: 'max-content' }}
              />
            </ConfigProvider>

          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ContasPagar;
