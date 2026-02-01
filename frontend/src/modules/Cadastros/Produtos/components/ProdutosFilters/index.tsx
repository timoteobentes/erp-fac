import React from 'react';
import {
  FormControl, InputLabel, Select, MenuItem, TextField, Button,
  type SelectChangeEvent
} from '@mui/material';
import { Check, Close } from '@mui/icons-material';

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
    setFiltros(prev => ({ ...prev, [name as keyof FiltrosType]: value }));
  };

  return (
    <div className='bg-[#E9DEF6] rounded-lg p-4 mb-8'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <FormControl fullWidth size="small">
          <InputLabel id="tipo-filtro-label">Grupo</InputLabel>
          <Select
            labelId="tipo-filtro-label"
            name="tipo"
            value={filtros.tipo}
            label="Tipo"
            onChange={handleChange}
          >
            <MenuItem value="">TODOS</MenuItem>
            <MenuItem value="PJ">PESSOA JURÍDICA</MenuItem>
            <MenuItem value="PF">PESSOA FÍSICA</MenuItem>
            <MenuItem value="estrangeiro">ESTRANGEIRO</MenuItem>
          </Select>
        </FormControl>

        <TextField fullWidth name="codigo" label='Código' value={filtros.codigo} onChange={handleInputChange} size="small" />
        <TextField fullWidth name="nome" label='Nome' value={filtros.nome} onChange={handleInputChange} size="small" />
        <TextField fullWidth name="fornecedor" label='Fornecedor' value={filtros.fornecedor} onChange={handleInputChange} size="small" />
        <TextField fullWidth name="marca" label='Marca' value={filtros.marca} onChange={handleInputChange} size="small" />
        <TextField fullWidth name="modelo" label='Modelo' value={filtros.modelo} onChange={handleInputChange} size="small" />

        <FormControl fullWidth size="small">
          <InputLabel id="situacao-filtro-label">Situação</InputLabel>
          <Select
            labelId="situacao-filtro-label"
            name="situacao"
            value={filtros.situacao}
            label="Situação"
            onChange={handleChange}
          >
            <MenuItem value="">TODOS</MenuItem>
            <MenuItem value="ativo">ATIVO</MenuItem>
            <MenuItem value="inativo">INATIVO</MenuItem>
            <MenuItem value="bloqueado">BLOQUEADO</MenuItem>
          </Select>
        </FormControl>
      </div>

      <div className='mt-4 flex gap-2'>
        <Button
          variant='contained'
          startIcon={<Check />}
          color='success'
          sx={{ color: '#FFFFFF' }}
          onClick={onBuscar}
        >
          Buscar
        </Button>
        <Button
          variant='contained'
          startIcon={<Close />}
          color='error'
          onClick={onLimpar}
        >
          Limpar
        </Button>
      </div>
    </div>
  );
};