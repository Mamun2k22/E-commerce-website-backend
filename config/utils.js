import jwt from "jsonwebtoken";

// Helper function to generate JWT
export const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};
