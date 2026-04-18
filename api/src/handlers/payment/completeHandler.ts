import { Request, Response } from 'express';
import { prisma } from '@/prisma';
import { CompletePaymentRequest } from '@/types';
import { logger } from '@/middlewares/logger';
import createHttpError from 'http-errors';

const handler = async (req: Request, res: Response) => {
  const {
    validated: { query },
  } = req as CompletePaymentRequest;
  logger.debug('payment/completeHandler');
  let payment = null;
  try {
    payment = await prisma.payment.findFirstOrThrow({
      where: {
        shoplazzaId: `app-${query.merchantOrderID}`,
      },
    });
  } catch (_e: unknown) {
    throw createHttpError(400, 'Payment not found');
  }
  logger.debug(`Payment model: ${payment.id}`);
  if (query.result === 'success') {
    if (payment.returnUrl) {
      return res.redirect(payment.returnUrl);
    }
    throw createHttpError(400, 'Return url not found');
  } else {
    if (payment.cancelUrl) {
      return res.redirect(payment.cancelUrl);
    }
    throw createHttpError(400, 'Cancel url not found');
  }
};
export default handler;
