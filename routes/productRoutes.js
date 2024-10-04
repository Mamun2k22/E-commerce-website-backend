// productRoutes.js

import express from 'express';
import {
  getAllProducts,
  deleteProductById, singleProducts
} from '../controller/productController.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:id', singleProducts);
router.delete('/:id', deleteProductById);

export default router;
