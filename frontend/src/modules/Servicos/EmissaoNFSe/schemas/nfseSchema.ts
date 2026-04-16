import * as yup from 'yup';

export interface NFSeFormData {
  cliente_id: number;
  servico_id: number;
  competencia?: string;
  descricao_servico: string;
  valor_servico: number;
  desconto: number;
  aliquota_iss?: number;
  retencao_ir?: number;
  retencao_inss?: number;
  retencao_csll?: number;
  retencao_cofins?: number;
  retencao_pis?: number;
  retencao_cpp?: number;
}

export const nfseSchema = yup.object().shape({
  cliente_id: yup.number().required('Selecione um cliente para faturamento'),
  servico_id: yup.number().required('Selecione um serviço base'),
  competencia: yup.string().optional(),
  descricao_servico: yup.string().required('Discriminação do serviço é obrigatória'),
  valor_servico: yup
    .number()
    .transform((value, originalValue) => (String(originalValue).trim() === '' ? 0 : value))
    .required('Valor do serviço é obrigatório')
    .min(0.01, 'Deve ser maior que R$ 0,00'),
  desconto: yup
    .number()
    .transform((value, originalValue) => (String(originalValue).trim() === '' ? 0 : value))
    .min(0, 'Não pode ser negativo')
    .default(0),
  aliquota_iss: yup.number().optional(),
  retencao_ir: yup.number().transform((value, originalValue) => (String(originalValue).trim() === '' ? 0 : value)).optional(),
  retencao_inss: yup.number().transform((value, originalValue) => (String(originalValue).trim() === '' ? 0 : value)).optional(),
  retencao_csll: yup.number().transform((value, originalValue) => (String(originalValue).trim() === '' ? 0 : value)).optional(),
  retencao_cofins: yup.number().transform((value, originalValue) => (String(originalValue).trim() === '' ? 0 : value)).optional(),
  retencao_pis: yup.number().transform((value, originalValue) => (String(originalValue).trim() === '' ? 0 : value)).optional(),
  retencao_cpp: yup.number().transform((value, originalValue) => (String(originalValue).trim() === '' ? 0 : value)).optional(),
});
