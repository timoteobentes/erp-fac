import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { CheckCircle, HourglassBottom, ErrorOutline } from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { checkPaymentStatus } from '../../modules/Inicio/services/infinitypayService';

type PageState = 'loading' | 'success' | 'pending' | 'error';

const PagamentoRetorno: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [state, setState] = useState<PageState>('loading');
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const orderNsu = searchParams.get('order_nsu');
  const transactionNsu = searchParams.get('transaction_nsu') ?? undefined;
  const slug = searchParams.get('slug') ?? undefined;
  const captureMethod = searchParams.get('capture_method');
  const receiptParam = searchParams.get('receipt_url');

  useEffect(() => {
    const verify = async () => {
      if (!orderNsu) {
        setState('error');
        return;
      }

      try {
        const status = await checkPaymentStatus({ orderNsu, transactionNsu, slug });

        if (status?.paid) {
          // Atualiza dados do usuário no localStorage
          const stored = localStorage.getItem('user');
          if (stored) {
            const parsed = JSON.parse(stored);
            localStorage.setItem('user', JSON.stringify({ ...parsed, status: 'ativo' }));
          }
          setReceiptUrl(receiptParam || status?.receipt_url || null);
          setState('success');
        } else {
          setState('pending');
        }
      } catch {
        // Se a verificação falhar, ainda mostramos pending pois o webhook pode chegar
        setState('pending');
      }
    };

    verify();
  }, [orderNsu, transactionNsu, slug, receiptParam]);

  const handleGoToDashboard = () => {
    window.location.href = '/inicio';
  };

  if (state === 'loading') {
    return (
      <Box className="min-h-screen flex flex-col items-center justify-center gap-4">
        <CircularProgress size={48} sx={{ color: '#6B00A1' }} />
        <Typography variant="h6" color="text.secondary">
          Verificando pagamento...
        </Typography>
      </Box>
    );
  }

  if (state === 'success') {
    return (
      <Box className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle sx={{ fontSize: 60, color: '#2e7d32' }} />
        </div>
        <Typography variant="h4" fontWeight="bold" color="#2e7d32" gutterBottom>
          Pagamento Confirmado!
        </Typography>
        <Typography color="text.secondary" className="max-w-sm mb-6">
          Sua assinatura foi ativada com sucesso.
          {captureMethod === 'pix' ? ' Pagamento via PIX.' : captureMethod === 'credit_card' ? ' Pagamento via cartão de crédito.' : ''}
        </Typography>

        {receiptUrl && (
          <Button
            variant="outlined"
            href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ mb: 2, color: '#2e7d32', borderColor: '#2e7d32' }}
          >
            Ver Comprovante
          </Button>
        )}

        <Button
          variant="contained"
          size="large"
          onClick={handleGoToDashboard}
          sx={{ bgcolor: '#6B00A1', '&:hover': { bgcolor: '#3C0473' }, px: 6 }}
        >
          Acessar Painel
        </Button>
      </Box>
    );
  }

  if (state === 'pending') {
    return (
      <Box className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
          <HourglassBottom sx={{ fontSize: 60, color: '#f59e0b' }} />
        </div>
        <Typography variant="h4" fontWeight="bold" color="#92400e" gutterBottom>
          Pagamento em Processamento
        </Typography>
        <Typography color="text.secondary" className="max-w-sm mb-6">
          Seu pagamento está sendo processado. Assim que confirmado, você receberá o acesso ao sistema.
          Isso pode levar alguns minutos.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={handleGoToDashboard}
          sx={{ bgcolor: '#6B00A1', '&:hover': { bgcolor: '#3C0473' }, px: 6 }}
        >
          Voltar ao Painel
        </Button>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <ErrorOutline sx={{ fontSize: 60, color: '#dc2626' }} />
      </div>
      <Typography variant="h4" fontWeight="bold" color="#dc2626" gutterBottom>
        Não foi possível verificar
      </Typography>
      <Typography color="text.secondary" className="max-w-sm mb-6">
        Não conseguimos verificar o status do seu pagamento. Se você já pagou, aguarde alguns instantes
        e tente acessar o sistema normalmente.
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={() => navigate('/inicio')}
        sx={{ bgcolor: '#6B00A1', '&:hover': { bgcolor: '#3C0473' }, px: 6 }}
      >
        Voltar ao Painel
      </Button>
    </Box>
  );
};

export default PagamentoRetorno;
