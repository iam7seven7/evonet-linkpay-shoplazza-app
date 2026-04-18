import express, { NextFunction, Request, Response } from 'express';
import HttpError from 'http-errors';
import config from '@/config';
import { requestLogger, errorLogger, logger } from '@/middlewares/logger';
import errorHandler from '@/middlewares/errorHandler';
import webhookRouter from '@/routers/webhookRouter';
import paymentRouter from '@/routers/paymentRouter';
import refundRouter from '@/routers/refundRouter';
import onboardingRouter from '@/routers/onboardingRouter';
import { workers } from '@/bullmq';
import { ParsedRequest } from '@/types';

const app = express();
app.use(
  express.json({
    // set request max body size same as nginx default value
    limit: '1mb',
    verify: (req, _res, buf) => {
      (req as ParsedRequest).rawBody = buf.toString();
    },
  }),
);
app.disable('x-powered-by');
app.use(requestLogger);

app.use('/webhook', webhookRouter);
app.use('/payment', paymentRouter);
app.use('/refund', refundRouter);
app.use('/', onboardingRouter);

app.get('/', (_req: Request, res: Response) => {
  return res.send({ data: 'Hello World' });
});

app.use((_: Request, res: Response, next: NextFunction) => {
  res.set('Content-Type', 'application/json');
  next();
});

app.use((_req: Request, _res: Response) => {
  throw new HttpError.NotFound();
});

app.use(errorHandler);
app.use(errorLogger);
workers.run();
app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});
