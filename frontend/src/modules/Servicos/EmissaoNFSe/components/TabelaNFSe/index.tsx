import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';
import type { NotaFiscalServico } from '../../services/nfseService';

interface TabelaNFSeProps {
  notas: NotaFiscalServico[];
  isLoading: boolean;
}

export const TabelaNFSe: React.FC<TabelaNFSeProps> = ({ notas, isLoading }) => {
  if (isLoading) {
    return <div className="p-4 text-center">Buscando histórico de NFS-e...</div>;
  }

  if (!notas.length) {
    return <div className="p-8 text-center text-gray-500">Nenhuma nota fisca de serviço registrada ainda.</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rascunho': return 'default';
      case 'emitida': return 'success';
      case 'rejeitada': return 'error';
      case 'cancelada': return 'warning';
      default: return 'default';
    }
  };

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: '#f9fafb' }}>
            <TableCell sx={{ fontWeight: 'bold' }}>Data</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Serviço Prestado</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Valor Total</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {notas.map((nota) => (
            <TableRow key={nota.id} hover>
              <TableCell>
                {new Date(nota.criado_em).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </TableCell>
              <TableCell>{nota.cliente_nome || `Cliente #${nota.cliente_id}`}</TableCell>
              <TableCell>{nota.servico_nome || `Serviço #${nota.servico_id}`}</TableCell>
              <TableCell>
                {Number(nota.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </TableCell>
              <TableCell>
                <Chip 
                  label={nota.status} 
                  size="small"
                  color={getStatusColor(nota.status) as any}
                  variant="outlined"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
