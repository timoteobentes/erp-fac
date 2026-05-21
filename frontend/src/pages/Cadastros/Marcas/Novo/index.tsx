import React from "react";
import { Typography } from "@mui/material";
import Layout from "../../../../template/Layout";
import { MarcaForm } from "../../../../modules/Cadastros/Marcas/components/MarcaForm";
import { useMarcas } from "../../../../modules/Cadastros/Marcas/hooks/useMarcas";

const NovaMarca: React.FC = () => {
  const { criarMarca, loading } = useMarcas();

  return (
    <Layout>
      <div className="mb-8">
        <Typography variant="h4" fontWeight={800} color="#0F172A">Nova Marca</Typography>
        <Typography variant="body2" color="#64748B">Cadastre uma marca para classificar produtos.</Typography>
      </div>
      <MarcaForm loading={loading} onSubmit={criarMarca} />
    </Layout>
  );
};

export default NovaMarca;
