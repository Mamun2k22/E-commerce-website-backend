// productRoutes.js

import express from 'express';
import {addProduct,
  getAllProducts,
  deleteProductById, singleProducts
} from '../controller/productController.js';

const router = express.Router();

router.post('/', addProduct);
router.get('/', getAllProducts);
router.get('/:id', singleProducts);
router.delete('/:id', deleteProductById);

export default router;
