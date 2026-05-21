import React, { useState } from "react";
import { Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import { ArrowBack, Check } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface MarcaFormProps {
  initialNome?: string;
  loading?: boolean;
  onSubmit: (dados: { nome: string }) => Promise<void> | void;
}

export const MarcaForm: React.FC<MarcaFormProps> = ({ initialNome = "", loading = false, onSubmit }) => {
  const navigate = useNavigate();
  const [nome, setNome] = useState(initialNome);
  const [erro, setErro] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      setErro("Informe o nome da marca.");
      return;
    }
    setErro("");
    await onSubmit({ nome: nomeLimpo });
  };

  return (
    <form onSubmit={submit}>
      <Box sx={{ backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", p: 4 }}>
        <Typography variant="h6" fontWeight={700} color="#0F172A" mb={3}>
          Dados da Marca
        </Typography>

        <TextField
          fullWidth
          label="Nome"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          error={!!erro}
          helperText={erro}
          autoFocus
        />

        <Box className="flex justify-end gap-3 mt-8">
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate("/cadastros/marcas")} sx={{ textTransform: "none" }}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Check />} sx={{ textTransform: "none", backgroundColor: "#5B21B6" }}>
            Salvar
          </Button>
        </Box>
      </Box>
    </form>
  );
};
