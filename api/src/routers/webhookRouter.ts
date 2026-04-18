import { Router } from 'express';
import webhookHandler from '@/handlers/webhook/webhookHandler';
import { validateBody } from '@/middlewares/validations';
import { WebhookBodySchema } from '@/schemas';

const router = Router();
router.post('/linkpay', [validateBody(WebhookBodySchema)], webhookHandler);
export default router;
