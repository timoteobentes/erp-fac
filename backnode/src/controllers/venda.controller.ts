import { Request, Response } from 'express';
import { VendaService } from '../services/venda.service';

export class VendaController {
  private vendaService: VendaService;

  constructor() {
    this.vendaService = new VendaService();
    this.checkout = this.checkout.bind(this);
    this.listar = this.listar.bind(this);
  }

  async checkout(req: Request, res: Response) {
    try {
      const usuario_id = (req as any).usuario?.id || (req as any).usuarioId; // vindo do authMiddleware
      if (!usuario_id) return res.status(401).json({ success: false, message: 'Não autorizado' });

      // Body esperado: { itens: [...], forma_pagamento, cliente_id, valor_total, desconto_total, observacao }
      const vendaData = req.body;

      const vendaRealizada = await this.vendaService.realizarCheckout(usuario_id, vendaData);

      return res.status(201).json({
        success: true,
        message: 'Venda realizada com sucesso no PDV',
        data: vendaRealizada
      });

    } catch (error: any) {
      console.error('Erro no Checkout do PDV:', error);
      return res.status(400).json({ success: false, message: error.message || 'Erro ao processar venda' });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const { data_inicio, data_fim } = req.query;
      
      const vendas = await this.vendaService.listarVendas({
          data_inicio: data_inicio as string, 
          data_fim: data_fim as string 
      });

      return res.status(200).json({
        success: true,
        data: vendas,
        meta: { total: vendas.length }
      });
    } catch (error: any) {
      console.error('Erro ao listar vendas:', error);
      return res.status(500).json({ success: false, message: 'Erro interno do servidor' });
    }
  }
}
