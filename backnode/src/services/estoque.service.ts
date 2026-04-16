import pool from '../config/database';
import { EstoqueRepository } from '../repositories/EstoqueRepository';
import { MovimentacaoEstoque } from '../models/MovimentacaoEstoque';
import * as ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export class EstoqueService {
  private estoqueRepository: EstoqueRepository;

  constructor() {
    this.estoqueRepository = new EstoqueRepository();
  }

  // =========================================================================
  // 1. LISTAR HISTÓRICO DE PRODUTO
  // =========================================================================
  async listarHistoricoProduto(produtoId: number, usuarioId: number, paginacao?: { limit: number, offset: number }) {
    return await this.estoqueRepository.listarHistoricoProduto(produtoId, usuarioId, paginacao);
  }

  // =========================================================================
  // 2. MOVIMENTAR ESTOQUE (Entrada, Saída, Ajuste)
  // =========================================================================
  async movimentarEstoque(dados: MovimentacaoEstoque, usuarioId: number): Promise<void> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN'); // 1. Inicia Transação

      // Busca produto para garantir que existe, que pertence ao usuário, e pega o saldo atual
      // O "FOR UPDATE" bloqueia o registro de produto especifico para outras transações simultâneas
      // Mas para não complicar, mantemos o check simples:
      const resProduto = await client.query(
        'SELECT id, estoque_atual, movimenta_estoque FROM produtos WHERE id = $1 AND usuario_id = $2 FOR UPDATE',
        [dados.produto_id, usuarioId]
      );

      if (resProduto.rows.length === 0) {
        throw new Error('Produto não encontrado ou não pertence ao usuário.');
      }

      const produto = resProduto.rows[0];

      if (!produto.movimenta_estoque && dados.origem === 'pdv') {
         // Aqui pode simplesmente ignorar se a origem for pdv e o produto não movimentar estoque.
         await client.query('COMMIT');
         return;
      }

      let estoqueAtual = Number(produto.estoque_atual);
      const qtdMovimento = Number(dados.quantidade);
      let novoSaldo = estoqueAtual;

      // 2. Calcula novo saldo
      if (dados.tipo === 'entrada') {
        novoSaldo = estoqueAtual + qtdMovimento;
      } else if (dados.tipo === 'saida') {
        novoSaldo = estoqueAtual - qtdMovimento;
      } else if (dados.tipo === 'ajuste') {
        novoSaldo = qtdMovimento; // O saldo passa a ser exatamente o informado
      } else {
        throw new Error('Tipo de movimentação inválido.');
      }

      // 3. Atualiza produtos
      await client.query(
        'UPDATE produtos SET estoque_atual = $1, atualizado_em = NOW() WHERE id = $2',
        [novoSaldo, produto.id]
      );

      // 4. Salva Movimentação
      dados.usuario_id = usuarioId;
      dados.saldo_apos = novoSaldo;
      
      // Quando for 'ajuste', a quantidade real de movimentação gerada (diferença) para histórico
      if (dados.tipo === 'ajuste') {
         // Opcional, guardar a quantidade como o valor absoluto da diferença, 
         // Ou apenas guardar o número final
         dados.quantidade = qtdMovimento;
      }

      await this.estoqueRepository.registrarMovimentacaoTransaction(client, dados);

      await client.query('COMMIT'); // 5. Confirma Transação
    } catch (error) {
      await client.query('ROLLBACK'); // Desfaz se houver erro
      console.error('Erro ao movimentar estoque:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // =========================================================================
  // 3. EXPORTAÇÕES (CSV, EXCEL, PDF)
  // =========================================================================
  async exportarMovimentacoes(usuarioId: number, opcoes: { formato: 'csv' | 'xlsx' | 'pdf' }): Promise<Buffer | string> {
    // Para simplificar, exporta todo o histórico recente devolvido pelo repositório
    const movimentacoesResult = await this.estoqueRepository.listarHistoricoGlobal(usuarioId);
    const movimentacoes = movimentacoesResult.dados || (movimentacoesResult as unknown as any[]);
    
    switch (opcoes.formato) {
      case 'csv':
        const header = ['ID', 'DATA', 'PRODUTO', 'TIPO', 'QTD', 'SALDO_POS', 'ORIGEM'].join(';');
        const rows = movimentacoes.map(m => `${m.id};${new Date(m.criado_em).toISOString()};"${m.produto_nome}";${m.tipo};${m.quantidade};${m.saldo_apos};${m.origem}`);
        return [header, ...rows].join('\n');
      
      case 'xlsx':
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Histórico de Movimentações');
        worksheet.columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Data/Hora', key: 'data', width: 20 },
          { header: 'Produto', key: 'produto', width: 40 },
          { header: 'Tipo', key: 'tipo', width: 15 },
          { header: 'Qtd.', key: 'qtd', width: 10 },
          { header: 'Saldo Final', key: 'saldo', width: 15 },
          { header: 'Origem', key: 'origem', width: 15 }
        ];
        movimentacoes.forEach(m => {
          worksheet.addRow({
            id: m.id,
            data: new Date(m.criado_em).toLocaleString('pt-BR'),
            produto: m.produto_nome,
            tipo: m.tipo.toUpperCase(),
            qtd: Number(m.quantidade),
            saldo: Number(m.saldo_apos),
            origem: m.origem.toUpperCase()
          });
        });
        worksheet.getRow(1).font = { bold: true };
        return await workbook.xlsx.writeBuffer() as unknown as Buffer;
      
      case 'pdf':
        return new Promise((resolve, reject) => {
          const doc = new PDFDocument({ margin: 30, size: 'A4' });
          const buffers: Buffer[] = [];
          doc.on('data', buffers.push.bind(buffers));
          doc.on('end', () => resolve(Buffer.concat(buffers)));
          doc.on('error', reject);

          doc.fontSize(18).text('Histórico de Movimentações', { align: 'center' }).moveDown();

          const drawHeader = (posY: number) => {
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('DATA/HORA', 30, posY);
            doc.text('PRODUTO', 130, posY);
            doc.text('TIPO', 330, posY);
            doc.text('QTD', 430, posY);
            doc.text('SALDO', 480, posY);
            doc.text('ORIGEM', 530, posY);
            doc.moveTo(30, posY + 15).lineTo(565, posY + 15).stroke();
          };

          let y = 100;
          drawHeader(y);
          y += 25;
          doc.font('Helvetica').fontSize(9);

          movimentacoes.forEach((m: any) => {
            if (y > 750) {
              doc.addPage();
              y = 50;
              drawHeader(y);
              y += 25;
              doc.font('Helvetica').fontSize(9);
            }
            doc.text(new Date(m.criado_em).toLocaleString('pt-BR').substring(0, 16), 30, y);
            doc.text((m.produto_nome || '').substring(0, 35), 130, y);
            const cor = m.tipo === 'entrada' ? 'green' : m.tipo === 'saida' ? 'red' : 'blue';
            doc.fillColor(cor).text((m.tipo || '').toUpperCase(), 330, y).fillColor('black');
            doc.text(String(m.quantidade), 430, y);
            doc.text(String(m.saldo_apos), 480, y);
            doc.text((m.origem || '').toUpperCase(), 530, y);
            
            y += 20;
            doc.save().strokeColor('#eeeeee').lineWidth(0.5).moveTo(30, y - 5).lineTo(565, y - 5).stroke().restore();
          });

          doc.end();
        });
      
      default:
        throw new Error('Formato inválido');
    }
  }
}
