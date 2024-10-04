import express from "express";
import { userSignup, userLogin, userVerifyEmail, userLogout } from "../controller/authController.js";

const router = express.Router();

// Authentication routes
router.post("/signup", userSignup);
router.post("/login", userLogin);
router.get("/verify-email", userVerifyEmail);
router.post("/logout", userLogout);

export default router;
