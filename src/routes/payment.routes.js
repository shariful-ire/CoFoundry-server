import { Router } from 'express';
import { createCheckout, stripeWebhook } from '../controllers/payment.controller.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = Router();

router.post('/create-checkout', verifyToken, createCheckout);

// Raw body parsing for this route is configured in app.js (must run before express.json())
router.post('/webhook', stripeWebhook);

export default router;
