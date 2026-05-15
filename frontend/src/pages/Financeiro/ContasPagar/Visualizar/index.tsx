import React, { useEffect, useState } from "react";
import { Button, Descriptions, Skeleton, Table, Tag } from "antd";
import { ArrowBack, EditOutlined } from "@mui/icons-material";
import Layout from "../../../../template/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { buscarContaPagarPorIdService } from "../../../../modules/Financeiro/ContasPagar/services/contasPagarService";
import { toast } from "react-toastify";

const VisualizarPagamento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [conta, setConta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConta = async () => {
      try {
        if (!id) return;
        const data = await buscarContaPagarPorIdService(id);
        setConta(data);
      } catch {
        toast.error("Erro ao carregar conta a pagar");
        navigate("/financeiro/pagar");
      } finally {
        setLoading(false);
      }
    };

    fetchConta();
  }, [id, navigate]);

  const formatCurrency = (val: any) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(val) || 0);

  const formatDate = (date: string) => {
    if (!date) return "-";
    const d = new Date(date);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d.toLocaleDateString("pt-BR");
  };

  const renderStatus = (status: string) => {
    const colors: Record<string, string> = { pago: "success", pendente: "warning", atrasado: "error", cancelado: "default" };
    return <Tag color={colors[status] || "default"}>{status || "-"}</Tag>;
  };

  const renderBoolean = (value: boolean) => <Tag color={value ? "success" : "warning"}>{value ? "Sim" : "Não"}</Tag>;

  if (loading) {
    return (
      <Layout>
        <Skeleton active paragraph={{ rows: 12 }} />
      </Layout>
    );
  }

  if (!conta) {
    return <Layout><div className="p-8 text-center text-[#64748B]">Conta não encontrada.</div></Layout>;
  }

  return (
    <Layout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowBack fontSize="small" />} onClick={() => navigate("/financeiro/pagar")} />
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] m-0">{conta.descricao || "Conta a Pagar"}</h1>
            <p className="text-sm text-[#64748B] m-0">Código #{conta.id?.toString().padStart(4, "0")}</p>
          </div>
        </div>
        <Button icon={<EditOutlined fontSize="small" />} onClick={() => navigate(`/financeiro/pagar/editar/${conta.id}`)}>
          Editar
        </Button>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 md:p-8 mb-6">
        <Descriptions title="Dados Gerais" bordered column={{ xs: 1, md: 2 }}>
          <Descriptions.Item label="Descrição">{conta.descricao || "-"}</Descriptions.Item>
          <Descriptions.Item label="Fornecedor">{conta.fornecedor_nome || conta.fornecedor_id || "-"}</Descriptions.Item>
          <Descriptions.Item label="Valor total">{formatCurrency(conta.valor_total)}</Descriptions.Item>
          <Descriptions.Item label="Vencimento">{formatDate(conta.data_vencimento)}</Descriptions.Item>
          <Descriptions.Item label="Status">{renderStatus(conta.status)}</Descriptions.Item>
          <Descriptions.Item label="Data pagamento">{formatDate(conta.data_pagamento)}</Descriptions.Item>
          <Descriptions.Item label="Plano de contas">{conta.plano_conta_nome || conta.categoria_despesa || "-"}</Descriptions.Item>
          <Descriptions.Item label="Centro de custos">{conta.centro_custo_nome || "-"}</Descriptions.Item>
          <Descriptions.Item label="Forma de pagamento">{conta.forma_pagamento_nome || "-"}</Descriptions.Item>
          <Descriptions.Item label="Conta bancária">{conta.conta_bancaria_nome || "-"}</Descriptions.Item>
          <Descriptions.Item label="Pagamento quitado">{renderBoolean(Boolean(conta.pagamento_quitado))}</Descriptions.Item>
          <Descriptions.Item label="Data compensação">{formatDate(conta.data_compensacao)}</Descriptions.Item>
          <Descriptions.Item label="Observação" span={2}>{conta.observacao || "-"}</Descriptions.Item>
        </Descriptions>
      </div>

      {conta.parcelas && conta.parcelas.length > 0 && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 md:p-8">
          <h2 className="text-base font-bold text-[#0F172A] mb-4">Parcelas</h2>
          <Table
            rowKey={(record: any) => record.id || record.numero_parcela}
            pagination={false}
            dataSource={conta.parcelas}
            scroll={{ x: 900 }}
            columns={[
              { title: "Número", dataIndex: "numero_parcela" },
              { title: "Data", dataIndex: "data_vencimento", render: (value: string) => formatDate(value) },
              { title: "Valor", dataIndex: "valor", render: (value: number) => formatCurrency(value) },
              { title: "Forma de pagamento", dataIndex: "forma_pagamento_nome", render: (value: string) => value || conta.forma_pagamento_nome || "-" },
              { title: "Pago", dataIndex: "pago", render: (value: boolean) => renderBoolean(Boolean(value)) },
              { title: "Observações", dataIndex: "observacao", render: (value: string) => value || "-" },
            ]}
          />
        </div>
      )}
    </Layout>
  );
};

export default VisualizarPagamento;
