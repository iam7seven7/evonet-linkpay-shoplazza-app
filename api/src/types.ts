import { Request } from 'express';
import {
  AuthorizedQuery,
  CompletePaymentQuery,
  CreatePaymentBody,
  CreateRefundBody,
  HmacQuery,
  InstallQuery,
  PaymentWebhookBody,
  QueryPaymentQuery,
  QueryRefundQuery,
  RefundWebhookBody,
  WebhookBody,
} from './schemas';
import {
  AccountModel,
} from './prisma/generated/models';

export type ParsedRequest = Request & {
  rawBody: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */ 
export type ValidatedRequest = Request & {
  validated: {
    body?: any;
    query?: any;
    params?: any;
  };
};
/* eslint-enable @typescript-eslint/no-explicit-any */ 

export type HeaderAuthenticatedRequest = ParsedRequest & {
  auth: {
    account: AccountModel;
  };
};

export type QueryAuthenticatedRequest = Request & {
  validated: {
    query: HmacQuery;
  };
};

export type InstallRequest = Request & {
  validated: {
    query: InstallQuery;
  };
};

export type AuthorizedRequest = Request & {
  validated: {
    query: AuthorizedQuery;
  };
};

export type WebhookRequest = ParsedRequest & {
  validated: {
    body: WebhookBody;
  };
};

export type PaymentWebhookJobData = {
  account: AccountModel;
  linkPay: PaymentWebhookBody;
};

export type RefundWebhookJobData = {
  account: AccountModel;
  linkPay: RefundWebhookBody;
};

export type CreatePaymentRequest = HeaderAuthenticatedRequest & {
  validated: {
    body: CreatePaymentBody;
  };
};

export type QueryPaymentRequest = HeaderAuthenticatedRequest & {
  validated: {
    query: QueryPaymentQuery;
  };
};

export type CompletePaymentRequest = HeaderAuthenticatedRequest & {
  validated: {
    query: CompletePaymentQuery;
  };
};

export type CreateRefundRequest = HeaderAuthenticatedRequest & {
  validated: {
    body: CreateRefundBody;
  };
};

export type QueryRefundRequest = HeaderAuthenticatedRequest & {
  validated: {
    query: QueryRefundQuery;
  };
};

export type LinkPayBaseResponseData = {
  result: {
    code: string;
    message: string;
  };
};

export type LinkPayCreatePaymentFailedResponseData = LinkPayBaseResponseData;

export type LinkPayCreatePaymentSuccessResponseData =
  LinkPayBaseResponseData & {
    merchantOrderInfo: {
      merchantOrderID: string;
      status: string;
    };
    transAmount: {
      currency: string;
      value: string;
    };
    linkUrl: string;
    sessionID: string;
  };

export type LinkPayFetchPaymentFailedResponseData = LinkPayBaseResponseData;

export type LinkPayFetchPaymentSuccessResponseData = LinkPayBaseResponseData & {
  merchantOrderInfo: {
    merchantOrderID: string;
    status: string;
  };
  transactionInfo: {
    status: string;
    merchantTransInfo: {
      merchantTransID: string;
      merchantOrderReference?: string;
      merchantTransTime: string;
    };
    evoTransInfo: {
      evoTransID: string;
      evoTransTime: string;
    };
    transAmount: {
      currency: string;
      value: string;
    };
  };
  linkUrl: string;
  sessionID: string;
};

export type LinkPayCreateRefundFailedResponseData = LinkPayBaseResponseData;

export type LinkPayCreateRefundSuccessResponseData = LinkPayBaseResponseData & {
  refund: {
    status: string;
    merchantTransInfo: {
      merchantTransID: string;
      merchantOrderReference?: string;
      merchantTransTime: string;
    };
    evoTransInfo: {
      evoTransID: string;
      evoTransTime: string;
    };
    transAmount: {
      currency: string;
      value: string;
    };
  };
};
