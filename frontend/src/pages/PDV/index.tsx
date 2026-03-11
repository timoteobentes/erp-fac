import React, { useState, useRef, useEffect } from 'react';
import { TextField, Button, IconButton, Select, MenuItem, Dialog, DialogContent, DialogActions } from '@mui/material';
import { Close, Settings } from '@mui/icons-material';
import { usePDV } from '../../modules/PDV/hooks/usePDV';
import { useNavigate } from 'react-router-dom';
import logo_fac from "../../assets/FAC_logo_roxo.svg"

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
    finalizarVenda
  } = usePDV();

  // Estados da Busca
  const [termoBusca, setTermoBusca] = useState('');
  const [resultados, setResultados] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Estados do Modal de Checkout (Pagamento Múltiplo)
  const [openModal, setOpenModal] = useState(false);
  
  // Design exato da tela prevê "Linha de pagamento" 1, 2, 3...
  const [pagamentos, setPagamentos] = useState([
    { tipo: '', valor: '', observacao: '', vencimento: '' }
  ]);

  // Estados para exibição do sucesso da Sefaz
  const [vendaConcluida, setVendaConcluida] = useState<any>(null);

  // Foco inicial no campo de busca
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Evita atalhos se os modais estiverem abertos
      if (openModal || vendaConcluida) return;

      if (e.key === 'F6') {
        e.preventDefault();
        handleFinalizarVenda(); // Dinheiro Direto ou o que for F6
      }
      if (e.key === 'F7') {
        e.preventDefault();
        setOpenModal(true); // Abre modal de multipagamentos
      }
      if (e.key === 'F1') {
         // Ver atalhos - não implementado tooltip ainda
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

  const handleNovaVenda = () => {
      setVendaConcluida(null);
      if (inputRef.current) setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      
      {/* HEADER SUPERIOR (MOCKUP: Fechar caixa | Ações) */}
      <div className="w-full flex items-center p-4 bg-white">
        <img src={logo_fac} alt="logo" className="w-24" /> {/* Spacer */}
        <div className="flex gap-2 ml-4">
           <Button 
             variant="contained" 
             startIcon={<Close />}
             sx={{ bgcolor: '#cb3a5e', textTransform: 'none', borderRadius: '6px', fontWeight: 'bold' }}
             onClick={() => navigate('/inicio')}
           >
             Fechar caixa
           </Button>
           <Button 
             variant="contained" 
             endIcon={<Settings />}
             sx={{ bgcolor: '#2e5bbf', textTransform: 'none', borderRadius: '6px', fontWeight: 'bold' }}
           >
             Ações
           </Button>
        </div>
      </div>

      <div className="px-8 pb-2 mt-2">
         <h1 className="text-[#9842F6] font-bold text-2xl">Frente de caixa</h1>
      </div>

      {/* WORKSPACE PRINCIPAL (GRID) */}
      <main className="flex-1 flex overflow-hidden px-8 pb-8 gap-4 h-[calc(100vh-140px)]">
        
        {/* LADO ESQUERDO: CARRINHO / BUSCA */}
        <section className="w-[60%] flex flex-col bg-white border border-[#a196aa] rounded-sm overflow-hidden relative shadow-sm">
          
          <div className="flex px-4 py-3 text-xs font-semibold text-[#544a5b]">
              <div className="w-full grid grid-cols-12 gap-2">
                 <div className="col-span-5">Produto</div>
                 <div className="col-span-3">Valor</div>
                 <div className="col-span-4">Quantidade</div>
              </div>
          </div>

          <div className="px-4">
            <form onSubmit={handleBuscar} className="flex gap-2 w-full">
              <input
                ref={inputRef}
                className="w-full bg-transparent border-none outline-none text-[#544a5b] placeholder-[#544a5b] py-2 text-sm"
                placeholder="Selecione produto ou use o código de barras"
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </form>
          </div>

          {/* CABEÇALHO DO CARRINHO */}
          <div className="mt-4 px-4">
             <div className="grid grid-cols-12 gap-2 text-xs font-bold text-[#352541] mb-2 px-2">
                 <div className="col-span-1">Item</div>
                 <div className="col-span-1">ID</div>
                 <div className="col-span-4">Produto</div>
                 <div className="col-span-2 text-center">Quantidade</div>
                 <div className="col-span-2 text-center">Valor</div>
                 <div className="col-span-2 text-right">Subtotal</div>
             </div>
             
             {/* LISTA DE ITENS */}
             <div className="overflow-y-auto max-h-[40vh] space-y-2 pb-2">
                {carrinho.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 text-xs text-[#544a5b] bg-[#f4eff6] rounded items-center p-2 border border-transparent shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                        <div className="col-span-1 text-center font-semibold">{index + 1}</div>
                        <div className="col-span-1 text-center">{item.produto_id}</div>
                        <div className="col-span-4 truncate">{item.nome}</div>
                        <div className="col-span-2 flex justify-center items-center gap-2">
                            <button 
                              className="text-red-500 border border-red-300 bg-transparent rounded-sm w-5 h-5 flex items-center justify-center font-bold hover:bg-red-50"
                              onClick={() => alterarQuantidade(index, item.quantidade - 1)}
                            >-</button>
                            <span className="w-4 text-center">{item.quantidade}</span>
                            <button 
                              className="text-green-500 border border-green-300 bg-transparent rounded-sm w-5 h-5 flex items-center justify-center font-bold hover:bg-green-50"
                              onClick={() => alterarQuantidade(index, item.quantidade + 1)}
                            >+</button>
                        </div>
                        <div className="col-span-2 text-center">{formatCurrency(item.valor_unitario)}</div>
                        <div className="col-span-2 text-right font-semibold">{formatCurrency(item.subtotal)}</div>
                    </div>
                ))}
            </div>
          </div>

          {/* TOTAL GIGANTE */}
          <div className="absolute bottom-4 right-6 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#352541]">Subtotal:</span>
              <span className="text-4xl font-normal text-[#544a5b]">{formatCurrency(totalCarrinho)}</span>
          </div>
        </section>

        {/* LADO DIREITO: GRID DE PRODUTOS / FINALIZAÇÃO */}
        <section className="w-[40%] flex flex-col bg-white border border-[#a196aa] rounded-sm overflow-hidden shadow-sm relative p-4">
           
           <h3 className="text-xs font-semibold text-[#544a5b] mb-4">Categorias de produtos</h3>
           <span className="text-xs text-[#352541] mb-4">Todos</span>

           <div className="grid grid-cols-3 gap-6 overflow-y-auto mb-32 pr-2">
              {resultados.length > 0 ? resultados.map(prod => (
                 <div key={prod.id} 
                      className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => adicionarProduto(prod, 1)}
                  >
                     {/* MOCK Imagem Garrafão */}
                     <img src="https://i.ibb.co/6803PqD/garrafao.png" alt="Produto" className="w-20 h-24 object-contain opacity-80 mix-blend-multiply drop-shadow-md" />
                     <span className="text-[10px] font-bold text-[#352541] text-center mt-2 leading-tight w-full line-clamp-2">{prod.nome}</span>
                     <span className="text-[11px] font-normal text-[#544a5b]">{formatCurrency(Number(prod.preco_venda))}</span>
                 </div>
              )) : (
                 <div className="col-span-3 text-center text-gray-500 text-sm mt-10">
                   Busque ou bipe produtos para adicioná-los.
                 </div>
              )}
           </div>

           {/* BLOCO FINALIZAÇÃO INFERIOR DIREITA */}
           <div className="absolute bottom-4 right-4 left-4 flex flex-col pr-1">
              <div className="flex justify-between items-end mb-4 text-xs font-semibold text-[#544a5b]">
                  <div className="flex flex-col gap-1">
                     <span>Forma de pagamento</span>
                     <span>Dinheiro</span>
                  </div>
                  <Button variant="contained" size="small" sx={{ bgcolor: '#2e5bbf', textTransform: 'none', padding: '2px 14px' }}>
                     Cliente
                  </Button>
              </div>

              <div className="flex justify-between items-end mb-4 text-xs font-semibold text-[#544a5b]">
                  <span>Valor recebido</span>
                  <Button variant="contained" size="small" sx={{ bgcolor: '#4fb462', textTransform: 'none', padding: '2px 14px' }} onClick={() => setOpenModal(true)}>
                     Pagamento Múltiplo (F7)
                  </Button>
              </div>

              <div className="flex justify-end mb-4">
                  <Button variant="contained" size="small" sx={{ bgcolor: '#6B00A1', textTransform: 'none', padding: '2px 14px' }}>
                     Notas
                  </Button>
              </div>

              <Button 
                variant="contained" 
                fullWidth
                disabled={carrinho.length === 0}
                onClick={handleFinalizarVenda}
                sx={{ 
                  bgcolor: '#4fb462', 
                  color: 'white', 
                  fontSize: '1.1rem', 
                  py: 1, 
                  fontWeight: 'bold',
                  textTransform: 'none',
                  borderRadius: '6px',
                  '&:hover': { bgcolor: '#44a155' },
                  '&:disabled': { bgcolor: '#8dcba1', color: '#fff' }
                }}
              >
                Finalizar {formatCurrency(totalCarrinho)} (F6)
              </Button>
           </div>
        </section>

      </main>

      {/* RODAPÉ ATALHOS */}
      <footer className="text-center pb-4 text-xs font-semibold text-[#352541] px-4 truncate">
         <span className="mx-2"><strong className="font-bold">F1 =</strong> Ver Atalhos</span>
         <span className="mx-2"><strong className="font-bold">F2 =</strong> Nova Busca</span>
         <span className="mx-2"><strong className="font-bold">F3 =</strong> Mudar Quantidade</span>
         <span className="mx-2"><strong className="font-bold">F4 =</strong> Adicionar Produto</span>
         <span className="mx-2"><strong className="font-bold">F6 =</strong> Finalizar venda</span>
         <span className="mx-2"><strong className="font-bold">F7 =</strong> Multiplos pagamentos</span>
         <span className="mx-2"><strong className="font-bold">F8 =</strong> Notas</span>
         <span className="mx-2"><strong className="font-bold">Shift + C =</strong> Adicionar Cliente</span>
      </footer>

      {/* MODAL DE PAGAMENTO MÚLTIPLO */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth PaperProps={{ sx: { background: 'white', borderRadius: '4px' } }}>
        <div className="bg-[#4a0e78] flex justify-between px-4 py-2 text-white items-center">
             <span className="text-sm font-semibold">Pagamento múltiplo {formatCurrency(totalCarrinho)}</span>
             <IconButton size="small" onClick={() => setOpenModal(false)} sx={{ color: 'white' }}>
                 <Close fontSize="small" />
             </IconButton>
        </div>
        <DialogContent sx={{ p: 4, pt: 2, background: 'white' }}>
            {[1, 2, 3].map((linha, _index) => (
                <div key={linha} className="mb-6">
                   <h4 className="text-[#352541] font-bold text-sm mb-2">Linha de pagamento {linha}</h4>
                   <div className="grid grid-cols-4 gap-4">
                       <div>
                           <label className="text-xs text-[#544a5b] mb-1 block">Tipo de pagamento</label>
                           <Select size="small" fullWidth value="" displayEmpty sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: '#d3d3d3' } }}>
                              <MenuItem value=""><em>-- selecione --</em></MenuItem>
                           </Select>
                       </div>
                       <div>
                           <label className="text-xs text-[#544a5b] mb-1 block">Valor</label>
                           <TextField size="small" fullWidth variant="standard" sx={{ mt: '6px' }} />
                       </div>
                       <div>
                           <label className="text-xs text-[#544a5b] mb-1 block">Observação</label>
                           <TextField size="small" fullWidth variant="standard" sx={{ mt: '6px' }} />
                       </div>
                       <div>
                           <label className="text-xs text-[#544a5b] mb-1 block">Vencimento</label>
                           <TextField size="small" fullWidth variant="standard" sx={{ mt: '6px' }} />
                       </div>
                   </div>
                </div>
            ))}

            <div className="mt-8 flex items-end gap-2 text-xl">
               <span className="font-bold text-[#352541]">Valor restante</span>
               <span className="font-bold text-[#cb3a5e]">{formatCurrency(totalCarrinho)}</span>
            </div>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4, pt: 0, justifyContent: 'flex-start' }}>
          <Button onClick={() => setOpenModal(false)} variant="contained" sx={{ bgcolor: '#cb3a5e', textTransform: 'none', '&:hover': { bgcolor: '#b83354' } }}>Cancelar</Button>
          <Button 
            onClick={handeConfirmarMultiplo} 
            variant="contained" 
            sx={{ bgcolor: '#4fb462', ml: 2, textTransform: 'none', '&:hover': { bgcolor: '#44a155' } }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL DE SUCESSO / RETORNO DA SEFAZ */}
      <Dialog open={!!vendaConcluida} onClose={handleNovaVenda} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '8px' } }}>
         <div className="bg-[#4fb462] flex justify-center py-4 text-white items-center text-xl font-bold">
            Venda Concluída!
         </div>
         <DialogContent sx={{ textAlign: 'center', py: 6 }}>
             {vendaConcluida?.status_sefaz === 'autorizado' ? (
                 <>
                    <div className="text-green-600 font-bold text-3xl mb-4">✅ NFC-e Autorizada</div>
                    <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6 inline-block text-left">
                       <p className="text-gray-600 text-sm mb-1"><strong>Chave de Acesso:</strong></p>
                       <p className="text-gray-900 text-xs font-mono break-all font-bold">{vendaConcluida.chave_acesso}</p>
                       <p className="text-gray-600 text-sm mt-3 mb-1"><strong>Protocolo de Autorização:</strong></p>
                       <p className="text-gray-900 text-xs font-mono font-bold">{vendaConcluida.protocolo} - Nº {vendaConcluida.numero_nfe}</p>
                    </div>
                    
                    <div className="flex justify-center w-full mt-2">
                      <Button 
                         variant="contained" 
                         size="large"
                         onClick={() => {
                            // Simulando a impressão do DANFE: abre o XML em nova aba
                            if (vendaConcluida.xml_autorizado) {
                               const w = window.open('about:blank', '_blank');
                               if (w) w.document.write(`<pre>${vendaConcluida.xml_autorizado.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`);
                            }
                         }}
                         sx={{ bgcolor: '#6B00A1', textTransform: 'none', px: 4, py: 1.5, fontSize: '1.1rem', borderRadius: '8px', '&:hover': { bgcolor: '#51007a' } }}
                      >
                         Imprimir Cupom (DANFE)
                      </Button>
                    </div>
                 </>
             ) : (
                 <>
                    <div className="text-[#cb3a5e] font-bold text-2xl mb-2">NF-e Pendente/Rejeitada</div>
                    <div className="text-gray-500 text-sm mb-6">
                      {vendaConcluida?.erro_sefaz || 'A venda local foi salva, mas a Sefaz não autorizou a emissão no momento.'}
                    </div>
                 </>
             )}
         </DialogContent>
         <DialogActions sx={{ justifyContent: 'center', pb: 4, pt: 0 }}>
             <Button variant="outlined" size="large" onClick={handleNovaVenda} sx={{ textTransform: 'none', color: '#6B00A1', borderColor: '#6B00A1' }}>
                Nova Venda (Esc)
             </Button>
         </DialogActions>
      </Dialog>
    </div>
  );
};

export default PDV;
