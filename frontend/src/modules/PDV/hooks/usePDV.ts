import { useState } from 'react';
import { checkoutPDVService, buscarProdutoPDVService } from '../services/pdvService';
import { toast } from 'react-toastify';

export interface ItemCarrinho {
  produto_id: number;
  nome: string;
  codigo?: string;
  quantidade: number;
  valor_unitario: number;
  subtotal: number;
}

export const usePDV = () => {
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [isLoadingBusca, setIsLoadingBusca] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalCarrinho, setTotalCarrinho] = useState(0);

  const recalcularTotal = (itens: ItemCarrinho[]) => {
    const total = itens.reduce((acc, obj) => acc + obj.subtotal, 0);
    setTotalCarrinho(total);
  };

  const adicionarProduto = (produto: any, quantidade: number = 1) => {
    const preco = Number(produto.preco_venda || 0);

    setCarrinho(prev => {
      // Verifica se já tem no carrinho
      const index = prev.findIndex(item => item.produto_id === produto.id);
      
      let novoCarrinho = [...prev];
      if (index >= 0) {
        novoCarrinho[index].quantidade += quantidade;
        novoCarrinho[index].subtotal = novoCarrinho[index].quantidade * preco;
      } else {
        novoCarrinho.push({
          produto_id: produto.id,
          nome: produto.nome,
          codigo: produto.codigo,
          quantidade: quantidade,
          valor_unitario: preco,
          subtotal: preco * quantidade
        });
      }
      recalcularTotal(novoCarrinho);
      return novoCarrinho;
    });
  };

  const alterarQuantidade = (index: number, novaQtde: number) => {
    if (novaQtde <= 0) return removerItem(index);

    setCarrinho(prev => {
      const novo = [...prev];
      novo[index].quantidade = novaQtde;
      novo[index].subtotal = novaQtde * novo[index].valor_unitario;
      recalcularTotal(novo);
      return novo;
    });
  };

  const removerItem = (index: number) => {
    setCarrinho(prev => {
      const novo = prev.filter((_, i) => i !== index);
      recalcularTotal(novo);
      return novo;
    });
  };

  const limparCarrinho = () => {
    setCarrinho([]);
    setTotalCarrinho(0);
  };

  const buscarProdutoOuCodBarras = async (termo: string) => {
    if (!termo) return [];
    setIsLoadingBusca(true);
    try {
      const produtos = await buscarProdutoPDVService(termo);
      return produtos;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao buscar produto');
      return [];
    } finally {
      setIsLoadingBusca(false);
    }
  };

  const finalizarVenda = async (formaPagamento: string, valorRecebido?: number, clienteId?: number) => {
    if (carrinho.length === 0) {
      toast.warning('O carrinho está vazio.');
      return false;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        cliente_id: clienteId || null,
        forma_pagamento: formaPagamento, // 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito'
        valor_total: totalCarrinho,
        desconto_total: 0,
        valor_recebido: valorRecebido || totalCarrinho,
        itens: carrinho
      };

      const response = await checkoutPDVService(payload);
      toast.success('Venda finalizada com sucesso! Verifique a nota fiscal.');
      limparCarrinho();
      return { sucesso: true, dadosVenda: response.data };
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao finalizar venda.');
      return { sucesso: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    carrinho,
    totalCarrinho,
    isLoadingBusca,
    isSubmitting,
    adicionarProduto,
    alterarQuantidade,
    removerItem,
    limparCarrinho,
    buscarProdutoOuCodBarras,
    finalizarVenda
  };
};
