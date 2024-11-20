import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { User } from "../model/index.model.js";
import { generateToken } from "../config/utils.js"; 
import dotenv from 'dotenv';
import bcrypt from "bcrypt";
import crypto from 'crypto';
// Load environment variables from .env file
dotenv.config();

// Protect middleware
const protect = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = decoded; // Attach decoded user info to the request object
    next();
  });
};

// Middleware to check authentication
const authenticate = (req, res, next) => {
  const token = req.cookies ? req.cookies.token : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.user = user; // Attach user info to the request
    next();
  });
};


// User registration (signup)
export const userSignup = async (req, res) => {
  const { name, mobile, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = (Math.floor(1000 + Math.random() * 9000)).toString(); // 6-digit OTP
    const hashedPassword = await bcrypt.hash(password, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes

    const newUser = new User({
      name,
      mobile,
      email,
      password: hashedPassword,
      verificationOtp: otp,
      otpExpiresAt,
      role: "user", // Assign default role
    });
    await newUser.save();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: req.body.email,
      subject: "Your OTP for Email Verification",
      html: `<p>Your OTP for verifying your email is: <strong>${otp}</strong></p>`,
    };

    await transporter.sendMail(mailOptions);
    res.status(201).json({ message: "User registered. Please check your email for the OTP." });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// User login

export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare the entered password with the hashed password in the database
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify your email before logging in." });
    }

    const token = generateToken(user);
    req.session.userId = user._id; // Store user ID in session
    res.status(200).json({
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        mobile: user.mobile,
        role: user.role // Return the user's role
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};



// Logout user
export const userLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Error logging out" });
    }

    // Clear the session cookie (usually named 'connect.sid' by default)
    res.clearCookie("connect.sid", {
      path: "/", 
      httpOnly: true, 
      sameSite: "strict", 
      secure: process.env.NODE_ENV === "production", // Set 'secure' flag in production
    });

    res.status(200).json({ message: "Logged out successfully" });
  });
};

// OTP verification
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  console.log("email and otp", req.body)
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if OTP matches and is still valid
    if (user.verificationOtp !== otp || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.verificationOtp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.status(200).json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Forgot password function
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // Token expires in 15 minutes

    await user.save();

    // Email setup
    const resetURL = `https://bholamart.com/reset-password/${resetToken}`;
    const message = `
      <p>You requested a password reset.</p>
      <p>Click <a href="${resetURL}">here</a> to reset your password.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: message,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("Error in forgot password:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if token is still valid
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password and save it
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Email verification
// export const userVerifyEmail = async (req, res) => {
//   const { token } = req.query;
//   try {
//     const user = await User.findOne({ verificationToken: token });

//     if (!user) {
//       return res.status(400).json({ message: "Invalid or expired token" });
//     }

//     user.isVerified = true; 
//     user.verificationToken = null; 
//     await user.save();

//     res.status(200).json({ message: "Email verified successfully. You can now log in." });
//   } catch (error) {
//     console.error("Error verifying email:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };


// Export the middleware for use in routes
export { protect, authenticate };
