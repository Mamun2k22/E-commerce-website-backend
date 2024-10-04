
import express from 'express';
import { addToCart, getCarts } from '../controller/cartController.js'; 
const router = express.Router();

// Route to add a product to the cart
router.post('/', addToCart); // Assuming the base route is '/cart'

// Route to get all carts for a specific user
router.get('/', getCarts); // Assuming the base route is '/carts'

// Export the router
export default router;
