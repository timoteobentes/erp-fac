import React from "react";
import { Typography } from "@mui/material";
import Layout from "../../../../template/Layout";
import { CategoriaForm } from "../../../../modules/Cadastros/Categorias/components/CategoriaForm";
import { useCategorias } from "../../../../modules/Cadastros/Categorias/hooks/useCategorias";

const NovaCategoria: React.FC = () => {
  const { criarCategoria, loading } = useCategorias();

  return (
    <Layout>
      <div className="mb-8">
        <Typography variant="h4" fontWeight={800} color="#0F172A">Nova Categoria</Typography>
        <Typography variant="body2" color="#64748B">Cadastre uma categoria para classificar produtos.</Typography>
      </div>
      <CategoriaForm loading={loading} onSubmit={criarCategoria} />
    </Layout>
  );
};

export default NovaCategoria;
