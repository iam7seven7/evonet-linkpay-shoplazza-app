import { Request, Response } from 'express';
import { formatISO } from 'date-fns';
import axios from 'axios';
import config from '@/config';
import { prisma } from '@/prisma';
import { logger } from '@/middlewares/logger';
import {
  LinkPayBaseResponseData,
  LinkPayFetchPaymentSuccessResponseData,
  QueryPaymentRequest,
} from '@/types';

const handler = async (req: Request, res: Response) => {
  logger.debug('payment/queryHandler');
  const {
    auth: { account },
    validated: { query },
  } = req as QueryPaymentRequest;
  try {
    const resp = await axios.get(
      `${config.linkpay.baseUrl}/interaction/${query.out_trans_id.replace('app-', '')}`,
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
    if ((resp.data as LinkPayBaseResponseData).result.code === 'S0000') {
      const data = resp.data as LinkPayFetchPaymentSuccessResponseData;
      logger.debug(`LinkPay data: ${JSON.stringify(data)}`);
      if (
        data.merchantOrderInfo.status === 'Paid' &&
        data.transactionInfo.status === 'captured'
      ) {
        await prisma.payment.update({
          data: {
            linkPayId: data.transactionInfo.merchantTransInfo.merchantTransID,
            status: 'success',
          },
          where: {
            shoplazzaId: query.out_trans_id,
          },
        });
        return res.send({
          code: 'success',
          data: {
            out_trans_id: query.out_trans_id,
            trade_id: data.transactionInfo.merchantTransInfo.merchantTransID,
            amount: data.transactionInfo.transAmount.value,
            currency: data.transactionInfo.transAmount.currency,
            payment_status: 'success',
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
