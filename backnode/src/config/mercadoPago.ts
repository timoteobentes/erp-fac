import 'dotenv/config';
import { MercadoPagoConfig } from 'mercadopago';

if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
  throw new Error('MercadoPago Access Token não definido');
}

export const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});
