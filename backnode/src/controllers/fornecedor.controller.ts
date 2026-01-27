import { Request, Response } from 'express';
import { FornecedorService } from '../services/fornecedor.service';
import { NovoFornecedorRequest } from '../models/Fornecedor';
import { AuthRequest } from '../middleware/auth';

export class FornecedorController {
  private fornecedorService: FornecedorService;

  constructor() {
    this.fornecedorService = new FornecedorService();
  }

  // Criar fornecedor
  criarFornecedor = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      
      if (!usuarioId) {
        console.log('❌ Isolamento: Tentativa de criar fornecedor sem usuário autenticado');
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const fornecedorData: NovoFornecedorRequest = req.body;

      // Validar dados
      const errors = await this.fornecedorService.validarDadosFornecedor(fornecedorData);
      if (errors.length > 0) {
        res.status(400).json({ errors });
        return;
      }

      const fornecedorId = await this.fornecedorService.criarFornecedor(fornecedorData, usuarioId);

      res.status(201).json({
        message: 'Fornecedor criado com sucesso',
        fornecedorId,
        fornecedor: {
          ...fornecedorData,
          id: fornecedorId
        }
      });

    } catch (error: any) {
      console.error('Erro ao criar fornecedor:', error);
      
      if (error.message.includes('já cadastrado')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    }
  };

  // Buscar fornecedor por ID
  buscarFornecedor = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const fornecedorId = parseInt(req.params.id);

