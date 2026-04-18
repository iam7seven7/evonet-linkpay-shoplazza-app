import { Router } from 'express';
import createHandler from '@/handlers/payment/createHandler';
import completeHandler from '@/handlers/payment/completeHandler';
import queryHandler from '@/handlers/payment/queryHandler';
import { authenicateHeaderHmac } from '@/middlewares/authentication';
import { validateBody, validateQuery } from '@/middlewares/validations';
import {
  CompletePaymentQuerySchema,
  CreatePaymentBodySchema,
  QueryPaymentQuerySchema,
} from '@/schemas';

const router = Router();
router.post(
  '/create',
  [authenicateHeaderHmac(), validateBody(CreatePaymentBodySchema)],
  createHandler,
);
router.get(
  '/query',
  [authenicateHeaderHmac(), validateQuery(QueryPaymentQuerySchema)],
  queryHandler,
);
router.get(
  '/complete',
  [validateQuery(CompletePaymentQuerySchema)],
  completeHandler,
);
export default router;
