import React from 'react';
import {
  FormControl, InputLabel, Select, MenuItem, TextField, Button,
  type SelectChangeEvent
} from '@mui/material';
import { DatePicker } from 'antd';
import { Check, Close } from '@mui/icons-material';
import dayjs from 'dayjs';

// Tipagem dos filtros
export interface FiltrosType {
  tipo: string;
  codigo: string;
  nome: string;
  cpfCnpj: string;
  telefone: string;
  email: string;
  cidade: string;
  estado: string;
  vendedor: string;
  situacao: string;
  data_inicio: string;
  data_fim: string;
}

interface ClientesFiltersProps {
  filtros: FiltrosType;
  setFiltros: React.Dispatch<React.SetStateAction<FiltrosType>>;
  onBuscar: () => void;
  onLimpar: () => void;
}

export const ClientesFilters: React.FC<ClientesFiltersProps> = ({
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

  const handleDateChange = (field: 'data_inicio' | 'data_fim', date: dayjs.Dayjs | null) => {
    setFiltros(prev => ({ ...prev, [field]: date ? date.format('YYYY-MM-DD') : '' }));
  };

  return (
    <div className='bg-[#E9DEF6] rounded-lg p-4 mb-8'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <FormControl fullWidth size="small">
          <InputLabel id="tipo-filtro-label">Tipo</InputLabel>
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
        <TextField fullWidth name="cpfCnpj" label='CPF/CNPJ' value={filtros.cpfCnpj} onChange={handleInputChange} size="small" />
        <TextField fullWidth name="telefone" label='Telefone' value={filtros.telefone} onChange={handleInputChange} size="small" />
        <TextField fullWidth name="email" label='E-mail' value={filtros.email} onChange={handleInputChange} size="small" />
        <TextField fullWidth name="cidade" label='Cidade' value={filtros.cidade} onChange={handleInputChange} size="small" />
        <TextField fullWidth name="estado" label='Estado' value={filtros.estado} onChange={handleInputChange} size="small" />
        <TextField fullWidth name="vendedor" label='Vendedor' value={filtros.vendedor} onChange={handleInputChange} size="small" />

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

        <DatePicker
          placeholder="Data início"
          format="DD/MM/YYYY"
          value={filtros.data_inicio ? dayjs(filtros.data_inicio) : null}
          onChange={(date) => handleDateChange('data_inicio', date)}
          style={{ width: '100%' }}
        />
        
        <DatePicker
          placeholder="Data fim"
          format="DD/MM/YYYY"
          value={filtros.data_fim ? dayjs(filtros.data_fim) : null}
          onChange={(date) => handleDateChange('data_fim', date)}
          style={{ width: '100%' }}
        />
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