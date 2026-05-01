import { z } from "zod";
import { CONTA_MAE_OPTIONS } from "../constants/contaMaeOptions";

export const planoContaSchema = z.object({
  conta_mae: z.enum(CONTA_MAE_OPTIONS.map((option) => option.value) as [string, ...string[]]),
  nome: z.string().trim().min(1, "O nome e obrigatorio."),
});

export type PlanoContaFormData = z.infer<typeof planoContaSchema>;
