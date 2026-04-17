import * as yup from 'yup';

export interface ServicoFormData {
  nome: string;
  codigo_lc116: string;
  codigo_tributacao_nacional?: string | null;
  cnae?: string | null;
  aliquota_iss: number;
  valor_padrao?: number | null;
  ativo?: boolean | null;
}

export const servicoSchema = yup.object().shape({
  nome: yup.string().required('O nome do serviço é obrigatório'),
  codigo_lc116: yup.string().required('O Código LC 116 é obrigatório para emissão de NFS-e'),
  codigo_tributacao_nacional: yup
    .string()
    .nullable()
    .test('len', 'Deve conter exatamente 6 números (ex: 140101)', (val: any) => {
       if (!val) return true;
       return val.replace(/\\D/g, '').length === 6;
    }),
  cnae: yup.string().nullable(),
  aliquota_iss: yup
    .number()
    .typeError('Aliquota ISS deve ser um número')
    .min(0, 'Aliquota mínima é 0')
    .max(100, 'Aliquota máxima é 100')
    .required('A alíquota ISS é obrigatória'),
  valor_padrao: yup
    .number()
    .typeError('Valor padrão deve ser numérico')
    .min(0, 'O valor não pode ser negativo')
    .nullable(),
  ativo: yup.boolean().default(true),
});

export interface Servico extends ServicoFormData {
  id: number;
  usuario_id: number;
  created_at: string;
  updated_at: string;
}
