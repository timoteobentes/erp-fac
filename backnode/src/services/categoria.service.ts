import { Categoria } from '../models/Categoria';
import { CategoriaRepository, FiltrosCategoria } from '../repositories/CategoriaRepository';

export class CategoriaService {
  private repository = new CategoriaRepository();

  async criar(dados: Categoria, usuarioId: number): Promise<number> {
    const nome = this.normalizarNome(dados.nome);
    await this.validarNome(nome, usuarioId);
    return this.repository.criar({ nome }, usuarioId);
  }

  async listar(usuarioId: number, filtros: FiltrosCategoria, paginacao: { page: number; limit: number }) {
    const offset = (paginacao.page - 1) * paginacao.limit;
    return this.repository.listar(usuarioId, { nome: filtros.nome?.trim() || undefined }, { limit: paginacao.limit, offset });
  }

  async buscarPorId(id: number, usuarioId: number) {
    const categoria = await this.repository.buscarPorId(id, usuarioId);
    if (!categoria) throw new Error('Categoria nao encontrada.');
    return categoria;
  }

  async atualizar(id: number, dados: Categoria, usuarioId: number): Promise<void> {
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
    if (!nome) throw new Error('Nome da categoria e obrigatorio.');
    const existe = await this.repository.existeNome(nome, usuarioId, ignorarId);
    if (existe) throw new Error('Ja existe uma categoria com este nome.');
  }
}
