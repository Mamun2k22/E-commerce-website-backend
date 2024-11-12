import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// // Define user schema
// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   mobile: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   isVerified: { type: Boolean, default: true},
// });

// // Password hashing before saving the user
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// // Compare password method
// userSchema.methods.comparePassword = function (password) {
//   return bcrypt.compare(password, this.password);
// };

// // Export the user model
// const User = mongoose.model("User", userSchema);
// export default User;

// Define user schema

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  profileImage: { type: String },
  verificationOtp: String,
  otpExpiresAt: Date,
  role: { type: String, enum: ["user", "admin"], default: "user" },
  resetPasswordToken: String,       
  resetPasswordExpires: Date          
});

// Export the user model
const User = mongoose.model("User", userSchema);
export default User;
