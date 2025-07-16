import express from 'express';
import { createOrder, getOrder, updateOrder, deleteOrder, returnOrder, getOrderById, getUserOrders } from '../controllers/order.Controller.js';
import { protect } from '../middlewares/authmiddleware.js';

const router = express.Router();

router.post('/create-order', createOrder);
router.get('/orders', getOrder);
router.get('/user-orders/:userId', protect, getUserOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id', updateOrder);
router.delete('/orders/:id', deleteOrder);
router.post('/orders/:id/return', returnOrder);

export default router;