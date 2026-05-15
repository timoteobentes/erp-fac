/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { IconButton, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../../../../template/Layout';
import { FornecedorForm } from '../../../../modules/Cadastros/Fornecedores/components/FornecedorForm';
import { useFornecedores } from '../../../../modules/Cadastros/Fornecedores/hooks/useFornecedores';

const NovoFornecedor: React.FC = () => {
  const navigate = useNavigate();
  const { criarFornecedor, isLoading } = useFornecedores();

  const handleSubmit = async (payload: any) => {
    try {
      await criarFornecedor(payload);
      toast.success('Fornecedor cadastrado com sucesso');
      navigate('/cadastros/fornecedores');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || error?.response?.data?.errors?.[0] || 'Erro ao cadastrar fornecedor');
    }
  };

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
              Novo Fornecedor
            </Typography>
            <Typography variant="body2" color="#64748B">
              Preencha os dados abaixo para criar um novo fornecedor.
            </Typography>
          </div>
        </div>
      </div>

      <FornecedorForm
        loading={isLoading}
        submitLabel="Cadastrar Fornecedor"
        onSubmit={handleSubmit}
        onCancel={() => navigate('/cadastros/fornecedores')}
      />
    </Layout>
  );
};

export default NovoFornecedor;
