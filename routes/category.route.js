import express from 'express';
import { protect,isAdmin,session } from "../middlewares/authmiddleware.js"
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory
} from '../controllers/category.controller.js';

const router = express.Router();

router.post('/create',isAdmin, createCategory);
router.put('/update/:id',isAdmin, updateCategory);
router.delete('/delete/:id',isAdmin, deleteCategory);
router.get('/', getCategories);
router.get('/:id', getCategoryById);
export default router;