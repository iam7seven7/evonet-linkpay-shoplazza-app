import { Request, Response } from 'express';
import { logger } from '@/middlewares/logger';
import { webhookQueue } from '@/bullmq';
import { WebhookRequest } from '@/types';
import { PaymentWebhookBody, RefundWebhookBody } from '@/schemas';
import { AccountModel } from '@/prisma/generated/models';
import { prisma } from '@/prisma';
import createHttpError from 'http-errors';

const handler = async (req: Request, res: Response) => {
  logger.debug('webhook/webhookHandler');
  const {
    validated: { body },
  } = req as WebhookRequest;

  let account: AccountModel;
  try {
    account = await prisma.account.findFirstOrThrow({
      where: {
        merchantNo: req.headers['authorization'],
      },
    });
  } catch (_: unknown) {
    throw createHttpError(400, 'Account not found');
  }

  if (body.eventCode === 'LinkPay') {
    await webhookQueue.add(
      'payment',
      {
        account,
        linkPay: body as PaymentWebhookBody,
      },
      {
        attempts: 15,
        backoff: {
          type: 'custom',
        },
      },
    );
  }
  if (body.eventCode === 'Refund') {
    await webhookQueue.add(
      'refund',
      {
        account,
        linkPay: body as RefundWebhookBody,
      },
      {
        attempts: 15,
        backoff: {
          type: 'custom',
        },
      },
    );
  }
  return res.send('SUCCESS');
};
export default handler;
