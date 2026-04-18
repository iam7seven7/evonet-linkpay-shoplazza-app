import { z } from 'zod';

export const HmacQuerySchema = z.object({
  hmac: z.string(),
});

export const InstallQuerySchema = HmacQuerySchema.extend({
  install_from: z.string(), // app_store, partner_center
  shop: z.string(), // developer.myshoplaza.com
  store_id: z.string(), // 1339409
});

export const AuthorizedQuerySchema = HmacQuerySchema.extend({
  code: z.string(), // authorization_code
  shop: z.string(), // developer.myshoplaza.com
});

const BaseWebhookBodySchema = z.object({
  merchantOrderInfo: z.object({
    merchantOrderID: z.string(),
    status: z.string(),
  }),
  result: z.object({
    code: z.string(),
    message: z.string(),
  }),
});
const PaymentWebhookBodySchema = BaseWebhookBodySchema.extend({
  eventCode: z.literal('LinkPay'),
  transactionInfo: z.object({
    merchantTransInfo: z.object({
      merchantOrderReference: z.string(),
      merchantTransID: z.string(),
      merchantTransTime: z.string(),
    }),
    evoTransInfo: z.object({
      evoTransID: z.string(),
      evoTransTime: z.string(),
    }),
    transAmount: z.object({
      currency: z.string(),
      value: z.string(),
    }),
    status: z.string(),
  }),
});
const RefundWebhookBodySchema = BaseWebhookBodySchema.extend({
  eventCode: z.literal('Refund'),
  refund: z.object({
    merchantTransInfo: z.object({
      merchantTransID: z.string(),
      merchantTransTime: z.string(),
    }),
    evoTransInfo: z.object({
      evoTransID: z.string(),
      evoTransTime: z.string(),
    }),
    transAmount: z.object({
      currency: z.string(),
      value: z.string(),
    }),
    status: z.string(),
  }),
});
export const WebhookBodySchema = z.discriminatedUnion('eventCode', [
  PaymentWebhookBodySchema,
  RefundWebhookBodySchema,
]);

export const CreatePaymentBodySchema = z.object({
  app_id: z.string(),
  out_trans_id: z.string(),
  shoplazza_order_id: z.string(),
  shoplazza_store_id: z.string().nullable(),
  shoplazza_sys_domain: z.string(),
  txn_time: z.string().nullable(),
  amount: z.string(),
  currency: z.string(),
  cancel_url: z.string().nullable(),
  return_url: z.string().nullable(),
  callback_url: z.string().nullable(),
  summary: z.string().nullable(),
  trans_type: z.string(), // redirect, card, iframe, app
  user_agent: z.string().nullable(),
  cpf: z.string().nullable(),
  test: z.string(), // "1", "0"
  ip: z.string().nullable(),
  card_info: z
    .object({
      card_number: z.string().nullable(),
      card_month: z.string().nullable(),
      card_year: z.string().nullable(),
      card_code: z.string().nullable(),
      card_first_name: z.string().nullable(),
      card_last_name: z.string().nullable(),
    })
    .nullable(),
  shipping_address: z
    .object({
      first_name: z.string().nullable(),
      last_name: z.string().nullable(),
      email: z.string().nullable(),
      phone: z.string().nullable(),
      phone_area_code: z.string().nullable(),
      country_code: z.string().nullable(),
      province: z.string().nullable(),
      city: z.string().nullable(),
      address: z.string().nullable(),
      address1: z.string().nullable(),
      state: z.string().nullable(),
      zip: z.string().nullable(),
      company: z.string().nullable(),
    })
    .nullable(),
  billing_address: z
    .object({
      first_name: z.string().nullable(),
      last_name: z.string().nullable(),
      email: z.string().nullable(),
      phone: z.string().nullable(),
      phone_area_code: z.string().nullable(),
      country_code: z.string().nullable(),
      province: z.string().nullable(),
      city: z.string().nullable(),
      address: z.string().nullable(),
      address1: z.string().nullable(),
      state: z.string().nullable(),
      zip: z.string().nullable(),
      company: z.string().nullable(),
    })
    .nullable(),
  line_items: z.array(
    z.object({
      id: z.string().nullable(),
      product_title: z.string().nullable(),
      unit_price: z.string().nullable(),
      sku: z.string().nullable(),
      vendor: z.string().nullable(),
      url: z.string().nullable(),
    }),
  ),
});

export const QueryPaymentQuerySchema = z.object({
  out_trans_id: z.string(),
});

export const CompletePaymentQuerySchema = z.object({
  merchantOrderID: z.string(),
  result: z.string(),
});

export const CreateRefundBodySchema = z.object({
  app_id: z.string(),
  refund_out_trans_id: z.string(),
  src_out_trans_id: z.string(),
  txn_time: z.string().nullable(),
  amount: z.string(),
  currency: z.string(),
  callback_url: z.string().nullable(),
  summary: z.string().nullable(),
});

export const QueryRefundQuerySchema = z.object({
  refund_out_trans_id: z.string(),
});

export type HmacQuery = z.infer<typeof HmacQuerySchema>;
export type InstallQuery = z.infer<typeof InstallQuerySchema>;
export type AuthorizedQuery = z.infer<typeof AuthorizedQuerySchema>;
export type PaymentWebhookBody = z.infer<typeof PaymentWebhookBodySchema>;
export type RefundWebhookBody = z.infer<typeof RefundWebhookBodySchema>;
export type WebhookBody = z.infer<typeof WebhookBodySchema>;
export type CreatePaymentBody = z.infer<typeof CreatePaymentBodySchema>;
export type QueryPaymentQuery = z.infer<typeof QueryPaymentQuerySchema>;
export type CompletePaymentQuery = z.infer<typeof CompletePaymentQuerySchema>;
export type CreateRefundBody = z.infer<typeof CreateRefundBodySchema>;
export type QueryRefundQuery = z.infer<typeof QueryRefundQuerySchema>;
