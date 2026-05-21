import { DatePicker } from 'antd';
import ptBR from 'antd/es/date-picker/locale/pt_BR';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
dayjs.locale('pt-br');
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { TextField, Button, IconButton, Select, MenuItem, Dialog, DialogContent, DialogActions, Typography, Alert, CircularProgress } from '@mui/material';
import { Close } from '@mui/icons-material';
import { usePDV } from '../../modules/PDV/hooks/usePDV';
import { useNavigate } from 'react-router-dom';
import logo_fac from "../../assets/FAC_logo_roxo.svg";
import CupomNaoFiscal from '../../modules/PDV/components/CupomNaoFiscal';
import { toast } from 'react-toastify'; // Usaremos para dar feedback visual nos atalhos
import { emitirNfceFrenteCaixaService } from '../../modules/PDV/services/pdvService';
import { listarClientesService } from '../../modules/Cadastros/Clientes/services/clienteService';
import { listarFormasPagamentoService } from '../../modules/Financeiro/FormasPagamento/services/formasPagamentoService';
import { useAuth } from '../../modules/Login/context/AuthContext';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const parseCurrency = (value: string | number) => {
  if (typeof value === 'number') return value;
  const normalized = String(value || '').replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  return Number(normalized) || 0;
};

const pagamentosPadrao = [
  { id: null, nome: 'Dinheiro', modalidade: 'dinheiro' },
  { id: null, nome: 'PIX', modalidade: 'pix' },
  { id: null, nome: 'Cartao de Debito', modalidade: 'cartao_debito' },
  { id: null, nome: 'Cartao de Credito', modalidade: 'cartao_credito' },
  { id: null, nome: 'A Prazo', modalidade: 'a_prazo' }
];

