import { NotificacaoRepository, FiltrosNotificacao } from '../repositories/NotificacaoRepository';
import { emailService } from './email.service';

export class NotificacaoService {
  private repository = new NotificacaoRepository();

  async criar(dados: any) {
    if (!dados.usuario_id) throw new Error('usuario_id é obrigatório');
    if (!dados.titulo?.trim()) throw new Error('Título é obrigatório');
    if (!dados.mensagem?.trim()) throw new Error('Mensagem é obrigatória');
    return this.repository.criar(dados);
  }

  async listar(usuarioId: number, filtros: FiltrosNotificacao, pagina: number, limite: number) {
    const safeLimit = Math.min(Number(limite) || 10, 100);
    const safePage = Math.max(Number(pagina) || 1, 1);
    const resultado = await this.repository.listar(usuarioId, filtros, {
      limit: safeLimit,
      offset: (safePage - 1) * safeLimit
    });

    return {
      ...resultado,
      paginacao: {
        pagina: safePage,
        limite: safeLimit,
        total: resultado.total,
        totalPaginas: Math.ceil(resultado.total / safeLimit)
      }
    };
  }

  async resumo(usuarioId: number, limite?: number) {
    return this.repository.resumo(usuarioId, limite);
  }

  async marcar(usuarioId: number, ids: number[], lida: boolean) {
    return this.repository.marcar(usuarioId, ids, lida);
  }

  async marcarTodas(usuarioId: number, lida: boolean) {
    return this.repository.marcarTodas(usuarioId, lida);
  }

  async excluir(usuarioId: number, ids: number[]) {
    return this.repository.excluir(usuarioId, ids);
  }

  async enviarPorEmail(usuarioId: number, ids: number[]) {
    const [usuario, notificacoes] = await Promise.all([
      this.repository.buscarUsuario(usuarioId),
      this.repository.buscarPorIds(usuarioId, ids)
    ]);

    if (!usuario?.email) throw new Error('Usuário sem e-mail cadastrado');
    if (notificacoes.length === 0) throw new Error('Nenhuma notificação encontrada');

    await emailService.sendNotificationEmail(usuario.email, usuario.nome_usuario || usuario.nome_empresa, notificacoes);
    await this.repository.marcarEmailEnviado(usuarioId, notificacoes.map((item: any) => item.id));
    return { enviados: notificacoes.length };
  }

  async receberWebhook(payload: any) {
    const evento = await this.repository.registrarWebhook({
      usuario_id: payload.usuario_id,
      origem: payload.origem || 'externo',
      evento: payload.evento || payload.event || 'notificacao',
      payload,
      status: 'processado'
    });

    let notificacao = null;
    if (payload.usuario_id && payload.titulo && payload.mensagem) {
      notificacao = await this.criar({
        usuario_id: payload.usuario_id,
        titulo: payload.titulo,
        mensagem: payload.mensagem,
        tipo: payload.tipo || 'webhook',
        origem: payload.origem || 'webhook',
        link: payload.link,
        metadados: payload.metadados || payload
      });
    }

    return { evento, notificacao };
  }
}

export const notificacaoService = new NotificacaoService();
