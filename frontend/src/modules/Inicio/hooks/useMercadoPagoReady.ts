import { useState, useEffect } from 'react';

export const useMercadoPagoReady = () => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const check = setInterval(() => {
      if (window.MercadoPago) {
        setReady(true);
        clearInterval(check);
      }
    }, 300);

    return () => clearInterval(check);
  }, []);

  return ready;
};
