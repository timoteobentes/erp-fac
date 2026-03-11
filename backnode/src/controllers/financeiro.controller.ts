import { Request, Response } from 'express';
import { FinanceiroService } from '../services/financeiro.service';

interface AuthRequest extends Request {
  usuario?: { id: number };
}

export class FinanceiroController {
  private financeiroService: FinanceiroService;

  constructor() {
    this.financeiroService = new FinanceiroService();
  }

  // =========================================================================
  // 1. CONTAS A RECEBER
  // =========================================================================

  criarContaReceber = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) { res.status(401).json({ message: 'Acesso negado.' }); return; }

      const id = await this.financeiroService.criarContaReceber(req.body, usuarioId);
      res.status(201).json({ success: true, message: 'Conta a receber criada.', id });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  listarContasReceber = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) { res.status(401).json({ message: 'Acesso negado.' }); return; }

      const filtros = {
        status: req.query.status as string,
        data_vencimento_inicio: req.query.data_vencimento_inicio as string,
        data_vencimento_fim: req.query.data_vencimento_fim as string,
        cliente_id: req.query.cliente_id ? parseInt(req.query.cliente_id as string) : undefined
      };

      const contas = await this.financeiroService.listarContasReceber(usuarioId, filtros);
      res.status(200).json({ success: true, data: contas });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  buscarContaReceber = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados inválidos.' }); return; }

      const conta = await this.financeiroService.buscarContaReceber(id, usuarioId);
      res.status(200).json({ success: true, data: conta });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  baixarContaReceber = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados inválidos.' }); return; }

      const { data_recebimento } = req.body;
      await this.financeiroService.baixarContaReceber(id, usuarioId, data_recebimento);
      res.status(200).json({ success: true, message: 'Conta baixada com sucesso.' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  excluirContaReceber = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados inválidos.' }); return; }

      await this.financeiroService.excluirContaReceber(id, usuarioId);
      res.status(200).json({ success: true, message: 'Conta excluída com sucesso.' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // =========================================================================
  // 2. CONTAS A PAGAR
  // =========================================================================

  criarContaPagar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) { res.status(401).json({ message: 'Acesso negado.' }); return; }

      const id = await this.financeiroService.criarContaPagar(req.body, usuarioId);
      res.status(201).json({ success: true, message: 'Conta a pagar criada.', id });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  listarContasPagar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) { res.status(401).json({ message: 'Acesso negado.' }); return; }

      const filtros = {
        status: req.query.status as string,
        data_vencimento_inicio: req.query.data_vencimento_inicio as string,
        data_vencimento_fim: req.query.data_vencimento_fim as string,
        fornecedor_id: req.query.fornecedor_id ? parseInt(req.query.fornecedor_id as string) : undefined
      };

      const contas = await this.financeiroService.listarContasPagar(usuarioId, filtros);
      res.status(200).json({ success: true, data: contas });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  buscarContaPagar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados inválidos.' }); return; }

      const conta = await this.financeiroService.buscarContaPagar(id, usuarioId);
      res.status(200).json({ success: true, data: conta });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  baixarContaPagar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados inválidos.' }); return; }

      const { data_pagamento } = req.body;
      await this.financeiroService.baixarContaPagar(id, usuarioId, data_pagamento);
      res.status(200).json({ success: true, message: 'Conta baixada com sucesso.' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  excluirContaPagar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados inválidos.' }); return; }

      await this.financeiroService.excluirContaPagar(id, usuarioId);
      res.status(200).json({ success: true, message: 'Conta excluída com sucesso.' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
