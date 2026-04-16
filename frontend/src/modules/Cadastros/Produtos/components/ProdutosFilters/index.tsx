import React from 'react';
import {
  FormControl, InputLabel, Select, MenuItem, TextField, Button, Box, Typography,
  type SelectChangeEvent
} from '@mui/material';
import { Search, FilterListOff, FilterAltOutlined } from '@mui/icons-material';

// Tipagem dos filtros
export interface FiltrosType {
  tipo: string;
  codigo: string;
  nome: string;
  fornecedor: string;
  marca: string;
  modelo: string;
  situacao: string;
}

interface ProdutosFiltersProps {
  filtros: FiltrosType;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosType>>;
  onBuscar: () => void;
  onLimpar: () => void;
}

// Estilo Premium B2B para os Inputs do MUI
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

export const ProdutosFilters: React.FC<ProdutosFiltersProps> = ({
  filtros,
  setFiltros,
  onBuscar,
  onLimpar
}) => {
  
  const handleChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFiltros(prev => ({ ...prev, [name as keyof FiltrosType]: value }));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    // Higiene: Força tudo a maiúsculas para manter a consistência da pesquisa
    setFiltros(prev => ({ ...prev, [name as keyof FiltrosType]: value }));
  };

  return (
    <Box className='flex flex-col gap-4'>
      
      <div className="flex items-center gap-2 mb-2 text-[#475569]">
        <FilterAltOutlined fontSize="small" />
        <Typography variant="subtitle2" fontWeight={600} className="uppercase tracking-wider text-xs">
          Filtros Avançados
        </Typography>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        
        <FormControl fullWidth size="small" sx={premiumInputStyles}>
          <InputLabel id="tipo-filtro-label">Grupo</InputLabel>
          <Select
            labelId="tipo-filtro-label"
            name="tipo"
            value={filtros.tipo}
            label="Grupo"
            onChange={handleChange}
          >
            <MenuItem value=""><em>TODOS</em></MenuItem>
            <MenuItem value="produtos">PRODUTOS ACABADOS</MenuItem>
            <MenuItem value="servicos">SERVIÇOS</MenuItem>
            <MenuItem value="materiais">MATÉRIAS-PRIMAS</MenuItem>
          </Select>
        </FormControl>

        <TextField fullWidth name="codigo" label='Código ou EAN' value={filtros.codigo} onChange={handleInputChange} size="small" sx={premiumInputStyles} />
        <TextField fullWidth name="nome" label='Nome do Produto' value={filtros.nome} onChange={handleInputChange} size="small" sx={premiumInputStyles} />
        <TextField fullWidth name="fornecedor" label='Fornecedor' value={filtros.fornecedor} onChange={handleInputChange} size="small" sx={premiumInputStyles} />
        <TextField fullWidth name="marca" label='Marca' value={filtros.marca} onChange={handleInputChange} size="small" sx={premiumInputStyles} />
        <TextField fullWidth name="modelo" label='Modelo' value={filtros.modelo} onChange={handleInputChange} size="small" sx={premiumInputStyles} />

        <FormControl fullWidth size="small" sx={premiumInputStyles}>
          <InputLabel id="situacao-filtro-label">Situação</InputLabel>
          <Select
            labelId="situacao-filtro-label"
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
      </div>

      <div className='mt-2 flex gap-3 justify-end border-t border-[#F1F5F9] pt-4'>
        <Button
          variant='outlined'
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
          variant='contained'
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