import React from 'react';
import { Box, Typography, Grid, TextField, Card, CardContent, Divider } from '@mui/material';
import { CreditCard, QrCode, Receipt, Lock } from '@mui/icons-material';
import { type PaymentData, type PaymentMethod } from '../../../hooks/usePaymentForm';

const PAYMENTS = [
  { id: 'cartao', label: 'Cartão de Crédito', icon: CreditCard },
  { id: 'pix', label: 'PIX', icon: QrCode },
  { id: 'boleto', label: 'Boleto', icon: Receipt },
];

interface StepPaymentProps {
  paymentData: PaymentData;
  onMethodChange: (method: PaymentMethod) => void;
  onUpdateData: (field: string, value: string, method: string) => void;
}

export const StepPayment: React.FC<StepPaymentProps> = ({ paymentData, onMethodChange, onUpdateData }) => {
  return (
    <>
      <Box className="flex flex-col gap-6 animate-fadeIn">
        <Typography variant="h6" className="text-center text-gray-600 font-normal">
          Selecione a forma de pagamento:
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Seletor de Método */}
          {PAYMENTS.map((item) => (
            <Grid key={item.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: paymentData.method === item.id ? '2px solid #6B00A1' : '1px solid #e0e0e0',
                  background: paymentData.method === item.id ? '2px solid #e1b9f5' : '1px solid #e0e0e0',
                  color: paymentData.method === item.id ? '#6B00A1' : '#5a5a5a',
                  '&:hover': { borderColor: '#3C0473' }
                }}
                onClick={() => onMethodChange(item.id as PaymentMethod)}
              >
                <CardContent sx={{ textAlign: 'center', minWidth: 150 }}>
                  <item.icon sx={{ fontSize: 48, color: paymentData.method === item.id ? '#3C0473' : '#5a5a5a', mb: 2 }} />
                  <Typography variant="h6">{item.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </div>

        <Divider className="my-6" />

        <div>
          {paymentData.method === 'cartao' && (
            <div className="animate-fadeIn">
              <Typography variant="subtitle2" className="mb-3 font-bold text-gray-600 flex items-center gap-2">
                <Lock fontSize="small" /> Dados do Cartão (Ambiente Seguro)
              </Typography>
              <Grid container spacing={2} className="mt-6">
                <Grid>
                  <TextField 
                    label="Número do Cartão" 
                    fullWidth size="small"
                    placeholder="0000 0000 0000 0000"
                    value={paymentData.cartao.numero}
                    onChange={(e) => onUpdateData('numero', e.target.value, "cartao")}
                    InputProps={{ startAdornment: <CreditCard className="text-gray-400 mr-2" /> }}
                  />
                </Grid>
                <Grid>
                  <TextField 
                    label="Nome do Titular" 
                    fullWidth size="small"
                    value={paymentData.cartao.nome}
                    onChange={(e) => onUpdateData('nome', e.target.value.toUpperCase(), "cartao")}
                  />
                </Grid>
                <Grid>
                  <TextField 
                    label="Validade" placeholder="MM/AA" fullWidth size="small"
                    value={paymentData.cartao.validade}
                    onChange={(e) => onUpdateData('validade', e.target.value, "cartao")}
                  />
                </Grid>
                <Grid>
                  <TextField 
                    label="CVV" placeholder="123" fullWidth size="small"
                    value={paymentData.cartao.cvv}
                    onChange={(e) => onUpdateData('cvv', e.target.value, "cartao")}
                  />
                </Grid>
                <Grid>
                  <TextField 
                    label="CPF/CNPJ do Titular" fullWidth size="small"
                    value={paymentData.cartao.cpf}
                    onChange={(e) => onUpdateData('cpf', e.target.value, "cartao")}
                  />
                </Grid>
              </Grid>
            </div>
          )}
          {paymentData.method === 'boleto' && (
            <div className="animate-fadIn pb-6">
              <Typography variant="subtitle2" className="mb-3 font-bold text-gray-600 flex items-center gap-2">
                <Receipt fontSize="small" /> Dados para Boleto
              </Typography>
              <Grid container spacing={2} className="mt-6">
                <Grid>
                  <TextField 
                    label="Nome Completo do Pagador" 
                    fullWidth size="small"
                    value={paymentData.boleto.nome}
                    onChange={(e) => onUpdateData('nome', e.target.value.toUpperCase(), "boleto")}
                  />
                </Grid>
                <Grid>
                  <TextField 
                    label="CPF/CNPJ do Pagador" fullWidth size="small"
                    value={paymentData.boleto.cpf}
                    onChange={(e) => onUpdateData('cpf', e.target.value, "boleto")}
                  />
                </Grid>
                <Grid>
                  <TextField 
                    label="CEP" fullWidth size="small"
                    value={paymentData.boleto.cep}
                    onChange={(e) => onUpdateData('cep', e.target.value, "boleto")}
                  />
                </Grid>
                <Grid>
                  <TextField 
                    label="Endereço" fullWidth size="small"
                    value={paymentData.boleto.endereco}
                    onChange={(e) => onUpdateData('endereco', e.target.value, "boleto")}
                  />
                </Grid>
                <Grid>
                  <TextField 
                    label="Número" fullWidth size="small"
                    value={paymentData.boleto.numero}
                    onChange={(e) => onUpdateData('numero', e.target.value, "boleto")}
                  />
                </Grid>
                <Grid>
                  <TextField 
                    label="Bairro" fullWidth size="small"
                    value={paymentData.boleto.bairro}
                    onChange={(e) => onUpdateData('bairro', e.target.value, "boleto")}
                  />
                </Grid>
                <Grid>
                  <TextField 
                    label="Cidade" fullWidth size="small"
                    value={paymentData.boleto.cidade}
                    onChange={(e) => onUpdateData('cidade', e.target.value, "boleto")}
                  />
                </Grid>
                <Grid>
                  <TextField 
                    label="Estado" fullWidth size="small"
                    value={paymentData.boleto.estado}
                    onChange={(e) => onUpdateData('estado', e.target.value, "boleto")}
                  />
                </Grid>
              </Grid>
            </div>
          )}
        </div>
      </Box>
      <Box className="animate-fadeIn">

        {/* Conteúdo Condicional */}
        

        {paymentData.method === 'pix' && (
          <div className="text-center py-6 bg-green-50 rounded-lg border border-green-200 animate-fadeIn">
            <QrCode sx={{ fontSize: 60, color: '#2e7d32', mb: 2 }} />
            <Typography variant="h6" color="success.main" fontWeight="bold">Desconto de 5% no PIX!</Typography>
            <Typography variant="body2" className="mt-2 text-gray-600 px-4">
              Após clicar em "Continuar", geraremos um QR Code exclusivo válido por 15 minutos. A liberação é imediata.
            </Typography>
          </div>
        )}

        {paymentData.method === 'boleto' && (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200 animate-fadeIn">
            <Typography variant="body2" className="mt-2 text-gray-600 px-4">
              O boleto pode levar até <strong>3 dias úteis</strong> para ser compensado. Liberação após compensação.
            </Typography>
          </div>
        )}
      </Box>
    </>
  );
};