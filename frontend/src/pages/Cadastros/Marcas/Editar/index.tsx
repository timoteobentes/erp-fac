import React, { useEffect, useState } from "react";
import { Skeleton, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import Layout from "../../../../template/Layout";
import { MarcaForm } from "../../../../modules/Cadastros/Marcas/components/MarcaForm";
import { useMarcas } from "../../../../modules/Cadastros/Marcas/hooks/useMarcas";

const EditarMarca: React.FC = () => {
  const { id } = useParams();
  const { marca, fetchMarca, atualizarMarca, loading } = useMarcas();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (id) fetchMarca(id).finally(() => setLoaded(true));
  }, [id]);

  return (
    <Layout>
      <div className="mb-8">
        <Typography variant="h4" fontWeight={800} color="#0F172A">Editar Marca</Typography>
        <Typography variant="body2" color="#64748B">Atualize o nome da marca.</Typography>
      </div>
      {!loaded ? <Skeleton variant="rounded" height={220} /> : (
        <MarcaForm initialNome={marca?.nome || ""} loading={loading} onSubmit={(dados) => atualizarMarca(String(id), dados)} />
      )}
    </Layout>
  );
};

export default EditarMarca;
