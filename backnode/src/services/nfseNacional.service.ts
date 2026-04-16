import forge from 'node-forge';
import { SignedXml } from 'xml-crypto';
import { DateTime } from 'luxon';
import nfseRepository from '../repositories/NfseRepository';
import axios from 'axios';
import https from 'https';
import zlib from 'zlib';

class NfseNacionalService {
  private normalizeCodigoTribNacional(codigoRaw: string | undefined | null): string {
    const rawStr = (codigoRaw || '').toString();
    const apenasNumeros = rawStr.replace(/\D/g, '');
    
    if (apenasNumeros.length !== 6) {
      throw new Error(`Código de Tributação Nacional incompleto (informado: '${rawStr}'). Informe o código nacional completo no formato 14.01.01.`);
    }
    
    return apenasNumeros;
  }

  private resolveTipoInscricaoFederal(doc: string): '1' | '2' {
    const limpo = doc.replace(/\D/g, '');
    if (limpo.length === 11) return '1'; // 1 = CPF no Padrão Nacional
    if (limpo.length === 14) return '2'; // 2 = CNPJ no Padrão Nacional
    throw new Error(`Inscrição Federal (CPF/CNPJ) inválida para DPS. Deve conter exatamente 11 ou 14 dígitos.`);
  }

  private buildIdDPS(params: {
    codigoMunicipio: string;
    inscricaoFederal: string;
    serie: string;
    numeroDps: string;
  }): string {
    const limpoCodMun = params.codigoMunicipio.replace(/\D/g, '').padEnd(7, '0').slice(0, 7);
    
    const docLimpo = params.inscricaoFederal.replace(/\D/g, '');
    const tipoInscricaoFederal = this.resolveTipoInscricaoFederal(docLimpo);
    
    // Completa PFE/CNPJ com zeros à esquerda
    const inscFed = docLimpo.padStart(14, '0').slice(-14);
    
    const serieLimpa = params.serie.replace(/\D/g, '').padStart(5, '0').slice(-5);
    const numeroLimpo = params.numeroDps.replace(/\D/g, '').padStart(15, '0').slice(-15);
    
    return `DPS${limpoCodMun}${tipoInscricaoFederal}${inscFed}${serieLimpa}${numeroLimpo}`;
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

    if (!privateKey) throw new Error("Chave privada não encontrada no certificado PFX.");

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

    if (!selectedCert) throw new Error("Não foi possível encontrar um certificado compatível com a chave privada no PFX.");

    return { privateKeyPem, certPem };
  }

