import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { Servico } from '../../schemas/servicoSchema';

interface TabelaServicosProps {
  servicos: Servico[];
  onDelete: (id: number) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
};

export const TabelaServicos = ({ servicos, onDelete }: TabelaServicosProps) => {
  const navigate = useNavigate();

  return (
    <TableContainer component={Paper} elevation={0} className="border border-gray-200">
      <Table sx={{ minWidth: 650 }} aria-label="tabela de serviços">
        <TableHead>
          <TableRow className="bg-gray-50">
            <TableCell sx={{ fontWeight: 'bold' }}>Nome do Serviço</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Cód. LC 116</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>CNAE</TableCell>
            <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Alíquota ISS (%)</TableCell>
            <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Valor Padrão</TableCell>
            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Situação</TableCell>
            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {servicos.length > 0 ? servicos.map((servico) => (
            <TableRow key={servico.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th" scope="row">
                {servico.nome}
              </TableCell>
              <TableCell>{servico.codigo_lc116}</TableCell>
              <TableCell>{servico.cnae || '-'}</TableCell>
              <TableCell sx={{ textAlign: 'right' }}>{Number(servico.aliquota_iss).toFixed(2)}%</TableCell>
              <TableCell sx={{ textAlign: 'right' }}>{formatCurrency(servico.valor_padrao || 0)}</TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${servico.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {servico.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </TableCell>
              <TableCell sx={{ textAlign: 'center' }}>
                <IconButton 
                  color="warning" 
                  onClick={() => servico.id && navigate(`/servicos/cadastro/${servico.id}/editar`)}
                >
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton 
                  color="error" 
                  onClick={() => servico.id && onDelete(servico.id)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                Nenhum serviço encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
