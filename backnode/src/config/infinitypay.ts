import 'dotenv/config';

if (!process.env.INFINITYPAY_HANDLE) {
  throw new Error('INFINITYPAY_HANDLE não definido. Configure no arquivo .env');
}

export const INFINITYPAY_CONFIG = {
  handle: process.env.INFINITYPAY_HANDLE!,
  apiUrl: 'https://api.checkout.infinitepay.io',
  webhookUrl: process.env.INFINITYPAY_WEBHOOK_URL ?? '',
  redirectUrl: process.env.INFINITYPAY_REDIRECT_URL ?? '',
};
