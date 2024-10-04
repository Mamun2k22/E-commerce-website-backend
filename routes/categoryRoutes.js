// categoryRoutes.js

import express from 'express';
import {
  addCategory,
  getAllCategories,
  getProductsByCategory,
} from '../controller/categoryController.js';

const router = express.Router();

// Route to add a new category
router.post('/', addCategory);

// Route to get all categories
router.get('/', getAllCategories);

// Route to get products by category name
router.get('/:name', getProductsByCategory);

export default router;
