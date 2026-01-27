import { Request, Response } from 'express';
import { ClienteService, OpcoesExportacao } from '../services/cliente.service';
import { FiltrosCliente } from '../repositories/ClienteRepository';
import { type NovoClienteDTO } from '../models/Cliente';

interface AuthRequest extends Request {
  usuario?: {
    id: number;
  };
}

export class ClienteController {
  private clienteService: ClienteService;

  constructor() {
    this.clienteService = new ClienteService();
  }

  // =========================================================================
  // 1. CRIAR
  // =========================================================================
  criar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) {
        res.status(401).json({ message: 'Usuário não autenticado.' });
        return;
      }

      const dados: NovoClienteDTO = req.body;

      // 1. Validar Dados (Regras de Negócio e Duplicidade)
      const erros = await this.clienteService.validarDadosCliente(dados);
      if (erros.length > 0) {
        res.status(400).json({ 
          success: false, 
          message: 'Erro de validação.', 
          errors: erros 
        });
        return;
      }

      // 2. Criar
      const novoId = await this.clienteService.criarCliente(dados, usuarioId);

      res.status(201).json({
        success: true,
        message: 'Cliente cadastrado com sucesso!',
        id: novoId
      });

    } catch (error: any) {
      // Captura erro de duplicidade se o service lançar throw new Error
      if (error.message.includes('Já existe')) {
        res.status(409).json({ success: false, message: error.message });
        return;
      }

      console.error('Erro ao criar cliente:', error);
      res.status(500).json({ success: false, message: 'Erro interno ao cadastrar cliente.' });
    }
  }

  // =========================================================================
  // 2. LISTAR (Com Paginação e Filtros)
  // =========================================================================
  listar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) {
        res.status(401).json({ message: 'Acesso negado.' });
        return;
      }

      // Extração de Paginação
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Extração de Filtros
      const filtros: FiltrosCliente = {
        nome: req.query.nome as string,
        email: req.query.email as string,
        cpf_cnpj: req.query.cpf_cnpj as string, // O Service vai limpar a máscara
        tipo_cliente: req.query.tipo as string,
        situacao: req.query.situacao as string,
        vendedor: req.query.vendedor as string,
        data_inicio: req.query.data_inicio as string,
        data_fim: req.query.data_fim as string
      };

      const resultado = await this.clienteService.listarClientesComFiltros(
        usuarioId, 
        filtros, 
        { page, limit }
      );

      res.status(200).json({
        success: true,
        data: resultado.clientes,
        meta: {
          total: resultado.total,
          page,
          limit,
          totalPages: Math.ceil(resultado.total / limit)
        }
      });

    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      res.status(500).json({ success: false, message: 'Erro ao buscar clientes.' });
    }
  }

  // =========================================================================
  // 3. BUSCAR POR ID
  // =========================================================================
  buscarPorId = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);

      if (!usuarioId || isNaN(id)) {
        res.status(400).json({ message: 'ID inválido.' });
        return;
      }

      const cliente = await this.clienteService.buscarClientePorId(id, usuarioId);
      
      res.status(200).json({ success: true, data: cliente });

    } catch (error: any) {
      if (error.message === 'Cliente não encontrado.') {
        res.status(404).json({ success: false, message: error.message });
      } else {
        console.error('Erro ao buscar cliente:', error);
        res.status(500).json({ success: false, message: 'Erro interno.' });
      }
    }
  }

  // =========================================================================
  // 4. ATUALIZAR
  // =========================================================================
  atualizar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);
      const dados: NovoClienteDTO = req.body;

      if (!usuarioId) {
         res.status(401).json({ message: 'Acesso negado.' });
         return;
      }

      // Validar dados básicos (opcional, pois o service valida duplicidade ignorando ID atual)
      // Você pode chamar validarDadosCliente aqui se quiser validação estrita, 
      // mas precisaria passar o ID para ignorar na verificação de duplicidade.

      await this.clienteService.atualizarCliente(id, dados, usuarioId);

      res.status(200).json({ success: true, message: 'Cliente atualizado com sucesso.' });

    } catch (error: any) {
      if (error.message.includes('não encontrado')) {
        res.status(404).json({ success: false, message: error.message });
      } else if (error.message.includes('Já existe')) {
        res.status(409).json({ success: false, message: error.message });
      } else {
        console.error('Erro ao atualizar:', error);
        res.status(500).json({ success: false, message: 'Erro ao atualizar cliente.' });
      }
    }
  }

  // =========================================================================
  // 5. MUDAR STATUS (PATCH)
  // =========================================================================
  mudarStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);
      const { situacao } = req.body; // { situacao: 'ativo' | 'inativo' }

      if (!usuarioId) {
        res.status(401).json({ message: 'Acesso negado.' });
        return;
      }

      await this.clienteService.mudarStatusCliente(id, usuarioId, situacao);

      res.status(200).json({ success: true, message: `Status alterado para ${situacao}.` });

    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // =========================================================================
  // 6. EXCLUIR
  // =========================================================================
  excluir = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const id = parseInt(req.params.id);

      if (!usuarioId) {
         res.status(401).json({ message: 'Acesso negado.' });
         return;
      }

      await this.clienteService.excluirCliente(id, usuarioId);

      res.status(200).json({ success: true, message: 'Cliente excluído com sucesso.' });

    } catch (error: any) {
      if (error.message.includes('não encontrado')) {
        res.status(404).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Erro ao excluir cliente.' });
      }
    }
  }

  // =========================================================================
  // 7. EXPORTAR (Download de Arquivo)
  // =========================================================================
  exportar = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      if (!usuarioId) {
        res.status(401).json({ message: 'Acesso negado.' });
        return;
      }

      // Parâmetros via Query String
      const formato = (req.query.formato as 'csv' | 'xlsx' | 'pdf') || 'csv';
      const filtros: FiltrosCliente = {
        nome: req.query.nome as string,
        situacao: req.query.situacao as string,
        tipo_cliente: req.query.tipo as string,
        cpf_cnpj: req.query.cpf_cnpj as string,
        data_inicio: req.query.data_inicio as string,
        data_fim: req.query.data_fim as string
      };

      const bufferOrString = await this.clienteService.exportarClientes(usuarioId, {
        formato,
        filtros
      });

      // Configuração dos Headers HTTP para Download
      const dataHoje = new Date().toISOString().split('T')[0];
      const filename = `relatorio_clientes_${dataHoje}`;

      if (formato === 'csv') {
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
        res.send(bufferOrString); // String
      } else if (formato === 'xlsx') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.xlsx`);
        res.send(bufferOrString); // Buffer
      } else if (formato === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}.pdf`);
        res.send(bufferOrString); // Buffer
      }

    } catch (error: any) {
      console.error('Erro na exportação:', error);
      res.status(500).json({ success: false, message: 'Erro ao gerar arquivo de exportação.' });
    }
  }

  // =========================================================================
  // 8. BUSCAR POR DOCUMENTO (Validação Frontend)
  // =========================================================================
  buscarPorDocumento = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const { doc } = req.query; // ?doc=12345678900

      if (!usuarioId || !doc) {
        res.status(400).json({ message: 'Dados insuficientes.' });
        return;
      }

      const cliente = await this.clienteService.buscarClientePorDocumento(doc as string, usuarioId);
      
      // Retorna null se não achar, ou o objeto cliente se achar (para preencher o form)
      res.status(200).json({ success: true, exists: !!cliente, cliente });

    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao verificar documento.' });
    }
  }
}