  private assinarDPS(xml: string, privateKeyPem: string, certPem: string, idDPS: string) {
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
      xpath: "//*[local-name(.)='infDPS']",
      uri: `#${idDPS}`,
      transforms: [
        'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
        'http://www.w3.org/TR/2001/REC-xml-c14n-20010315'
      ],
      digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1'
    });
    
    sig.computeSignature(xml, {
      location: { reference: "/*/*[local-name(.)='infDPS']", action: 'after' },
    });
    return sig.getSignedXml();
  }

  private gerarXMLDPS(nota: any, idDPS: string): string {
    const agora = DateTime.now().setZone('America/Manaus').toFormat("yyyy-MM-dd'T'HH:mm:ssZZ");
    
    const serie = '1';
    const nDPS = nota.id.toString();
    const emissorDocRaw = (nota.emissor_cnpj || '').replace(/\D/g, '');
    const emissorDocTag = emissorDocRaw.length === 11 ? `<CPF>${emissorDocRaw}</CPF>` : `<CNPJ>${emissorDocRaw}</CNPJ>`;
    const emissorIM = (nota.emissor_im || '').replace(/\D/g, '');
    
    const clienteDoc = (nota.cliente_cpf_cnpj || '').replace(/\D/g, '');
    const docTag = clienteDoc.length === 11 ? `<CPF>${clienteDoc}</CPF>` : `<CNPJ>${clienteDoc}</CNPJ>`;
    
    const cTribNacBruto = (nota.codigo_tributacao_nacional || nota.codigo_lc116 || '');
    const codServicoNac = this.normalizeCodigoTribNacional(cTribNacBruto);

    const aliquota = (Number(nota.aliquota_iss) / 100).toFixed(4);
    
    const vServEnv = Number(nota.valor_servico).toFixed(2);
    const vDescEnv = Number(nota.desconto || 0).toFixed(2);
    const vBcEnv = (Number(nota.valor_servico) - Number(nota.desconto || 0)).toFixed(2);
    const vISSRet = Number(nota.valor_iss).toFixed(2);

    // Formata a data de competência (YYYY-MM-DD)
    const dCompet = nota.competencia ? new Date(nota.competencia).toISOString().split('T')[0] : agora.split('T')[0];
    // Código IBGE do Município de Emissão (Manaus)
    const cLocEmi = '1302603'; 

    return `
      <DPS xmlns="http://www.sped.fazenda.gov.br/nfse" versao="1.00">
        <infDPS Id="${idDPS}">
          <tpAmb>2</tpAmb>
          <dhEmi>${agora}</dhEmi>
          <verAplic>FacoAConta_1.0</verAplic>
          <serie>${serie}</serie>
          <nDPS>${nDPS}</nDPS>
          <dCompet>${dCompet}</dCompet>
          <tpEmit>1</tpEmit>
          <cLocEmi>${cLocEmi}</cLocEmi>

          <prest>
            ${emissorDocTag}
            ${emissorIM ? `<IM>${emissorIM}</IM>` : ''}
            <regTrib>
              <opSimpNac>1</opSimpNac>
              <regEspTrib>0</regEspTrib>
            </regTrib>
          </prest>

          <toma>
            ${docTag}
            <xNome>${nota.cliente_nome}</xNome>
            <end>
              <endNac>
                <cMun>1302603</cMun>
                <CEP>${(nota.cliente_cep || '69000000').replace(/\D/g, '')}</CEP>
              </endNac>
              <xLgr>${nota.cliente_lgr || 'Nao Informado'}</xLgr>
              <nro>${nota.cliente_nro || 'S/N'}</nro>
              <xBairro>${nota.cliente_bairro || 'Centro'}</xBairro>
            </end>
          </toma>

          <serv>
            <locPrest>
              <cLocPrestacao>1302603</cLocPrestacao>
            </locPrest>
            <cServ>
              <cTribNac>${codServicoNac}</cTribNac>
              ${nota.cnae ? `<CNAE>${nota.cnae.replace(/\D/g, '')}</CNAE>` : ''}
              <xDescServ>${nota.servico_nome}</xDescServ>
            </cServ>
          </serv>

          <valores>
            <vServPrest>
              <vServ>${vServEnv}</vServ>
            </vServPrest>
            <trib>
              <tribMun>
                <tribISSQN>1</tribISSQN>
                <tpRetISSQN>1</tpRetISSQN>
                <pAliq>${(Number(aliquota) < 1 ? Number(aliquota) * 100 : Number(aliquota)).toFixed(2)}</pAliq>
              </tribMun>
              <totTrib>
                <indTotTrib>0</indTotTrib>
              </totTrib>
            </trib>
          </valores>
          
        </infDPS>
      </DPS>
    `.trim().replace(/>\s+</g, '><'); // Simple minification
  }

  private async enviarParaSerpro(xmlAssinado: string, certificadoBase64: string, senhaCertificado: string) {
    const pfxBuffer = Buffer.from(certificadoBase64, 'base64');
    const httpsAgent = new https.Agent({
      pfx: pfxBuffer,
      passphrase: senhaCertificado,
      rejectUnauthorized: false
    });

    const urlSerpro = process.env.NFSE_URL || 'https://sefin.producaorestrita.nfse.gov.br/SefinNacional/nfse';
    
    // 1. Comprime o XML assinado em GZIP
    const gzipBuffer = zlib.gzipSync(Buffer.from(xmlAssinado, 'utf-8'));
    // 2. Converte o buffer comprimido para Base64
    const base64Gzip = gzipBuffer.toString('base64');
    // 3. Monta o envelope JSON no padrão exigido pelo Governo Federal
    const payload = { dpsXmlGZipB64: base64Gzip };

    console.log(`[NfseNacionalService] Disparando requisição mTLS (JSON/GZIP) para: ${urlSerpro}`);
    
    return await axios.post(urlSerpro, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.SERPRO_BEARER_TOKEN}`
      },
      httpsAgent: httpsAgent,
      timeout: 15000
    });
  }

  async emitirNotaServico(nfseId: number): Promise<any> {
    console.log(`[NfseNacionalService] Iniciando motor de emissão SERPRO para a nfse_id: ${nfseId}`);

    const nota = await nfseRepository.getNfseCompleta(nfseId);
    if (!nota) throw new Error("NFS-e não encontrada.");

    if (!nota.certificado_base64 || !nota.certificado_senha) {
      throw new Error("Certificado P12 não foi configurado (Acesse Perfil > Configuração Fiscal).");
    }

    if (!nota.emissor_cnpj) throw new Error("CNPJ do Emitente ausente.");
    if (!nota.cliente_cpf_cnpj) throw new Error("Documento (CPF/CNPJ) do Tomador ausente.");
    if (!nota.codigo_lc116) throw new Error("Código de Atividade LC 116 ausente no serviço selecionado.");

    const { privateKeyPem, certPem } = this.extractPemFromPfx(
      nota.certificado_base64,
      nota.certificado_senha
    );

    const idDPS = this.buildIdDPS({
      codigoMunicipio: '1302603',
      inscricaoFederal: nota.emissor_cnpj,
      serie: '1',
      numeroDps: nota.id.toString()
    });

    console.log(`[NfseNacionalService] Montando DPS tag XML...`);
    const xmlBase = this.gerarXMLDPS(nota, idDPS);

    console.log(`[NfseNacionalService] Assinando a DPS com certificado A1...`);
    const xmlAssinado = this.assinarDPS(xmlBase, privateKeyPem, certPem, idDPS);

    let xmlFinal = xmlAssinado;
    if (!xmlFinal.includes('<?xml')) {
      xmlFinal = `<?xml version="1.0" encoding="utf-8"?>\n` + xmlFinal;
    }

    // Tentar transmitir ao SERPRO
    try {
      const resp = await this.enviarParaSerpro(xmlFinal, nota.certificado_base64, nota.certificado_senha);
      
      const xmlRetorno = resp.data;
      // Extrai Chave da NFS-e (chNFSe) se existir via regex rápido
      const matchChave = typeof xmlRetorno === 'string' ? xmlRetorno.match(/<chNFSe>(.*?)<\/chNFSe>/) : null;
      const chaveAcesso = matchChave ? matchChave[1] : idDPS.replace('DPS', '');

      await nfseRepository.atualizarTransmissao(nfseId, 'emitida', chaveAcesso, xmlFinal, 'Autorizado com Sucesso');
      
      console.log(`[NfseNacionalService] NFS-e ${chaveAcesso} emitida com sucesso!`);
      
      return {
        status: 'emitida',
        mensagem: 'NFS-e Emitida e Autorizada com Sucesso',
        chaveAcesso,
        xmlAutorizado: Buffer.from(xmlFinal).toString('base64')
      };
      
    } catch (err: any) {
      console.error(`[NfseNacionalService] Erro na transmissão SERPRO.`, err.message);
      
      let motivoRejeicao = err.message;
      if (err.response && err.response.data) {
        motivoRejeicao = typeof err.response.data === 'string' 
          ? err.response.data 
          : JSON.stringify(err.response.data);
          
        // Tenta capturar `xMotivo` ou `mensagem` do XML/JSON puro
        const matchMotivo = typeof err.response.data === 'string' ? err.response.data.match(/<xMotivo>(.*?)<\/xMotivo>/) : null;
        if (matchMotivo) motivoRejeicao = matchMotivo[1];
      }

      await nfseRepository.atualizarTransmissao(nfseId, 'rejeitada', null, null, motivoRejeicao);
      
      throw new Error(`Rejeição Sefaz/Serpro: ${motivoRejeicao}`);
    }
  }
}

export default new NfseNacionalService();
