/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  interface Window {
    MercadoPago: any;
  }
}
const MP_PUBLIC_KEY = "TEST-25c387b8-b560-4521-9b77-bfa1309f1881";

// Variável para controlar se já iniciou
let mpInstance: any = null;

export const getMP = () => {
  if (!mpInstance && window.MercadoPago) {
    mpInstance = new window.MercadoPago(MP_PUBLIC_KEY);
  }

  return mpInstance;
};

export interface CardTokenParams {
  cardNumber: string;
  cardholderName: string;
  cardExpirationMonth: string;
  cardExpirationYear: string;
  securityCode: string;
  identification: {
    type: string;
    number: string;
  };
}

export const createCardToken = async (data: CardTokenParams) => {
  const mp = getMP();

  if (!mp) {
    throw new Error("SDK MercadoPago não carregado");
  }

  const token = await mp.createCardToken({
    cardNumber: data.cardNumber.replace(/\s/g, ""),
    cardholderName: data.cardholderName,
    cardExpirationMonth: data.cardExpirationMonth,
    cardExpirationYear: data.cardExpirationYear,
    securityCode: data.securityCode,
    identification: {
      type: data.identification.type,
      number: data.identification.number.replace(/\D/g, "")
    }
  });

  return token.id;
};