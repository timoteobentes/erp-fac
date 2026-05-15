/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { ArrowBack, EditOutlined } from '@mui/icons-material';
import { Button, Descriptions, Tag } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import Layout from '../../../../template/Layout';
import { useFornecedores } from '../../../../modules/Cadastros/Fornecedores/hooks/useFornecedores';

const formatDate = (value?: string) => value ? dayjs(value).format('DD/MM/YYYY') : '-';

const VisualizarFornecedor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { fornecedor, fetchFornecedorId, isLoading } = useFornecedores();

  useEffect(() => {
    if (id) fetchFornecedorId(id);
  }, [id]);

  const dados = fornecedor?.fornecedor || {};
  const endereco = fornecedor?.enderecos?.[0] || {};
  const contato = fornecedor?.contatos?.[0] || {};

  return (
    <Layout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center gap-4">
          <IconButton
            onClick={() => navigate('/cadastros/fornecedores')}
            sx={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', color: '#475569', '&:hover': { backgroundColor: '#F8FAFC', color: '#0F172A' } }}
          >
            <ArrowBack />
          </IconButton>
          <div className="flex flex-col">
            <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Visualizar Fornecedor
            </Typography>
            <Typography variant="body2" color="#64748B">
              Consulte os dados completos do fornecedor selecionado.
            </Typography>
          </div>
        </div>

        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/cadastros/fornecedores/editar/${id}`)}
          style={{ background: 'linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)' }}
        >
          Editar
        </Button>
      </div>

      <Box sx={{ backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 24px rgba(0,0,0,0.02)', p: { xs: 3, md: 5 } }}>
        <Descriptions title="Dados Gerais" bordered column={{ xs: 1, md: 2 }} size="middle">
          <Descriptions.Item label="Nome">{dados.nome || '-'}</Descriptions.Item>
          <Descriptions.Item label="Situação">
            <Tag color={dados.situacao === 'ativo' ? 'green' : 'red'}>{dados.situacao || '-'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Tipo">{dados.tipo_fornecedor || '-'}</Descriptions.Item>
          <Descriptions.Item label="Documento">{dados.cnpj || dados.cpf || dados.documento || '-'}</Descriptions.Item>
          <Descriptions.Item label="Razão social">{dados.razao_social || '-'}</Descriptions.Item>
          <Descriptions.Item label="Responsável">{dados.responsavel || dados.responsavel_compras || '-'}</Descriptions.Item>
          <Descriptions.Item label="E-mail">{dados.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="Telefone comercial">{dados.telefone_comercial || '-'}</Descriptions.Item>
          <Descriptions.Item label="Celular">{dados.telefone_celular || '-'}</Descriptions.Item>
          <Descriptions.Item label="Site">{dados.site || '-'}</Descriptions.Item>
          <Descriptions.Item label="Nascimento">{formatDate(dados.nascimento)}</Descriptions.Item>
          <Descriptions.Item label="Ramo de atividade">{dados.ramo_atividade || '-'}</Descriptions.Item>
        </Descriptions>

        <div className="mt-8">
          <Descriptions title="Endereço Principal" bordered column={{ xs: 1, md: 2 }} size="middle">
            <Descriptions.Item label="CEP">{endereco.cep || '-'}</Descriptions.Item>
            <Descriptions.Item label="Tipo">{endereco.tipo || '-'}</Descriptions.Item>
            <Descriptions.Item label="Logradouro">{endereco.logradouro || '-'}</Descriptions.Item>
            <Descriptions.Item label="Número">{endereco.numero || '-'}</Descriptions.Item>
            <Descriptions.Item label="Bairro">{endereco.bairro || '-'}</Descriptions.Item>
            <Descriptions.Item label="Cidade/UF">{endereco.cidade ? `${endereco.cidade}/${endereco.uf || ''}` : '-'}</Descriptions.Item>
          </Descriptions>
        </div>

        <div className="mt-8">
          <Descriptions title="Contato Principal" bordered column={{ xs: 1, md: 2 }} size="middle">
            <Descriptions.Item label="Tipo">{contato.tipo || '-'}</Descriptions.Item>
            <Descriptions.Item label="Nome">{contato.nome || '-'}</Descriptions.Item>
            <Descriptions.Item label="Contato">{contato.valor || contato.contato || '-'}</Descriptions.Item>
            <Descriptions.Item label="Cargo">{contato.cargo || '-'}</Descriptions.Item>
          </Descriptions>
        </div>

        <div className="mt-8">
          <Descriptions title="Condições Comerciais" bordered column={{ xs: 1, md: 2 }} size="middle">
            <Descriptions.Item label="Prazo de entrega">{dados.prazo_entrega ? `${dados.prazo_entrega} dias` : '-'}</Descriptions.Item>
            <Descriptions.Item label="Condição pagamento">{dados.condicao_pagamento || '-'}</Descriptions.Item>
            <Descriptions.Item label="Observações" span={2}>{dados.observacoes || '-'}</Descriptions.Item>
          </Descriptions>
        </div>
      </Box>

      {isLoading && <div className="mt-4 text-sm text-[#64748B]">Carregando fornecedor...</div>}
    </Layout>
  );
};

export default VisualizarFornecedor;
