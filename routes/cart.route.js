import express from 'express';
import { addItemToCart, clearUserCart, getUserCart, mergeProduct, removeCartItem } from '../controllers/cart.controller.js';
import { protect } from '../middlewares/authmiddleware.js';
const router = express.Router();

router.post('/addToCart', addItemToCart);
router.get('/cartList',getUserCart)
router.delete('/delete/:id',removeCartItem)
router.delete('/clear', clearUserCart);
router.post('/merge', protect,mergeProduct)
export default router;

