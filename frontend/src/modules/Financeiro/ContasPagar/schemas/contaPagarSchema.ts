import { z } from "zod";

export const contaPagarSchema = z.object({
  descricao: z.string().min(3, "A descrição deve ter pelo menos 3 caracteres."),
  fornecedor_id: z.number().optional().nullable(), // no MVP pode ser avulso
  categoria_despesa: z.string().optional().nullable(),
  observacao: z.string().optional().nullable(),
  
  // O backend espera data_vencimento
  data_vencimento: z.string().min(1, "A data de vencimento é obrigatória."),
  
  // Valores
  valor_bruto: z.coerce.number().min(0.01, "O valor não pode ser zero."),
  juros: z.coerce.number().optional().default(0),
  desconto: z.coerce.number().optional().default(0),
  
  // Será calculado
  valor_total: z.coerce.number().min(0.01, "O valor total não pode ser zero."),
  
  status: z.enum(["pendente", "pago"]).default("pendente"),
  data_pagamento: z.string().optional().nullable(),
});

export type ContaPagarFormData = z.infer<typeof contaPagarSchema>;
