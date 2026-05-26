import React, { useState } from 'react';
import { Alert, Button, CircularProgress } from '@mui/material';
import { useAuth } from '../../modules/Login/context/AuthContext';
import api from '../../api/api';

const SubscriptionBanner: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!user?.validade_assinatura) return null;

  const msRestantes = new Date(user.validade_assinatura).getTime() - Date.now();
  const diasRestantes = Math.ceil(msRestantes / (1000 * 60 * 60 * 24));

  if (diasRestantes > 7) return null;

  const handleRenovar = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/payments/renovar', { usuarioId: user.id });
      if (data?.checkoutUrl) window.location.href = data.checkoutUrl;
    } catch {
      // silently fall through — user can retry
    } finally {
      setLoading(false);
    }
  };

  const severity = diasRestantes <= 0 ? 'error' : diasRestantes <= 3 ? 'warning' : 'info';
  const mensagem =
    diasRestantes <= 0
      ? 'Sua assinatura venceu. Renove agora para retomar o acesso.'
      : `Sua assinatura vence em ${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''}. Renove para não perder o acesso.`;

  return (
    <Alert
      severity={severity}
      sx={{ borderRadius: 0, py: 0.5 }}
      action={
        <Button
          size="small"
          color="inherit"
          variant="outlined"
          disabled={loading}
          onClick={handleRenovar}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : undefined}
          sx={{ whiteSpace: 'nowrap', fontWeight: 600, textTransform: 'none' }}
        >
          {loading ? 'Aguarde...' : 'Renovar agora'}
        </Button>
      }
    >
      {mensagem}
    </Alert>
  );
};

export default SubscriptionBanner;
