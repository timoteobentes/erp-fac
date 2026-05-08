import { z } from "zod";

export const categoriaDreSchema = z.object({
  grupo: z.string().trim().min(1, "O grupo e obrigatorio."),
  nome: z.string().trim().min(1, "O nome e obrigatorio."),
  tipo: z.enum(["DESPESA", "RECEITA", "TOTALIZADOR"]),
  ativo: z.boolean(),
});

export type CategoriaDreFormData = z.infer<typeof categoriaDreSchema>;
