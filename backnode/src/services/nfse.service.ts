import nfseRepository from '../repositories/NfseRepository';
import { Nfse, CreateNfseDTO } from '../models/Nfse';

class NfseService {
  async listar(usuarioId: number, paginacao?: { limit: number, offset: number }) {
    return await nfseRepository.listar(usuarioId, paginacao);
  }

  async buscarPorId(id: number, usuarioId: number): Promise<Nfse> {
    const nfse = await nfseRepository.buscarPorId(id, usuarioId);
    if (!nfse) {
      throw new Error('NFS-e não encontrada.');
    }
    return nfse;
  }

  async criar(usuarioId: number, data: CreateNfseDTO): Promise<Nfse> {
    if (!data.cliente_id) throw new Error('Cliente é obrigatório para emissão de NFS-e.');
    if (!data.servico_id) throw new Error('Serviço é obrigatório para emissão de NFS-e.');
    if (data.valor_servico <= 0) throw new Error('Valor do serviço deve ser maior que zero.');

    const valorServico = Number(data.valor_servico);
    const desconto = Number(data.desconto || 0);
    const aliquotaIss = Number(data.aliquota_iss || 0);

    const valor_total = valorServico - desconto;
    const valor_iss = (valorServico * aliquotaIss) / 100;

    let competenciaFinal = data.competencia || new Date().toISOString().split('T')[0];
    if (competenciaFinal && competenciaFinal.length === 7) {
      competenciaFinal = `${competenciaFinal}-01`;
    }

    const novaNfse: Nfse = {
      usuario_id: usuarioId,
      cliente_id: data.cliente_id,
      servico_id: data.servico_id,
      competencia: competenciaFinal,
      valor_servico: valorServico,
      desconto,
      valor_total: valor_total > 0 ? valor_total : 0,
      aliquota_iss: aliquotaIss,
      valor_iss,
      status: 'rascunho'
    };

    return await nfseRepository.criar(novaNfse);
  }
}

export default new NfseService();
