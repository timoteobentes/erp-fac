export interface ContaBancaria {
  id?: number;
  usuario_id: number;
  nome: string;
  saldo_inicial: number;
  data_saldo: Date | string;
  criado_em?: Date | string;
  atualizado_em?: Date | string;
}
