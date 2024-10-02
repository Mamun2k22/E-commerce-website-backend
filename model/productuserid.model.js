import mongoose from "mongoose";

// Define user schema
const productUserIdSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // reference to user collection
  quantity: { type: Number, default: 1 },
  totalprice: { type: Number, default: 1 },

},

{ collection: 'carts' }); // Explicitly set the collection name

// Export the user model
const UserProductId = mongoose.model("UserProductId", productUserIdSchema);
export default UserProductId;
