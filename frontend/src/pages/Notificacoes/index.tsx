/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { ConfigProvider, Table, Tag, message, type TablePaginationConfig } from 'antd';
import type { TableColumnsType } from 'antd';
import { Box, Button, MenuItem, TextField, Typography } from '@mui/material';
import { DeleteOutline, DoneAll, DraftsOutlined, EmailOutlined, FilterAltOutlined, MarkEmailUnreadOutlined, Refresh } from '@mui/icons-material';
import dayjs from 'dayjs';
import Layout from '../../template/Layout';
import {
  enviarNotificacoesEmailService,
  excluirNotificacoesService,
  listarNotificacoesService,
  marcarNotificacoesService,
  type FiltrosNotificacoes
} from '../../modules/Notificacoes/services/notificacoesService';

const inputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#F8FAFC',
    '& fieldset': { borderColor: '#E2E8F0' },
    '&:hover fieldset': { borderColor: '#CBD5E1' },
    '&.Mui-focused fieldset': { borderColor: '#5B21B6' }
  }
};

const Notificacoes: React.FC = () => {
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [pagination, setPagination] = useState<TablePaginationConfig>({ current: 1, pageSize: 10, total: 0 });
  const [filtros, setFiltros] = useState<FiltrosNotificacoes>({});

  const carregar = async (pagina = pagination.current || 1, limite = pagination.pageSize || 10, filtrosAtivos = filtros) => {
    setLoading(true);
    try {
      const data = await listarNotificacoesService(pagina, limite, filtrosAtivos);
      setNotificacoes(data.notificacoes || []);
      setPagination({
        current: data.paginacao?.pagina || pagina,
        pageSize: data.paginacao?.limite || limite,
        total: data.paginacao?.total || 0
      });
    } catch (error) {
      console.error(error);
      message.error('Erro ao carregar notificações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar(1, 10, {});
  }, []);

  const idsSelecionados = selectedRowKeys.map(Number);

  const aplicarFiltros = () => {
    setSelectedRowKeys([]);
    carregar(1, pagination.pageSize || 10, filtros);
  };

  const limparFiltros = () => {
    const vazio = {};
    setFiltros(vazio);
    setSelectedRowKeys([]);
    carregar(1, pagination.pageSize || 10, vazio);
  };

  const executarAcao = async (acao: 'lida' | 'nao_lida' | 'excluir' | 'email') => {
    if (idsSelecionados.length === 0) {
      message.warning('Selecione pelo menos uma notificação.');
      return;
    }

    try {
      if (acao === 'lida') await marcarNotificacoesService(idsSelecionados, true);
      if (acao === 'nao_lida') await marcarNotificacoesService(idsSelecionados, false);
      if (acao === 'excluir') await excluirNotificacoesService(idsSelecionados);
      if (acao === 'email') await enviarNotificacoesEmailService(idsSelecionados);

      message.success('Ação executada com sucesso.');
      setSelectedRowKeys([]);
      carregar();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Erro ao executar ação.');
    }
  };

  const columns: TableColumnsType<any> = [
    {
      title: 'Título',
      dataIndex: 'titulo',
      width: 260,
      render: (value, record) => (
        <div className="flex flex-col">
          <span className="font-bold text-[#0F172A]">{value}</span>
          <span className="text-xs text-[#64748B]">{record.origem || 'sistema'}</span>
        </div>
      )
    },
    {
      title: 'Mensagem',
      dataIndex: 'mensagem',
      ellipsis: true
    },
    {
      title: 'Status',
      dataIndex: 'lido_em',
      width: 120,
      align: 'center',
      render: (lidoEm) => lidoEm ? <Tag color="green">Lida</Tag> : <Tag color="purple">Não lida</Tag>
    },
    {
      title: 'E-mail',
      dataIndex: 'email_enviado_em',
      width: 140,
      align: 'center',
      render: (value) => value ? <Tag color="blue">Enviado</Tag> : <Tag>Não enviado</Tag>
    },
    {
      title: 'Criada em',
      dataIndex: 'criado_em',
      width: 180,
      render: (value) => value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '-'
    }
  ];

  return (
    <Layout>
      <div className="mb-8 flex flex-col gap-1">
        <Typography variant="h4" fontWeight={800} color="#0F172A">Notificações</Typography>
        <Typography variant="body2" color="#64748B">Gerencie notificações do sistema, leituras e envio por e-mail.</Typography>
      </div>

      <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', p: 3, mb: 3 }}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <TextField fullWidth label="Título" value={filtros.titulo || ''} onChange={(e) => setFiltros((prev) => ({ ...prev, titulo: e.target.value }))} sx={inputStyles} />
          <TextField select fullWidth label="Leitura" value={filtros.lida || ''} onChange={(e) => setFiltros((prev) => ({ ...prev, lida: e.target.value }))} sx={inputStyles}>
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="false">Não lidas</MenuItem>
            <MenuItem value="true">Lidas</MenuItem>
          </TextField>
          <TextField fullWidth type="date" label="Data inicial" value={filtros.data_inicio || ''} onChange={(e) => setFiltros((prev) => ({ ...prev, data_inicio: e.target.value }))} InputLabelProps={{ shrink: true }} sx={inputStyles} />
          <TextField fullWidth type="date" label="Data final" value={filtros.data_fim || ''} onChange={(e) => setFiltros((prev) => ({ ...prev, data_fim: e.target.value ? `${e.target.value} 23:59:59` : '' }))} InputLabelProps={{ shrink: true }} sx={inputStyles} />
          <div className="flex gap-2">
            <Button fullWidth variant="contained" startIcon={<FilterAltOutlined />} onClick={aplicarFiltros} sx={{ background: '#3C0473', textTransform: 'none', borderRadius: '8px' }}>Filtrar</Button>
            <Button variant="outlined" startIcon={<Refresh />} onClick={limparFiltros} sx={{ borderColor: '#E2E8F0', color: '#475569', textTransform: 'none', borderRadius: '8px' }}>Limpar</Button>
          </div>
        </div>
      </Box>

      <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <div className="p-4 border-b border-[#F1F5F9] flex flex-wrap gap-2">
          <Button variant="outlined" startIcon={<DoneAll />} onClick={() => executarAcao('lida')} sx={{ textTransform: 'none', borderRadius: '8px' }}>Marcar como lida</Button>
          <Button variant="outlined" startIcon={<MarkEmailUnreadOutlined />} onClick={() => executarAcao('nao_lida')} sx={{ textTransform: 'none', borderRadius: '8px' }}>Marcar como não lida</Button>
          <Button variant="outlined" startIcon={<DeleteOutline />} onClick={() => executarAcao('excluir')} color="error" sx={{ textTransform: 'none', borderRadius: '8px' }}>Excluir</Button>
          <Button variant="outlined" startIcon={<EmailOutlined />} onClick={() => executarAcao('email')} sx={{ textTransform: 'none', borderRadius: '8px' }}>Enviar por e-mail</Button>
          <Button variant="text" startIcon={<DraftsOutlined />} onClick={async () => { await marcarNotificacoesService([], true, true); carregar(); }} sx={{ textTransform: 'none', borderRadius: '8px', color: '#5B21B6' }}>Marcar todas como lidas</Button>
        </div>

        <ConfigProvider theme={{ components: { Table: { headerBg: '#F8FAFC', headerColor: '#475569', borderColor: '#F1F5F9' } } }}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={notificacoes}
            loading={loading}
            rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
            pagination={pagination}
            onChange={(nextPagination) => carregar(nextPagination.current || 1, nextPagination.pageSize || 10)}
            locale={{ emptyText: 'Nenhuma notificação encontrada' }}
          />
        </ConfigProvider>
      </Box>
    </Layout>
  );
};

export default Notificacoes;
