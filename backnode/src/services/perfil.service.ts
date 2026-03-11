import { PerfilRepository } from '../repositories/PerfilRepository';
import bcrypt from 'bcryptjs';

export class PerfilService {
  private perfilRepository: PerfilRepository;

  constructor() {
    this.perfilRepository = new PerfilRepository();
  }

  async obterPerfil(usuario_id: number) {
    return await this.perfilRepository.getPerfilCompleto(usuario_id);
  }

  async atualizarPerfil(usuario_id: number, dados: any) {
    const { usuario, fiscal } = dados;

    // Se a senha foi informada para trocar, fazer o hash
    if (usuario && usuario.senha) {
      usuario.senha = await bcrypt.hash(usuario.senha, 8);
    }

    if (fiscal) {
      const rtMap: Record<string, string> = {
        'Simples Nacional': 'simples_nacional',
        'Regime Normal': 'regime_normal'
      };
      if (fiscal.regime_tributario && rtMap[fiscal.regime_tributario]) {
        fiscal.regime_tributario = rtMap[fiscal.regime_tributario];
      }

      const asMap: Record<string, string> = {
        'Homologação': 'homologacao',
        'Homologacao': 'homologacao',
        'Produção': 'producao',
        'Producao': 'producao'
      };
      if (fiscal.ambiente_sefaz && asMap[fiscal.ambiente_sefaz]) {
        fiscal.ambiente_sefaz = asMap[fiscal.ambiente_sefaz];
      }
    }

    await this.perfilRepository.atualizarPerfilTransacional(
      usuario_id, 
      usuario || {}, 
      fiscal || {}
    );

    return { success: true, message: 'Perfil e Configurações Fiscais atualizados' };
  }
}
