export const CONTA_MAE_OPTIONS = [
  { value: "PAGAMENTO", label: "1 - Pagamento" },
  { value: "DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS", label: "1.1 - Despesas administrativas e comerciais" },
  { value: "DESPESAS_PRODUTOS_VENDIDOS", label: "1.2 - Despesas de produtos vendidos" },
  { value: "DESPESAS_FINANCEIRAS", label: "1.3 - Despesas financeiras" },
  { value: "INVESTIMENTOS", label: "1.4 - Investimentos" },
  { value: "OUTRAS_DESPESAS", label: "1.5 - Outras despesas" },
  { value: "RECEBIMENTOS", label: "2 - Recebimentos" },
  { value: "RECEITAS_VENDAS", label: "2.1 - Receitas de vendas" },
  { value: "RECEITAS_FINANCEIRAS", label: "2.2 - Receitas financeiras" },
  { value: "OUTRAS_RECEITAS", label: "2.3 - Outras receitas" },
] as const;

export type ContaMaeOptionValue = (typeof CONTA_MAE_OPTIONS)[number]["value"];

export const getContaMaeLabel = (value: string) =>
  CONTA_MAE_OPTIONS.find((option) => option.value === value)?.label || value;
