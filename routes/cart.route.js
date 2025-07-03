import express from 'express';
import { addItemToCart, getUserCart, mergeProduct, removeCartItem } from '../controllers/cart.controller.js';
const router = express.Router();

router.post('/create', addItemToCart);
router.get('/list',getUserCart)
router.delete('/delete/:id',removeCartItem)
router.post('/merge',mergeProduct)
export default router;

