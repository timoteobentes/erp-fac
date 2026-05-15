import React, { useState } from "react";
import Layout from "../../../../template/Layout";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ContaPagarForm } from "../../../../modules/Financeiro/ContasPagar/components/ContaPagarForm";
import { criarContaPagarService, type ContaPagarPayload } from "../../../../modules/Financeiro/ContasPagar/services/contasPagarService";

const NovoPagamento: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (payload: ContaPagarPayload) => {
    try {
      setSubmitting(true);
      await criarContaPagarService(payload);
      toast.success("Conta a pagar cadastrada com sucesso");
      navigate("/financeiro/pagar");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao cadastrar conta a pagar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <ContaPagarForm submitLabel="Nova Conta a Pagar" submitting={submitting} onSubmit={handleSubmit} />
    </Layout>
  );
};

export default NovoPagamento;
