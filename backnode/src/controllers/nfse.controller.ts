import { Response } from 'express';
import nfseService from '../services/nfse.service';
import { AuthRequest } from '../middleware/auth';

export const listarNfse = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    if (!usuarioId) return res.status(401).json({ error: 'Usuário não autenticado.' });

    const notas = await nfseService.listar(usuarioId);
    return res.status(200).json(notas || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const buscarNfsePorId = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    const { id } = req.params;
    if (!usuarioId) return res.status(401).json({ error: 'Usuário não autenticado.' });

    const nota = await nfseService.buscarPorId(parseInt(id), usuarioId);
    res.status(200).json(nota);
  } catch (err: any) {
    if (err.message === 'NFS-e não encontrada.') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const criarNfse = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    if (!usuarioId) return res.status(401).json({ error: 'Usuário não autenticado.' });

    const novaNota = await nfseService.criar(usuarioId, req.body);

    if (req.body.emitir_agora) {
       const MotorSerpro = (await import('../services/nfseNacional.service')).default;
       const resultadoSefaz = await MotorSerpro.emitirNotaServico(novaNota.id!);
       return res.status(201).json({ nota: novaNota, transmissao: resultadoSefaz });
    }

    res.status(201).json(novaNota);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const dispararTransmissaoSefaz = async (req: AuthRequest, res: Response) => {
  try {
    const usuarioId = req.usuario?.id;
    const { id } = req.params;
    if (!usuarioId) return res.status(401).json({ error: 'Usuário não autenticado.' });

    const notaOriginal = await nfseService.buscarPorId(parseInt(id), usuarioId);
    if (!notaOriginal) return res.status(404).json({ error: 'Nota não encontrada' });

    const MotorSerpro = (await import('../services/nfseNacional.service')).default;
    const resultado = await MotorSerpro.emitirNotaServico(parseInt(id));

    res.status(200).json(resultado);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
