import { Response, NextFunction } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import config from '@/config';
import { HmacQuery } from '@/schemas';
import { Request } from '@/types';

export const authenicateHmac = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { hmac } = req.validated?.query as HmacQuery;
    const map = Object.assign({}, req.query) as { [key:string]: string };
    delete map["hmac"];
    const sortedKeys = Object.keys(map).sort();
    const message = sortedKeys.map((key:string) => `${key}=${(map[key])}`).join('&');

    const generatedHash = createHmac("sha256", config.shoplazza.clientSecret)
      .update(message)
      .digest("hex");
    if (!timingSafeEqual(Buffer.from(generatedHash), Buffer.from(hmac as string))) {
      return res.status(400).send("HMAC validation failed");
    }
    next();
  }
}
