import { z } from "zod";

export const contaBancariaSchema = z.object({
  nome: z.string().trim().min(1, "O nome e obrigatorio."),
  saldo_inicial: z.coerce.number(),
  data_saldo: z.string().trim().min(1, "A data do saldo e obrigatoria."),
});

export type ContaBancariaFormData = z.infer<typeof contaBancariaSchema>;