const PDV: React.FC = () => {
  const navigate = useNavigate();
  const {
    carrinho,
    totalCarrinho,
    adicionarProduto,
    alterarQuantidade,
    buscarProdutoOuCodBarras,
    finalizarVenda,
    isSubmitting
  } = usePDV();

  // Estados da Busca
  const [termoBusca, setTermoBusca] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();

  // Estados do Modal de Checkout (Pagamento Múltiplo)
  const [openModal, setOpenModal] = useState(false);
  const [pagamentos, setPagamentos] = useState([
    { tipo: '', valor: '', observacao: '', vencimento: '' }
  ]);
  const [clienteSelecionado, setClienteSelecionado] = useState<any | null>(null);
  const [formasPagamento, setFormasPagamento] = useState<any[]>(pagamentosPadrao);
  const [formaPagamentoSelecionada, setFormaPagamentoSelecionada] = useState<any>(pagamentosPadrao[0]);
  const [isEmitindoNfce, setIsEmitindoNfce] = useState(false);

  // Estados do Modal de Cliente
  const [openModalCliente, setOpenModalCliente] = useState(false);
  const [openModalAjuda, setOpenModalAjuda] = useState(false);
  const [clienteForm, setClienteForm] = useState({ tipo: 'consumidor', nome: '', cpf: '', email: '', celular: '' });
  const [pesquisandoCliente, setPesquisandoCliente] = useState(false);

  // Estados para exibição do sucesso da Sefaz
  const [vendaConcluida, setVendaConcluida] = useState<any>(null);
  const totalPagamentos = useMemo(
    () => pagamentos.reduce((acc, pagamento) => acc + parseCurrency(pagamento.valor), 0),
    [pagamentos]
  );
  const faltaReceber = Math.max(0, totalCarrinho - totalPagamentos);

  // Foco inicial no campo de busca
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    const carregarApoio = async () => {
      try {
        const formasResp = await listarFormasPagamentoService({ disponivel_em: 'recebimentos' });

        const formasApi = formasResp?.data?.dados || formasResp?.data || [];
        setFormasPagamento(formasApi.length > 0 ? formasApi : pagamentosPadrao);
        if (formasApi.length > 0) setFormaPagamentoSelecionada(formasApi[0]);
      } catch (error) {
        setFormasPagamento(pagamentosPadrao);
      }
    };

    carregarApoio();
  }, []);

  // 🚀 O MOTOR DE ATALHOS DO PDV
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Se um modal estiver aberto, não dispara os atalhos de fundo
      if (e.key === 'Escape') {
        if (openModal) setOpenModal(false);
        else if (openModalCliente) setOpenModalCliente(false);
        else if (openModalAjuda) setOpenModalAjuda(false);
        else if (vendaConcluida) handleNovaVenda();
        return;
      }

      if (openModal || openModalCliente || openModalAjuda || vendaConcluida) return;

      switch (e.key) {
        case 'F1':
          e.preventDefault();
          setOpenModalAjuda(true);
          break;
        case 'F2':
          e.preventDefault();
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select(); // Seleciona o texto atual para sobrescrever rápido
          }
          break;
        case 'F3':
          e.preventDefault();
          if (carrinho.length === 0) {
            toast.warning('Nenhum item no carrinho para alterar quantidade.');
            return;
          }
          alterarQuantidade(carrinho.length - 1, carrinho[carrinho.length - 1].quantidade + (e.shiftKey ? -1 : 1));
          toast.info(e.shiftKey ? 'Quantidade do ultimo item reduzida.' : 'Quantidade do ultimo item aumentada.');
          break;
        case 'F6':
          e.preventDefault();
          if (carrinho.length > 0) handleFinalizarVenda();
          else toast.warning('O carrinho está vazio.');
          break;
        case 'F7':
          e.preventDefault();
          if (carrinho.length > 0) abrirPagamentoMultiplo();
          else toast.warning('Adicione produtos antes de pagar.');
          break;
        case 'F8':
          e.preventDefault();
          toast.info('A NFC-e pode ser emitida no modal exibido apos finalizar a venda.');
          break;
        case 'C':
        case 'c':
          if (e.shiftKey) {
            e.preventDefault();
            setOpenModalCliente(true);
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [carrinho, openModal, vendaConcluida, openModalCliente, openModalAjuda, formaPagamentoSelecionada, totalCarrinho]);

  const handlePesquisarCliente = async () => {
    if (!clienteForm.cpf && !clienteForm.nome) {
      toast.warning('Informe um nome ou CPF/CNPJ para pesquisar.');
      return;
    }
    setPesquisandoCliente(true);
    try {
      const resp = await listarClientesService(1, 10, { nome: clienteForm.cpf || clienteForm.nome });
      const clientesBase = resp?.data || [];
      if (clientesBase.length > 0) {
        const c = clientesBase[0];
        setClienteForm({
          tipo: c.tipo_pessoa === 'J' ? 'empresa' : 'consumidor',
          nome: c.nome || c.razao_social || '',
          cpf: c.cpf || c.cnpj || '',
          email: c.email || '',
          celular: c.celular || c.telefone || ''
        });
        setClienteSelecionado(c);
        toast.success('Cliente encontrado.');
      } else {
        toast.info('Nenhum cliente encontrado com estes dados.');
      }
    } catch (error) {
      toast.error('Erro ao pesquisar cliente.');
    } finally {
      setPesquisandoCliente(false);
    }
  };

  const handleConfirmarCliente = () => {
    if (!clienteForm.nome) {
      toast.warning('O campo Nome é obrigatório.');
      return;
    }
    if (!clienteSelecionado || (clienteSelecionado.nome !== clienteForm.nome && clienteSelecionado.razao_social !== clienteForm.nome)) {
      setClienteSelecionado({
        id: null,
        nome: clienteForm.nome,
        cpf: clienteForm.cpf,
        email: clienteForm.email,
        celular: clienteForm.celular
      });
    }
    setOpenModalCliente(false);
  };


  const handleBuscar = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!termoBusca.trim()) return;
    
    const prods = await buscarProdutoOuCodBarras(termoBusca);
    if (prods.length === 1 && (prods[0].codigo === termoBusca || prods[0].ean === termoBusca)) {
      adicionarProduto(prods[0], 1);
      setTermoBusca('');
      setResultados([]);
      if (inputRef.current) inputRef.current.focus();
    } else {
      setResultados(prods);
    }
  };

  const cleanScreenAfterSale = () => {
      setPagamentos([{ tipo: '', valor: '', observacao: '', vencimento: '' }]);
      setTermoBusca('');
      setResultados([]);
      if (inputRef.current) setTimeout(() => inputRef.current?.focus(), 100);
  };

  const getFormaPagamentoNome = (forma: any) => forma?.nome || forma?.modalidade || 'Dinheiro';
  const getFormaPagamentoTipo = (forma: any) => forma?.id ? forma.nome : (forma?.modalidade || forma?.nome || 'dinheiro');

  const abrirPagamentoMultiplo = () => {
    setPagamentos([
      {
        tipo: getFormaPagamentoTipo(formaPagamentoSelecionada),
        valor: totalCarrinho ? totalCarrinho.toFixed(2).replace('.', ',') : '',
        observacao: '',
        vencimento: ''
      }
    ]);
    setOpenModal(true);
  };

  const atualizarPagamento = (index: number, campo: string, valor: string) => {
    setPagamentos((prev) => {
      const novo = [...prev];
      novo[index] = { ...novo[index], [campo]: valor };
      return novo;
    });
  };

  const adicionarLinhaPagamento = () => {
    setPagamentos((prev) => [...prev, { tipo: '', valor: '', observacao: '', vencimento: '' }]);
  };

  const removerLinhaPagamento = (index: number) => {
    setPagamentos((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const montarPagamentosVenda = () => pagamentos
    .map((pagamento) => ({
      tipo: pagamento.tipo,
      valor: parseCurrency(pagamento.valor),
      observacao: pagamento.observacao,
      vencimento: pagamento.vencimento,
      forma_pagamento_id: formasPagamento.find((forma) => getFormaPagamentoTipo(forma) === pagamento.tipo || forma.nome === pagamento.tipo)?.id || null
    }))
    .filter((pagamento) => pagamento.tipo && pagamento.valor > 0);

  const handleFinalizarVenda = async () => {
     if (carrinho.length === 0) return;
     const formaNome = getFormaPagamentoNome(formaPagamentoSelecionada);
     const result = await finalizarVenda(
       formaNome,
       totalCarrinho,
       clienteSelecionado?.id || null,
       [{
         tipo: getFormaPagamentoTipo(formaPagamentoSelecionada),
         valor: totalCarrinho,
         forma_pagamento_id: formaPagamentoSelecionada?.id || null
       }],
       clienteSelecionado
     );
     if (result && result.sucesso) {
        setVendaConcluida(result.dadosVenda);
        cleanScreenAfterSale();
     } else if (result) {
        setVendaConcluida({ sucesso: false, erro: result.mensagem || 'Erro ao finalizar venda.' });
     }
  };

  const handeConfirmarMultiplo = async () => {
    const pagamentosVenda = montarPagamentosVenda();
    if (pagamentosVenda.length === 0) {
      toast.warning('Informe pelo menos uma forma de pagamento.');
      return;
    }
    if (pagamentosVenda.reduce((acc, pagamento) => acc + pagamento.valor, 0) + 0.001 < totalCarrinho) {
      toast.warning('O total dos pagamentos precisa cobrir o valor da venda.');
      return;
    }

    const result = await finalizarVenda(
      pagamentosVenda.map((pagamento) => pagamento.tipo).join(' + '),
      pagamentosVenda.reduce((acc, pagamento) => acc + pagamento.valor, 0),
      clienteSelecionado?.id || null,
      pagamentosVenda,
      clienteSelecionado
    );
    if (result && result.sucesso) {
      setOpenModal(false);
      setVendaConcluida(result.dadosVenda);
      cleanScreenAfterSale();
    } else if (result) {
      setVendaConcluida({ sucesso: false, erro: result.mensagem || 'Erro ao finalizar venda.' });
    }
  };

  const handleEmitirNfce = async () => {
    if (!vendaConcluida?.id) return;
    setIsEmitindoNfce(true);
    try {
      const response = await emitirNfceFrenteCaixaService(vendaConcluida.id);
      setVendaConcluida((prev: any) => ({ ...prev, ...(response.data.data || response.data), nfce_emitida: response.success }));
      if (response.success) toast.success('NFC-e autorizada com sucesso.');
      else toast.warning(response.message || 'NFC-e rejeitada pela Sefaz.');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao emitir NFC-e.';
      setVendaConcluida((prev: any) => ({ ...prev, status_sefaz: 'rejeitado', erro_sefaz: message }));
      toast.error(message);
    } finally {
      setIsEmitindoNfce(false);
    }
  };

  const handlePrintCupom = () => {
    const printContent = document.getElementById('printable-cupom-nao-fiscal');
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=360,height=640');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Cupom</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            html, body {
              width: 80mm;
              margin: 0;
              padding: 0;
              background: #fff;
              color: #000;
            }
            body {
              display: block;
              font-family: "Courier New", monospace;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            * { box-sizing: border-box; }
            #printable-cupom-nao-fiscal {
              width: 80mm !important;
              min-height: 80mm !important;
              margin: 0 !important;
              padding: 4mm !important;
              box-shadow: none !important;
            }
          </style>
        </head>
        <body>${printContent.outerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleNovaVenda = () => {
      setVendaConcluida(null);
      if (inputRef.current) setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <>
    {/* Fundo Neutro (Cinza claro, sem azul) */}
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans print:hidden">
      
      {/* HEADER SUPERIOR CLEAN */}
      <div className="w-full flex items-center justify-between px-8 py-4 bg-white border-b border-[#E5E7EB] shadow-sm">
        <div className="flex items-center gap-4">
            <img src={logo_fac} alt="logo" className="w-28" />
            <div className="h-6 w-px bg-[#D1D5DB] mx-2"></div>
            <h1 className="text-[#111827] font-bold text-xl tracking-tight">Frente de Caixa</h1>
            {user && (
              <>
                <div className="h-6 w-px bg-[#D1D5DB] mx-2"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#6B7280] uppercase tracking-wider font-bold">Vendedor</span>
                  <span className="text-sm font-semibold text-[#3C0473]">{user.nome_usuario || user.nome_completo || user.nome || user.name || 'Vendedor'}</span>
                </div>
              </>
            )}
        </div>
        
        <div className="flex gap-3">
           {/* <Button variant="outlined" endIcon={<Settings />} sx={{ borderColor: '#E5E7EB', color: '#374151', textTransform: 'none', borderRadius: '8px', fontWeight: 600, '&:hover': { borderColor: '#D1D5DB', backgroundColor: '#F3F4F6' } }}>Ações</Button> */}
           <Button 
             variant="contained" 
             startIcon={<Close />}
             onClick={() => navigate('/inicio')}
             sx={{ bgcolor: '#EF4444', color: '#fff', textTransform: 'none', borderRadius: '8px', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#DC2626', boxShadow: 'none' } }}
           >
             Fechar Caixa
           </Button>
        </div>
      </div>

      {/* WORKSPACE PRINCIPAL */}
      <main className="flex-1 flex overflow-hidden px-8 py-6 gap-6 h-[calc(100vh-140px)]">
        
        {/* LADO ESQUERDO: CARRINHO / BUSCA */}
        <section className="w-[60%] flex flex-col bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden relative border border-[#E5E7EB]">
          
          {/* BUSCA GIGANTE E FLUIDA */}
          <div className="p-6 border-b border-[#E5E7EB] bg-[#F9FAFB]">
            <form onSubmit={handleBuscar} className="w-full relative">
              <input
                ref={inputRef}
                className="w-full bg-white border border-[#D1D5DB] rounded-xl outline-none text-[#111827] placeholder-[#9CA3AF] py-4 px-5 pl-12 text-lg font-medium transition-all focus:border-[#5B21B6] focus:ring-2 focus:ring-[#5B21B6]/20"
                placeholder="Bipe o código de barras ou busque o produto (F2)"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
            </form>
          </div>

          {/* CABEÇALHO DO CARRINHO */}
          <div className="px-6 pt-6">
             <div className="grid grid-cols-12 gap-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3 px-2">
                 <div className="col-span-1">Seq</div>
                 <div className="col-span-1">Cód</div>
                 <div className="col-span-4">Descrição</div>
                 <div className="col-span-2 text-center">Qtd</div>
                 <div className="col-span-2 text-center">Unitário</div>
                 <div className="col-span-2 text-right">Total</div>
             </div>
             
             {/* LISTA DE ITENS CLEAN */}
             <div className="overflow-y-auto h-[calc(100vh-420px)] space-y-1 pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                {carrinho.map((item, index) => (
                    <div key={index} className="group grid grid-cols-12 gap-4 text-[13px] text-[#374151] bg-white rounded-lg items-center p-3 border border-transparent hover:bg-[#F9FAFB] hover:border-[#E5E7EB] transition-colors">
                        <div className="col-span-1 text-center font-medium text-[#9CA3AF]">{String(index + 1).padStart(3, '0')}</div>
                        <div className="col-span-1 text-center font-mono text-[#6B7280]">{item.produto_id}</div>
                        <div className="col-span-4 truncate font-medium">{item.nome}</div>
                        
                        {/* CONTROLES DE QUANTIDADE */}
                        <div className="col-span-2 flex justify-center items-center gap-3">
                            <button 
                              className="text-[#9CA3AF] bg-transparent rounded-full w-6 h-6 flex items-center justify-center hover:bg-[#E5E7EB] hover:text-[#111827] transition-colors"
                              onClick={() => alterarQuantidade(index, item.quantidade - 1)}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                            <span className="w-6 text-center font-bold text-[#111827]">{item.quantidade}</span>
                            <button 
                              className="text-[#9CA3AF] bg-transparent rounded-full w-6 h-6 flex items-center justify-center hover:bg-[#E5E7EB] hover:text-[#111827] transition-colors"
                              onClick={() => alterarQuantidade(index, item.quantidade + 1)}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            </button>
                        </div>
                        
                        <div className="col-span-2 text-center text-[#6B7280]">{formatCurrency(item.valor_unitario)}</div>
                        <div className="col-span-2 text-right font-bold text-[#111827]">{formatCurrency(item.subtotal)}</div>
                    </div>
                ))}
                
                {carrinho.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-[#9CA3AF] space-y-4 pt-20">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                        <p className="text-sm">O carrinho está vazio. Inicie a venda.</p>
                    </div>
                )}
            </div>
          </div>

          {/* TOTAL GIGANTE */}
          <div className="absolute bottom-0 w-full bg-[#3C0473] px-8 py-6 flex items-end justify-between text-white">
              <div className="flex flex-col">
                  <span className="text-[#9CA3AF] text-sm font-medium uppercase tracking-wider mb-1">Total da Venda</span>
                  <span className="text-[#9CA3AF] text-xs">{(carrinho.length)} {carrinho.length === 1 ? 'item' : 'itens'}</span>
              </div>
              <span className="text-5xl font-bold tracking-tight">{formatCurrency(totalCarrinho)}</span>
          </div>
        </section>

        {/* LADO DIREITO: GRID DE PRODUTOS / FINALIZAÇÃO */}
        <section className="w-[40%] flex flex-col justify-between">
           
           {/* CATEGORIAS E PRODUTOS RÁPIDOS */}
           <div className="flex-1 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#E5E7EB] p-6 mb-6 overflow-hidden flex flex-col">
               <div className="flex justify-between items-center mb-6">
                   <h3 className="text-sm font-bold text-[#111827]">Acesso Rápido</h3>
                   <span className="text-xs font-semibold text-[#5B21B6] bg-[#5B21B6]/10 px-3 py-1 rounded-full cursor-pointer hover:bg-[#5B21B6]/20 transition-colors">Ver Categorias</span>
               </div>

               <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-gray-200">
                  {resultados.length > 0 ? resultados.map(prod => (
                     <div key={prod.id} 
                          className="flex flex-col items-center bg-[#F9FAFB] border border-[#E5E7EB] p-4 rounded-xl cursor-pointer hover:border-[#5B21B6] hover:shadow-md hover:-translate-y-1 transition-all"
                          onClick={() => adicionarProduto(prod, 1)}
                      >
                         <div className="w-full h-16 mb-3 flex items-center justify-center bg-white rounded-lg shadow-sm">
                            <img src="https://i.ibb.co/6803PqD/garrafao.png" alt="Produto" className="w-10 h-14 object-contain opacity-80" />
                         </div>
                         <span className="text-[11px] font-bold text-[#111827] text-center leading-tight w-full line-clamp-2 min-h-[28px]">{prod.nome}</span>
                         <span className="text-[13px] font-bold text-[#10B981] mt-1">{formatCurrency(Number(prod.preco_venda))}</span>
                     </div>
                  )) : (
                     <div className="col-span-3 flex flex-col items-center justify-center text-center text-[#9CA3AF] text-sm mt-10">
                       <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2 opacity-50"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                       Nenhum produto rápido configurado.
                     </div>
                  )}
               </div>
           </div>

           {/* BLOCO DE FINALIZAÇÃO (PAGAMENTO) */}
           <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-[#E5E7EB] p-6">
              
              <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-[#F9FAFB]">
                  <div className="flex flex-col gap-1">
                     <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Forma Pagamento</span>
                     <Select
                       size="small"
                       value={getFormaPagamentoTipo(formaPagamentoSelecionada)}
                       onChange={(event) => {
                         const selecionada = formasPagamento.find((forma) => getFormaPagamentoTipo(forma) === event.target.value || forma.nome === event.target.value);
                         setFormaPagamentoSelecionada(selecionada || pagamentosPadrao[0]);
                       }}
                       sx={{ bgcolor: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB', borderRadius: '8px' } }}
                     >
                       {formasPagamento.map((forma, index) => (
                         <MenuItem key={`${getFormaPagamentoTipo(forma)}-${forma.id || index}`} value={getFormaPagamentoTipo(forma)}>
                           {getFormaPagamentoNome(forma)}
                         </MenuItem>
                       ))}
                     </Select>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Cliente</span>
                     <Button 
                       variant="outlined" 
                       onClick={() => setOpenModalCliente(true)}
                       sx={{ bgcolor: 'white', borderColor: '#D1D5DB', color: clienteSelecionado ? '#111827' : '#9CA3AF', textTransform: 'none', borderRadius: '8px', justifyContent: 'flex-start', py: 1, px: 2, height: '40px', fontWeight: clienteSelecionado ? 600 : 400, '&:hover': { borderColor: '#5B21B6', bgcolor: '#F9FAFB' } }}
                     >
                       <span className="truncate w-full text-left">{clienteSelecionado ? (clienteSelecionado.nome || clienteSelecionado.razao_social) : 'Adicionar Consumidor'}</span>
                     </Button>
                  </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-bold text-[#111827]">Recebimento</span>
                  <Button variant="contained" size="small" sx={{ bgcolor: '#F9FAFB', color: '#3C0473', boxShadow: 'none', border: '1px solid #D1D5DB', textTransform: 'none', borderRadius: '8px', fontWeight: 600, '&:hover': { bgcolor: '#F3F4F6', boxShadow: 'none' } }} onClick={abrirPagamentoMultiplo}>
                     Pagamento Múltiplo (F7)
                  </Button>
              </div>

              <Button 
                variant="contained" 
                fullWidth
                disabled={carrinho.length === 0 || isSubmitting}
                onClick={handleFinalizarVenda}
                sx={{ 
                  background: carrinho.length > 0 ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)' : '#E5E7EB',
                  color: carrinho.length > 0 ? 'white' : '#9CA3AF',
                  fontSize: '1.15rem', 
                  py: 1.5, 
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: '12px',
                  boxShadow: carrinho.length > 0 ? '0 10px 25px -5px rgba(16, 185, 129, 0.4)' : 'none',
                  transition: 'all 0.2s',
                  '&:hover': { 
                     background: 'linear-gradient(90deg, #059669 0%, #047857 100%)',
                     transform: carrinho.length > 0 ? 'translateY(-2px)' : 'none'
                  },
                }}
              >
                {isSubmitting ? 'Finalizando venda...' : `Finalizar Venda (F6)`}
              </Button>
           </div>
        </section>

      </main>

      {/* RODAPÉ ATALHOS CLEAN E FUNCIONAIS */}
      <footer className="text-center py-3 bg-[#3C0473] text-xs font-medium text-[#9CA3AF] px-4">
         <span className="mx-3"><strong className="text-white font-bold">F1</strong> Atalhos</span>
         <span className="mx-3"><strong className="text-white font-bold">F2</strong> Busca</span>
         <span className="mx-3"><strong className="text-white font-bold">F3</strong> +Qtd</span>
         <span className="mx-3"><strong className="text-white font-bold">Shift+F3</strong> -Qtd</span>
         <span className="mx-3"><strong className="text-white font-bold">F6</strong> Finalizar</span>
         <span className="mx-3"><strong className="text-white font-bold">F7</strong> Multi-Pagamentos</span>
         <span className="mx-3"><strong className="text-white font-bold">Shift+C</strong> Cliente</span>
         <span className="mx-3"><strong className="text-white font-bold">Esc</strong> Fechar</span>
      </footer>

      {/* 💳 MODAL DE PAGAMENTO MÚLTIPLO PREMIUM (Sem azul e sem roxo escuro velho) */}
      <Dialog 
        open={openModal} 
        onClose={() => setOpenModal(false)} 
        maxWidth="md" 
        fullWidth 
        PaperProps={{ sx: { background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' } }}
        slotProps={{ backdrop: { sx: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(15, 23, 42, 0.4)' } } }}
      >
        <div className="flex justify-between px-6 py-4 border-b border-[#E5E7EB] items-center">
             <div className="flex flex-col">
                <Typography variant="h6" fontWeight={700} color="#111827">Pagamento Múltiplo</Typography>
                <Typography variant="caption" color="#6B7280">Divida o valor em diferentes formas de recebimento.</Typography>
             </div>
             <IconButton onClick={() => setOpenModal(false)} sx={{ color: '#6B7280', '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}>
                 <Close />
             </IconButton>
        </div>
        
        <DialogContent sx={{ p: 6, background: '#FFFFFF' }}>
            {pagamentos.map((pagamento, index) => (
                <div key={index} className="mb-6 p-4 border border-[#E5E7EB] rounded-xl bg-[#F9FAFB]">
                   <div className="flex justify-between items-center mb-3">
                     <h4 className="text-[#3C0473] font-bold text-xs uppercase tracking-wide">Linha de pagamento {index + 1}</h4>
                     {pagamentos.length > 1 && (
                       <Button size="small" onClick={() => removerLinhaPagamento(index)} sx={{ color: '#EF4444', textTransform: 'none' }}>Remover</Button>
                     )}
                   </div>
                   <div className="grid grid-cols-4 gap-4">
                       <div>
                           <label className="text-xs font-semibold text-[#475569] mb-1 block">Tipo de pagamento</label>
                           <Select size="small" fullWidth displayEmpty value={pagamento.tipo} onChange={(event) => atualizarPagamento(index, 'tipo', String(event.target.value))} sx={{ bgcolor: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB', borderRadius: '8px' } }}>
                              <MenuItem value=""><em>-- selecione --</em></MenuItem>
                              {formasPagamento.map((forma, formaIndex) => (
                                <MenuItem key={`${getFormaPagamentoTipo(forma)}-${forma.id || formaIndex}`} value={getFormaPagamentoTipo(forma)}>
                                  {getFormaPagamentoNome(forma)}
                                </MenuItem>
                              ))}
                           </Select>
                       </div>
                       <div>
                           <label className="text-xs font-semibold text-[#475569] mb-1 block">Valor</label>
                           <TextField size="small" fullWidth variant="outlined" placeholder="R$ 0,00" value={pagamento.valor} onChange={(event) => atualizarPagamento(index, 'valor', event.target.value)} sx={{ bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                       </div>
                       <div>
                           <label className="text-xs font-semibold text-[#475569] mb-1 block">Observacao</label>
                           <TextField size="small" fullWidth variant="outlined" placeholder="Ex: Cartao final 1234" value={pagamento.observacao} onChange={(event) => atualizarPagamento(index, 'observacao', event.target.value)} sx={{ bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                       </div>
                       <div>
                           <label className="text-xs font-semibold text-[#475569] mb-1 block">Vencimento</label>
                           <DatePicker locale={ptBR} getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement} style={{ width: '100%', height: '40px', borderRadius: '8px' }} format="DD/MM/YYYY" value={pagamento.vencimento ? dayjs(pagamento.vencimento) : null} onChange={(date, _dateString) => atualizarPagamento(index, 'vencimento', date ? date.format('YYYY-MM-DD') : '')} />
                       </div>
                   </div>
                </div>
            ))}

            <Button variant="outlined" onClick={adicionarLinhaPagamento} sx={{ borderColor: '#D1D5DB', color: '#3C0473', textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}>
              Adicionar forma de pagamento
            </Button>

            <div className="mt-8 flex justify-between items-center bg-[#F3F4F6] p-4 rounded-xl">
               <span className="font-bold text-[#475569] text-lg">Falta Receber:</span>
               <span className={`font-bold text-2xl ${faltaReceber > 0 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>{formatCurrency(faltaReceber)}</span>
            </div>
        </DialogContent>
        
        <DialogActions sx={{ px: 6, pb: 6, pt: 0, justifyContent: 'space-between' }}>
          <Button onClick={() => setOpenModal(false)} variant="outlined" sx={{ borderColor: '#D1D5DB', color: '#475569', textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 4 }}>Cancelar</Button>
          <Button 
            onClick={handeConfirmarMultiplo} 
            variant="contained" 
            sx={{ bgcolor: '#10B981', color: 'white', textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 6, boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.3)', '&:hover': { bgcolor: '#059669' } }}
          >
            Confirmar Pagamentos
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DE SUCESSO / RETORNO DA SEFAZ (Também adaptado) */}
      <Dialog 
        open={!!vendaConcluida} 
        onClose={handleNovaVenda} 
        maxWidth="sm" 
        fullWidth 
        PaperProps={{ sx: { borderRadius: '16px', overflow: 'hidden' } }}
        slotProps={{ backdrop: { sx: { backdropFilter: 'blur(4px)' } } }}
      >
         <div className={`${vendaConcluida?.sucesso === false ? 'bg-[#EF4444]' : 'bg-[#10B981]'} flex justify-center py-5 text-white items-center text-xl font-bold tracking-wide shadow-inner`}>
            {vendaConcluida?.sucesso === false ? 'Venda nao realizada' : 'Venda realizada com sucesso'}
         </div>
         <DialogContent sx={{ textAlign: 'center', py: 6, background: '#FFFFFF' }}>
             {vendaConcluida?.sucesso === false ? (
                 <Alert severity="error" sx={{ textAlign: 'left', mb: 2 }}>
                   {vendaConcluida?.erro || 'Nao foi possivel finalizar a venda.'}
                 </Alert>
             ) : vendaConcluida?.status_sefaz === 'autorizado' ? (
                 <>
                    <div className="text-[#059669] font-extrabold text-3xl mb-4">✅ NFC-e Autorizada</div>
                    <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-5 mb-6 inline-block text-left shadow-sm">
                       <p className="text-[#6B7280] text-sm mb-1"><strong>Chave de Acesso:</strong></p>
                       <p className="text-[#111827] text-xs font-mono break-all font-bold">{vendaConcluida.chave_acesso}</p>
                       <p className="text-[#6B7280] text-sm mt-3 mb-1"><strong>Protocolo de Autorização:</strong></p>
                       <p className="text-[#111827] text-xs font-mono font-bold">{vendaConcluida.protocolo} - Nº {vendaConcluida.numero_nfe}</p>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center w-full mt-2 gap-3">
                      <Button 
                         variant="contained" 
                         size="large"
                         onClick={handlePrintCupom}
                         sx={{ bgcolor: '#3C0473', textTransform: 'none', px: 4, py: 1.5, fontSize: '1.1rem', borderRadius: '12px', fontWeight: 600, boxShadow: '0 4px 14px 0 rgba(60, 4, 115, 0.3)', '&:hover': { bgcolor: '#2A0255' }, width: '100%' }}
                       >
                         Imprimir cupom/recibo
                      </Button>
                      
                      <Button 
                         variant="text" 
                         size="small"
                         onClick={() => {
                             if (vendaConcluida.xml_autorizado) {
                               const blob = new Blob([vendaConcluida.xml_autorizado], { type: 'text/xml' });
                               const url = URL.createObjectURL(blob);
                               const a = document.createElement('a');
                               a.href = url;
                               a.download = `NFCe_${vendaConcluida.chave_acesso}.xml`;
                               a.click();
                             }
                         }}
                         sx={{ color: '#6B7280', textTransform: 'none', textDecoration: 'underline', fontWeight: 500 }}
                      >
                         Baixar XML da Nota
                      </Button>
                    </div>
                 </>
             ) : (
                 <>
                    <div className="text-[#059669] font-bold text-2xl mb-2">Venda salva</div>
                    <div className="text-[#6B7280] text-sm mb-6 px-4">
                      {vendaConcluida?.erro_sefaz || 'A NFC-e ainda nao foi emitida. Voce pode imprimir o recibo ou emitir a NFC-e agora.'}
                    </div>
                 </>
             )}
         </DialogContent>
         <DialogActions sx={{ justifyContent: 'center', gap: 1.5, px: 5, pb: 5, pt: 0, background: '#FFFFFF', flexWrap: 'wrap' }}>
             {vendaConcluida?.sucesso !== false && (
               <>
                 <Button variant="contained" size="large" onClick={handlePrintCupom} sx={{ bgcolor: '#3C0473', textTransform: 'none', borderRadius: '8px', fontWeight: 600, px: 3, '&:hover': { bgcolor: '#2A0255' } }}>
                    Imprimir cupom/recibo
                 </Button>
                 <Button variant="contained" size="large" disabled={isEmitindoNfce || vendaConcluida?.status_sefaz === 'autorizado'} onClick={handleEmitirNfce} sx={{ bgcolor: '#0EA5E9', textTransform: 'none', borderRadius: '8px', fontWeight: 600, px: 3, '&:hover': { bgcolor: '#0284C7' } }}>
                    {isEmitindoNfce ? <CircularProgress size={20} color="inherit" /> : 'Emitir NFC-e'}
                 </Button>
               </>
             )}
             <Button variant="outlined" size="large" onClick={handleNovaVenda} sx={{ textTransform: 'none', color: '#3C0473', borderColor: '#D1D5DB', borderRadius: '8px', fontWeight: 600, px: 4, '&:hover': { borderColor: '#3C0473', bgcolor: '#F8FAFC' } }}>
                Realizar nova venda
             </Button>
         </DialogActions>
      </Dialog>
    </div>


      {/* 👤 MODAL DE INDICAR CLIENTE */}
      <Dialog 
        open={openModalCliente} 
        onClose={() => setOpenModalCliente(false)} 
        maxWidth="sm" 
        fullWidth 
        PaperProps={{ sx: { background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' } }}
        slotProps={{ backdrop: { sx: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(15, 23, 42, 0.4)' } } }}
      >
        <div className="flex justify-between px-6 py-4 border-b border-[#E5E7EB] items-center">
             <div className="flex flex-col">
                <Typography variant="h6" fontWeight={700} color="#111827">Indicar Consumidor</Typography>
                <Typography variant="caption" color="#6B7280">Vincule um cliente à venda atual.</Typography>
             </div>
             <IconButton onClick={() => setOpenModalCliente(false)} sx={{ color: '#6B7280', '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}>
                 <Close />
             </IconButton>
        </div>
        
        <DialogContent sx={{ p: 6, background: '#FFFFFF' }}>
            <div className="space-y-4">
               <div>
                   <label className="text-xs font-semibold text-[#475569] mb-1 block">Tipo de Pessoa</label>
                   <Select 
                     size="small" 
                     fullWidth 
                     value={clienteForm.tipo} 
                     onChange={(e) => setClienteForm({ ...clienteForm, tipo: e.target.value })} 
                     sx={{ bgcolor: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB', borderRadius: '8px' } }}
                   >
                     <MenuItem value="consumidor">Pessoa Física (Consumidor)</MenuItem>
                     <MenuItem value="empresa">Pessoa Jurídica (Empresa)</MenuItem>
                   </Select>
               </div>
               
               <div className="flex gap-2 items-end">
                   <div className="flex-1">
                       <label className="text-xs font-semibold text-[#475569] mb-1 block">{clienteForm.tipo === 'empresa' ? 'CNPJ' : 'CPF'}</label>
                       <TextField size="small" fullWidth variant="outlined" placeholder={clienteForm.tipo === 'empresa' ? '00.000.000/0000-00' : '000.000.000-00'} value={clienteForm.cpf} onChange={(e) => setClienteForm({ ...clienteForm, cpf: e.target.value })} sx={{ bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                   </div>
                   <Button variant="contained" onClick={handlePesquisarCliente} disabled={pesquisandoCliente} sx={{ bgcolor: '#3C0473', color: 'white', textTransform: 'none', fontWeight: 600, borderRadius: '8px', height: '40px', px: 3, '&:hover': { bgcolor: '#2A0255' }, boxShadow: 'none' }}>
                     {pesquisandoCliente ? <CircularProgress size={20} color="inherit" /> : 'Pesquisar'}
                   </Button>
               </div>

               <div>
                   <label className="text-xs font-semibold text-[#475569] mb-1 block">Nome <span className="text-red-500">*</span></label>
                   <TextField size="small" fullWidth variant="outlined" placeholder="Nome do consumidor" value={clienteForm.nome} onChange={(e) => setClienteForm({ ...clienteForm, nome: e.target.value })} sx={{ bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
               </div>

               <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="text-xs font-semibold text-[#475569] mb-1 block">E-mail</label>
                       <TextField size="small" fullWidth variant="outlined" placeholder="email@exemplo.com" value={clienteForm.email} onChange={(e) => setClienteForm({ ...clienteForm, email: e.target.value })} sx={{ bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                   </div>
                   <div>
                       <label className="text-xs font-semibold text-[#475569] mb-1 block">Celular</label>
                       <TextField size="small" fullWidth variant="outlined" placeholder="(00) 00000-0000" value={clienteForm.celular} onChange={(e) => setClienteForm({ ...clienteForm, celular: e.target.value })} sx={{ bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                   </div>
               </div>
            </div>
        </DialogContent>
        
        <DialogActions sx={{ px: 6, pb: 6, pt: 0, justifyContent: 'space-between' }}>
          <Button onClick={() => { setClienteSelecionado(null); setOpenModalCliente(false); }} variant="outlined" sx={{ borderColor: '#EF4444', color: '#EF4444', textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 3, '&:hover': { bgcolor: '#FEF2F2', borderColor: '#DC2626' } }}>Remover Cliente</Button>
          <div className="flex gap-2">
             <Button onClick={() => setOpenModalCliente(false)} variant="outlined" sx={{ borderColor: '#D1D5DB', color: '#475569', textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 3 }}>Cancelar</Button>
             <Button onClick={handleConfirmarCliente} variant="contained" sx={{ bgcolor: '#10B981', color: 'white', textTransform: 'none', fontWeight: 600, borderRadius: '8px', px: 4, boxShadow: 'none', '&:hover': { bgcolor: '#059669', boxShadow: 'none' } }}>Confirmar</Button>
          </div>
        </DialogActions>
      </Dialog>

      {/* ℹ️ MODAL DE AJUDA / ATALHOS */}
      <Dialog 
        open={openModalAjuda} 
        onClose={() => setOpenModalAjuda(false)} 
        maxWidth="xs" 
        fullWidth 
        PaperProps={{ sx: { background: '#FFFFFF', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' } }}
        slotProps={{ backdrop: { sx: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(15, 23, 42, 0.4)' } } }}
      >
        <div className="flex justify-between px-6 py-4 border-b border-[#E5E7EB] items-center">
             <div className="flex flex-col">
                <Typography variant="h6" fontWeight={700} color="#111827">Atalhos do Teclado</Typography>
                <Typography variant="caption" color="#6B7280">Agilize suas operações no PDV.</Typography>
             </div>
             <IconButton onClick={() => setOpenModalAjuda(false)} sx={{ color: '#6B7280', '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}>
                 <Close />
             </IconButton>
        </div>
        <DialogContent sx={{ p: 6, background: '#FFFFFF' }}>
             <ul className="space-y-4">
                 <li className="flex justify-between items-center"><span className="text-[#374151] font-medium">Ajuda de Atalhos</span> <span className="bg-[#F3F4F6] text-[#111827] px-2 py-1 rounded-md text-xs font-bold border border-[#D1D5DB]">F1</span></li>
                 <li className="flex justify-between items-center"><span className="text-[#374151] font-medium">Focar na Busca de Produto</span> <span className="bg-[#F3F4F6] text-[#111827] px-2 py-1 rounded-md text-xs font-bold border border-[#D1D5DB]">F2</span></li>
                 <li className="flex justify-between items-center"><span className="text-[#374151] font-medium">Aumentar quantidade do ultimo item</span> <span className="bg-[#F3F4F6] text-[#111827] px-2 py-1 rounded-md text-xs font-bold border border-[#D1D5DB]">F3</span></li>
                 <li className="flex justify-between items-center"><span className="text-[#374151] font-medium">Reduzir quantidade do ultimo item</span> <span className="bg-[#F3F4F6] text-[#111827] px-2 py-1 rounded-md text-xs font-bold border border-[#D1D5DB]">Shift + F3</span></li>
                 <li className="flex justify-between items-center"><span className="text-[#374151] font-medium">Finalizar Venda</span> <span className="bg-[#F3F4F6] text-[#111827] px-2 py-1 rounded-md text-xs font-bold border border-[#D1D5DB]">F6</span></li>
                 <li className="flex justify-between items-center"><span className="text-[#374151] font-medium">Pagamento Múltiplo</span> <span className="bg-[#F3F4F6] text-[#111827] px-2 py-1 rounded-md text-xs font-bold border border-[#D1D5DB]">F7</span></li>
                 <li className="flex justify-between items-center"><span className="text-[#374151] font-medium">Indicar Consumidor</span> <span className="bg-[#F3F4F6] text-[#111827] px-2 py-1 rounded-md text-xs font-bold border border-[#D1D5DB]">Shift + C</span></li>
                 <li className="flex justify-between items-center"><span className="text-[#374151] font-medium">Fechar modal / nova venda</span> <span className="bg-[#F3F4F6] text-[#111827] px-2 py-1 rounded-md text-xs font-bold border border-[#D1D5DB]">Esc</span></li>
             </ul>
        </DialogContent>
      </Dialog>

    {/* AREA DE IMPRESSÃO INVISÍVEL NO DOM PRINCIPAL */}
    <div style={{ position: 'absolute', left: '-9999px', top: '0px' }}>
       <CupomNaoFiscal venda={vendaConcluida} user={user} pagamentos={vendaConcluida?.pagamentos || pagamentos} />
    </div>
    </>
  );
};

export default PDV;
