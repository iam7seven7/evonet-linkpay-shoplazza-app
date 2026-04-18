import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { formatISO } from 'date-fns';
import axios from 'axios';
import config from '@/config';
import {
  CreateRefundRequest,
  LinkPayBaseResponseData,
  LinkPayCreateRefundFailedResponseData,
  LinkPayCreateRefundSuccessResponseData,
  LinkPayFetchPaymentSuccessResponseData,
} from '@/types';
import { logger } from '@/middlewares/logger';
import { AccountModel } from '@/prisma/generated/models';
import { CreateRefundBody } from '@/schemas';
import { prisma } from '@/prisma';

const fetchLinkPayPayment = async (
  account: AccountModel,
  body: CreateRefundBody,
) => {
  const resp = await axios.get(
    `${config.linkpay.baseUrl}/interaction/${body.src_out_trans_id.replace('app-', '')}`,
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
    logger.debug(`LinkPay data: ${JSON.stringify(resp.data)}`);
    return resp.data as LinkPayFetchPaymentSuccessResponseData;
  } else {
    logger.error(JSON.stringify(resp.data));
    throw new Error('Error on fetching LinkPay payment');
  }
};
const createLinkPayRefund = async (
  account: AccountModel,
  body: CreateRefundBody,
  payment: LinkPayFetchPaymentSuccessResponseData,
) => {
  const resp = await axios.post(
    `${config.linkpay.baseUrl}/payment/${payment.transactionInfo.merchantTransInfo.merchantTransID}/refund `,
    {
      merchantTransInfo: {
        merchantTransID: body.refund_out_trans_id,
        merchantTransTime: body.txn_time,
      },
      transAmount: {
        currency: body.currency,
        value: body.amount,
      },
      webhook: `${config.app.baseUrl}/webhook/linkpay/refund`,
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
  return resp.data as LinkPayBaseResponseData;
};
const handler = async (req: Request, res: Response) => {
  const {
    auth: { account },
    validated: { body },
  } = req as CreateRefundRequest;
  logger.debug('refund/createHandler');
  try {
    const paymentData = await fetchLinkPayPayment(account, body);
    const refundData = await createLinkPayRefund(account, body, paymentData);
    if (refundData.result.code === 'S0000') {
      const data = refundData as LinkPayCreateRefundSuccessResponseData;
      logger.debug(`LinkPay data: ${JSON.stringify(data)}`);
      await prisma.refund.create({
        data: {
          id: uuid(),
          shoplazzaId: body.refund_out_trans_id,
          storeId: null, // shoplazza why wouldn't you provide store id in the body
          merchantNo: account.merchantNo,
          status: 'processing',
        },
      });
      return res.send({
        refund_out_trans_id: body.refund_out_trans_id,
        refund_trade_id: data.refund.merchantTransInfo.merchantTransID,
        amount: body.amount,
        currency: body.currency,
        refund_status: 'processing',
      });
    } else {
      const data = refundData as LinkPayCreateRefundFailedResponseData;
      logger.error(JSON.stringify(data));
      return res.send({
        refund_out_trans_id: body.refund_out_trans_id,
        amount: body.amount,
        currency: body.currency,
        refund_status: 'failed',
        error_code: '',
        error_message: 'Failed to request LinkPay Refund',
        channel_time: '',
      });
    }
  } catch (e: unknown) {
    logger.error(e);
    return res.send({
      refund_out_trans_id: body.refund_out_trans_id,
      amount: body.amount,
      currency: body.currency,
      refund_status: 'failed',
      error_code: '',
      error_message: 'Failed to request LinkPay Refund',
      channel_time: '',
    });
  }
};
export default handler;
