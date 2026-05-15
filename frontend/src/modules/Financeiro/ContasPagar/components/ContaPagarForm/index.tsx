import React, { useEffect, useMemo, useState } from "react";
import { Button, ConfigProvider, DatePicker, Form, Input, InputNumber, Select, Switch, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import {
  ArrowBack,
  Check,
  DeleteForeverOutlined,
  FormatQuoteOutlined,
  MonetizationOnOutlined,
  PlayArrow,
  ReceiptLongOutlined
} from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { listarCentroCustosService } from "../../../CentroCustos/services/centroCustosService";
import { listarPlanosContasService } from "../../../PlanosContas/services/planosContasService";
import { listarFormasPagamentoService } from "../../../FormasPagamento/services/formasPagamentoService";
import { listarContasBancariasService } from "../../../ContasBancarias/services/contasBancariasService";
import { listarFornecedoresService } from "../../../../Cadastros/Fornecedores/services/fornecedoresService";
import type { ContaPagarPayload, ContaPagarParcelaPayload } from "../../services/contasPagarService";

type Option = {
  value: number;
  label: string;
  extra?: any;
};

interface ContaPagarFormProps {
  initialData?: any;
  loading?: boolean;
  submitting?: boolean;
  onSubmit: (payload: ContaPagarPayload) => Promise<void>;
  submitLabel: string;
}

interface FormValues {
  descricao: string;
  fornecedor_id?: number;
  plano_conta_id?: number;
  centro_custo_id?: number;
  forma_pagamento_id?: number;
  conta_bancaria_id?: number;
  valor_total: number;
  data_vencimento: Dayjs;
  pagamento_quitado: boolean;
  data_compensacao?: Dayjs;
  observacao?: string;
  parcelamento_recorrencia_ativo: boolean;
  tipo_parcela?: string;
  repeticao?: string;
  quantidade_parcelas?: number;
  data_primeira_parcela?: Dayjs;
}

const CONTAS_MAE_DESPESA = [
  "PAGAMENTO",
  "DESPESAS_ADMINISTRATIVAS_E_COMERCIAIS",
  "DESPESAS_PRODUTOS_VENDIDOS",
  "DESPESAS_FINANCEIRAS",
  "INVESTIMENTOS",
  "OUTRAS_DESPESAS",
];

const repeticaoOptions = [
  { value: "QUINZENAL", label: "Quinzenal" },
  { value: "MENSAL", label: "Mensal" },
  { value: "TRIMESTRAL", label: "Trimestral" },
  { value: "SEMESTRAL", label: "Semestral" },
  { value: "ANUAL", label: "Anual" },
];

const tipoParcelaOptions = [
  { value: "DIVIDIR_VALOR_ENTRE_PARCELAS", label: "Dividir o valor do lançamento entre as parcelas" },
  { value: "MULTIPLICAR_VALOR_PELAS_PARCELAS", label: "Multiplicar o valor do lançamento pelas parcelas" },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);

const extractRows = (payload: any): any[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.dados)) return payload.data.dados;
  if (Array.isArray(payload?.dados)) return payload.dados;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.fornecedores)) return payload.fornecedores;
  return [];
};

const addPeriodo = (date: Dayjs, repeticao: string, index: number) => {
  if (repeticao === "QUINZENAL") return date.add(15 * index, "day");
  if (repeticao === "TRIMESTRAL") return date.add(3 * index, "month");
  if (repeticao === "SEMESTRAL") return date.add(6 * index, "month");
  if (repeticao === "ANUAL") return date.add(index, "year");
  return date.add(index, "month");
};

const sectionTitle = (icon: React.ReactNode, title: string) => (
  <div className="flex items-center gap-2 mb-6">
    {icon}
    <Typography variant="h6" fontWeight={700} color="#0F172A">{title}</Typography>
  </div>
);

