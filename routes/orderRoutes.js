import express from "express";
import { protect } from '../middleware/protect.js';
import { isAdmin } from '../middleware/isAdmin.js';
import {
  placeOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from "../controller/orderController.js";

const router = express.Router();
router.post("/order", placeOrder);
router.get("/orders/:userId", getUserOrders);
router.get("/order/:orderId", getOrderById);

// Admin-only routes
router.put("/order/:orderId", protect, isAdmin, updateOrderStatus); // Update order status (admin)
router.delete("/order/:orderId", protect, isAdmin, cancelOrder); // Cancel order (admin)
export default router;
