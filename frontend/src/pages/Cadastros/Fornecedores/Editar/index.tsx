/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { IconButton, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../../../../template/Layout';
import { FornecedorForm } from '../../../../modules/Cadastros/Fornecedores/components/FornecedorForm';
import { useFornecedores } from '../../../../modules/Cadastros/Fornecedores/hooks/useFornecedores';

const EditarFornecedor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { fornecedor, fetchFornecedorId, atualizarFornecedor, isLoading } = useFornecedores();

  useEffect(() => {
    if (id) fetchFornecedorId(id);
  }, [id]);

  const handleSubmit = async (payload: any) => {
    if (!id) return;
    try {
      await atualizarFornecedor(id, payload);
      toast.success('Fornecedor atualizado com sucesso');
      navigate('/cadastros/fornecedores');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Erro ao atualizar fornecedor');
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
              Editar Fornecedor
            </Typography>
            <Typography variant="body2" color="#64748B">
              Atualize dados cadastrais, contatos e condições comerciais.
            </Typography>
          </div>
        </div>
      </div>

      <FornecedorForm
        initialData={fornecedor}
        loading={isLoading}
        submitLabel="Salvar Alterações"
        onSubmit={handleSubmit}
        onCancel={() => navigate('/cadastros/fornecedores')}
      />
    </Layout>
  );
};

export default EditarFornecedor;
