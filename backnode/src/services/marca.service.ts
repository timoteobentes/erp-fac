import { Marca } from '../models/Marca';
import { FiltrosMarca, MarcaRepository } from '../repositories/MarcaRepository';

export class MarcaService {
  private repository = new MarcaRepository();

  async criar(dados: Marca, usuarioId: number): Promise<number> {
    const nome = this.normalizarNome(dados.nome);
    await this.validarNome(nome, usuarioId);
    return this.repository.criar({ nome }, usuarioId);
  }

  async listar(usuarioId: number, filtros: FiltrosMarca, paginacao: { page: number; limit: number }) {
    const offset = (paginacao.page - 1) * paginacao.limit;
    return this.repository.listar(usuarioId, { nome: filtros.nome?.trim() || undefined }, { limit: paginacao.limit, offset });
  }

  async buscarPorId(id: number, usuarioId: number) {
    const marca = await this.repository.buscarPorId(id, usuarioId);
    if (!marca) throw new Error('Marca nao encontrada.');
    return marca;
  }

  async atualizar(id: number, dados: Marca, usuarioId: number): Promise<void> {
    await this.buscarPorId(id, usuarioId);
    const nome = this.normalizarNome(dados.nome);
    await this.validarNome(nome, usuarioId, id);
    await this.repository.atualizar(id, { nome }, usuarioId);
  }

  async excluir(id: number, usuarioId: number): Promise<void> {
    await this.buscarPorId(id, usuarioId);
    await this.repository.excluir(id, usuarioId);
  }

  private normalizarNome(nome?: string): string {
    return nome?.trim() || '';
  }

  private async validarNome(nome: string, usuarioId: number, ignorarId?: number): Promise<void> {
    if (!nome) throw new Error('Nome da marca e obrigatorio.');
    const existe = await this.repository.existeNome(nome, usuarioId, ignorarId);
    if (existe) throw new Error('Ja existe uma marca com este nome.');
  }
}
