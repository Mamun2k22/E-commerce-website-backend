import mongoose from 'mongoose';
const { Schema } = mongoose;


const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      selectedSize: { type: String },
       // Add size for the selected product
      selectedWeight: { type: String },
       // Add weight for the selected product
      selectedColor: { type: String },

    },
  ],
  totalPrice: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
  },
  shippingCost: {
    type: Number,
    required: true,
  },
  shippingOption: {
    type: String,
    enum: ['inside', 'outside'],
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['Bkash', 'Cash', 'Cash on Delivery'], 
    required: true,
  },
  
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pay', 'paid'],
    default: 'pay',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { 
  collection: 'order', 
});




const Order = mongoose.model('Order', OrderSchema);
export default Order;
