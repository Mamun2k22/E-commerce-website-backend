// productRoutes.js

import express from 'express';
import {
  addProduct,
  getAllProducts,
  deleteProductById,
  singleProducts,
  searchQuery,
  getRelatedProducts,
} from '../controller/productController.js';

const router = express.Router();

// Public/User-accessible routes
router.get('/search', searchQuery);               // Search products (public)
router.get('/:id', singleProducts);               // View single product details (public)
router.get('/related/:category', getRelatedProducts); // View related products by category (public)
router.get('/', getAllProducts); 
// Admin-specific routes (protected)
router.post('/', addProduct);      // Add new product (admin only)
  // List all products (admin only)
router.delete('/:id',  deleteProductById); // Delete product (admin only)

export default router;
