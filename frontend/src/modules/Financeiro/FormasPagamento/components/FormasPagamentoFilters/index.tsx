import React from "react";
import { Box, Typography } from "@mui/material";
import { Button, Input, Select } from "antd";
import { FilterAltOutlined, FilterListOff, Search } from "@mui/icons-material";
import type { FiltrosFormaPagamento } from "../../services/formasPagamentoService";
import { DISPONIVEL_EM_OPTIONS, MODALIDADE_OPTIONS } from "../../constants/formaPagamentoOptions";

interface ContaBancariaOption {
  id: number;
  nome: string;
}

interface FormasPagamentoFiltersProps {
  filtros: FiltrosFormaPagamento;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosFormaPagamento>>;
  onBuscar: () => void;
  onLimpar: () => void;
  contasBancarias: ContaBancariaOption[];
}

export const FormasPagamentoFilters: React.FC<FormasPagamentoFiltersProps> = ({
  filtros,
  setFiltros,
  onBuscar,
  onLimpar,
  contasBancarias,
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
        <Input
          placeholder="Nome"
          value={filtros.termo || ""}
          onChange={(event) => setFiltros((prev) => ({ ...prev, termo: event.target.value }))}
          style={{ height: 40, borderRadius: 8 }}
        />

        <Select
          placeholder="Modalidade"
          value={filtros.modalidade || undefined}
          onChange={(value) => setFiltros((prev) => ({ ...prev, modalidade: value || undefined }))}
          allowClear
          style={{ height: 40 }}
          options={MODALIDADE_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
        />

        <Select
          placeholder="Disponível em"
          value={filtros.disponivel_em || undefined}
          onChange={(value) => setFiltros((prev) => ({ ...prev, disponivel_em: value || undefined }))}
          allowClear
          style={{ height: 40 }}
          options={DISPONIVEL_EM_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
        />

        <Select
          placeholder="Conta bancária"
          value={filtros.conta_bancaria_id ? String(filtros.conta_bancaria_id) : undefined}
          onChange={(value) => setFiltros((prev) => ({ ...prev, conta_bancaria_id: value ? Number(value) : undefined }))}
          allowClear
          style={{ height: 40 }}
          options={contasBancarias.map((conta) => ({ value: String(conta.id), label: conta.nome }))}
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
