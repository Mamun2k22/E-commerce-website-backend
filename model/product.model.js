import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  productName: {
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
    discount: {
      type: Number,
    },
    brand: {
      type: String,
      required: false,
    },
    sizeWeight: [
      {
        size: {
          type: String,
          // enum: ['S', 'M', 'L', 'XL', 'XXL'], // Optional sizes enum
          required: false // Make size optional
        },
        weight: {
          type: Number,
          // enum: [50, 100, 250, 500, 1000], // Optional weights enum in grams
          required: false // Make weight optional
        }
      }
    ],
    // sizeWeight: [
    //   {
    //     type: {
    //       type: String,
    //       enum: ['size', 'weight'],
    //       required: true
    //     },
    //     value: {
    //       type: String, // You can store both sizes and weights as strings, or use Number for weights
    //       required: true
    //     }
    //   }
    // ],
    
    color: { type: [String], required: false }, 
    
    details: {
      type: String,
      required: true,
    },
    longDetails: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      
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
    productImage: {
      type: [String],
      required: true, // Optional field for product image
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
