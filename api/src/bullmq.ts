import IORedis from 'ioredis';
import { Job, Queue, Worker } from 'bullmq';
import config from '@/config';
import {
  worker as paymentWebhookWorker,
  onComplete as onPaymentWebhookComplete,
} from './workers/paymentWebhookWorker';
import {
  worker as refundWebhookWorker,
  onComplete as onRefundWebhookComplete,
} from './workers/refundWebhookWorker';

const connection = new IORedis(config.redis, {
  maxRetriesPerRequest: null,
});
const webhookQueue = new Queue('webhook', { connection });

const RETRY_AFTER = [
  0, // placeholder
  1,
  30,
  60,
  300, // 5 mins
  900, // 15 mins
  1800, // 30 mins
  3600, // 1 hr
  7200, // 2 hrs
  14400, // 4 hours
  14400, // 4 hours
  14400, // 4 hours
  14400, // 4 hours
  14400, // 4 hours
  14400, // 4 hours
];
const backoffStrategy = (attempts: number) => {
  return RETRY_AFTER[attempts];
};
const workers = {
  run: () => {
    new Worker(
      'webhook',
      async (job: Job) => {
        if (job.name === 'payment') {
          return await paymentWebhookWorker(job);
        }
        if (job.name === 'refund') {
          return await refundWebhookWorker(job);
        }
      },
      {
        connection,
        concurrency: 5,
        removeOnComplete: { count: 0 },
        removeOnFail: { count: 0 },
        settings: { backoffStrategy },
      },
    ).on('completed', async (job: Job) => {
      if (job.name === 'payment') {
        return await onPaymentWebhookComplete(job);
      }
      if (job.name === 'refund') {
        return await onRefundWebhookComplete(job);
      }
    });
  },
};
export { webhookQueue, workers };
