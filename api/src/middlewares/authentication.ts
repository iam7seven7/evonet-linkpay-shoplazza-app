import { Request, Response, NextFunction } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import config from '@/config';
import {
  HeaderAuthenticatedRequest,
  ParsedRequest,
  QueryAuthenticatedRequest,
} from '@/types';
import { prisma } from '@/prisma';
import { logger } from '@/middlewares/logger';

export const computeHmac = (
  method: string,
  originalUrl: string,
  rawBody: string,
  secret: string,
) => {
  const message = `${method}\n${originalUrl}\n${rawBody || ''}\n`;
  const generatedHash = createHmac('sha256', secret)
    .update(message)
    .digest('hex');
  logger.debug(`message: ${message}`);
  logger.debug(`generatedHash: ${generatedHash}`);
  return generatedHash;
};

export const authenicateHeaderHmac = () => {
  return async (_req: Request, res: Response, next: NextFunction) => {
    logger.debug('authenicateHeaderHmac');
    const req = _req as ParsedRequest;
    const account = await prisma.account.findFirstOrThrow({
      where: {
        merchantNo: (req.headers['shoplazza-merchant-id'] || '').toString(),
      },
    });
    const generatedHash = computeHmac(
      req.method,
      req.originalUrl,
      req.rawBody,
      account.signKey,
    );
    const hmac = (req.headers['shoplazza-hmac-sha256'] || '').toString();
    logger.debug(`hmac: ${hmac}`);
    if (
      !timingSafeEqual(Buffer.from(generatedHash), Buffer.from(hmac as string))
    ) {
      return res.status(400).send('HMAC validation failed');
    }
    (req as HeaderAuthenticatedRequest).auth = {
      account,
    };
    next();
  };
};

export const authenicateQueryHmac = () => {
  return (_req: Request, res: Response, next: NextFunction) => {
    logger.debug('authenicateQueryHmac');
    const req = _req as QueryAuthenticatedRequest;
    const json = Object.assign({}, req.query) as { [key: string]: string };
    delete json['hmac'];
    const sortedKeys = Object.keys(json).sort();
    const message = sortedKeys
      .map((key: string) => `${key}=${json[key]}`)
      .join('&');
    const generatedHash = createHmac('sha256', config.shoplazza.clientSecret)
      .update(message)
      .digest('hex');
    const { hmac } = req.validated.query;
    logger.debug(`message: ${message}`);
    logger.debug(`generatedHash: ${generatedHash}`);
    logger.debug(`hmac: ${hmac}`);
    if (
      !timingSafeEqual(Buffer.from(generatedHash), Buffer.from(hmac as string))
    ) {
      return res.status(400).send('HMAC validation failed');
    }
    next();
  };
};
