export const toNumber = (value: unknown): number => {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const roundCurrency = (value: number): number => Number(value.toFixed(2));

export const roundPercent = (value: number): number => Number(value.toFixed(2));

export const calcularCustoFinal = (
  precoCusto: unknown,
  despesasAcessorias: unknown,
  outrasDespesas: unknown
): number => roundCurrency(toNumber(precoCusto) + toNumber(despesasAcessorias) + toNumber(outrasDespesas));

export const calcularPrecoVenda = (custoFinal: number, margemLucro: unknown): number => {
  if (custoFinal <= 0) return 0;
  return roundCurrency(custoFinal * (1 + toNumber(margemLucro) / 100));
};

export const calcularMargemAplicada = (custoFinal: number, precoVenda: unknown): number => {
  if (custoFinal <= 0) return 0;
  return roundPercent(((toNumber(precoVenda) - custoFinal) / custoFinal) * 100);
};

export const calcularLucroSugerido = (
  precoCusto: unknown,
  despesasAcessorias: unknown,
  outrasDespesas: unknown
): number => {
  const custoCompra = toNumber(precoCusto);
  const despesas = toNumber(despesasAcessorias) + toNumber(outrasDespesas);
  const custoFinal = custoCompra + despesas;

  if (custoFinal <= 0) return 0;

  const margemBase = custoFinal <= 50 ? 40 : custoFinal <= 200 ? 30 : custoFinal <= 1000 ? 22 : 15;
  const impactoDespesas = custoCompra > 0 ? Math.min((despesas / custoCompra) * 20, 10) : 0;

  return roundPercent(margemBase + impactoDespesas);
};