const formTheme = {
  token: {
    colorPrimary: "#5B21B6",
    borderRadius: 8,
    controlHeight: 48,
    colorBorder: "#E2E8F0",
    colorText: "#0F172A",
  },
  components: {
    DatePicker: {
      activeBorderColor: "#5B21B6",
      hoverBorderColor: "#CBD5E1",
    },
    Input: {
      activeBorderColor: "#5B21B6",
      hoverBorderColor: "#CBD5E1",
    },
    InputNumber: {
      activeBorderColor: "#5B21B6",
      hoverBorderColor: "#CBD5E1",
    },
    Select: {
      activeBorderColor: "#5B21B6",
      hoverBorderColor: "#CBD5E1",
      optionSelectedBg: "#F3E8FF",
    },
    Switch: {
      colorPrimary: "#5B21B6",
      colorPrimaryHover: "#4C1D95",
    },
    Table: {
      headerBg: "#F8FAFC",
      headerColor: "#475569",
      rowHoverBg: "#F8FAFC",
      borderColor: "#F1F5F9",
    },
  },
};

export const ContaPagarForm: React.FC<ContaPagarFormProps> = ({
  initialData,
  loading = false,
  submitting = false,
  onSubmit,
  submitLabel,
}) => {
  const [form] = Form.useForm<FormValues>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [parcelas, setParcelas] = useState<ContaPagarParcelaPayload[]>([]);
  const [planosContas, setPlanosContas] = useState<Option[]>([]);
  const [centrosCustos, setCentrosCustos] = useState<Option[]>([]);
  const [formasPagamento, setFormasPagamento] = useState<Option[]>([]);
  const [contasBancarias, setContasBancarias] = useState<Option[]>([]);
  const [fornecedores, setFornecedores] = useState<Option[]>([]);

  const parcelamentoAtivo = Form.useWatch("parcelamento_recorrencia_ativo", form);
  const pagamentoQuitado = Form.useWatch("pagamento_quitado", form);
  const formaPagamentoId = Form.useWatch("forma_pagamento_id", form);
  const contaBancariaId = Form.useWatch("conta_bancaria_id", form);

  useEffect(() => {
    const carregarOpcoes = async () => {
      try {
        const [planosRes, centrosRes, formasRes, contasRes, fornecedoresRes] = await Promise.all([
          listarPlanosContasService(),
          listarCentroCustosService(),
          listarFormasPagamentoService(),
          listarContasBancariasService(),
          listarFornecedoresService(1, 1000, {}, { campo: "nome", ordem: "ASC" }),
        ]);

        setPlanosContas(
          extractRows(planosRes)
            .filter((item: any) => CONTAS_MAE_DESPESA.includes(item.conta_mae))
            .map((item: any) => ({ value: Number(item.id), label: `${item.nome}`, extra: item }))
        );
        setCentrosCustos(extractRows(centrosRes).map((item: any) => ({ value: Number(item.id), label: item.nome, extra: item })));
        setFormasPagamento(
          extractRows(formasRes)
            .filter((item: any) => ["CONTAS_A_PAGAR_E_RECEBER", "SOMENTE_CONTAS_A_PAGAR"].includes(item.disponivel_em))
            .map((item: any) => ({ value: Number(item.id), label: item.nome, extra: item }))
        );
        setContasBancarias(extractRows(contasRes).map((item: any) => ({ value: Number(item.id), label: item.nome, extra: item })));
        setFornecedores(extractRows(fornecedoresRes).map((item: any) => ({ value: Number(item.id), label: item.nome, extra: item })));
      } catch {
        messageApi.error("Erro ao carregar dados auxiliares de contas a pagar.");
      }
    };

    carregarOpcoes();
  }, [messageApi]);

  useEffect(() => {
    if (!initialData) {
      form.setFieldsValue({
        pagamento_quitado: false,
        parcelamento_recorrencia_ativo: false,
        valor_total: 0,
      });
      return;
    }

    form.setFieldsValue({
      descricao: initialData.descricao || "",
      fornecedor_id: initialData.fornecedor_id || undefined,
      plano_conta_id: initialData.plano_conta_id || undefined,
      centro_custo_id: initialData.centro_custo_id || undefined,
      forma_pagamento_id: initialData.forma_pagamento_id || undefined,
      conta_bancaria_id: initialData.conta_bancaria_id || undefined,
      valor_total: Number(initialData.valor_total || 0),
      data_vencimento: initialData.data_vencimento ? dayjs(initialData.data_vencimento) : undefined,
      pagamento_quitado: Boolean(initialData.pagamento_quitado || initialData.status === "pago"),
      data_compensacao: initialData.data_compensacao ? dayjs(initialData.data_compensacao) : undefined,
      observacao: initialData.observacao || "",
      parcelamento_recorrencia_ativo: Boolean(initialData.parcelamento_recorrencia_ativo),
      tipo_parcela: initialData.tipo_parcela || undefined,
      repeticao: initialData.repeticao || undefined,
      quantidade_parcelas: initialData.quantidade_parcelas || undefined,
      data_primeira_parcela: initialData.data_primeira_parcela ? dayjs(initialData.data_primeira_parcela) : undefined,
    });

    setParcelas((initialData.parcelas || []).map((parcela: any) => ({
      id: parcela.id,
      numero_parcela: Number(parcela.numero_parcela),
      data_vencimento: parcela.data_vencimento?.split?.("T")?.[0] || parcela.data_vencimento,
      valor: Number(parcela.valor || 0),
      forma_pagamento_id: Number(parcela.forma_pagamento_id),
      conta_bancaria_id: parcela.conta_bancaria_id ? Number(parcela.conta_bancaria_id) : null,
      pago: Boolean(parcela.pago),
      observacao: parcela.observacao || "",
    })));
  }, [form, initialData]);

  useEffect(() => {
    if (!formaPagamentoId) return;
    const forma = formasPagamento.find((item) => item.value === formaPagamentoId);
    const contaVinculada = forma?.extra?.conta_bancaria_id;
    if (contaVinculada && !contaBancariaId) {
      form.setFieldValue("conta_bancaria_id", Number(contaVinculada));
    }

    setParcelas((atuais) => atuais.map((parcela) => ({
      ...parcela,
      forma_pagamento_id: Number(formaPagamentoId),
      conta_bancaria_id: contaVinculada ? Number(contaVinculada) : parcela.conta_bancaria_id,
    })));
  }, [contaBancariaId, formaPagamentoId, formasPagamento, form]);

  useEffect(() => {
    if (!contaBancariaId) return;
    setParcelas((atuais) => atuais.map((parcela) => parcela.pago ? parcela : ({
      ...parcela,
      conta_bancaria_id: Number(contaBancariaId),
    })));
  }, [contaBancariaId]);

  const formaPagamentoSelecionada = useMemo(
    () => formasPagamento.find((item) => item.value === formaPagamentoId),
    [formaPagamentoId, formasPagamento]
  );

  const gerarParcelas = async () => {
    try {
      const values = await form.validateFields([
        "valor_total",
        "forma_pagamento_id",
        "conta_bancaria_id",
        "tipo_parcela",
        "repeticao",
        "quantidade_parcelas",
        "data_primeira_parcela",
      ]);

      const quantidade = Number(values.quantidade_parcelas);
      const valorTotal = Number(values.valor_total);
      const tipoParcela = values.tipo_parcela;
      const baseDate = values.data_primeira_parcela as Dayjs;
      const repeticao = String(values.repeticao);

      if (!quantidade || quantidade <= 0) throw new Error();
      if (!valorTotal || valorTotal <= 0) throw new Error();

      let valores = Array.from({ length: quantidade }, () => valorTotal);
      if (tipoParcela === "DIVIDIR_VALOR_ENTRE_PARCELAS") {
        const valorBase = Math.floor((valorTotal / quantidade) * 100) / 100;
        valores = Array.from({ length: quantidade }, () => valorBase);
        const somaParcial = Number((valorBase * (quantidade - 1)).toFixed(2));
        valores[quantidade - 1] = Number((valorTotal - somaParcial).toFixed(2));
      }

      const novasParcelas = Array.from({ length: quantidade }, (_, index) => ({
        numero_parcela: index + 1,
        data_vencimento: addPeriodo(baseDate, repeticao, index).format("YYYY-MM-DD"),
        valor: valores[index],
        forma_pagamento_id: Number(values.forma_pagamento_id),
        conta_bancaria_id: values.conta_bancaria_id ? Number(values.conta_bancaria_id) : null,
        pago: false,
        observacao: "",
      }));

      setParcelas(novasParcelas);
      messageApi.success("Parcelas geradas com sucesso.");
    } catch {
      messageApi.error("Erro ao gerar parcelas. Verifique os campos obrigatórios.");
    }
  };

  const removerParcela = (numeroParcela: number) => {
    const parcela = parcelas.find((item) => item.numero_parcela === numeroParcela);
    if (parcela?.pago) {
      messageApi.warning("Não é possível remover uma parcela paga.");
      return;
    }
    const restantes = parcelas.filter((item) => item.numero_parcela !== numeroParcela);
    if (parcelamentoAtivo && restantes.length === 0) {
      messageApi.warning("Gere ou mantenha ao menos uma parcela.");
      return;
    }
    setParcelas(restantes.map((item, index) => ({ ...item, numero_parcela: index + 1 })));
  };

  const handleSubmit = async (values: FormValues) => {
    if (values.pagamento_quitado && !values.data_compensacao) {
      messageApi.error("Informe a data de compensação para pagamento quitado.");
      return;
    }

    if (values.parcelamento_recorrencia_ativo && parcelas.length === 0) {
      messageApi.error("Gere as parcelas antes de salvar.");
      return;
    }

    const planoConta = planosContas.find((item) => item.value === values.plano_conta_id);

    await onSubmit({
      descricao: values.descricao,
      fornecedor_id: values.fornecedor_id || null,
      valor_total: Number(values.valor_total),
      data_vencimento: values.data_vencimento.format("YYYY-MM-DD"),
      data_pagamento: values.pagamento_quitado ? values.data_compensacao?.format("YYYY-MM-DD") || null : null,
      status: values.pagamento_quitado ? "pago" : "pendente",
      categoria_despesa: planoConta?.label || null,
      observacao: values.observacao || null,
      plano_conta_id: values.plano_conta_id || null,
      centro_custo_id: values.centro_custo_id || null,
      forma_pagamento_id: values.forma_pagamento_id || null,
      conta_bancaria_id: values.conta_bancaria_id || null,
      pagamento_quitado: Boolean(values.pagamento_quitado),
      data_compensacao: values.data_compensacao ? values.data_compensacao.format("YYYY-MM-DD") : null,
      parcelamento_recorrencia_ativo: Boolean(values.parcelamento_recorrencia_ativo),
      tipo_parcela: values.parcelamento_recorrencia_ativo ? values.tipo_parcela || null : null,
      repeticao: values.parcelamento_recorrencia_ativo ? values.repeticao || null : null,
      quantidade_parcelas: values.parcelamento_recorrencia_ativo ? values.quantidade_parcelas || null : null,
      data_primeira_parcela: values.parcelamento_recorrencia_ativo && values.data_primeira_parcela ? values.data_primeira_parcela.format("YYYY-MM-DD") : null,
      parcelas: values.parcelamento_recorrencia_ativo ? parcelas : [],
    });
  };

  const columns: ColumnsType<ContaPagarParcelaPayload> = [
    { title: "Parcela", dataIndex: "numero_parcela", width: 90, render: (_, record) => `${record.numero_parcela}/${parcelas.length}` },
    { title: "Data", dataIndex: "data_vencimento", render: (value) => dayjs(value).format("DD/MM/YYYY") },
    { title: "Valor", dataIndex: "valor", render: (value) => formatCurrency(value) },
    { title: "Forma de pagamento", render: () => formaPagamentoSelecionada?.label || "-" },
    {
      title: "Pago",
      dataIndex: "pago",
      render: (value, record) => (
        <Select
          value={value ? "sim" : "nao"}
          style={{ width: 90 }}
          options={[{ value: "nao", label: "Não" }, { value: "sim", label: "Sim" }]}
          onChange={(nextValue) => setParcelas((atuais) => atuais.map((item) => item.numero_parcela === record.numero_parcela ? { ...item, pago: nextValue === "sim" } : item))}
        />
      )
    },
    {
      title: "Observações",
      dataIndex: "observacao",
      render: (value, record) => (
        <Input
          value={value || ""}
          onChange={(event) => setParcelas((atuais) => atuais.map((item) => item.numero_parcela === record.numero_parcela ? { ...item, observacao: event.target.value } : item))}
        />
      )
    },
    {
      title: "Ações",
      width: 90,
      render: (_, record) => (
        <Button danger type="text" icon={<DeleteForeverOutlined fontSize="small" />} onClick={() => removerParcela(record.numero_parcela)} />
      )
    },
  ];

  return (
    <>
      {contextHolder}
      <style>
        {`
          .conta-pagar-premium .ant-form-item-label > label {
            color: #475569;
            font-weight: 600;
          }

          .conta-pagar-premium .ant-input,
          .conta-pagar-premium .ant-input-number,
          .conta-pagar-premium .ant-select-selector,
          .conta-pagar-premium .ant-picker {
            background-color: #F8FAFC !important;
            border-color: #E2E8F0 !important;
            transition: all 0.2s ease-in-out;
          }

          .conta-pagar-premium .ant-input:hover,
          .conta-pagar-premium .ant-input-number:hover,
          .conta-pagar-premium .ant-select-selector:hover,
          .conta-pagar-premium .ant-picker:hover {
            border-color: #CBD5E1 !important;
          }

          .conta-pagar-premium .ant-input:focus,
          .conta-pagar-premium .ant-input-focused,
          .conta-pagar-premium .ant-input-number-focused,
          .conta-pagar-premium .ant-select-focused .ant-select-selector,
          .conta-pagar-premium .ant-picker-focused {
            background-color: #FFFFFF !important;
            border-color: #5B21B6 !important;
            box-shadow: 0 0 0 3px rgba(91, 33, 182, 0.1) !important;
          }
        `}
      </style>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowBack fontSize="small" />}
            onClick={() => navigate("/financeiro/pagar")}
            style={{ height: 44, width: 44, borderRadius: 12, borderColor: "#E2E8F0", color: "#475569", backgroundColor: "#FFFFFF" }}
          />
          <div className="flex flex-col">
            <Typography variant="h4" fontWeight={800} color="#0F172A" sx={{ letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              {submitLabel}
            </Typography>
            <Typography variant="body2" color="#64748B">
              Informe os dados financeiros e, se necessário, gere as parcelas do pagamento.
            </Typography>
          </div>
        </div>
      </div>
      <div className="hidden">
        <Button icon={<ArrowBack fontSize="small" />} onClick={() => navigate("/financeiro/pagar")} style={{ height: 40, borderRadius: 8 }} />
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] m-0">{submitLabel}</h1>
          <p className="text-sm text-[#64748B] m-0">Informe os dados financeiros e, se necessário, gere as parcelas do pagamento.</p>
        </div>
      </div>

      <ConfigProvider componentSize="large" theme={formTheme}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} disabled={loading || submitting} className="conta-pagar-premium animate-fadeIn">
        <Box sx={{ backgroundColor: "#FFFFFF", borderRadius: "24px", border: "1px solid #E2E8F0", boxShadow: "0 4px 24px rgba(0,0,0,0.02)", p: { xs: 3, md: 5 } }}>
        <div className="flex flex-col gap-10">
          <section>
            {sectionTitle(<ReceiptLongOutlined sx={{ color: "#5B21B6" }} />, "Dados Gerais")}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Form.Item className="md:col-span-2" name="descricao" label="Descrição do pagamento" rules={[{ required: true, message: "Informe a descrição do pagamento." }]}>
                <Input />
              </Form.Item>
              <Form.Item name="valor_total" label="Valor total" rules={[{ required: true, message: "Informe o valor total." }]}>
                <InputNumber min={0.01} precision={2} decimalSeparator="," prefix="R$" style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="data_vencimento" label="Vencimento" rules={[{ required: true, message: "Informe o vencimento." }]}>
                <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item name="fornecedor_id" label="Fornecedor">
                <Select showSearch allowClear options={fornecedores} optionFilterProp="label" />
              </Form.Item>
              <Form.Item name="plano_conta_id" label="Plano de contas">
                <Select showSearch allowClear options={planosContas} optionFilterProp="label" placeholder="Somente despesas/pagamentos" />
              </Form.Item>
              <Form.Item name="centro_custo_id" label="Centro de custos">
                <Select showSearch allowClear options={centrosCustos} optionFilterProp="label" />
              </Form.Item>
              <Form.Item name="forma_pagamento_id" label="Forma de pagamento" rules={parcelamentoAtivo || pagamentoQuitado ? [{ required: true, message: "Selecione uma forma de pagamento." }] : []}>
                <Select showSearch allowClear options={formasPagamento} optionFilterProp="label" />
              </Form.Item>
              <Form.Item name="conta_bancaria_id" label="Conta bancária" rules={parcelamentoAtivo || pagamentoQuitado ? [{ required: true, message: "Selecione uma conta bancária." }] : []}>
                <Select showSearch allowClear options={contasBancarias} optionFilterProp="label" />
              </Form.Item>
              <Form.Item name="pagamento_quitado" label="Pagamento quitado" valuePropName="checked">
                <Switch checkedChildren="Sim" unCheckedChildren="Não" />
              </Form.Item>
              <Form.Item name="data_compensacao" label="Data de compensação" rules={pagamentoQuitado ? [{ required: true, message: "Informe a data de compensação para pagamento quitado." }] : []}>
                <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
              </Form.Item>
            </div>
          </section>

          <div className="border-t border-[#F1F5F9]" />

          <section>
            {sectionTitle(<MonetizationOnOutlined sx={{ color: "#5B21B6" }} />, "Parcelamento/Recorrência")}
            <Box className="p-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] transition-all hover:border-[#CBD5E1]">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                <div>
                  <Typography variant="subtitle2" fontWeight={700} color="#0F172A">
                    Ativar parcelamento/recorrência
                  </Typography>
                  <Typography variant="body2" color="#64748B">
                    Gere parcelas mantendo a forma de pagamento, conta bancária, repetição e valores definidos.
                  </Typography>
                </div>
                <Form.Item name="parcelamento_recorrencia_ativo" valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Switch checkedChildren="Ativo" unCheckedChildren="Inativo" style={{ minWidth: 90 }} />
                </Form.Item>
              </div>

            {parcelamentoAtivo && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Form.Item name="tipo_parcela" label="Tipo de parcela" rules={[{ required: true, message: "Informe o tipo de parcela." }]}>
                    <Select options={tipoParcelaOptions} />
                  </Form.Item>
                  <Form.Item name="repeticao" label="Repetição" rules={[{ required: true, message: "Informe a repetição." }]}>
                    <Select options={repeticaoOptions} />
                  </Form.Item>
                  <Form.Item name="quantidade_parcelas" label="Quantidade" rules={[{ required: true, message: "Informe a quantidade de parcelas." }]}>
                    <InputNumber min={1} precision={0} style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item name="data_primeira_parcela" label="Data 1ª parcela" rules={[{ required: true, message: "Informe a data da primeira parcela." }]}>
                    <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item label=" ">
                    <Button
                      type="primary"
                      icon={<PlayArrow fontSize="small" />}
                      onClick={gerarParcelas}
                      style={{ width: "100%", background: "linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)", boxShadow: "0 4px 14px 0 rgba(91, 33, 182, 0.25)" }}
                    >
                      Gerar
                    </Button>
                  </Form.Item>
                </div>

                {parcelas.length > 0 && (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <Tag color="blue">Quantidade: {parcelas.length}</Tag>
                      <Tag color="green">Total gerado: {formatCurrency(parcelas.reduce((sum, item) => sum + Number(item.valor || 0), 0))}</Tag>
                    </div>
                    <Table rowKey="numero_parcela" columns={columns} dataSource={parcelas} pagination={false} scroll={{ x: 900 }} />
                  </>
                )}
              </div>
            )}
            </Box>
          </section>

          <div className="border-t border-[#F1F5F9]" />

          <section>
            {sectionTitle(<FormatQuoteOutlined sx={{ color: "#5B21B6" }} />, "Outras Informações")}
            <Form.Item name="observacao" label="Observações internas">
              <Input.TextArea rows={4} />
            </Form.Item>
          </section>

          <div className="flex justify-end gap-3 border-t border-[#F1F5F9] pt-5">
            <Button onClick={() => navigate("/financeiro/pagar")} style={{ borderColor: "#E2E8F0", color: "#475569", fontWeight: 600, borderRadius: 8, paddingInline: 28 }}>
              Cancelar
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              icon={<Check fontSize="small" />}
              style={{ background: "linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)", fontWeight: 600, borderRadius: 8, paddingInline: 40, boxShadow: "0 4px 14px 0 rgba(91, 33, 182, 0.25)" }}
            >
              Salvar
            </Button>
          </div>
        </div>
        </Box>
      </Form>
      </ConfigProvider>
    </>
  );
};
