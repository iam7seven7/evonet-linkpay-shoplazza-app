import { Request, Response } from 'express';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import config from '@/config';
import { prisma } from '@/prisma';
import { AuthorizedRequest } from '@/types';
import { logger } from '@/middlewares/logger';

const handler = async (_req: Request, res: Response) => {
  const req = _req as AuthorizedRequest;
  const { code, hmac, shop } = req.query;
  if (shop && hmac && code) {
    const {
      shoplazza: { appId, clientId, clientSecret },
      app: { baseUrl },
    } = config;
    const { data } = await axios.post(`https://${shop}/admin/oauth/token`, {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${baseUrl}/authorized`,
    });
    logger.debug(JSON.stringify(data));
    await prisma.$transaction(async () => {
      await prisma.store.upsert({
        where: {
          storeId: data.store_id,
        },
        update: {
          storeId: data.store_id,
          storeName: data.store_name,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          tokenExpireAt: data.expires_at,
        },
        create: {
          id: uuid(),
          storeId: data.store_id,
          storeName: data.store_name,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          tokenExpireAt: data.expires_at,
        },
      });
    });
    res.redirect(
      `https://${shop}/admin/smart_apps/coral/payment/providers/${appId}`,
    );
  } else {
    res.status(400).send('Required parameters missing');
  }
};
export default handler;
