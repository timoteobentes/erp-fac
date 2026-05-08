import React from "react";
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { FilterAltOutlined, FilterListOff, Search } from "@mui/icons-material";
import type { FiltrosCategoriaDre } from "../../services/categoriasDreService";
import {
  ATIVO_OPTIONS,
  GRUPO_CATEGORIA_DRE_OPTIONS,
  TIPO_CATEGORIA_DRE_OPTIONS,
  premiumInputStyles,
} from "../../constants/categoriaDreOptions";

interface CategoriasDreFiltersProps {
  filtros: FiltrosCategoriaDre;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosCategoriaDre>>;
  onBuscar: () => void;
  onLimpar: () => void;
}

export const CategoriasDreFilters: React.FC<CategoriasDreFiltersProps> = ({
  filtros,
  setFiltros,
  onBuscar,
  onLimpar,
}) => {
  return (
    <Box className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2 text-[#475569]">
        <FilterAltOutlined fontSize="small" />
        <Typography variant="subtitle2" fontWeight={600} className="uppercase tracking-wider text-xs">
          Filtros Avancados
        </Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <TextField
          fullWidth
          size="small"
          label="Nome"
          value={filtros.termo || ""}
          onChange={(event) => setFiltros((prev) => ({ ...prev, termo: event.target.value }))}
          sx={premiumInputStyles}
        />

        <FormControl fullWidth size="small" sx={premiumInputStyles}>
          <InputLabel id="grupo-categoria-dre-filtro-label">Grupo</InputLabel>
          <Select
            labelId="grupo-categoria-dre-filtro-label"
            label="Grupo"
            value={filtros.grupo || ""}
            onChange={(event) => setFiltros((prev) => ({ ...prev, grupo: event.target.value || undefined }))}
          >
            <MenuItem value="">Todos</MenuItem>
            {GRUPO_CATEGORIA_DRE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={premiumInputStyles}>
          <InputLabel id="tipo-categoria-dre-filtro-label">Tipo</InputLabel>
          <Select
            labelId="tipo-categoria-dre-filtro-label"
            label="Tipo"
            value={filtros.tipo || ""}
            onChange={(event) => setFiltros((prev) => ({ ...prev, tipo: event.target.value || undefined }))}
          >
            <MenuItem value="">Todos</MenuItem>
            {TIPO_CATEGORIA_DRE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small" sx={premiumInputStyles}>
          <InputLabel id="ativo-categoria-dre-filtro-label">Ativo</InputLabel>
          <Select
            labelId="ativo-categoria-dre-filtro-label"
            label="Ativo"
            value={typeof filtros.ativo === "boolean" ? String(filtros.ativo) : ""}
            onChange={(event) =>
              setFiltros((prev) => ({
                ...prev,
                ativo: event.target.value === "" ? undefined : event.target.value === "true",
              }))
            }
          >
            <MenuItem value="">Todos</MenuItem>
            {ATIVO_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div className="mt-2 flex gap-3 justify-end border-t border-[#F1F5F9] pt-4">
        <Button variant="outlined" startIcon={<FilterListOff />} onClick={onLimpar} sx={{ borderColor: "#E2E8F0", color: "#64748B", textTransform: "none", fontWeight: 600, borderRadius: "8px", px: 3, "&:hover": { borderColor: "#CBD5E1", backgroundColor: "#F8FAFC", color: "#0F172A" } }}>
          Limpar Filtros
        </Button>
        <Button variant="contained" startIcon={<Search />} onClick={onBuscar} sx={{ background: "linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)", color: "#ffffff", textTransform: "none", fontWeight: 600, borderRadius: "8px", px: 4, boxShadow: "0 4px 14px 0 rgba(91, 33, 182, 0.25)", "&:hover": { background: "linear-gradient(90deg, #28024D 0%, #4C1D95 100%)", boxShadow: "0 6px 20px rgba(91, 33, 182, 0.3)" } }}>
          Aplicar Filtros
        </Button>
      </div>
    </Box>
  );
};
