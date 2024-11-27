// productRoutes.js

import express from 'express';
import {
  addProduct,
  getAllProducts,
  deleteProductById,
  singleProducts,
  searchQuery,
  getRelatedProducts, updateProductById
} from '../controller/productController.js';

const router = express.Router();

// Public/User-accessible routes
router.get('/search', searchQuery);              
router.get('/:id', singleProducts);               
router.get('/related/:category', getRelatedProducts); // View related products by category (public)
router.get('/', getAllProducts); 
router.post('/', addProduct); 
router.delete('/:id', deleteProductById); 
router.put('/:id', updateProductById);


export default router;
