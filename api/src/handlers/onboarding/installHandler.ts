import { Request, Response } from 'express';
import config from '@/config';
import { InstallRequest } from '@/types';

const handler = (_req: Request, res: Response) => {
  const req = _req as InstallRequest;
  const { query } = req.validated;
  const scopes = 'read_payment_info write_payment_info';
  const {
    shoplazza: { clientId },
    app: { baseUrl },
  } = config;
  const redirectUri = `${baseUrl}/authorized`;
  res.redirect(
    `https://${query.shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}&response_type=code`,
  );
};
export default handler;
