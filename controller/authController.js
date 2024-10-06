import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { User } from "../model/index.model.js";
import { generateToken } from "../config/utils.js"; 
import dotenv from 'dotenv';
import bcrypt from "bcrypt";

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
  console.log(req.body);
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const verificationToken = randomBytes(32).toString("hex");

    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      mobile,
      email,
      password: hashedPassword,
      verificationToken,
    });
    await newUser.save();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASS,
      },
    });
    const verificationUrl = `http://localhost:5000/api/auth/verify-email?token=${verificationToken}
`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: req.body.email,
      subject: "Verify your email",
      html: `<p>Please click the following link to verify your email:</p>
             <a href="${verificationUrl}">Verify Email</a>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "User registered. Please check your email to verify your account.",
    });
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
      user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in" });
  }
};


// Email verification
export const userVerifyEmail = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.isVerified = true; // Update user to verified
    user.verificationToken = null; // Remove the verification token after verification
    await user.save();

    res.status(200).json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Internal Server Error" });
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

// Export the middleware for use in routes
export { protect, authenticate };
