import React from 'react';
import {
  FormControl, InputLabel, Select, MenuItem, TextField, Button, Box, Typography,
  type SelectChangeEvent
} from '@mui/material';
import { DatePicker } from 'antd';
import { Search, FilterListOff, FilterAltOutlined } from '@mui/icons-material';
import dayjs from 'dayjs';

export interface FiltrosFornecedoresType {
  tipo_fornecedor: string;
  nome: string;
  cpf_cnpj: string;
  email: string;
  responsavel_compras: string;
  ramo_atividade: string;
  situacao: string;
  data_inicio: string;
  data_fim: string;
}

interface FornecedoresFiltersProps {
  filtros: FiltrosFornecedoresType;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosFornecedoresType>>;
  onBuscar: () => void;
  onLimpar: () => void;
}

const premiumInputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#F8FAFC',
    transition: 'all 0.2s ease-in-out',
    '& fieldset': { borderColor: '#E2E8F0' },
    '&:hover fieldset': { borderColor: '#CBD5E1' },
    '&.Mui-focused': {
      backgroundColor: '#FFFFFF',
      boxShadow: '0 0 0 3px rgba(91, 33, 182, 0.1)',
    },
    '&.Mui-focused fieldset': { borderColor: '#5B21B6', borderWidth: '1px' },
  }
};

export const FornecedoresFilters: React.FC<FornecedoresFiltersProps> = ({
  filtros,
  setFiltros,
  onBuscar,
  onLimpar
}) => {
  const handleChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFiltros(prev => ({ ...prev, [name as keyof FiltrosFornecedoresType]: value }));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFiltros(prev => ({ ...prev, [name as keyof FiltrosFornecedoresType]: value }));
  };

  const handleDateChange = (field: 'data_inicio' | 'data_fim', date: dayjs.Dayjs | null) => {
    setFiltros(prev => ({ ...prev, [field]: date ? date.format('YYYY-MM-DD') : '' }));
  };

  return (
    <Box className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2 text-[#475569]">
        <FilterAltOutlined fontSize="small" />
        <Typography variant="subtitle2" fontWeight={600} className="uppercase tracking-wider text-xs">
          Filtros Avançados
        </Typography>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <FormControl fullWidth size="small" sx={premiumInputStyles}>
          <InputLabel id="tipo-fornecedor-filtro-label">Tipo</InputLabel>
          <Select
            labelId="tipo-fornecedor-filtro-label"
            name="tipo_fornecedor"
            value={filtros.tipo_fornecedor}
            label="Tipo"
            onChange={handleChange}
          >
            <MenuItem value=""><em>TODOS</em></MenuItem>
            <MenuItem value="PJ">PESSOA JURÍDICA</MenuItem>
            <MenuItem value="PF">PESSOA FÍSICA</MenuItem>
            <MenuItem value="estrangeiro">ESTRANGEIRO</MenuItem>
          </Select>
        </FormControl>

        <TextField fullWidth name="nome" label="Nome / Razão Social" value={filtros.nome} onChange={handleInputChange} size="small" sx={premiumInputStyles} />
        <TextField fullWidth name="cpf_cnpj" label="CPF / CNPJ / Documento" value={filtros.cpf_cnpj} onChange={handleInputChange} size="small" sx={premiumInputStyles} />
        <TextField fullWidth name="email" label="E-mail" value={filtros.email} onChange={handleInputChange} size="small" sx={premiumInputStyles} />
        <TextField fullWidth name="responsavel_compras" label="Responsável compras" value={filtros.responsavel_compras} onChange={handleInputChange} size="small" sx={premiumInputStyles} />
        <TextField fullWidth name="ramo_atividade" label="Ramo de atividade" value={filtros.ramo_atividade} onChange={handleInputChange} size="small" sx={premiumInputStyles} />

        <FormControl fullWidth size="small" sx={premiumInputStyles}>
          <InputLabel id="situacao-fornecedor-filtro-label">Situação</InputLabel>
          <Select
            labelId="situacao-fornecedor-filtro-label"
            name="situacao"
            value={filtros.situacao}
            label="Situação"
            onChange={handleChange}
          >
            <MenuItem value=""><em>TODOS</em></MenuItem>
            <MenuItem value="ativo">ATIVO</MenuItem>
            <MenuItem value="inativo">INATIVO</MenuItem>
          </Select>
        </FormControl>

        <DatePicker
          placeholder="Data cadastro (início)"
          format="DD/MM/YYYY"
          value={filtros.data_inicio ? dayjs(filtros.data_inicio) : null}
          onChange={(date) => handleDateChange('data_inicio', date)}
          style={{ width: '100%', height: '40px', borderRadius: '8px', backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
        />

        <DatePicker
          placeholder="Data cadastro (fim)"
          format="DD/MM/YYYY"
          value={filtros.data_fim ? dayjs(filtros.data_fim) : null}
          onChange={(date) => handleDateChange('data_fim', date)}
          style={{ width: '100%', height: '40px', borderRadius: '8px', backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
        />
      </div>

      <div className="mt-2 flex gap-3 justify-end border-t border-[#F1F5F9] pt-4">
        <Button
          variant="outlined"
          startIcon={<FilterListOff />}
          onClick={onLimpar}
          sx={{
            borderColor: '#E2E8F0',
            color: '#64748B',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '8px',
            px: 3,
            '&:hover': { borderColor: '#CBD5E1', backgroundColor: '#F8FAFC', color: '#0F172A' }
          }}
        >
          Limpar Filtros
        </Button>
        <Button
          variant="contained"
          startIcon={<Search />}
          onClick={onBuscar}
          sx={{
            background: 'linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)',
            color: '#ffffff',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '8px',
            px: 4,
            boxShadow: '0 4px 14px 0 rgba(91, 33, 182, 0.25)',
            '&:hover': { background: 'linear-gradient(90deg, #28024D 0%, #4C1D95 100%)', boxShadow: '0 6px 20px rgba(91, 33, 182, 0.3)' }
          }}
        >
          Aplicar Filtros
        </Button>
      </div>
    </Box>
  );
};
