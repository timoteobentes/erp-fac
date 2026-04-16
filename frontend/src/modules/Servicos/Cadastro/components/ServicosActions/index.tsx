import { Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const ServicosActions = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-end mb-4">
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => navigate('/servicos/cadastro/novo')}
        sx={{
          backgroundColor: '#9842F6',
          textTransform: 'none',
          '&:hover': { backgroundColor: '#7E2EDF' }
        }}
      >
        Novo Serviço
      </Button>
    </div>
  );
};
