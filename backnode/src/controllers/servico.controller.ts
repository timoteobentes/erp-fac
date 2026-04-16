import { Request, Response } from 'express';
import { ServicoService } from '../services/servico.service';
import { AuthRequest } from '../middleware/auth';

const servicoService = new ServicoService();

export const listarServicos = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    if (!usuarioId) return res.status(401).json({ error: 'Usuário não autenticado.' });

    const servicos = await servicoService.listar(usuarioId);
    return res.status(200).json(servicos || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const buscarServicoPorId = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    const { id } = req.params;
    if (!usuarioId) return res.status(401).json({ error: 'Usuário não autenticado.' });

    const servico = await servicoService.buscarPorId(parseInt(id), usuarioId);
    if (!servico) return res.status(404).json({ error: 'Serviço não encontrado.' });
    
    res.json(servico);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const criarServico = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    if (!usuarioId) return res.status(401).json({ error: 'Usuário não autenticado.' });

    const novoServico = await servicoService.criar(usuarioId, req.body);
    res.status(201).json(novoServico);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const atualizarServico = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    const { id } = req.params;
    if (!usuarioId) return res.status(401).json({ error: 'Usuário não autenticado.' });

    const servicoAtualizado = await servicoService.atualizar(parseInt(id), usuarioId, req.body);
    if (!servicoAtualizado) return res.status(404).json({ error: 'Serviço não encontrado ou não atualizado.' });

    res.json(servicoAtualizado);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deletarServico = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    const { id } = req.params;
    if (!usuarioId) return res.status(401).json({ error: 'Usuário não autenticado.' });

    const sucesso = await servicoService.deletar(parseInt(id), usuarioId);
    if (!sucesso) return res.status(404).json({ error: 'Serviço não encontrado.' });

    res.json({ message: 'Serviço deletado com sucesso.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
