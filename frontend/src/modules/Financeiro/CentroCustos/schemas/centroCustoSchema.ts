import { z } from "zod";

export const centroCustoSchema = z.object({
  nome: z.string().trim().min(1, "O nome e obrigatorio."),
  status: z.enum(["ATIVO", "INATIVO"]),
});

export type CentroCustoFormData = z.infer<typeof centroCustoSchema>;
