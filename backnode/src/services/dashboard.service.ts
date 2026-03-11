import { DashboardRepository } from '../repositories/DashboardRepository';

export class DashboardService {
  private repository: DashboardRepository;

  constructor() {
    this.repository = new DashboardRepository();
  }

  async obterResumo(usuarioId: number) {
    return await this.repository.getResumo(usuarioId);
  }
}
