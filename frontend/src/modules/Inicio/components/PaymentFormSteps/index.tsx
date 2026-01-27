import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { CreditCard, QrCode, Password } from '@mui/icons-material';
import { usePaymentForm } from '../../hooks/usePaymentForm';

interface PaymentFormStepsProps {
  onClose: () => void;
}

export const PaymentFormSteps = ({ onClose }: PaymentFormStepsProps) => {
  const {
    step,
    paymentData,
    handleSelectMethod,
    handleUpdateCartaoData,
    handleBack,
    handleNext,
    handleSubmit,
    handleReset,
  } = usePaymentForm();

  const steps = ['Selecionar Pagamento', 'Informações', 'Confirmação'];

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Selecione a forma de pagamento:
            </Typography>
            <Grid container spacing={3}>
              <Grid>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: paymentData.method === 'cartao' ? '2px solid #3C0473' : '1px solid #e0e0e0',
                    '&:hover': { borderColor: '#3C0473' }
                  }}
                  onClick={() => handleSelectMethod('cartao')}
                >
                  <CardContent sx={{ textAlign: 'center', minWidth: 150 }}>
                    <CreditCard sx={{ fontSize: 48, color: '#3C0473', mb: 2 }} />
                    <Typography variant="h6">Cartão</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Crédito
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: paymentData.method === 'pix' ? '2px solid #3C0473' : '1px solid #e0e0e0',
                    '&:hover': { borderColor: '#3C0473' }
                  }}
                  onClick={() => handleSelectMethod('pix')}
                >
                  <CardContent sx={{ textAlign: 'center', minWidth: 150 }}>
                    <QrCode sx={{ fontSize: 48, color: '#3C0473', mb: 2 }} />
                    <Typography variant="h6">PIX</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pagamento instantâneo
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: paymentData.method === 'boleto' ? '2px solid #3C0473' : '1px solid #e0e0e0',
                    '&:hover': { borderColor: '#3C0473' }
                  }}
                  onClick={() => handleSelectMethod('boleto')}
                >
                  <CardContent sx={{ textAlign: 'center', minWidth: 150 }}>
                    <Password sx={{ fontSize: 48, color: '#3C0473', mb: 2 }} />
                    <Typography variant="h6">Boleto</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pagamento em até 3 dias
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        if (paymentData.method === 'cartao') {
          return (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Informações do Cartão
              </Typography>
              
              <Grid container spacing={3}>
                <Grid>
                  <TextField
                    fullWidth
                    label="Nome como está no cartão"
                    value={paymentData.cartao.nomeCartao}
                    onChange={(e) => handleUpdateCartaoData({ nomeCartao: e.target.value })}
                  />
                </Grid>
                
                <Grid>
                  <TextField
                    fullWidth
                    label="Número do cartão"
                    value={paymentData.cartao.numeroCartao}
                    onChange={(e) => handleUpdateCartaoData({ numeroCartao: e.target.value })}
                    inputProps={{ maxLength: 19 }}
                  />
                </Grid>
                
                <Grid>
                  <TextField
                    fullWidth
                    label="Validade (MM/AA)"
                    value={paymentData.cartao.validade}
                    onChange={(e) => handleUpdateCartaoData({ validade: e.target.value })}
                    placeholder="MM/AA"
                  />
                </Grid>
                
                <Grid>
                  <TextField
                    fullWidth
                    label="CVV"
                    value={paymentData.cartao.cvv}
                    onChange={(e) => handleUpdateCartaoData({ cvv: e.target.value })}
                    inputProps={{ maxLength: 4 }}
                  />
                </Grid>
                
                <Grid>
                  <TextField
                    fullWidth
                    label="Email para receber o comprovante"
                    type="email"
                    value={paymentData.cartao.email}
                    onChange={(e) => handleUpdateCartaoData({ email: e.target.value })}
                  />
                </Grid>
                
                <Grid>
                  <FormControl fullWidth>
                    <InputLabel>Parcelas</InputLabel>
                    <Select
                      value={paymentData.cartao.parcelas}
                      label="Parcelas"
                      onChange={(e) => handleUpdateCartaoData({ parcelas: Number(e.target.value) })}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                        <MenuItem key={num} value={num}>
                          {num}x {num === 1 ? '(à vista)' : ''}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          );
        }
        
        // Para PIX e Boleto, apenas mostrar informações
        return (
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Confirme os dados para {paymentData.method === 'pix' ? 'PIX' : 'Boleto'}
            </Typography>
            <Typography variant="body1">
              Clique em "Continuar" para gerar o {paymentData.method === 'pix' ? 'QR Code PIX' : 'código de barras do boleto'}
            </Typography>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              {paymentData.method === 'cartao' ? 'Confirmar Pagamento com Cartão' : 
                paymentData.method === 'pix' ? 'Pagamento via PIX' : 'Boleto Bancário'}
            </Typography>
            
            {paymentData.method === 'cartao' && (
              <Grid container spacing={2}>
                <Grid>
                  <Typography><strong>Nome:</strong> {paymentData.cartao.nomeCartao}</Typography>
                </Grid>
                <Grid>
                  <Typography><strong>Cartão:</strong> **** **** **** {paymentData.cartao.numeroCartao.slice(-4)}</Typography>
                </Grid>
                <Grid>
                  <Typography><strong>Parcelas:</strong> {paymentData.cartao.parcelas}x</Typography>
                </Grid>
                <Grid>
                  <Typography><strong>Email:</strong> {paymentData.cartao.email}</Typography>
                </Grid>
              </Grid>
            )}
            
            {paymentData.method === 'pix' && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" gutterBottom>
                  Escaneie o QR Code abaixo para realizar o pagamento:
                </Typography>
                <img 
                  src={paymentData.pix.qrCode} 
                  alt="QR Code PIX" 
                  style={{ width: 200, height: 200, margin: '20px auto', display: 'block' }}
                />
                <Typography variant="body2" color="text.secondary">
                  Ou acesse: <a href={paymentData.pix.linkPix}>{paymentData.pix.linkPix}</a>
                </Typography>
              </Box>
            )}
            
            {paymentData.method === 'boleto' && (
              <Box sx={{ py: 4 }}>
                <Typography variant="body1" gutterBottom>
                  Código de barras para pagamento:
                </Typography>
                <Box sx={{ 
                  p: 3, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  letterSpacing: '2px'
                }}>
                  {paymentData.boleto.codigoBarras}
                </Box>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  <strong>Linha digitável:</strong> {paymentData.boleto.linhaDigitavel}
                </Typography>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Stepper activeStep={step} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent()}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          onClick={step === 0 ? onClose : handleBack}
          variant="outlined"
        >
          {step === 0 ? 'Cancelar' : 'Voltar'}
        </Button>
        
        <Box>
          {step === steps.length - 1 ? (
            <>
              <Button
                onClick={handleReset}
                variant="outlined"
                sx={{ mr: 2 }}
              >
                Novo Pagamento
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                sx={{ bgcolor: '#3C0473' }}
              >
                Confirmar Pagamento
              </Button>
            </>
          ) : (
            <Button
              onClick={handleNext}
              variant="contained"
              disabled={step === 0 && !paymentData.method}
              sx={{ bgcolor: '#3C0473' }}
            >
              Continuar
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};