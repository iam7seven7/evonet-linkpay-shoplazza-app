import { validateQuery } from '@/middlewares/validations';
import { authenicateQueryHmac } from '@/middlewares/authentication';
import { AuthorizedQuerySchema, InstallQuerySchema } from '@/schemas';
import installHandler from '@/handlers/onboarding/installHandler';
import authorizedHandler from '@/handlers/onboarding/authorizedHandler';
import { Router } from 'express';

const router = Router();
router.get(
  '/install',
  [validateQuery(InstallQuerySchema), authenicateQueryHmac()],
  installHandler,
);

router.get(
  '/authorized',
  [validateQuery(AuthorizedQuerySchema), authenicateQueryHmac()],
  authorizedHandler,
);
export default router;
