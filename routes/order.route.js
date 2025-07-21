import express from 'express';
import { protect } from '../middlewares/authmiddleware.js';
import { createOrder, getOrder, updateOrder, deleteOrder, returnOrder, getOrderById, trackOrder, getUserOrders, updateOrderStatus } from '../controllers/order.controller.js';

const router = express.Router();

router.post('/create-order', createOrder);
router.get('/orders', getOrder);
router.get('/user-orders/:userId', protect, getUserOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id', updateOrder);
router.patch('/update-status/:id', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);
router.post('/orders/:id/return', returnOrder);
router.get('/orders/track/:orderId', trackOrder);

export default router;