import { Request, Response } from 'express';
import { formatISO } from 'date-fns';
import axios from 'axios';
import config from '@/config';
import {
  LinkPayFetchPaymentSuccessResponseData,
  QueryRefundRequest,
} from '@/types';
import { logger } from '@/middlewares/logger';
import { prisma } from '@/prisma';

const handler = async (req: Request, res: Response) => {
  logger.debug('refund/queryHandler');
  const {
    auth: { account },
    validated: { query },
  } = req as QueryRefundRequest;

  try {
    const resp = await axios.get(
      `${config.linkpay.baseUrl}/interaction/${query.refund_out_trans_id}`,
      {
        headers: {
          Authorization: account.merchantNo,
          DateTime: formatISO(new Date()),
          KeyID: account.signKey,
          SignType: 'Key-based',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    if (resp.data.result.code === 'S0000') {
      const data = resp.data as LinkPayFetchPaymentSuccessResponseData;
      logger.debug(`LinkPay data: ${JSON.stringify(data)}`);
      if (
        ['Refunded', 'Partial Refunded'].includes(
          data.merchantOrderInfo.status,
        ) &&
        ['refunded_partial', 'refunded_full'].includes(
          data.transactionInfo.status,
        )
      ) {
        await prisma.payment.update({
          data: {
            linkPayId: data.transactionInfo.evoTransInfo.evoTransID,
            status: 'success',
          },
          where: {
            shoplazzaId: data.transactionInfo.merchantTransInfo.merchantTransID,
          },
        });
        return res.send({
          code: 'success',
          data: {
            src_out_trans_id: `app-${data.transactionInfo.merchantTransInfo.merchantTransID}`,
            refund_out_trans_id:
              data.transactionInfo.merchantTransInfo.merchantTransID,
            amount: data.transactionInfo.transAmount.value,
            currency: data.transactionInfo.transAmount.currency,
            refund_status: 'success',
            channel_time: data.transactionInfo.evoTransInfo.evoTransTime,
          },
        });
      }
      // ignore cases other than success
    }
    logger.error(JSON.stringify(resp.data));
    return res.send({
      code: 'recordNotFound',
    });
  } catch (e: unknown) {
    logger.error(e);
    return res.send({
      code: 'recordNotFound',
    });
  }
};
export default handler;
