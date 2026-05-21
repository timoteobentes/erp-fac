import React from 'react';
import dayjs from 'dayjs';
import { QRCodeSVG } from 'qrcode.react';

interface CupomNaoFiscalProps {
  venda: any;
  user: any;
  pagamentos: any[];
}

const formatCurrency = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num || 0);
};

const formatTelefone = (tel?: string) => {
  if (!tel) return '';
  const cleaned = String(tel).replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})/, "($1)$2-$3");
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/^(\d{2})(\d{4})(\d{4})/, "($1)$2-$3");
  }
  return tel;
};

const CupomNaoFiscal: React.FC<CupomNaoFiscalProps> = ({ venda, user, pagamentos }) => {
  if (!venda) return null;

  const localData = JSON.parse(localStorage.getItem('user') || localStorage.getItem('empresa') || '{}');
  const nomeEmpresa = venda.nome_fantasia || venda.razao_social || venda.nome_empresa || localData.nome_empresa || localData.razao_social || localData.empresa?.nome_fantasia || localData.empresa?.razao_social || 'Empresa Emissora';
  const cnpjRaw = venda.emitente_cnpj || localData.cnpj || localData.empresa?.cnpj || '00000000000000';
  const cnpjFormatado = String(cnpjRaw).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  
  const telefoneEmpresa = localData.telefone || localData.celular || localData.empresa?.telefone || localData.empresa?.celular || 'Não informado';
  const operador = user?.nome_usuario || user?.nome_completo || user?.nome || user?.name || localData.nome_usuario || localData.nome_completo || 'Representante';
  
  const dataVenda = dayjs().format('DD/MM/YYYY');
  const horaVenda = dayjs().format('HH:mm');

  // fallback para cliente
  const clienteNome = venda.cliente_nome || 'Consumidor';
  const clienteTel = formatTelefone(venda.cliente_telefone || '');

  // fallback para itens se não houver venda finalizada completa ainda
  const itens = venda.itens || [];
  const totalPedido = Number(venda.valor_total) || itens.reduce((acc: number, item: any) => acc + (parseFloat(item.subtotal || item.valor_total || 0)), 0);
  const qrCodeValue = venda.url_qrcode
    || venda.qr_code_url
    || venda.qrcode
    || venda.qr_code
    || (venda.chave_acesso ? `NFC-e ${venda.chave_acesso}` : `FACOACONTA|VENDA:${venda.id || 'SEM_ID'}|TOTAL:${totalPedido.toFixed(2)}|DATA:${dayjs().format('YYYY-MM-DD HH:mm')}`);

  return (
    <div 
      id="printable-cupom-nao-fiscal" 
      style={{ 
        width: '80mm',
        minHeight: '80mm',
        padding: '4mm',
        boxSizing: 'border-box',
        fontFamily: '"Courier New", monospace',
        fontSize: '10px',
        color: '#000',
        backgroundColor: '#fff',
        lineHeight: '1.25',
        overflow: 'hidden'
      }}
    >
      {/* CABEÇALHO DA EMPRESA */}
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>
        {nomeEmpresa}
      </div>
      <div>CNPJ: {cnpjFormatado}</div>
      <div>{telefoneEmpresa}</div>
      <div>Operador: {operador}</div>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

      {/* PEDIDO */}
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13px', margin: '8px 0' }}>
        PEDIDO Nº {venda.id || '1'}
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

      {/* INFORMAÇÕES DO CLIENTE */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div><span style={{ fontWeight: 'bold' }}>Data:</span> {dataVenda}</div>
        <div>Hora: {horaVenda}</div>
      </div>
      <div><span style={{ fontWeight: 'bold' }}>Cliente:</span> {clienteNome}</div>
      {clienteTel && <div><span style={{ fontWeight: 'bold' }}>Telefone:</span> {clienteTel}</div>}

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

      {/* DETALHES DA VENDA */}
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13px', margin: '8px 0' }}>
        DETALHES DA VENDA
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

      <table style={{ width: '100%', fontSize: '9px', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', fontWeight: 'bold', width: '38%' }}>NOME</th>
            <th style={{ textAlign: 'right', fontWeight: 'bold', width: '14%' }}>QTD</th>
            <th style={{ textAlign: 'right', fontWeight: 'bold', width: '18%' }}>VL.UN</th>
            <th style={{ textAlign: 'right', fontWeight: 'bold', width: '12%' }}>DESC</th>
            <th style={{ textAlign: 'right', fontWeight: 'bold', width: '18%' }}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item: any, idx: number) => (
            <tr key={idx}>
              <td style={{ paddingTop: '4px', paddingBottom: '4px', wordBreak: 'break-word' }}>{item.nome || item.produto_nome}</td>
              <td style={{ textAlign: 'right', paddingTop: '4px', paddingBottom: '4px' }}>{Number(item.quantidade).toFixed(2).replace('.', ',')}</td>
              <td style={{ textAlign: 'right', paddingTop: '4px', paddingBottom: '4px' }}>{formatCurrency(item.valor_unitario)}</td>
              <td style={{ textAlign: 'right', paddingTop: '4px', paddingBottom: '4px' }}>-</td>
              <td style={{ textAlign: 'right', paddingTop: '4px', paddingBottom: '4px' }}>{formatCurrency(item.subtotal || item.valor_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
        <div>Total do pedido:</div>
        <div>{formatCurrency(totalPedido)}</div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

      {/* PAGAMENTO */}
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '13px', margin: '8px 0' }}>
        PAGAMENTO
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

      <table style={{ width: '100%', fontSize: '9px', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', fontWeight: 'bold' }}>Vencimento</th>
            <th style={{ textAlign: 'left', fontWeight: 'bold' }}>Valor</th>
            <th style={{ textAlign: 'left', fontWeight: 'bold' }}>Forma de pag.</th>
          </tr>
        </thead>
        <tbody>
          {pagamentos && pagamentos.length > 0 ? pagamentos.map((pag: any, idx: number) => (
            <tr key={idx}>
              <td style={{ paddingTop: '4px' }}>{pag.vencimento ? dayjs(pag.vencimento).format('DD/MM/YYYY') : dayjs().format('DD/MM/YYYY')}</td>
              <td style={{ paddingTop: '4px' }}>{formatCurrency(pag.valor)}</td>
              <td style={{ paddingTop: '4px' }}>{pag.tipo || 'A Combinar'}</td>
            </tr>
          )) : (
            <tr>
              <td style={{ paddingTop: '4px' }}>{dayjs().format('DD/MM/YYYY')}</td>
              <td style={{ paddingTop: '4px' }}>{formatCurrency(totalPedido)}</td>
              <td style={{ paddingTop: '4px' }}>A Combinar</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
        <QRCodeSVG value={qrCodeValue} size={96} level="M" includeMargin={false} />
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

      <div style={{ textAlign: 'center', margin: '16px 0' }}>
        <div>*** Este cupom não é documento fiscal ***</div>
        <div style={{ marginTop: '16px' }}>OBRIGADO E VOLTE SEMPRE!</div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '16px 0 8px 0' }}></div>

      <div style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '10px', color: '#555' }}>
        Software Faço a Conta – www.facoaconta.com.br
      </div>
    </div>
  );
};

export default CupomNaoFiscal;
