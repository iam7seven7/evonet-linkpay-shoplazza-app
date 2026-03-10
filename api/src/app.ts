import express, { Request, Response } from 'express';
import cors from 'cors';
import HttpError from 'http-errors';
import config from '@/config';
import { requestLogger, errorLogger, logger } from '@/middlewares/logger';
import errorHandler from '@/middlewares/errorHandler';

const app = express();
app.use(cors());
// set request max body size same as nginx default value
app.use(express.json({ limit: '1mb' }));
app.disable('x-powered-by');
app.use(requestLogger);

app.get('/', (_req: Request, res: Response) => {
  res.send({ data: 'Hello World' });
});

app.use((_req: Request, _res: Response) => {
  throw new HttpError.NotFound();
});

app.use(errorHandler);
app.use(errorLogger);
app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});
