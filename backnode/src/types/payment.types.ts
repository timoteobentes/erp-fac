export type CaptureMethod = 'credit_card' | 'pix';

export type IpPaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

export interface InfinityPayItem {
  quantity: number;
  price: number; // em centavos
  description: string;
}

export interface InfinityPayCreateLinkPayload {
  handle: string;
  items: InfinityPayItem[];
  order_nsu?: string;
  redirect_url?: string;
  webhook_url?: string;
  customer?: {
    name?: string;
    email?: string;
    phone_number?: string;
  };
  address?: {
    cep?: string;
    street?: string;
    neighborhood?: string;
    number?: string;
    complement?: string;
  };
}

export interface InfinityPayWebhookPayload {
  invoice_slug: string;
  amount: number;
  paid_amount: number;
  installments: number;
  capture_method: CaptureMethod;
  transaction_nsu: string;
  order_nsu: string;
  receipt_url: string;
  items: InfinityPayItem[];
}

export interface InfinityPayStatusResponse {
  success: boolean;
  paid: boolean;
  amount: number;
  paid_amount: number;
  installments: number;
  capture_method: CaptureMethod;
}