      if (!usuarioId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const fornecedor = await this.fornecedorService.buscarFornecedor(fornecedorId, usuarioId);

      if (!fornecedor) {
        res.status(404).json({ error: 'Fornecedor não encontrado ou acesso não autorizado' });
        return;
      }

      res.json(fornecedor);

    } catch (error) {
      console.error('Erro ao buscar fornecedor:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  // Listar fornecedores com filtros e paginação
  listarFornecedores = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;

      if (!usuarioId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const pagina = parseInt(req.query.pagina as string) || 1;
      const limite = parseInt(req.query.limite as string) || 10;
      const offset = (pagina - 1) * limite;

      const filtros = {
        nome: req.query.nome as string,
        email: req.query.email as string,
        tipo_fornecedor: req.query.tipo_fornecedor as string,
        situacao: req.query.situacao as string,
        cpf_cnpj: req.query.cpf_cnpj as string,
        responsavel_compras: req.query.responsavel_compras as string,
        ramo_atividade: req.query.ramo_atividade as string,
        data_inicio: req.query.data_inicio as string,
        data_fim: req.query.data_fim as string,
      };

      const ordenarPor = req.query.ordenar_por as string || 'criado_em';
      const ordem = req.query.ordem as string || 'DESC';

      const resultado = await this.fornecedorService.listarFornecedoresComFiltros(
        usuarioId, 
        filtros, 
        { limite, offset },
        { ordenarPor, ordem }
      );

      res.json({
        fornecedores: resultado.fornecedores,
        paginacao: {
          pagina,
          limite,
          total: resultado.total,
          totalPaginas: Math.ceil(resultado.total / limite)
        },
        filtros
      });

    } catch (error) {
      console.error('Erro ao listar fornecedores:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  // Atualizar fornecedor
  atualizarFornecedor = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const fornecedorId = parseInt(req.params.id);

      if (!usuarioId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const fornecedorData: Partial<NovoFornecedorRequest> = req.body;

      const fornecedorExistente = await this.fornecedorService.buscarFornecedor(fornecedorId, usuarioId);
      if (!fornecedorExistente) {
        res.status(404).json({ error: 'Fornecedor não encontrado' });
        return;
      }

      await this.fornecedorService.atualizarFornecedor(fornecedorId, usuarioId, fornecedorData);

      res.json({
        message: 'Fornecedor atualizado com sucesso',
        fornecedorId
      });

    } catch (error: any) {
      console.error('Erro ao atualizar fornecedor:', error);
      
      if (error.message.includes('já cadastrado')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Erro interno do servidor' });
      }
    }
  };

  // Mudar status do fornecedor
  mudarStatusFornecedor = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const fornecedorId = parseInt(req.params.id);
      const { situacao } = req.body;

      if (!usuarioId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      if (!situacao || !['ativo', 'inativo'].includes(situacao)) {
        res.status(400).json({ error: 'Status inválido. Use: "ativo" ou "inativo"' });
        return;
      }

      const fornecedorExistente = await this.fornecedorService.buscarFornecedor(fornecedorId, usuarioId);
      if (!fornecedorExistente) {
        res.status(404).json({ error: 'Fornecedor não encontrado' });
        return;
      }

      await this.fornecedorService.mudarStatusFornecedor(fornecedorId, usuarioId, situacao);

      res.json({
        message: `Status do fornecedor alterado para ${situacao}`,
        fornecedorId,
        situacao
      });

    } catch (error) {
      console.error('Erro ao mudar status do fornecedor:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  // Excluir fornecedor
  excluirFornecedor = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const fornecedorId = parseInt(req.params.id);
      const hardDelete = req.query.hard === 'true';

      if (!usuarioId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const fornecedorExistente = await this.fornecedorService.buscarFornecedor(fornecedorId, usuarioId);
      if (!fornecedorExistente) {
        res.status(404).json({ error: 'Fornecedor não encontrado' });
        return;
      }

      await this.fornecedorService.excluirFornecedor(fornecedorId, usuarioId, hardDelete);

      res.json({
        message: hardDelete ? 'Fornecedor excluído permanentemente' : 'Fornecedor movido para inativos',
        fornecedorId
      });

    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  // Buscar fornecedor por CPF/CNPJ
  buscarFornecedorPorDocumento = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const { documento } = req.params;

      if (!usuarioId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const fornecedor = await this.fornecedorService.buscarFornecedorPorDocumento(usuarioId, documento);

      if (!fornecedor) {
        res.status(404).json({ error: 'Fornecedor não encontrado' });
        return;
      }

      res.json(fornecedor);

    } catch (error) {
      console.error('Erro ao buscar fornecedor por documento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  // Estatísticas dos fornecedores
  obterEstatisticas = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;

      if (!usuarioId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const estatisticas = await this.fornecedorService.obterEstatisticasFornecedores(usuarioId);

      res.json(estatisticas);

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };

  // Exportar fornecedores
  async exportarFornecedores(req: Request, res: Response): Promise<void> {
    try {
      console.log('exportarFornecedores chamado');
      
      const usuarioId = (req as any).usuarioId;
      const formato = req.query.formato as string || 'csv';
      const filtros = req.query as any;

      console.log('usuarioId:', usuarioId);
      console.log('formato:', formato);
      console.log('filtros:', JSON.stringify(filtros, null, 2));
      
      if (!this.fornecedorService) {
        throw new Error('fornecedorService não foi inicializado');
      }

      if (!['csv', 'xlsx', 'pdf'].includes(formato.toLowerCase())) {
        res.status(400).json({ error: 'Formato de exportação não suportado' });
        return;
      }

      const resultado = await this.fornecedorService.exportarFornecedores(
        usuarioId,
        formato,
        filtros
      );

      const filename = `fornecedores_${new Date().toISOString().split('T')[0]}`;
      
      switch (formato.toLowerCase()) {
        case 'csv':
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
          res.send(resultado as string);
          break;
        
        case 'xlsx':
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
          res.send(resultado as Buffer);
          break;
        
        case 'pdf':
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
          res.send(resultado as Buffer);
          break;
      }
    } catch (error: any) {
      console.error('Erro detalhado ao exportar fornecedores:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({ 
        error: 'Erro ao exportar fornecedores', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  };

  // Adicionar produto/serviço
  adicionarProdutoServico = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const usuarioId = req.usuario?.id;
      const fornecedorId = parseInt(req.params.id);

      if (!usuarioId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const produtoData = req.body;

      const produtoId = await this.fornecedorService.adicionarProdutoServico(fornecedorId, usuarioId, produtoData);

      res.status(201).json({
        message: 'Produto/Serviço adicionado com sucesso',
        produtoId,
        fornecedorId
      });

    } catch (error: any) {
      console.error('Erro ao adicionar produto/serviço:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  };
}