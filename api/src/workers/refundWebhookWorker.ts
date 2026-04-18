import axios from 'axios';
import { Job } from 'bullmq';
import { v4 as uuid } from 'uuid';
import config from '@/config';
import { computeHmac } from '@/middlewares/authentication';
import { logger } from '@/middlewares/logger';
import { RefundWebhookJobData } from '@/types';
import { RefundWebhookBody } from '@/schemas';
import { prisma } from '@/prisma';

const isRefundSuccess = (linkPay: RefundWebhookBody) => {
  return (
    linkPay.result.code === 'S0000' &&
    ['Refunded', 'Partial Refunded'].includes(
      linkPay.merchantOrderInfo.status,
    ) &&
    linkPay.refund.status === 'Success'
  );
};

const worker = async (job: Job) => {
  logger.debug('refundWebhookWorker.worker');
  logger.debug(JSON.stringify(job));
  const { account, linkPay } = job.data as RefundWebhookJobData;
  try {
    const isSuccess = isRefundSuccess(linkPay);
    const body = {
      webhook_id: uuid(),
      webhook_type: 'REFUND',
      data: {
        src_out_trans_id: `app-${linkPay.merchantOrderInfo.merchantOrderID}`,
        refund_out_trans_id: linkPay.refund.merchantTransInfo.merchantTransID,
        amount: linkPay.refund.transAmount.value,
        currency: linkPay.refund.transAmount.currency,
        refund_status: isSuccess ? 'success' : 'failed',
        ...(!isSuccess && {
          error_code: linkPay.result.code,
          error_message: linkPay.result.message,
        }),
        channel_time: linkPay.refund.evoTransInfo.evoTransTime,
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
  logger.debug('refundWebhookWorker.onComplete');
  const { linkPay } = job.data as RefundWebhookJobData;
  const isSuccess = isRefundSuccess(linkPay);
  await prisma.refund.update({
    data: {
      linkPayId: linkPay.refund.evoTransInfo.evoTransID,
      status: isSuccess ? 'success' : 'failed',
    },
    where: {
      shoplazzaId: linkPay.refund.merchantTransInfo.merchantTransID,
    },
  });
};

export { worker, onComplete };
