import { ServicoRepository } from '../repositories/ServicoRepository';
import { Servico } from '../models/Servico';

export class ServicoService {
  private servicoRepo: ServicoRepository;

  constructor() {
    this.servicoRepo = new ServicoRepository();
  }

  async listar(usuarioId: number, paginacao?: { limit: number, offset: number }) {
    return await this.servicoRepo.listar(usuarioId, paginacao);
  }

  async buscarPorId(id: number, usuarioId: number): Promise<Servico | null> {
    return await this.servicoRepo.buscarPorId(id, usuarioId);
  }

  async criar(usuarioId: number, servico: Partial<Servico>): Promise<Servico> {
    if (!servico.nome || !servico.codigo_lc116 || servico.aliquota_iss === undefined) {
      throw new Error('Campos obrigatórios: Nome, Código LC116 e Alíquota ISS.');
    }
    servico.usuario_id = usuarioId;
    return await this.servicoRepo.criar(servico as Omit<Servico, 'id' | 'created_at' | 'updated_at'>);
  }

  async atualizar(id: number, usuarioId: number, servico: Partial<Servico>): Promise<Servico | null> {
    return await this.servicoRepo.atualizar(id, usuarioId, servico);
  }

  async deletar(id: number, usuarioId: number): Promise<boolean> {
    return await this.servicoRepo.deletar(id, usuarioId);
  }
}
