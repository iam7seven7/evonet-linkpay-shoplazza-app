import express, { Response } from 'express';
import cors from 'cors';
import HttpError from 'http-errors';
import config from '@/config';
import { requestLogger, errorLogger, logger } from '@/middlewares/logger';
import errorHandler from '@/middlewares/errorHandler';

import { validateQuery } from '@/middlewares/validations';
import { authenicateHmac } from '@/middlewares/authentication';
import axios from 'axios';
import { AuthorizedQuerySchema, InstallQuery, InstallQuerySchema } from '@/schemas';
import { Request } from '@/types';

const app = express();
app.use(cors());
// set request max body size same as nginx default value
app.use(express.json({ limit: '1mb' }));
app.disable('x-powered-by');
app.use(requestLogger);

app.get('/', (_req: Request, res: Response) => {
  res.send({ data: 'Hello World' });
});

const REDIRECT_URI='https://myrtis-unflogged-veronika.ngrok-free.dev/authorized';

app.get('/install', [
  validateQuery(InstallQuerySchema),
  authenicateHmac(),
], (req: Request, res: Response) => {
  const q = req.validated?.query as InstallQuery;
  const scopes = "read_payment_info write_payment_info";
  const { clientId } = config.shoplazza;
  res.redirect(
    `https://${q.shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${REDIRECT_URI}&response_type=code`
  );
});

app.get('/authorized', [
  validateQuery(AuthorizedQuerySchema),
  authenicateHmac(),
], async (req: Request, res: Response) => {
  const { code, hmac, shop } = req.query;
  if (shop && hmac && code) {
      const { appId, clientId, clientSecret } = config.shoplazza;
      const { data } = await axios.post(`https://${shop}/admin/oauth/token`, {
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: REDIRECT_URI,
      });
      // const result = await axios({
      //     method: "get",
      //     url: `https://${shop}/openapi/2022-01/customers`,
      //     headers: {
      //         "Access-Token": data.access_token,
      //     },
      // });
      // res.status(200).send(result.data ? result.data : "No customer found");
      res.redirect(
        `https://${shop}.myshoplaza.com/admin/smart_apps/coral/payment/providers/${appId}`
      )
  } else {
      res.status(400).send("Required parameters missing");
  }
});

app.use((_req: Request, _res: Response) => {
  throw new HttpError.NotFound();
});

app.use(errorHandler);
app.use(errorLogger);
app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port}`);
});
