import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import User from "./model/user.model.js";
import Product from "./model/product.model.js";
import Category from "./model/category.model.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import Cart from "./model/cart.model.js";
import UserProductId from "./model/productuserid.model.js";
import Color from './model/color.model.js'; // Import the Color model
import cookieParser from "cookie-parser";



dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
// CORS Configuration
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true, // This allows cookies to be sent
}));
app.use(cookieParser());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
}));

// MongoDB connection
const uri = process.env.MONGO_URL;
if (!uri) {
  throw new Error("MongoDB connection string is not defined in the environment variables");
}

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// API routes
app.get("/", (req, res) => {
  res.send("Vholamart Is Running Now");
});

// Protect middleware
const protect = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = decoded; // Attach decoded user info to the request object
    next();
  });
};

// User registration
app.post("/signup", async (req, res) => {
  const { name, mobile, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const newUser = new User({ name, mobile, email, password });
    await newUser.save();
    const token = generateToken(newUser);
    res.status(201).json({
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// User login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ message: "Invalid email or password" });
    }

    // Compare the plain-text password directly
    if (user.password !== password) {
      return res.status(400).send({ message: "Invalid email or password" });
    }

    const token = generateToken(user);
    req.session.userId = user._id; // Store user ID in session
    res.status(200).send({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).send({ message: "Error logging in", error });
  }
});


// Middleware to check authentication
const authenticate = (req, res, next) => {
  const token = req.cookies ? req.cookies.token : null; // Safely access req.cookies

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // If you decide to verify the token in the future:
  // jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  //   if (err) return res.status(403).json({ message: 'Forbidden' });
  //   req.user = user; // You can attach user info to the request
  //   next();
  // });

  next(); // Proceed if the token is present (not verified here)
};

// User logout
// User logout without verifying token
app.post("/logout", (req, res) => {
  // Clear the session and remove the token cookie (if any)
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send({ message: "Error logging out" });
    }
    res.clearCookie("token"); // Clear the token cookie if it exists
    res.status(200).send({ message: "Logged out successfully" });
  });
});



// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find().select('-password');
    if (!users.length) {
      return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete user by ID
app.delete("/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).send(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Delete product by ID
app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }
    res.status(200).send({ message: "Product deleted successfully", product });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Update product by ID
app.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }
    res.status(200).send({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
});

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Categories API
app.post("/categories", async (req, res) => {
  const { categoryName, image } = req.body;
  if (!categoryName || !image) {
    return res.status(400).send({ message: "Category name and image URL are required" });
  }
  try {
    const newCategory = new Category({ name: categoryName, image });
    await newCategory.save();
    res.status(201).send({ message: "Category added successfully", category: newCategory });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).send({ message: "Server error" });
  }
});

// Get all categories
app.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).send(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get products by category name
app.get("/category/:name", async (req, res) => {
  try {
    const products = await Product.find({ categoryName: req.params.name });
    if (!products.length) {
      return res.status(404).send({ message: "No products found for this category." });
    }
    res.status(200).send(products);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get product by ID
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }
    res.status(200).send(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Add new product
app.post("/products", async (req, res) => {
  const {
    productName,
    categoryName,
    color,
    productImage,
    brand,
    price,
    discount,
    status,
    stock,
    sizeWeight,
    details,
    longDetails,
  } = req.body;

  // Validate required fields
  if (!productName || !categoryName || !productImage || !Array.isArray(productImage) || !price || !details || !longDetails) {
    return res.status(400).json({ message: "Please fill in all required fields" });
  }

  try {
    const newProduct = new Product({
      productName,
      categoryName,
      color,
      productImage,
      brand,
      price,
      discount,
      status,
      stock,
      sizeWeight,
      details,
      longDetails,
    });
    
    await newProduct.save();
    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// POST API to add a product to the cart
app.post('/cart', async (req, res) => {
  const { productId, userId, quantity} = req.body;
console.log(req.body)
  try {
    // Fetch the product to get the price
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Calculate total price (assuming product.price exists in the Product schema)
    const totalprice = product.price * quantity;

    // Check if the user already has this product in the cart
    const existingCartItem = await UserProductId.findOne({ productId, userId });

    if (existingCartItem) {
      // If product is already in the cart, update quantity and total price
      existingCartItem.quantity += quantity;
      existingCartItem.totalprice += totalprice;
      await existingCartItem.save();
      return res.status(200).json({ message: 'Cart updated successfully', cartItem: existingCartItem });
    }

    // If product is not in the cart, create a new cart item
    const newCartItem = new UserProductId({
      productId,
      userId,
      quantity,
      totalprice,
    });

    await newCartItem.save();
    res.status(201).json({ message: 'Product added to cart', cartItem: newCartItem });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// GET API to access all carts for a specific user
app.get('/carts', async (req, res) => {
  const { id } = req.query;  // Expecting the `id` query parameter for user ID

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const cartItems = await UserProductId.find({ userId: id });  // Find cart items by userId

    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ message: 'No cart items found' });
    }

    res.status(200).json({ cartItems });
  } catch (error) {
    console.error('Error fetching carts:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});



// Remove item from cart
app.delete("/cart/:userId/:productId", protect, async (req, res) => {
  const { userId, productId } = req.params;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



// Add new color
app.post("/colors", async (req, res) => {
  const { name, code } = req.body;
  console.log(req.body);

  if (!name || !code) {
    return res.status(400).json({ message: "Color name and code are required" });
  }

  try {
    const newColor = new Color({ name, code });
    await newColor.save();
    res.status(201).json({ message: "Color added successfully", color: newColor });
  } catch (error) {
    console.error("Error adding color:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get all colors
app.get("/colors", async (req, res) => {
  try {
    const colors = await Color.find({});
    res.status(200).json(colors);
  } catch (error) {
    console.error("Error fetching colors:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


// Server listening
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
