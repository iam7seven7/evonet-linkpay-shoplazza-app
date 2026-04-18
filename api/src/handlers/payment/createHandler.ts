import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { formatISO } from 'date-fns';
import axios from 'axios';
import config from '@/config';
import {
  CreatePaymentRequest,
  LinkPayBaseResponseData,
  LinkPayCreatePaymentFailedResponseData,
  LinkPayCreatePaymentSuccessResponseData,
} from '@/types';
import { prisma } from '@/prisma';
import { logger } from '@/middlewares/logger';

const handler = async (req: Request, res: Response) => {
  const {
    auth: { account },
    validated: { body },
  } = req as CreatePaymentRequest;
  logger.debug('payment/createHandler');
  try {
    const resp = await axios.post(
      `${config.linkpay.baseUrl}/interaction`,
      {
        merchantOrderInfo: {
          merchantOrderID: body.out_trans_id.replace('app-', ''),
          merchantOrderTime: body.txn_time,
        },
        transAmount: {
          currency: body.currency,
          value: body.amount,
        },
        validTime: 10, // minutes
        returnUrl: `${config.app.baseUrl}/payment/complete`,
        webhook: `${config.app.baseUrl}/webhook/linkpay`,
      },
      {
        headers: {
          Authorization: account.merchantNo,
          KeyID: account.signKey,
          DateTime: formatISO(new Date()),
          MsgID: uuid(),
          SignType: 'Key-based',
          'Content-Type': 'application/json',
        },
      },
    );
    if ((resp.data as LinkPayBaseResponseData).result.code === 'S0000') {
      const data = resp.data as LinkPayCreatePaymentSuccessResponseData;
      logger.debug(`LinkPay data: ${JSON.stringify(resp.data)}`);
      await prisma.payment.create({
        data: {
          id: uuid(),
          shoplazzaId: body.out_trans_id,
          storeId: body.shoplazza_store_id || null,
          merchantNo: account.merchantNo,
          cancelUrl: body.cancel_url,
          returnUrl: body.return_url,
          status: 'processing',
        },
      });
      return res.send({
        out_trans_id: body.out_trans_id,
        amount: data.transAmount.value,
        currency: data.transAmount.currency,
        trans_type: body.trans_type,
        payment_status: 'processing',
        redirect_url: data.linkUrl,
      });
    } else {
      logger.error(
        JSON.stringify(resp.data as LinkPayCreatePaymentFailedResponseData),
      );
      return res.send({
        out_trans_id: body.out_trans_id,
        amount: body.amount,
        currency: body.currency,
        trans_type: body.trans_type,
        payment_status: 'failed',
        error_message: 'Failed to redirect to LinkPay Payment',
      });
    }
  } catch (e: unknown) {
    logger.error(e);
    return res.send({
      out_trans_id: body.out_trans_id,
      amount: body.amount,
      currency: body.currency,
      trans_type: body.trans_type,
      payment_status: 'failed',
      error_message: 'Failed to redirect to LinkPay Payment',
    });
  }
};
export default handler;
