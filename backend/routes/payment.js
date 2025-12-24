import express from 'express';
import {
  createPaymentIntent,
  fakePayment,
  stripeWebhook,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-intent', protect, createPaymentIntent);
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

router.post('/fake-payment', protect, fakePayment);

export default router;
