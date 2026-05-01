import React from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import { FilterAltOutlined, FilterListOff, Search } from "@mui/icons-material";
import type { FiltrosPlanoConta } from "../../services/planosContasService";
import { CONTA_MAE_OPTIONS } from "../../constants/contaMaeOptions";

interface PlanosContasFiltersProps {
  filtros: FiltrosPlanoConta;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosPlanoConta>>;
  onBuscar: () => void;
  onLimpar: () => void;
}

const premiumInputStyles = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: "#F8FAFC",
    transition: "all 0.2s ease-in-out",
    "& fieldset": { borderColor: "#E2E8F0" },
    "&:hover fieldset": { borderColor: "#CBD5E1" },
    "&.Mui-focused": {
      backgroundColor: "#FFFFFF",
      boxShadow: "0 0 0 3px rgba(91, 33, 182, 0.1)",
    },
    "&.Mui-focused fieldset": { borderColor: "#5B21B6", borderWidth: "1px" },
  },
};

export const PlanosContasFilters: React.FC<PlanosContasFiltersProps> = ({
  filtros,
  setFiltros,
  onBuscar,
  onLimpar,
}) => {
  const handleContaMaeChange = (event: SelectChangeEvent) => {
    setFiltros((prev) => ({ ...prev, conta_mae: event.target.value }));
  };

  return (
    <Box className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2 text-[#475569]">
        <FilterAltOutlined fontSize="small" />
        <Typography variant="subtitle2" fontWeight={600} className="uppercase tracking-wider text-xs">
          Filtros Avancados
        </Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextField
          fullWidth
          size="small"
          label="Nome"
          value={filtros.termo || ""}
          onChange={(event) => setFiltros((prev) => ({ ...prev, termo: event.target.value }))}
          sx={premiumInputStyles}
        />

        <FormControl fullWidth size="small" sx={premiumInputStyles}>
          <InputLabel id="conta-mae-plano-conta-label">Conta mae</InputLabel>
          <Select labelId="conta-mae-plano-conta-label" value={filtros.conta_mae || ""} label="Conta mae" onChange={handleContaMaeChange}>
            <MenuItem value="">Todas as Contas mae</MenuItem>
            {CONTA_MAE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
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
