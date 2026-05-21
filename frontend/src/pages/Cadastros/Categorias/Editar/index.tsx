import React, { useEffect, useState } from "react";
import { Skeleton, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import Layout from "../../../../template/Layout";
import { CategoriaForm } from "../../../../modules/Cadastros/Categorias/components/CategoriaForm";
import { useCategorias } from "../../../../modules/Cadastros/Categorias/hooks/useCategorias";

const EditarCategoria: React.FC = () => {
  const { id } = useParams();
  const { categoria, fetchCategoria, atualizarCategoria, loading } = useCategorias();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (id) fetchCategoria(id).finally(() => setLoaded(true));
  }, [id]);

  return (
    <Layout>
      <div className="mb-8">
        <Typography variant="h4" fontWeight={800} color="#0F172A">Editar Categoria</Typography>
        <Typography variant="body2" color="#64748B">Atualize o nome da categoria.</Typography>
      </div>
      {!loaded ? <Skeleton variant="rounded" height={220} /> : (
        <CategoriaForm initialNome={categoria?.nome || ""} loading={loading} onSubmit={(dados) => atualizarCategoria(String(id), dados)} />
      )}
    </Layout>
  );
};

export default EditarCategoria;
