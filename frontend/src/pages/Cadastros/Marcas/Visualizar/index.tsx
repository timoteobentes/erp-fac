import React, { useEffect } from "react";
import { Box, Button, Skeleton, Typography } from "@mui/material";
import { ArrowBack, EditOutlined } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../../template/Layout";
import { useMarcas } from "../../../../modules/Cadastros/Marcas/hooks/useMarcas";

const VisualizarMarca: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { marca, fetchMarca, loading } = useMarcas();

  useEffect(() => {
    if (id) fetchMarca(id);
  }, [id]);

  return (
    <Layout>
      <div className="flex justify-between items-start gap-4 mb-8">
        <div>
          <Typography variant="h4" fontWeight={800} color="#0F172A">Marca</Typography>
          <Typography variant="body2" color="#64748B">Detalhes do cadastro.</Typography>
        </div>
        <div className="flex gap-2">
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate("/cadastros/marcas")} sx={{ textTransform: "none" }}>Voltar</Button>
          <Button variant="contained" startIcon={<EditOutlined />} onClick={() => navigate(`/cadastros/marcas/editar/${id}`)} sx={{ textTransform: "none", backgroundColor: "#5B21B6" }}>Editar</Button>
        </div>
      </div>

      {loading ? <Skeleton variant="rounded" height={180} /> : (
        <Box sx={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", p: 4 }}>
          <Typography variant="caption" color="#64748B" fontWeight={700} sx={{ textTransform: "uppercase" }}>Nome</Typography>
          <Typography variant="h6" color="#0F172A" mt={1}>{marca?.nome || "-"}</Typography>
        </Box>
      )}
    </Layout>
  );
};

export default VisualizarMarca;
