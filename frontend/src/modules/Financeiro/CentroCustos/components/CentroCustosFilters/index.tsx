import React from "react";
import { Box, Typography } from "@mui/material";
import { Button, Input, Select } from "antd";
import { FilterAltOutlined, FilterListOff, Search } from "@mui/icons-material";
import type { FiltrosCentroCusto } from "../../services/centroCustosService";

interface CentroCustosFiltersProps {
  filtros: FiltrosCentroCusto;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosCentroCusto>>;
  onBuscar: () => void;
  onLimpar: () => void;
}

export const CentroCustosFilters: React.FC<CentroCustosFiltersProps> = ({
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
          placeholder="Status"
          value={filtros.status || undefined}
          onChange={(value) => setFiltros((prev) => ({ ...prev, status: value }))}
          allowClear
          style={{ height: 40 }}
          options={[
            { value: "ATIVO", label: "Ativo" },
            { value: "INATIVO", label: "Inativo" },
          ]}
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
