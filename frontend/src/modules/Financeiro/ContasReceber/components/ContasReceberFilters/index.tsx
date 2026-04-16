import React from 'react';
import {
  FormControl, InputLabel, Select, MenuItem, Button, Box, Typography,
  type SelectChangeEvent
} from '@mui/material';
import { DatePicker } from 'antd';
import { Search, FilterListOff, FilterAltOutlined } from '@mui/icons-material';
import dayjs from 'dayjs';

interface ContasReceberFiltersProps {
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

export const ContasReceberFilters: React.FC<ContasReceberFiltersProps> = ({
  filtros,
  setFiltros,
  onBuscar,
  onLimpar
}) => {
  
  const handleChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFiltros((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field: 'data_vencimento_inicio' | 'data_vencimento_fim', date: dayjs.Dayjs | null) => {
    setFiltros((prev: any) => ({ ...prev, [field]: date ? date.format('YYYY-MM-DD') : '' }));
  };

  return (
    <Box className='flex flex-col gap-4'>
      
      <div className="flex items-center gap-2 mb-2 text-[#475569]">
        <FilterAltOutlined fontSize="small" />
        <Typography variant="subtitle2" fontWeight={600} className="uppercase tracking-wider text-xs">
          Filtros Avançados
        </Typography>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <FormControl fullWidth size="small" sx={premiumInputStyles}>
          <InputLabel id="status-filtro-label">Status da Cobrança</InputLabel>
          <Select
            labelId="status-filtro-label"
            name="status"
            value={filtros.status || ''}
            label="Status da Cobrança"
            onChange={handleChange}
          >
            <MenuItem value="">Todas as Situações</MenuItem>
            <MenuItem value="pendente">Pendente (A Receber)</MenuItem>
            <MenuItem value="recebido">Recebido (Pago pelo cliente)</MenuItem>
            <MenuItem value="atrasado">Em Atraso (Inadimplente)</MenuItem>
            <MenuItem value="cancelado">Cancelada</MenuItem>
          </Select>
        </FormControl>

        <DatePicker
          placeholder="Vencimento Início"
          format="DD/MM/YYYY"
          value={filtros.data_vencimento_inicio ? dayjs(filtros.data_vencimento_inicio) : null}
          onChange={(date) => handleDateChange('data_vencimento_inicio', date)}
          style={{ width: '100%', height: '40px', borderRadius: '8px', backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
        />
        
        <DatePicker
          placeholder="Vencimento Fim"
          format="DD/MM/YYYY"
          value={filtros.data_vencimento_fim ? dayjs(filtros.data_vencimento_fim) : null}
          onChange={(date) => handleDateChange('data_vencimento_fim', date)}
          style={{ width: '100%', height: '40px', borderRadius: '8px', backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
        />
      </div>

      <div className='mt-2 flex gap-3 justify-end border-t border-[#F1F5F9] pt-4'>
        <Button
          variant='outlined'
          startIcon={<FilterListOff />}
          onClick={onLimpar}
          sx={{ 
            borderColor: '#E2E8F0', 
            color: '#475569', 
            textTransform: 'none', 
            fontWeight: 600, 
            borderRadius: '8px',
            px: 4, py: 1,
            '&:hover': { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1', color: '#0F172A' }
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
            px: 6, py: 1,
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