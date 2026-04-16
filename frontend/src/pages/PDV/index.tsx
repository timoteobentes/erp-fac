import React, { useState, useRef, useEffect } from 'react';
import { TextField, Button, IconButton, Select, MenuItem, Dialog, DialogContent, DialogActions, Box, Typography, Divider } from '@mui/material';
import { Close, Settings } from '@mui/icons-material';
import { usePDV } from '../../modules/PDV/hooks/usePDV';
import { useNavigate } from 'react-router-dom';
import logo_fac from "../../assets/FAC_logo_roxo.svg";
import DanfeCupom from '../../modules/PDV/components/DanfeCupom';
import { toast } from 'react-toastify'; // Usaremos para dar feedback visual nos atalhos

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

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

  // Estados do Modal de Checkout (Pagamento Múltiplo)
  const [openModal, setOpenModal] = useState(false);
  const [pagamentos, setPagamentos] = useState([
    { tipo: '', valor: '', observacao: '', vencimento: '' }
  ]);

  // Estados para exibição do sucesso da Sefaz
  const [vendaConcluida, setVendaConcluida] = useState<any>(null);

  // Foco inicial no campo de busca
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // 🚀 O MOTOR DE ATALHOS DO PDV
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Se um modal estiver aberto, não dispara os atalhos de fundo
      if (openModal || vendaConcluida) return;

      switch (e.key) {
        case 'F1':
          e.preventDefault();
          toast.info('Ajuda de Atalhos acionada!'); // Pode abrir um modal de ajuda no futuro
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
          toast.info('Selecione o item para alterar a quantidade.'); 
          // Aqui você pode colocar a lógica para focar no input de QTD do último item adicionado
          break;
        case 'F6':
          e.preventDefault();
          if (carrinho.length > 0) handleFinalizarVenda();
          else toast.warning('O carrinho está vazio.');
          break;
        case 'F7':
          e.preventDefault();
          if (carrinho.length > 0) setOpenModal(true);
          else toast.warning('Adicione produtos antes de pagar.');
          break;
        case 'F8':
          e.preventDefault();
          toast.info('Abrindo listagem de notas...');
          break;
        case 'C':
        case 'c':
          if (e.shiftKey) {
            e.preventDefault();
            toast.info('Modal de Vincular Cliente abrirá aqui!');
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [carrinho, openModal, vendaConcluida]);

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

  const handleFinalizarVenda = async () => {
     if (carrinho.length === 0) return;
     const result = await finalizarVenda('dinheiro', totalCarrinho);
     if (result && result.sucesso) {
        setVendaConcluida(result.dadosVenda);
        cleanScreenAfterSale();
     }
  };

  const handeConfirmarMultiplo = async () => {
    const result = await finalizarVenda(pagamentos[0]?.tipo || 'dinheiro', totalCarrinho);
    if (result && result.sucesso) {
      setOpenModal(false);
      setVendaConcluida(result.dadosVenda);
      cleanScreenAfterSale();
    }
  };

  const handlePrintCupom = () => {
    const printContent = document.getElementById('printable-danfe-content');
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Imprimir NFC-e</title>');
      printWindow.document.write('<style>@page { margin: 0; } body { font-family: monospace; width: 80mm; padding: 10px; margin: 0 auto; color: #000; } table { width: 100%; border-collapse: collapse; font-size: 10px; } .dashed-line { border-bottom: 1px dashed #000; margin: 8px 0; } .text-center { text-align: center; } .text-right { text-align: right; } .font-bold { font-weight: bold; }</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.write('</body></html>');
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
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
        </div>
        
        <div className="flex gap-3">
           <Button 
             variant="outlined" 
             endIcon={<Settings />}
             sx={{ borderColor: '#E5E7EB', color: '#374151', textTransform: 'none', borderRadius: '8px', fontWeight: 600, '&:hover': { borderColor: '#D1D5DB', backgroundColor: '#F3F4F6' } }}
           >
             Ações
           </Button>
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
              
              <div className="flex justify-between items-center mb-5 pb-5 border-b border-[#F9FAFB]">
                  <div className="flex flex-col gap-1">
                     <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Forma Pagamento</span>
                     <span className="text-sm font-bold text-[#111827]">Dinheiro</span>
                  </div>
                  <Button variant="outlined" size="small" sx={{ borderColor: '#D1D5DB', color: '#111827', textTransform: 'none', borderRadius: '8px', fontWeight: 600, '&:hover':{ borderColor: '#5B21B6', backgroundColor: '#F9FAFB' } }}>
                     Vincular Cliente
                  </Button>
              </div>

              <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-bold text-[#111827]">Recebimento</span>
                  <Button variant="contained" size="small" sx={{ bgcolor: '#F9FAFB', color: '#3C0473', boxShadow: 'none', border: '1px solid #D1D5DB', textTransform: 'none', borderRadius: '8px', fontWeight: 600, '&:hover': { bgcolor: '#F3F4F6', boxShadow: 'none' } }} onClick={() => setOpenModal(true)}>
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
                {isSubmitting ? 'Emitindo NFC-e...' : `Finalizar Venda (F6)`}
              </Button>
           </div>
        </section>

      </main>

      {/* RODAPÉ ATALHOS CLEAN E FUNCIONAIS */}
      <footer className="text-center py-3 bg-[#3C0473] text-xs font-medium text-[#9CA3AF] px-4">
         <span className="mx-3"><strong className="text-white font-bold">F1</strong> Atalhos</span>
         <span className="mx-3"><strong className="text-white font-bold">F2</strong> Busca</span>
         <span className="mx-3"><strong className="text-white font-bold">F3</strong> Quantidade</span>
         <span className="mx-3"><strong className="text-white font-bold">F6</strong> Finalizar</span>
         <span className="mx-3"><strong className="text-white font-bold">F7</strong> Multi-Pagamentos</span>
         <span className="mx-3"><strong className="text-white font-bold">Shift+C</strong> Cliente</span>
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
            {[1, 2, 3].map((linha, _index) => (
                <div key={linha} className="mb-6 p-4 border border-[#E5E7EB] rounded-xl bg-[#F9FAFB]">
                   <h4 className="text-[#3C0473] font-bold text-xs uppercase tracking-wide mb-3">Linha de pagamento {linha}</h4>
                   <div className="grid grid-cols-4 gap-4">
                       <div>
                           <label className="text-xs font-semibold text-[#475569] mb-1 block">Tipo de pagamento</label>
                           <Select size="small" fullWidth displayEmpty sx={{ bgcolor: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB', borderRadius: '8px' } }}>
                              <MenuItem value=""><em>-- selecione --</em></MenuItem>
                              <MenuItem value="dinheiro">Dinheiro</MenuItem>
                              <MenuItem value="pix">PIX</MenuItem>
                              <MenuItem value="cartao">Cartão</MenuItem>
                           </Select>
                       </div>
                       <div>
                           <label className="text-xs font-semibold text-[#475569] mb-1 block">Valor</label>
                           <TextField size="small" fullWidth variant="outlined" placeholder="R$ 0,00" sx={{ bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                       </div>
                       <div>
                           <label className="text-xs font-semibold text-[#475569] mb-1 block">Observação</label>
                           <TextField size="small" fullWidth variant="outlined" placeholder="Ex: Cartão final 1234" sx={{ bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                       </div>
                       <div>
                           <label className="text-xs font-semibold text-[#475569] mb-1 block">Vencimento</label>
                           <TextField size="small" fullWidth variant="outlined" placeholder="DD/MM/AAAA" sx={{ bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }} />
                       </div>
                   </div>
                </div>
            ))}

            <div className="mt-8 flex justify-between items-center bg-[#F3F4F6] p-4 rounded-xl">
               <span className="font-bold text-[#475569] text-lg">Falta Receber:</span>
               <span className="font-bold text-[#EF4444] text-2xl">{formatCurrency(totalCarrinho)}</span>
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
         <div className="bg-[#10B981] flex justify-center py-5 text-white items-center text-xl font-bold tracking-wide shadow-inner">
            Venda Concluída!
         </div>
         <DialogContent sx={{ textAlign: 'center', py: 6, background: '#FFFFFF' }}>
             {vendaConcluida?.status_sefaz === 'autorizado' ? (
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
                         Imprimir Cupom (DANFE)
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
                    <div className="text-[#EF4444] font-bold text-2xl mb-2">NF-e Pendente/Rejeitada</div>
                    <div className="text-[#6B7280] text-sm mb-6 px-4">
                      {vendaConcluida?.erro_sefaz || 'A venda local foi salva, mas a Sefaz não autorizou a emissão no momento.'}
                    </div>
                 </>
             )}
         </DialogContent>
         <DialogActions sx={{ justifyContent: 'center', pb: 5, pt: 0, background: '#FFFFFF' }}>
             <Button variant="outlined" size="large" onClick={handleNovaVenda} sx={{ textTransform: 'none', color: '#3C0473', borderColor: '#D1D5DB', borderRadius: '8px', fontWeight: 600, px: 4, '&:hover': { borderColor: '#3C0473', bgcolor: '#F8FAFC' } }}>
                Nova Venda (Esc)
             </Button>
         </DialogActions>
      </Dialog>
    </div>

    {/* AREA DE IMPRESSÃO INVISÍVEL NO DOM PRINCIPAL */}
    <div style={{ display: 'none' }}>
       <DanfeCupom venda={vendaConcluida} />
    </div>
    </>
  );
};

export default PDV;