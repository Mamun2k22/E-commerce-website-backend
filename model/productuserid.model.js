import mongoose from "mongoose";

// Define user schema
const productUserIdSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // reference to user collection
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Add productId to reference Product schema
  quantity: { type: Number, default: 1 },
  itemPrice: { type: Number, default: 1 },
}, { collection: 'carts' }); 

// Export the user model
const AddToCart = mongoose.model("AddToCart", productUserIdSchema);
export default AddToCart;
