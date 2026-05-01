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
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados invÃƒÂ¡lidos.' }); return; }

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
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados invÃƒÂ¡lidos.' }); return; }

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
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados invÃƒÂ¡lidos.' }); return; }

      await this.financeiroService.excluirContaReceber(id, usuarioId);
      res.status(200).json({ success: true, message: 'Conta excluÃƒÂ­da com sucesso.' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  exportarContasReceber = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) { res.status(401).json({ message: 'Acesso negado.' }); return; }

      const formato = (req.query.formato as 'csv' | 'xlsx' | 'pdf') || 'csv';
      const filtros = {
        status: req.query.status as string,
        data_vencimento_inicio: req.query.data_vencimento_inicio as string,
        data_vencimento_fim: req.query.data_vencimento_fim as string,
        cliente_id: req.query.cliente_id ? parseInt(req.query.cliente_id as string) : undefined
      };

      const bufferOrString = await this.financeiroService.exportarContasReceber(usuarioId, { formato, filtros });
      const filename = `relatorio_contas_receber_${new Date().toISOString().split('T')[0]}`;

      if (formato === 'csv') {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
        res.send(bufferOrString);
      } else if (formato === 'xlsx') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
        res.send(bufferOrString);
      } else if (formato === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
        res.send(bufferOrString);
      }
    } catch (error: any) {
      console.error('Erro na exportaÃƒÂ§ÃƒÂ£o de contas a receber:', error);
      res.status(500).json({ success: false, message: 'Erro ao gerar arquivo de exportaÃƒÂ§ÃƒÂ£o.' });
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
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados invÃƒÂ¡lidos.' }); return; }

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
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados invÃƒÂ¡lidos.' }); return; }

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
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados invÃƒÂ¡lidos.' }); return; }

      await this.financeiroService.excluirContaPagar(id, usuarioId);
      res.status(200).json({ success: true, message: 'Conta excluÃƒÂ­da com sucesso.' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  exportarContasPagar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) { res.status(401).json({ message: 'Acesso negado.' }); return; }

      const formato = (req.query.formato as 'csv' | 'xlsx' | 'pdf') || 'csv';
      const filtros = {
        status: req.query.status as string,
        data_vencimento_inicio: req.query.data_vencimento_inicio as string,
        data_vencimento_fim: req.query.data_vencimento_fim as string,
        fornecedor_id: req.query.fornecedor_id ? parseInt(req.query.fornecedor_id as string) : undefined
      };

      const bufferOrString = await this.financeiroService.exportarContasPagar(usuarioId, { formato, filtros });
      const filename = `relatorio_contas_pagar_${new Date().toISOString().split('T')[0]}`;

      if (formato === 'csv') {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
        res.send(bufferOrString);
      } else if (formato === 'xlsx') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
        res.send(bufferOrString);
      } else if (formato === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
        res.send(bufferOrString);
      }
    } catch (error: any) {
      console.error('Erro na exportaÃƒÂ§ÃƒÂ£o de contas a pagar:', error);
      res.status(500).json({ success: false, message: 'Erro ao gerar arquivo de exportaÃƒÂ§ÃƒÂ£o.' });
    }
  }

  // =========================================================================
  // 3. CENTRO DE CUSTOS
  // =========================================================================

  criarCentroCusto = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) { res.status(401).json({ message: 'Acesso negado.' }); return; }

      const id = await this.financeiroService.criarCentroCusto(req.body, usuarioId);
      res.status(201).json({ success: true, message: 'Centro de Custo criado.', id });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  listarCentroCustos = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) { res.status(401).json({ message: 'Acesso negado.' }); return; }

      const filtros = {
        status: req.query.status as string,
        termo: req.query.termo as string
      };

      const centroCustos = await this.financeiroService.listarCentroCustos(usuarioId, filtros);
      res.status(200).json({ success: true, data: centroCustos });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  buscarCentroCusto = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados invÃƒÂ¡lidos.' }); return; }

      const centroCusto = await this.financeiroService.buscarCentroCusto(id, usuarioId);
      res.status(200).json({ success: true, data: centroCusto });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  atualizarCentroCusto = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados invÃƒÂ¡lidos.' }); return; }

      const centroCusto = await this.financeiroService.atualizarCentroCusto(id, usuarioId, req.body);
      res.status(200).json({ success: true, message: 'Centro de Custo atualizado.', data: centroCusto });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  excluirCentroCusto = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados invÃƒÂ¡lidos.' }); return; }

      await this.financeiroService.excluirCentroCusto(id, usuarioId);
      res.status(200).json({ success: true, message: 'Centro de Custo excluÃƒÂ­do com sucesso.' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // =========================================================================
  // 4. PLANOS DE CONTAS
  // =========================================================================

  criarPlanoConta = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) { res.status(401).json({ message: 'Acesso negado.' }); return; }

      const id = await this.financeiroService.criarPlanoConta(req.body, usuarioId);
      res.status(201).json({ success: true, message: 'Plano de Conta criado.', id });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  listarPlanosContas = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) { res.status(401).json({ message: 'Acesso negado.' }); return; }

      const filtros = {
        conta_mae: req.query.conta_mae as string,
        termo: req.query.termo as string
      };

      const planosContas = await this.financeiroService.listarPlanosContas(usuarioId, filtros);
      res.status(200).json({ success: true, data: planosContas });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  buscarPlanoConta = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados invÃƒÆ’Ã‚Â¡lidos.' }); return; }

      const planoConta = await this.financeiroService.buscarPlanoConta(id, usuarioId);
      res.status(200).json({ success: true, data: planoConta });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  atualizarPlanoConta = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados invÃƒÆ’Ã‚Â¡lidos.' }); return; }

      const planoConta = await this.financeiroService.atualizarPlanoConta(id, usuarioId, req.body);
      res.status(200).json({ success: true, message: 'Plano de Conta atualizado.', data: planoConta });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  excluirPlanoConta = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados invÃƒÆ’Ã‚Â¡lidos.' }); return; }

      await this.financeiroService.excluirPlanoConta(id, usuarioId);
      res.status(200).json({ success: true, message: 'Plano de Conta excluÃƒÆ’Ã‚Â­do com sucesso.' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // =========================================================================
  // 5. CONTAS BANCARIAS
  // =========================================================================

  criarContaBancaria = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) { res.status(401).json({ message: 'Acesso negado.' }); return; }

      const id = await this.financeiroService.criarContaBancaria(req.body, usuarioId);
      res.status(201).json({ success: true, message: 'Conta Bancaria criada.', id });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  listarContasBancarias = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) { res.status(401).json({ message: 'Acesso negado.' }); return; }

      const filtros = {
        termo: req.query.termo as string
      };

      const contasBancarias = await this.financeiroService.listarContasBancarias(usuarioId, filtros);
      res.status(200).json({ success: true, data: contasBancarias });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  buscarContaBancaria = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados invÃƒÆ’Ã‚Â¡lidos.' }); return; }

      const contaBancaria = await this.financeiroService.buscarContaBancaria(id, usuarioId);
      res.status(200).json({ success: true, data: contaBancaria });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  atualizarContaBancaria = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados invÃƒÆ’Ã‚Â¡lidos.' }); return; }

      const contaBancaria = await this.financeiroService.atualizarContaBancaria(id, usuarioId, req.body);
      res.status(200).json({ success: true, message: 'Conta Bancaria atualizada.', data: contaBancaria });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  excluirContaBancaria = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados invÃƒÆ’Ã‚Â¡lidos.' }); return; }

      await this.financeiroService.excluirContaBancaria(id, usuarioId);
      res.status(200).json({ success: true, message: 'Conta Bancaria excluÃƒÆ’Ã‚Â­da com sucesso.' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // =========================================================================
  // 6. FORMAS DE PAGAMENTO
  // =========================================================================

  criarFormaPagamento = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) { res.status(401).json({ message: 'Acesso negado.' }); return; }

      const id = await this.financeiroService.criarFormaPagamento(req.body, usuarioId);
      res.status(201).json({ success: true, message: 'Forma de Pagamento criada.', id });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  listarFormasPagamento = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) { res.status(401).json({ message: 'Acesso negado.' }); return; }

      const filtros = {
        termo: req.query.termo as string,
        modalidade: req.query.modalidade as string,
        disponivel_em: req.query.disponivel_em as string,
        conta_bancaria_id: req.query.conta_bancaria_id ? parseInt(req.query.conta_bancaria_id as string) : undefined
      };

      const formasPagamento = await this.financeiroService.listarFormasPagamento(usuarioId, filtros);
      res.status(200).json({ success: true, data: formasPagamento });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  buscarFormaPagamento = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados invalidos.' }); return; }

      const formaPagamento = await this.financeiroService.buscarFormaPagamento(id, usuarioId);
      res.status(200).json({ success: true, data: formaPagamento });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  atualizarFormaPagamento = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados invalidos.' }); return; }

      const formaPagamento = await this.financeiroService.atualizarFormaPagamento(id, usuarioId, req.body);
      res.status(200).json({ success: true, message: 'Forma de Pagamento atualizada.', data: formaPagamento });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  excluirFormaPagamento = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);
      if (!usuarioId || isNaN(id)) { res.status(400).json({ message: 'Dados invalidos.' }); return; }

      await this.financeiroService.excluirFormaPagamento(id, usuarioId);
      res.status(200).json({ success: true, message: 'Forma de Pagamento excluida com sucesso.' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
