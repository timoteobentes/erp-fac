import { Autocomplete, TextField } from "@mui/material";
import type { OpcaoFiscal } from "../services/produtoService";

interface FiscalAutocompleteProps {
  label: string;
  placeholder: string;
  value?: string | null;
  options: OpcaoFiscal[];
  sx?: object;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  onSelectOption?: (option: OpcaoFiscal) => void;
}

const getOptionLabel = (option: string | OpcaoFiscal) => {
  if (typeof option === "string") return option;
  const descricao = option.descricao ? ` - ${option.descricao}` : "";
  const categoria = option.categoria ? ` (${option.categoria})` : "";
  return `${option.codigo}${descricao}${categoria}`;
};

const FiscalAutocomplete = ({
  label,
  placeholder,
  value,
  options,
  sx,
  onChange,
  onSearch,
  onSelectOption
}: FiscalAutocompleteProps) => {
  const selectedValue = options.find((option) => option.codigo === value) || value || null;

  return (
    <Autocomplete
      freeSolo
      fullWidth
      options={options}
      value={selectedValue}
      filterOptions={(items) => items}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={(option, selected) => {
        if (typeof option === "string") return option === (typeof selected === "string" ? selected : selected.codigo);
        if (typeof selected === "string") return option.codigo === selected;
        return option.codigo === selected.codigo;
      }}
      onChange={(_, selected) => {
        if (typeof selected === "string") {
          onChange(selected);
          return;
        }

        onChange(selected?.codigo || "");
        if (selected) onSelectOption?.(selected);
      }}
      onInputChange={(_, inputValue, reason) => {
        if (reason !== "input") return;
        onChange(inputValue);
        onSearch(inputValue);
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder={placeholder} sx={sx} />
      )}
    />
  );
};

export default FiscalAutocomplete;
