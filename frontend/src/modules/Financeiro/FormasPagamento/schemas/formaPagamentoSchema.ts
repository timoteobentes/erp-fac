import { z } from "zod";
import {
  CONFIRMACAO_AUTOMATICA_OPTIONS,
  DISPONIVEL_EM_OPTIONS,
  MODALIDADE_OPTIONS,
} from "../constants/formaPagamentoOptions";

const disponivelEmValues = DISPONIVEL_EM_OPTIONS.map((option) => option.value) as [string, ...string[]];
const confirmacaoAutomaticaValues = CONFIRMACAO_AUTOMATICA_OPTIONS.map((option) => option.value) as [string, ...string[]];
const modalidadeValues = MODALIDADE_OPTIONS.map((option) => option.value) as [string, ...string[]];

export const formaPagamentoSchema = z.object({
  nome: z.string().trim().min(1, "O nome e obrigatorio."),
  conta_bancaria_id: z.coerce.number().int().min(1, "A conta bancaria e obrigatoria."),
  disponivel_em: z.enum(disponivelEmValues),
  confirmacao_automatica: z.enum(confirmacaoAutomaticaValues),
  numero_maximo_parcelas: z.coerce.number().int().min(1, "O numero maximo de parcelas deve ser no minimo 1."),
  intervalo_parcelas_dias: z.coerce.number().int().min(0, "O intervalo de parcelas nao pode ser negativo."),
  primeira_parcela_dias: z.coerce.number().int().min(0, "A primeira parcela nao pode ser negativa."),
  taxa_banco: z.coerce.number().min(0, "A taxa do banco nao pode ser negativa."),
  taxa_operadora: z.coerce.number().min(0, "A taxa da operadora nao pode ser negativa."),
  juros_multa: z.coerce.number().min(0, "O juros de multa nao pode ser negativo."),
  juros_mora: z.coerce.number().min(0, "O juros de mora nao pode ser negativo."),
  modalidade: z.enum(modalidadeValues),
});

export type FormaPagamentoFormData = z.infer<typeof formaPagamentoSchema>;
