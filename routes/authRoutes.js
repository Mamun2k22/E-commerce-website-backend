import express from "express";
import { userSignup, userLogin, verifyOtp, userLogout } from "../controller/authController.js";

const router = express.Router();

// Authentication routes
router.post("/signup", userSignup);
router.post("/login", userLogin);
router.post("/verify-otp", verifyOtp);
router.post("/logout", userLogout);

export default router;
