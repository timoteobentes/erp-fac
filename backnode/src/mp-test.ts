import 'dotenv/config';
import { MercadoPagoConfig, Payment } from 'mercadopago';

async function test() {
  console.log('TOKEN:', process.env.MERCADOPAGO_ACCESS_TOKEN);

  const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  });

  const payment = new Payment(client);

  const result = await payment.create({
    body: {
      transaction_amount: 10,
      description: 'Teste isolado',
      payment_method_id: 'master',
      installments: 1,
      token: 'e3d13d2d0c6bd2ac5f7d1379fd4b48be',
      payer: {
        email: 'test_user_123@testuser.com',
      },
    },
  });

  console.log(result);
}

test().catch(console.error);
