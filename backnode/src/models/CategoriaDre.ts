export interface CategoriaDre {
  id?: number;
  usuario_id: number;
  grupo: string;
  nome: string;
  tipo: string;
  ativo: boolean;
  criado_em?: Date | string;
  atualizado_em?: Date | string;
}
