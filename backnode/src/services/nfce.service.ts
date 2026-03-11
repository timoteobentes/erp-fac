import { VendaRepository } from '../repositories/VendaRepository';
import forge from 'node-forge';
import { DateTime } from 'luxon';
import { SignedXml } from 'xml-crypto';
import { DOMParser } from '@xmldom/xmldom';
import axios from 'axios';
import https from 'https';
import crypto from 'crypto';

class NFeKeyInfo {
  private certPem: string;
  constructor(certPem: string) {
    this.certPem = certPem
      .replace(/-----BEGIN CERTIFICATE-----/g, '')
      .replace(/-----END CERTIFICATE-----/g, '')
      .replace(/\r?\n|\r/g, '');
  }
  getKeyInfo(key: any, prefix: string) {
    return `<X509Data><X509Certificate>${this.certPem}</X509Certificate></X509Data>`;
  }
  getKey(keyInfo: any) {
    return this.certPem;
  }
}

export class NfceService {
  private vendaRepository: VendaRepository;

  constructor() {
    this.vendaRepository = new VendaRepository();
  }

  private modulo11(chave43: string): string {
    const multiplicadores = [2, 3, 4, 5, 6, 7, 8, 9];
    let soma = 0;
    for (let i = 42, m = 0; i >= 0; i--, m++) {
      if (m >= multiplicadores.length) m = 0;
      soma += parseInt(chave43[i]) * multiplicadores[m];
    }
    const resto = soma % 11;
    return resto === 0 || resto === 1 ? '0' : (11 - resto).toString();
  }

  private extractPemFromPfx(pfxBase64: string, password: string) {
    const p12Der = forge.util.decode64(pfxBase64);
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, password);
    
    let privateKey: forge.pki.PrivateKey | null = null;
    let privateKeyPem = '';
    const certs: forge.pki.Certificate[] = [];

    for (const safeContents of p12.safeContents) {
      for (const safeBag of safeContents.safeBags) {
        if (
          safeBag.type === forge.pki.oids.keyBag ||
          safeBag.type === forge.pki.oids.pkcs8ShroudedKeyBag
        ) {
          privateKey = safeBag.key!;
          privateKeyPem = forge.pki.privateKeyToPem(privateKey);
        } else if (safeBag.type === forge.pki.oids.certBag) {
          certs.push(safeBag.cert!);
        }
      }
    }

    if (!privateKey) {
      throw new Error("Chave privada não encontrada no certificado PFX.");
    }

    let selectedCert: forge.pki.Certificate | null = null;
    let certPem = '';

    for (const cert of certs) {
      const publicKey = cert.publicKey as forge.pki.rsa.PublicKey;
      const rsaPrivateKey = privateKey as forge.pki.rsa.PrivateKey;
      
      if (publicKey && rsaPrivateKey && publicKey.n && rsaPrivateKey.n) {
        if (publicKey.n.compareTo(rsaPrivateKey.n) === 0 && publicKey.e.compareTo(rsaPrivateKey.e) === 0) {
          selectedCert = cert;
          certPem = forge.pki.certificateToPem(cert);
          break;
        }
      }
    }

    if (!selectedCert) {
      throw new Error("Não foi possível encontrar um certificado compatível com a chave privada no PFX.");
    }

    const getAttribute = (attributes: any[], name: string) => {
      const attr = attributes.find(a => a.shortName === name || a.name === name);
      return attr ? attr.value : 'N/A';
    };

    console.log(`[NfceService] Certificado selecionado para assinatura:`);
    console.log(` - Subject: CN=${getAttribute(selectedCert.subject.attributes, 'CN')}`);
    console.log(` - Issuer: CN=${getAttribute(selectedCert.issuer.attributes, 'CN')}`);
    console.log(` - Serial: ${selectedCert.serialNumber}`);
    console.log(` - Status: Match verificado com a private key (n, e).`);

