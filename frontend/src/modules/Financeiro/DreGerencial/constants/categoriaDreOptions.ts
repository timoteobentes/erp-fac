export const GRUPO_CATEGORIA_DRE_OPTIONS = [
  { value: "NENHUM", label: "Nenhum" },
  { value: "CUSTOS_OPERACIONAIS", label: "(-) Custos operacionais" },
  { value: "DEDUCOES", label: "(-) Deducoes" },
  { value: "DESPESAS_FINANCEIRAS", label: "(-) Despesas financeiras" },
  { value: "DESPESAS_OPERACIONAIS", label: "(-) Despesas operacionais" },
  { value: "OUTRAS_DESPESAS", label: "(-) Outras despesas" },
  { value: "OUTRAS_RECEITAS", label: "(+) Outras receitas" },
  { value: "RECEITA_BRUTA", label: "(+) Receita bruta" },
  { value: "RECEITAS_FINANCEIRAS", label: "(+) Receitas financeiras" },
] as const;

export const TIPO_CATEGORIA_DRE_OPTIONS = [
  { value: "DESPESA", label: "(-) Despesa" },
  { value: "RECEITA", label: "(+) Receita" },
  { value: "TOTALIZADOR", label: "(=) Totalizador" },
] as const;

export const ATIVO_OPTIONS = [
  { value: "true", label: "Sim" },
  { value: "false", label: "Nao" },
] as const;

export const GRUPO_CATEGORIA_DRE_LABELS = Object.fromEntries(
  GRUPO_CATEGORIA_DRE_OPTIONS.map((option) => [option.value, option.label])
) as Record<string, string>;

export const TIPO_CATEGORIA_DRE_LABELS = Object.fromEntries(
  TIPO_CATEGORIA_DRE_OPTIONS.map((option) => [option.value, option.label])
) as Record<string, string>;

export const premiumInputStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: "#F8FAFC",
    transition: "all 0.2s ease-in-out",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
    "&.Mui-focused": {
      backgroundColor: "#FFFFFF",
      boxShadow: "0 0 0 3px rgba(91, 33, 182, 0.1)",
    },
    "&.Mui-focused fieldset": { borderColor: "#5B21B6", borderWidth: "1px" },
  },
};
