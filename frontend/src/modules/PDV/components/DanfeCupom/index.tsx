import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface DanfeCupomProps {
  venda: any;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
};

const formatCNPJ = (cnpj?: string) => {
  if (!cnpj) return '00.000.000/0000-00';
  const cleaned = String(cnpj).replace(/\D/g, ''); // Remove tudo que não for número
  if (cleaned.length !== 14) return cnpj; // Se não tiver 14 dígitos, devolve como veio
  return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
};

const DanfeCupom: React.FC<DanfeCupomProps> = ({ venda }) => {
  if (!venda) return null;

  let urlQRCode = venda.url_qrcode || venda.qr_code_url || venda.qrcode || venda.qr_code || '';
  if (!urlQRCode && venda.xml_autorizado) {
    const xmlString = String(venda.xml_autorizado);
    if (xmlString.includes('<qrCode>') && xmlString.includes('</qrCode>')) {
      const extraido = xmlString.split('<qrCode>')[1].split('</qrCode>')[0];
      urlQRCode = extraido.replace('<![CDATA[', '').replace(']]>', '').trim();
    }
  }

  const dataEmissao = new Date().toLocaleString('pt-BR');
  const ambiente = venda.xml_autorizado?.includes('<tpAmb>2</tpAmb>') ? 'HOMOLOGAÇÃO' : 'PRODUÇÃO';

  const localData = JSON.parse(localStorage.getItem('user') || localStorage.getItem('empresa') || '{}');
  const cnpjRaw = venda.emitente_cnpj || localData.cnpj || localData.empresa?.cnpj || '';
  const cnpjFormatado = formatCNPJ(cnpjRaw);

  return (
    <div id="printable-danfe-content">
      {/* CABEÇALHO DA EMPRESA */}
      <div className="text-center font-bold" style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '12px' }}>{venda.nome_fantasia || venda.razao_social || venda.nome_empresa || 'Empresa Emissora'}</div>
        <div>CNPJ: {cnpjFormatado || 'CNPJ não encontrado'}</div>
        <div>{venda.emitente_cidade} - {venda.emitente_estado}</div>
      </div>

      <div className="dashed-line"></div>

      {/* TÍTULO DANFE */}
      <div className="text-center font-bold" style={{ marginBottom: '8px' }}>
        <div>DANFE NFC-e - Documento Auxiliar da</div>
        <div>Nota Fiscal de Consumidor Eletrônica</div>
        <div style={{ fontSize: '9px', marginTop: '4px' }}>Não permite aproveitamento de crédito de ICMS</div>
      </div>

      <div className="dashed-line"></div>

      {/* LISTA DE ITENS */}
      <table>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>DESCRIÇÃO</th>
            <th className="text-right">QTD</th>
            <th className="text-right">UN</th>
            <th className="text-right">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {venda.itens?.map((item: any, idx: number) => (
            <tr key={idx}>
              <td style={{ paddingRight: '4px' }}>{item.nome || item.produto_nome}</td>
              <td className="text-right">{Number(item.quantidade).toFixed(2)}</td>
              <td className="text-right">UN</td>
              <td className="text-right">{formatCurrency(item.valor_total || item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="dashed-line"></div>

      {/* TOTAIS */}
      <table style={{ marginTop: '4px', fontSize: '11px' }}>
        <tbody>
          <tr>
            <td className="font-bold">QTD. TOTAL DE ITENS</td>
            <td className="text-right font-bold">{venda.itens?.length || 0}</td>
          </tr>
          <tr>
            <td className="font-bold" style={{ fontSize: '12px' }}>VALOR TOTAL R$</td>
            <td className="text-right font-bold" style={{ fontSize: '12px' }}>{formatCurrency(venda.valor_total)}</td>
          </tr>
          <tr>
            <td>FORMA DE PAGAMENTO</td>
            <td className="text-right">{venda.forma_pagamento || 'Dinheiro'}</td>
          </tr>
        </tbody>
      </table>

      <div className="dashed-line"></div>

      {/* MENSAGEM HOMOLOGACAO SE FOR O CASO */}
      {ambiente === 'HOMOLOGAÇÃO' && (
         <div className="text-center font-bold" style={{ margin: '8px 0', fontSize: '12px' }}>
            EMITIDA EM AMBIENTE DE HOMOLOGAÇÃO<br/>SEM VALOR FISCAL
         </div>
      )}

      {/* CHAVE DE ACESSO */}
      <div className="text-center" style={{ margin: '8px 0' }}>
        <div className="font-bold">Consulte pela Chave de Acesso em</div>
        <div style={{ fontSize: '9px', wordBreak: 'break-all' }}>https://sistemas.sefaz.am.gov.br/nfceweb/formConsulta.do</div>
        <div className="font-bold" style={{ fontSize: '10px', marginTop: '4px', letterSpacing: '1px' }}>
          {venda.chave_acesso?.replace(/(.{4})/g, '$1 ')}
        </div>
      </div>

      <div className="dashed-line"></div>

      {/* PROTOCOLO */}
      <div className="text-center font-bold" style={{ fontSize: '10px', margin: '8px 0' }}>
        <div>NFC-e nº {venda.numero_nfe || '000000000'} Série: {venda.serie_nfe || '001'}</div>
        <div>Emissão: {dataEmissao}</div>
        <div style={{ marginTop: '4px' }}>Protocolo de Autorização: {venda.protocolo}</div>
      </div>

      <div className="dashed-line"></div>

      {/* QR CODE */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0 8px 0' }}>
        {urlQRCode ? (
           <QRCodeSVG value={urlQRCode} size={130} level="M" />
        ) : (
           <div style={{ border: '1px solid #000', padding: '16px', textAlign: 'center' }}>QR Code não disponível</div>
        )}
      </div>

    </div>
  );
};

export default DanfeCupom;
