import React from "react";
import { Box, Typography } from "@mui/material";
import { Button, Input, Select } from "antd";
import { FilterAltOutlined, FilterListOff, Search } from "@mui/icons-material";
import type { FiltrosPlanoConta } from "../../services/planosContasService";
import { CONTA_MAE_OPTIONS } from "../../constants/contaMaeOptions";

interface PlanosContasFiltersProps {
  filtros: FiltrosPlanoConta;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosPlanoConta>>;
  onBuscar: () => void;
  onLimpar: () => void;
}

export const PlanosContasFilters: React.FC<PlanosContasFiltersProps> = ({
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          placeholder="Nome"
          value={filtros.termo || ""}
          onChange={(event) => setFiltros((prev) => ({ ...prev, termo: event.target.value }))}
          style={{ height: 40, borderRadius: 8 }}
        />

        <Select
          placeholder="Conta mãe"
          value={filtros.conta_mae || undefined}
          onChange={(value) => setFiltros((prev) => ({ ...prev, conta_mae: value }))}
          allowClear
          style={{ height: 40 }}
          options={CONTA_MAE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
        />
      </div>

      <div className="mt-2 flex gap-3 justify-end border-t border-[#F1F5F9] pt-4">
        <Button icon={<FilterListOff fontSize="small" />} onClick={onLimpar} style={{ height: 40, borderRadius: 8, fontWeight: 600 }}>
          Limpar Filtros
        </Button>
        <Button type="primary" icon={<Search fontSize="small" />} onClick={onBuscar} style={{ height: 40, borderRadius: 8, fontWeight: 600, background: "#5B21B6", borderColor: "#5B21B6" }}>
          Aplicar Filtros
        </Button>
      </div>
    </Box>
  );
};
