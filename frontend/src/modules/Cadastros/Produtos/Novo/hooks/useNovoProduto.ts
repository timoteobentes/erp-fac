/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom'; // Ajuste conforme sua versão do router
import { novoProdutoSchema, type NovoProdutoForm } from '../schemas/novoProdutoSchema';
// import api from '../../../../../services/api'; // Importe seu axios aqui

export const useNovoProduto = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0); // Controle das Abas

  const form = useForm<any>({
    resolver: zodResolver(novoProdutoSchema),
    defaultValues: {
      tipo_item: 'produto',
      ativo: true,
      movimenta_estoque: true,
      origem_mercadoria: 0,
      unidade_id: 1, // Default UN (conforme seu SQL)
      preco_venda: 0,
      estoque_atual: 0
    }
  });

  const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const onSubmit = async (data: NovoProdutoForm) => {
    try {
      setLoading(true);
      console.log("Enviando payload:", data);
      
      // await api.post('/produtos', data);
      
      // Simulação de sucesso
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Produto cadastrado com sucesso!"); // Substituir pelo seu Snackbar
      navigate('/cadastros/produtos');
      
    } catch (error: any) {
      console.error(error);
      alert("Erro ao cadastrar produto");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    loading,
    tabIndex,
    handleChangeTab,
    onSubmit
  };
};