import express from 'express';
import { createOrder, getOrder, updateOrder, deleteOrder, returnOrder, getOrderById } from '../controllers/order.Controller.js';

const router = express.Router();

router.post('/orders', createOrder);
router.get('/orders', getOrder);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id', updateOrder);
router.delete('/orders/:id', deleteOrder);
router.post('/orders/:id/return', returnOrder);

export default router;