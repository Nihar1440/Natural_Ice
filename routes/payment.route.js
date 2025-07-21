import express from 'express';
import { createCheckoutSession ,storeOrderAfterPayment} from '../controllers/stripe.controller.js';
const router = express.Router();
router.post('/create-checkout-session', createCheckoutSession);
router.post('/store-order', storeOrderAfterPayment);

export default router;