import React from "react";
import { Box, Typography } from "@mui/material";
import { Button, Input } from "antd";
import { FilterAltOutlined, FilterListOff, Search } from "@mui/icons-material";
import type { FiltrosContaBancaria } from "../../services/contasBancariasService";

interface ContasBancariasFiltersProps {
  filtros: FiltrosContaBancaria;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosContaBancaria>>;
  onBuscar: () => void;
  onLimpar: () => void;
}

export const ContasBancariasFilters: React.FC<ContasBancariasFiltersProps> = ({
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

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Input
          placeholder="Nome"
          value={filtros.termo || ""}
          onChange={(event) => setFiltros((prev) => ({ ...prev, termo: event.target.value }))}
          style={{ height: 40, borderRadius: 8 }}
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
