import { z } from 'zod';

export const HmacQuerySchema = z.object({
  hmac: z.string(),
});

export const InstallQuerySchema = HmacQuerySchema.extend({
  install_from: z.string(), // app_store, partner_center
  shop: z.string(), // rwerwre.myshoplaza.com
  store_id: z.string(), // 1339409
});

export const AuthorizedQuerySchema = HmacQuerySchema.extend({
  code: z.string(), // authorization_code
  shop: z.string(), // rwerwre.myshoplaza.com
});

export type HmacQuery = z.infer<typeof HmacQuerySchema>;
export type InstallQuery = z.infer<typeof InstallQuerySchema>;
export type AuthorizedQuery = z.infer<typeof AuthorizedQuerySchema>;
