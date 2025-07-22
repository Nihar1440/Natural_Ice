import express from 'express';
import { createCheckoutSession ,storeOrderAfterPayment} from '../controllers/stripe.controller.js';
import { getPaymentDetails } from '../controllers/payment.controller.js';
const router = express.Router();
router.post('/create-checkout-session', createCheckoutSession);
router.post('/store-order', storeOrderAfterPayment);

router.get('/payment-details/:orderId', getPaymentDetails);

export default router;