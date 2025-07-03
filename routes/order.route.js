import express from 'express';
import { createOrder, getOrder, updateOrder, deleteOrder } from '../controllers/orderController.js';

const router = express.Router();

router.post('/orders', createOrder);
router.get('/orders/:id', getOrder);
router.put('/orders/:id', updateOrder);
router.delete('/orders/:id', deleteOrder);

export default router; 