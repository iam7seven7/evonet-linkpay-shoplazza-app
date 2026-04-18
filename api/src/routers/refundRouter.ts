import { Router } from 'express';
import createHandler from '@/handlers/refund/createHandler';
import queryHandler from '@/handlers/refund/queryHandler';
import { authenicateHeaderHmac } from '@/middlewares/authentication';
import { validateBody, validateQuery } from '@/middlewares/validations';
import { CreateRefundBodySchema, QueryRefundQuerySchema } from '@/schemas';

const router = Router();
router.post(
  '/create',
  [authenicateHeaderHmac(), validateBody(CreateRefundBodySchema)],
  createHandler,
);
router.get(
  '/query',
  [authenicateHeaderHmac(), validateQuery(QueryRefundQuerySchema)],
  queryHandler,
);
export default router;
