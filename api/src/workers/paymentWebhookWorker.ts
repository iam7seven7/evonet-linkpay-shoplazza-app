import axios from 'axios';
import { Job } from 'bullmq';
import { v4 as uuid } from 'uuid';
import config from '@/config';
import { computeHmac } from '@/middlewares/authentication';
import { logger } from '@/middlewares/logger';
import { prisma } from '@/prisma';
import { PaymentWebhookJobData } from '@/types';
import { PaymentWebhookBody } from '@/schemas';

const isPaymentSuccess = (linkPay: PaymentWebhookBody) => {
  return (
    linkPay.result.code === 'S0000' &&
    linkPay.merchantOrderInfo.status === 'Paid' &&
    linkPay.transactionInfo.status === 'captured'
  );
};
const worker = async (job: Job) => {
  logger.debug('paymentWebhookWorker.worker');
  logger.debug(JSON.stringify(job));
  const { account, linkPay } = job.data as PaymentWebhookJobData;
  try {
    const isSuccess = isPaymentSuccess(linkPay);
    const body = {
      webhook_id: uuid(),
      webhook_type: 'PAYMENT',
      data: {
        out_trans_id: `app-${linkPay.merchantOrderInfo.merchantOrderID}`,
        trade_id: linkPay.transactionInfo.merchantTransInfo.merchantTransID,
        amount: linkPay.transactionInfo.transAmount.value,
        currency: linkPay.transactionInfo.transAmount.currency,
        payment_status: isSuccess ? 'success' : 'failed',
        ...(!isSuccess && {
          error_code: linkPay.result.code,
          error_message: linkPay.result.message,
        }),
        channel_time: linkPay.transactionInfo.evoTransInfo.evoTransTime,
      },
    };
    const originalUrl = `/api/channel_proxy/webhook/online/v2/${config.shoplazza.appId}`;
    await axios.post(`https://callback.shoplazza.com${originalUrl}`, body, {
      headers: {
        'Content-Type': 'application/json',
        'Shoplazza-Request-Id': uuid(),
        'Shoplazza-Merchant-Id': account.merchantNo,
        'Shoplazza-Hmac-Sha256': computeHmac(
          'POST',
          originalUrl,
          JSON.stringify(body),
          account.signKey,
        ),
      },
    });
    return true;
  } catch (e: unknown) {
    logger.error(e);
    throw e;
  }
};

const onComplete = async (job: Job) => {
  logger.debug('paymentWebhookWorker.onComplete');
  const { linkPay } = job.data as PaymentWebhookJobData;
  const isSuccess = isPaymentSuccess(linkPay);
  await prisma.payment.update({
    data: {
      linkPayId: linkPay.transactionInfo.merchantTransInfo.merchantTransID,
      status: isSuccess ? 'success' : 'failed',
    },
    where: {
      shoplazzaId: `app-${linkPay.transactionInfo.merchantTransInfo.merchantOrderReference}`,
    },
  });
};

export { worker, onComplete };
