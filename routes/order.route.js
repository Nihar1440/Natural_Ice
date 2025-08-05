import express from 'express';
import { isAdmin, protect } from '../middlewares/authmiddleware.js';
import { createOrder, getOrder, updateOrder, deleteOrder, getOrderById, trackOrder, getUserOrders, updateOrderStatus, cancelOrder } from '../controllers/order.controller.js';
import { uploadReturnOrderImage } from '../middlewares/upload.js';
import { cancelReturnRequest, getAllReturnRequestOrders, getUserReturnRequest, returnOrderRequest, updateReturnRequestStatus } from '../controllers/returnOrder.controller.js';

const router = express.Router();

router.post('/create-order', createOrder);
router.get('/orders', getOrder);
router.get('/user-orders/:userId', protect, getUserOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id', updateOrder);
router.patch('/update-status/:id', updateOrderStatus);
router.patch('/orders/:orderId/cancel', cancelOrder)
router.delete('/orders/:id', deleteOrder);
router.get('/orders/track/:orderId', trackOrder);

router.post('/return-request/:orderId', uploadReturnOrderImage.single('image'), returnOrderRequest);
router.patch('/cancel-return-request/:id', cancelReturnRequest);
router.get('/user-return-request/:userId', getUserReturnRequest);

router.get('/return-request',isAdmin, getAllReturnRequestOrders);
router.patch('/update-return-request/:id', updateReturnRequestStatus);

export default router;