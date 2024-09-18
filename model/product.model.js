import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      enum: ['S', 'M', 'L', 'XL', 'XXL'], // Example sizes
      required: true,
    },
    weight: {
      type: String,
      enum: [50, 100, 250, 500, 1000], // Fixed typo: 'emum' -> 'enum'
      required: true,
    },
    description: {
      type: String,
      // Description is optional
    },
    stock: {
      type: Number,
      default: 0, // Default stock value is 0
    },
    ratings: {
      type: Number,
      default: 0,
      min: 0, // Ratings can't be less than 0
      max: 5, // Ratings can't exceed 5
    },
    imageUrl: {
      type: String,
      required: false, // Optional field for product image
    },
    createdAt: {
      type: Date,
      default: Date.now, // Automatically set the creation date
    },
    updatedAt: {
      type: Date,
      default: Date.now, // Automatically set the last updated date
    }
});

const Product = mongoose.model('Product', productSchema);

export default Product;