    return { privateKeyPem, certPem };
  }

  private signXml(xml: string, privateKeyPem: string, certPem: string, idDfe: string) {
    const certPemStripped = certPem
      .replace(/-----BEGIN CERTIFICATE-----/g, '')
      .replace(/-----END CERTIFICATE-----/g, '')
      .replace(/\r?\n|\r/g, '');

    const sig = new SignedXml({
        privateKey: privateKeyPem
    }) as any;

    sig.getKeyInfoContent = function() {
        return `<X509Data><X509Certificate>${certPemStripped}</X509Certificate></X509Data>`;
    };
    
    sig.signatureAlgorithm = 'http://www.w3.org/2000/09/xmldsig#rsa-sha1';
    sig.canonicalizationAlgorithm = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';

    sig.addReference({
      xpath: "//*[local-name(.)='infNFe']",
      uri: `#${idDfe}`,
      transforms: [
        'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
        'http://www.w3.org/TR/2001/REC-xml-c14n-20010315'
      ],
      digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1'
    });
    
    sig.computeSignature(xml, {
      location: { reference: "/*/*[local-name(.)='infNFe']", action: 'after' },
    });
    return sig.getSignedXml();
  }

  private buildImpostoItemXml(iv: any): string {
    return `<imposto><ICMS><ICMSSN102><orig>0</orig><CSOSN>102</CSOSN></ICMSSN102></ICMS><PIS><PISNT><CST>07</CST></PISNT></PIS><COFINS><COFINSNT><CST>07</CST></COFINSNT></COFINS></imposto>`;
  }

  private buildInfRespTecXml(): string {
    const cnpj = process.env.RESP_TEC_CNPJ || '47684399000130';
    const xContato = process.env.RESP_TEC_XCONTATO || 'Jonatha Oliveira';
    const email = process.env.RESP_TEC_EMAIL || 'facoacontatech@gmail.com';
    const fone = process.env.RESP_TEC_FONE || '92991761374';
    
    return `<infRespTec><CNPJ>${cnpj}</CNPJ><xContato>${xContato}</xContato><email>${email}</email><fone>${fone}</fone></infRespTec>`;
  }

  private buildEmitXml(venda: any, cnpj: string): string {
    const xNome = venda.nome_empresa || 'Empresa Teste';
    const xLgr = 'Rua Teste';
    const nro = '123';
    const xBairro = 'Centro';
    const cMun = '1302603';
    const xMun = 'Manaus';
    const UF = 'AM';
    const CEP = '69000000';
    const cPais = '1058';
    const xPais = 'BRASIL';
    const IE = venda.inscricao_estadual ? venda.inscricao_estadual.replace(/\D/g, '') : 'ISENTO';
    const CRT = '1';

    return `<emit><CNPJ>${cnpj}</CNPJ><xNome>${xNome}</xNome><enderEmit><xLgr>${xLgr}</xLgr><nro>${nro}</nro><xBairro>${xBairro}</xBairro><cMun>${cMun}</cMun><xMun>${xMun}</xMun><UF>${UF}</UF><CEP>${CEP}</CEP><cPais>${cPais}</cPais><xPais>${xPais}</xPais></enderEmit><IE>${IE}</IE><CRT>${CRT}</CRT></emit>`;
  }

  private buildNfeXml(venda: any, cNF: string, cDV: string, idAcesso: string, nNF: string, serie: string, tpEmis: string, dataHoraEmissao: string, chaveAcesso: string): string {
    const cUF = '13'; // AM
    const mod = '65';
    const cnpj = venda.emitente_cnpj.replace(/\D/g, '').padEnd(14, '0');
    let vNF = Number(venda.valor_total).toFixed(2);
    
    const emitXml = this.buildEmitXml(venda, cnpj);
    
    // Constrói XML Base: Simples Nacional (CRT=1), ICMS genérico(CSOSN=102)
    let xml = `<NFe xmlns="http://www.portalfiscal.inf.br/nfe"><infNFe Id="${idAcesso}" versao="4.00"><ide><cUF>${cUF}</cUF><cNF>${cNF}</cNF><natOp>VENDA DE MERCADORIA</natOp><mod>${mod}</mod><serie>${parseInt(serie)}</serie><nNF>${parseInt(nNF)}</nNF><dhEmi>${dataHoraEmissao}</dhEmi><tpNF>1</tpNF><idDest>1</idDest><cMunFG>1302603</cMunFG><tpImp>4</tpImp><tpEmis>${tpEmis}</tpEmis><cDV>${cDV}</cDV><tpAmb>${venda.ambiente_sefaz === 'homologacao' ? '2' : '1'}</tpAmb><finNFe>1</finNFe><indFinal>1</indFinal><indPres>1</indPres><procEmi>0</procEmi><verProc>FacoAContaERP</verProc></ide>${emitXml}`;

    // Itens
    let nItem = 1;
    for (const iv of venda.itens) {
      const ncm = (iv.ncm ? iv.ncm.replace(/\D/g, '') : '00000000').padEnd(8, '0').substring(0, 8);
      // Prioridade: CFOP do item na venda -> CFOP padrão do produto -> fallback '5102'
      const cfop = (iv.cfop || iv.cfop_padrao ? (iv.cfop || iv.cfop_padrao).toString().replace(/\D/g, '') : '5102').padEnd(4, '0').substring(0, 4);
      const impostoXml = this.buildImpostoItemXml(iv);
      
      let xProd = iv.produto_nome;
      const tpAmb = venda.ambiente_sefaz === 'homologacao' ? '2' : '1';
      if (mod === '65' && tpAmb === '2' && nItem === 1) {
          xProd = 'NOTA FISCAL EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL';
      }

      xml += `<det nItem="${nItem}"><prod><cProd>${iv.produto_id}</cProd><cEAN>SEM GTIN</cEAN><xProd>${xProd}</xProd><NCM>${ncm}</NCM><CFOP>${cfop}</CFOP><uCom>${iv.unidade_sigla || 'UN'}</uCom><qCom>${Number(iv.quantidade).toFixed(4)}</qCom><vUnCom>${Number(iv.valor_unitario).toFixed(4)}</vUnCom><vProd>${Number(iv.subtotal || iv.valor_total).toFixed(2)}</vProd><cEANTrib>SEM GTIN</cEANTrib><uTrib>${iv.unidade_sigla || 'UN'}</uTrib><qTrib>${Number(iv.quantidade).toFixed(4)}</qTrib><vUnTrib>${Number(iv.valor_unitario).toFixed(4)}</vUnTrib><indTot>1</indTot></prod>${impostoXml}</det>`;
      nItem++;
    }

    // Pagamentos e Totais
    xml += `<total><ICMSTot><vBC>0.00</vBC><vICMS>0.00</vICMS><vICMSDeson>0.00</vICMSDeson><vFCP>0.00</vFCP><vBCST>0.00</vBCST><vST>0.00</vST><vFCPST>0.00</vFCPST><vFCPSTRet>0.00</vFCPSTRet><vProd>${vNF}</vProd><vFrete>0.00</vFrete><vSeg>0.00</vSeg><vDesc>0.00</vDesc><vII>0.00</vII><vIPI>0.00</vIPI><vIPIDevol>0.00</vIPIDevol><vPIS>0.00</vPIS><vCOFINS>0.00</vCOFINS><vOutro>0.00</vOutro><vNF>${vNF}</vNF><vTotTrib>0.00</vTotTrib></ICMSTot></total><transp><modFrete>9</modFrete></transp><pag><detPag><tPag>01</tPag><vPag>${vNF}</vPag></detPag><vTroco>0.00</vTroco></pag>`;
    
    // Informações do Responsável Técnico
    const infRespTecXml = this.buildInfRespTecXml();
    xml += infRespTecXml;

    xml += `</infNFe></NFe>`;
    return xml;
  }

  private buildInfNFeSuplXml(urlQRCode: string, urlChave: string): string {
    return `<infNFeSupl><qrCode><![CDATA[${urlQRCode}]]></qrCode><urlChave>${urlChave}</urlChave></infNFeSupl>`;
  }

  private insertInfNFeSuplBeforeSignature(xmlAssinado: string, infNFeSuplXml: string): string {
    const signatureOpenTag = '<Signature';
    let cleanXml = xmlAssinado.replace(/<\?xml.*?\?>/gi, '').trim();
    const index = cleanXml.indexOf(signatureOpenTag);
    
    if (index === -1) {
      throw new Error("Assinatura XML não encontrada para inserir infNFeSupl antes da Signature.");
    }

    return cleanXml.slice(0, index) + infNFeSuplXml + cleanXml.slice(index);
  }

  private assertEstruturaNfe(xmlFinalNfe: string): void {
    const idxInfNFe = xmlFinalNfe.indexOf('<infNFe');
    const idxInfNFeSupl = xmlFinalNfe.indexOf('<infNFeSupl>');
    const idxSignature = xmlFinalNfe.indexOf('<Signature');
    const idxInfNFeClose = xmlFinalNfe.indexOf('</infNFe>');

    if (idxInfNFe === -1 || idxInfNFeSupl === -1 || idxSignature === -1) {
       throw new Error("Estrutura XML inválida: tags obrigatórias ausentes.");
    }

    if (idxInfNFeSupl < idxInfNFeClose || idxInfNFeSupl > idxSignature) {
       throw new Error("Estrutura XML inválida: esperado infNFe -> infNFeSupl -> Signature.");
    }
  }

  private assertEmitOrder(xmlFinalNfe: string): void {
    const emitMatch = xmlFinalNfe.match(/<emit>([\s\S]*?)<\/emit>/);
    if (!emitMatch) throw new Error("Grupo <emit> não encontrado.");
    const emitBlock = emitMatch[1];
    
    const iCNPJ = emitBlock.indexOf('<CNPJ>');
    const iXNome = emitBlock.indexOf('<xNome>');
    const iEnderEmit = emitBlock.indexOf('<enderEmit>');
    const iIE = emitBlock.indexOf('<IE>');
    const iCRT = emitBlock.indexOf('<CRT>');

    if (iCNPJ === -1 || iXNome === -1 || iEnderEmit === -1 || iIE === -1 || iCRT === -1) {
      throw new Error("Estrutura XML inválida no grupo emit: tags obrigatórias ausentes.");
    }

    if (!(iCNPJ < iXNome && iXNome < iEnderEmit && iEnderEmit < iIE && iIE < iCRT)) {
      throw new Error("Estrutura XML inválida no grupo emit: ordem esperada CNPJ -> xNome -> enderEmit -> IE -> CRT.");
    }
  }

  private assertImpostoOrder(xmlFinalNfe: string): void {
    const regex = /<imposto>([\s\S]*?)<\/imposto>/g;
    let match;
    while ((match = regex.exec(xmlFinalNfe)) !== null) {
      const impostoBlock = match[1];
      const iICMS = impostoBlock.indexOf('<ICMS>');
      const iPIS = impostoBlock.indexOf('<PIS>');
      const iCOFINS = impostoBlock.indexOf('<COFINS>');

      if (iICMS !== -1 && iPIS !== -1 && iCOFINS !== -1) {
        if (!(iICMS < iPIS && iPIS < iCOFINS)) {
          throw new Error("Estrutura XML inválida no grupo imposto: ordem esperada ICMS -> PIS -> COFINS.");
        }
      }
    }
  }

  async emitir(vendaId: number, usuarioId: number) {
    console.log(`[NfceService] Iniciando emissão real para Sefaz. Venda ${vendaId}...`);

    // 1. Carga de Dados
    const venda = await this.vendaRepository.getVendaCompleta(vendaId);
    if (!venda) throw new Error("Venda não encontrada.");
    if (!venda.certificado_base64 || !venda.certificado_senha) {
      throw new Error("Certificado digital não configurado para o usuário.");
    }

    const { privateKeyPem, certPem } = this.extractPemFromPfx(
      venda.certificado_base64,
      venda.certificado_senha
    );

    // 2. Geração da Chave e Informações Base
    const cUF = '13'; // AM
    const agora = DateTime.now().setZone('America/Manaus');
    const dataHoraEmissao = agora.toFormat("yyyy-MM-dd'T'HH:mm:ssZZ");
    const anoMes = agora.toFormat('yyMM');
    
    console.log(`[NfceService] --- Geração de Data/Hora ---`);
    console.log(` * Timestamp bruto: ${agora.toISO()}`);
    console.log(` * Timezone: ${agora.zoneName}`);
    console.log(` * dhEmi: ${dataHoraEmissao}`);
    console.log(` * anoMes: ${anoMes}`);

    const cnpj = venda.emitente_cnpj.replace(/\D/g, '').padEnd(14, '0');
    const mod = '65';
    const serie = (venda.serie_nfe || 1).toString().padStart(3, '0');
    const nNFNum = venda.numero_nfe || Math.floor(Math.random() * 900000) + 100000;
    const nNF = nNFNum.toString().padStart(9, '0');
    const tpEmis = '1'; // Normal
    const cNF = Math.floor(Math.random() * 90000000 + 10000000).toString(); // Aleatório 8 digitos

    const chave43 = `${cUF}${anoMes}${cnpj}${mod}${serie}${nNF}${tpEmis}${cNF}`;
    const cDV = this.modulo11(chave43);
    const chaveAcesso = `${chave43}${cDV}`;
    const idAcesso = `NFe${chaveAcesso}`;

    console.log(`[NfceService] Gerando XML base da NFe...`);
    const xmlBase = this.buildNfeXml(venda, cNF, cDV, idAcesso, nNF, serie, tpEmis, dataHoraEmissao, chaveAcesso);

    console.log(`[NfceService] Assinando XML base...`);
    const xmlAssinado = this.signXml(xmlBase, privateKeyPem, certPem, idAcesso);

    console.log(`[NfceService] Validando assinatura localmente...`);
    const docParaValidar = new DOMParser().parseFromString(xmlAssinado, 'text/xml');
    
    // Suporte ao namespace xmldsig ou tag crua
    let signatureElements = docParaValidar.getElementsByTagNameNS('http://www.w3.org/2000/09/xmldsig#', 'Signature');
    if (!signatureElements || signatureElements.length === 0) {
        signatureElements = docParaValidar.getElementsByTagName('Signature');
    }
    
    if (!signatureElements || signatureElements.length === 0) {
        throw new Error("Assinatura XML não encontrada para validação local.");
    }
    const signatureElement = signatureElements[0].toString();
    
    const sigVerify = new SignedXml({ publicCert: certPem }) as any;
    sigVerify.loadSignature(signatureElement);
    const isValid = sigVerify.checkSignature(xmlAssinado);
    if (!isValid) {
        throw new Error(`Validação local da assinatura falhou: ${sigVerify.validationErrors.join(', ')}`);
    }
    console.log(`[NfceService] Assinatura validada localmente com sucesso!`);

    // 3. Montagem do XML Suplementar (QR Code)
    const tpAmb = venda.ambiente_sefaz === 'homologacao' ? '2' : '1';
    
    // Regra específica de Homologação AM-SEFAZ
    const cscAlfanumerico = tpAmb === '2' ? '0123456789' : (venda.csc_alfanumerico || '000000000000000000000000000000000000');
    const cscIdFinal = tpAmb === '2' ? '000001' : (venda.csc_id ? venda.csc_id.replace(/\D/g, '').padEnd(6, '0') : '000001');
    const cscIdNormalizado = parseInt(cscIdFinal, 10).toString(); // Se vier "000001", vira "1"

    const uriPrefix = tpAmb === '2' 
      ? 'https://sistemas.sefaz.am.gov.br/nfceweb-hom/consultarNFCe.jsp' 
      : 'http://sistemas.sefaz.am.gov.br/nfceweb/consultarNFCe.jsp';

    const qrBaseString = `${chaveAcesso}|2|${tpAmb}|${cscIdNormalizado}`;
    const hashInputString = `${qrBaseString}${cscAlfanumerico}`;
    
    const hashCSC = crypto.createHash('sha1').update(hashInputString).digest('hex').toUpperCase();
    
    const urlQRCode = `${uriPrefix}?p=${qrBaseString}|${hashCSC}`;

    console.log(`[NfceService] --- Mapeamento Técnico de QR Code ---`);
    console.log(` * Ambiente (tpAmb): ${tpAmb}`);
    console.log(` * CSC ID Bruto: ${cscIdFinal}`);
    console.log(` * CSC ID Normalizado no QR Code: ${cscIdNormalizado}`);
    console.log(` * CSC Token Usado: ${cscAlfanumerico}`);
    console.log(` * Base do Payload (qrBase): ${qrBaseString}`);
    console.log(` * String Injetada no SHA-1 (hashInput): ${hashInputString}`);
    console.log(` * Hash SHA-1 Gerado: ${hashCSC}`);
    console.log(` * URL Final QR Code: ${urlQRCode}`);
    console.log(`-----------------------------------------------`);

    console.log(`[NfceService] Gerando infNFeSupl...`);
    const infNFeSuplXml = this.buildInfNFeSuplXml(urlQRCode, uriPrefix);

    console.log(`[NfceService] Inserindo infNFeSupl antes da Signature...`);
    const xmlNfeFinal = this.insertInfNFeSuplBeforeSignature(xmlAssinado, infNFeSuplXml);

    console.log(`[NfceService] Validando estrutura final da NFe...`);
    this.assertEstruturaNfe(xmlNfeFinal);
    this.assertEmitOrder(xmlNfeFinal);
    this.assertImpostoOrder(xmlNfeFinal);

    // 4. Fechar Lote
    console.log(`[NfceService] Montando Lote enviNFe...`);
    const loteXml = `<enviNFe versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe"><idLote>1</idLote><indSinc>1</indSinc>${xmlNfeFinal}</enviNFe>`.trim();

    console.log("\n📄 XML LOTE GERADO PARA SEFAZ:\n", loteXml, "\n");

    // 5. Envelope SOAP e Disparo
    const urlSefaz = venda.ambiente_sefaz === 'homologacao' 
        ? 'https://homnfce.sefaz.am.gov.br/nfce-services/services/NfeAutorizacao4'
        : 'https://nfce.sefaz.am.gov.br/nfce-services/services/NfeAutorizacao4';
        
    console.log(`[NfceService] Montando SOAP Header/Body...`);
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Header>
    <nfeCabecMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4">
      <cUF>13</cUF>
      <versaoDados>4.00</versaoDados>
    </nfeCabecMsg>
  </soap12:Header>
  <soap12:Body>
    <nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4">
      ${loteXml}
    </nfeDadosMsg>
  </soap12:Body>
</soap12:Envelope>`.trim();

    console.log(`[NfceService] Disparando requisição SOAP para ${urlSefaz}`);
    
    const pfxBuffer = Buffer.from(venda.certificado_base64, 'base64');
    const httpsAgent = new https.Agent({
      pfx: pfxBuffer,
      passphrase: venda.certificado_senha,
      rejectUnauthorized: false
    });

    let retornoSefaz;

    try {
      const response = await axios.post(urlSefaz, soapEnvelope, {
        headers: {
          'Content-Type': 'application/soap+xml; charset=utf-8; action="http://www.portalfiscal.inf.br/nfe/wsdl/NFeAutorizacao4"',
          'Accept': 'application/soap+xml; charset=utf-8'
        },
        httpsAgent: httpsAgent,
        timeout: 10000
      });

      const resXml = response.data;
      console.log("\n➡️ RETORNO DA SEFAZ (STATUS 200):\n", resXml, "\n");
      
      const cStatMatchExterno = resXml.match(/<cStat>(.*?)<\/cStat>/);
      const xMotivoMatchExterno = resXml.match(/<xMotivo>(.*?)<\/xMotivo>/);
      const nProtMatch = resXml.match(/<nProt>(.*?)<\/nProt>/);

      const cStatExterno = cStatMatchExterno ? cStatMatchExterno[1] : '';
      const xMotivoExterno = xMotivoMatchExterno ? xMotivoMatchExterno[1] : '';
      const nProt = nProtMatch ? nProtMatch[1] : null;

      let cStatInterno = '';
      let xMotivoInterno = '';
      const infProtMatch = resXml.match(/<infProt.*?>([\s\S]*?)<\/infProt>/);
      if (infProtMatch) {
          const infProtContent = infProtMatch[1];
          const cMatch = infProtContent.match(/<cStat>(.*?)<\/cStat>/);
          const xMatch = infProtContent.match(/<xMotivo>(.*?)<\/xMotivo>/);
          if (cMatch) cStatInterno = cMatch[1];
          if (xMatch) xMotivoInterno = xMatch[1];
      }

      const cStatFinal = cStatInterno || cStatExterno;
      const xMotivoFinal = xMotivoInterno || xMotivoExterno;

      if (cStatFinal === '100') {
         // Autorizado
         retornoSefaz = {
           status_sefaz: 'autorizado',
           chave_acesso: chaveAcesso,
           numero_nfe: parseInt(nNF),
           protocolo: nProt,
           xml_autorizado: xmlAssinado // Em prod, anexar auth node.
         };

         await this.vendaRepository.atualizarDadosSefaz(vendaId, retornoSefaz);
         console.log(`[NfceService] Sucesso! NFC-e ${chaveAcesso} Autorizada.`);
         return retornoSefaz;
      }

      retornoSefaz = {
         status_sefaz: 'rejeitado',
         chave_acesso: chaveAcesso,
         numero_nfe: parseInt(nNF),
         observacao: `${cStatFinal} - ${xMotivoFinal}`
      };

      await this.vendaRepository.atualizarDadosSefaz(vendaId, retornoSefaz);
      console.warn(`[NfceService] Rejeição Sefaz: ${cStatFinal} - ${xMotivoFinal}`);

      return retornoSefaz;

    } catch (err: any) {
      const rawXmlError = err.response?.data || err.message;
      console.error("\n🚨 RETORNO BRUTO DA SEFAZ (ERRO):\n", rawXmlError, "\n");

      let motivoReal = err.message;
      if (typeof rawXmlError === 'string') {
          const match = rawXmlError.match(/<xMotivo.*?>(.*?)<\/xMotivo>/);
          if (match && match[1]) {
              motivoReal = match[1];
          } else if (err.response) {
              motivoReal = `Erro HTTP ${err.response.status} na comunicação Sefaz`;
          }
      }

      console.error('[NfceService] Falha na comunicação ou rejeição Sefaz:', motivoReal);
      throw new Error(motivoReal);
    }
  }
}
