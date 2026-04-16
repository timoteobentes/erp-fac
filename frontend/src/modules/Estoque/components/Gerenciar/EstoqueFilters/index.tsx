import React from 'react';
import {
  FormControl, InputLabel, Select, MenuItem, Button, Box, Typography,
  type SelectChangeEvent
} from '@mui/material';
import { Search, FilterListOff, FilterAltOutlined } from '@mui/icons-material';

interface EstoqueFiltersProps {
  filtros: any;
  setFiltros: React.Dispatch<React.SetStateAction<any>>;
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

export const EstoqueFilters: React.FC<EstoqueFiltersProps> = ({
  filtros,
  setFiltros,
  onBuscar,
  onLimpar
}) => {
  
  const handleChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFiltros((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <Box className='flex flex-col gap-4'>
      
      <div className="flex items-center gap-2 mb-2 text-[#475569]">
        <FilterAltOutlined fontSize="small" />
        <Typography variant="subtitle2" fontWeight={600} className="uppercase tracking-wider text-xs">
          Filtros Avançados
        </Typography>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <FormControl fullWidth size="small" sx={premiumInputStyles}>
          <InputLabel id="controla-estoque-label">Controla Estoque</InputLabel>
          <Select
            labelId="controla-estoque-label"
            name="movimenta_estoque"
            value={filtros.movimenta_estoque || ''}
            label="Controla Estoque"
            onChange={handleChange}
          >
            <MenuItem value=""><em>Todos os Produtos</em></MenuItem>
            <MenuItem value="sim">Sim</MenuItem>
            <MenuItem value="nao">Não</MenuItem>
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