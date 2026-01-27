import { Payment } from 'mercadopago';
import { mpClient } from '../config/mercadoPago';

const payment = new Payment(mpClient);

export function getPaymentInstance() {
  return payment;
}
