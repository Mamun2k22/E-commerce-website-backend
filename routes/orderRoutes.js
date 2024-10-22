import express from "express";
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
router.put("/order/:orderId", updateOrderStatus);
router.delete("/order/:orderId", cancelOrder);
export default router;
