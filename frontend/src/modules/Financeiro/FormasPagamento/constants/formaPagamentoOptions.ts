export const DISPONIVEL_EM_OPTIONS = [
  { value: "CONTAS_A_PAGAR_E_RECEBER", label: "Contas a pagar e receber" },
  { value: "SOMENTE_CONTAS_A_PAGAR", label: "Somente contas a pagar" },
  { value: "SOMENTE_CONTAS_A_RECEBER", label: "Somente contas a receber" },
];

export const CONFIRMACAO_AUTOMATICA_OPTIONS = [
  { value: "NUNCA_CONFIRMAR_AUTOMATICO", label: "Nunca confirmar automático" },
  { value: "SEMPRE_CONFIRMAR_AUTOMATICO", label: "Sempre confirmar automático" },
  { value: "CONFIRMAR_SOMENTE_CONTAS_A_RECEBER", label: "Confirmar somente em contas a receber" },
  { value: "CONFIRMAR_SOMENTE_CONTAS_A_PAGAR", label: "Confirmar somente em contas a pagar" },
];

export const MODALIDADE_OPTIONS = [
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "CARTAO_CREDITO", label: "Cartão de crédito" },
  { value: "CARTAO_DEBITO", label: "Cartão de débito" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "CREDITO_LOJA", label: "Crédito loja" },
  { value: "VALE_ALIMENTACAO", label: "Vale alimentação" },
  { value: "VALE_REFEICAO", label: "Vale refeição" },
  { value: "VALE_PRESENTE", label: "Vale presente" },
  { value: "VALE_COMBUSTIVEL", label: "Vale combustível" },
  { value: "DEVOLUCAO_MERCADORIA", label: "Devolução de mercadoria" },
  { value: "DUPLICATA_MERCANTIL", label: "Duplicata mercantil" },
  { value: "CARNE", label: "Carnê" },
  { value: "BOLETO_BANCARIO", label: "Boleto bancário" },
  { value: "DEPOSITO_BANCARIO", label: "Depósito bancário" },
  { value: "PAGAMENTO_INSTANTANEO_PIX", label: "Pagamento instantâneo - PIX" },
  { value: "TRANSFERENCIA_BANCARIA_CARTEIRA_DIGITAL", label: "Transferência bancária/carteira digital" },
  { value: "PROGRAMA_FIDELIDADE_CASHBACK_CREDITO_VIRTUAL", label: "Programa de fidelidade/cashback/crédito virtual" },
  { value: "OUTROS", label: "Outros" },
];

export const getDisponivelEmLabel = (value?: string) =>
  DISPONIVEL_EM_OPTIONS.find((option) => option.value === value)?.label || value || "-";

export const getConfirmacaoAutomaticaLabel = (value?: string) =>
  CONFIRMACAO_AUTOMATICA_OPTIONS.find((option) => option.value === value)?.label || value || "-";

export const getModalidadeLabel = (value?: string) =>
  MODALIDADE_OPTIONS.find((option) => option.value === value)?.label || value || "-";
