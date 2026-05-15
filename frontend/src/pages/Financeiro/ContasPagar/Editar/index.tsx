import React, { useEffect, useState } from "react";
import Layout from "../../../../template/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Skeleton } from "@mui/material";
import { ContaPagarForm } from "../../../../modules/Financeiro/ContasPagar/components/ContaPagarForm";
import {
  atualizarContaPagarService,
  buscarContaPagarPorIdService,
  type ContaPagarPayload,
} from "../../../../modules/Financeiro/ContasPagar/services/contasPagarService";

const EditarPagamento: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [conta, setConta] = useState<any>(null);

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

  const handleSubmit = async (payload: ContaPagarPayload) => {
    try {
      if (!id) return;
      setSubmitting(true);
      await atualizarContaPagarService(id, payload);
      toast.success("Conta a pagar atualizada com sucesso");
      navigate("/financeiro/pagar");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao atualizar conta a pagar");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Skeleton variant="rounded" width="100%" height={640} sx={{ borderRadius: "16px" }} />
      </Layout>
    );
  }

  return (
    <Layout>
      <ContaPagarForm
        submitLabel="Editar Conta a Pagar"
        initialData={conta}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </Layout>
  );
};

export default EditarPagamento;
