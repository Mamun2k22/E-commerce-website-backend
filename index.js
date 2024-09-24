import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import User from "./model/user.model.js";
import Product from "./model/product.model.js"; // Import Product model
import Category from "./model/category.model.js";
import jwt from "jsonwebtoken";
import multer from "multer";

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Vholamart Is Running Now");
});

// MongoDB connection using Mongoose
const uri = process.env.MONGO_URL;
if (!uri) {
  throw new Error(
    "MongoDB connection string is not defined in the environment variables"
  );
}

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// Register API
app.post("/signup", async (req, res) => {
  const { name, mobile, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      name,
      mobile,
      email,
      password,
    });
    await newUser.save();

    const token = generateToken(newUser);
    res
      .status(201)
      .json({
        token,
        user: { id: newUser._id, name: newUser.name, email: newUser.email },
      });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Login API
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).send({ message: "Invalid email or password" });
    }

    const token = generateToken(user);
    res
      .status(200)
      .send({
        token,
        user: { id: user._id, name: user.name, email: user.email },
      });
  } catch (error) {
    res.status(500).send({ message: "Error logging in", error });
  }
});

// Get All Users API
app.get("/users", async (req, res) => {
  try {
    // Fetch all users, excluding passwords
    const users = await User.find().select('-password');

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Return the list of users
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

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



// Middleware to protect routes
const protect = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).send({ message: "Not authorized, no token" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Not authorized, token failed" });
    }

    req.user = decoded.id;
    next();
  });
};

// Protected route example
app.get("/protected", protect, (req, res) => {
  res.send({ message: "This is a protected route", userId: req.user });
});

// Get all products
app.get("/products", async (req, res) => {
  const products = await Product.find({});
  res.send(products);
});

// Delete product by ID
app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }
    res.send({ message: "Product deleted successfully", product });
  } catch (error) {
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

    res.send({ message: "Product updated successfully", product });
  } catch (error) {
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

app.post("/categories", async (req, res) => {
  try {
    const { categoryName, image } = req.body; // Now expecting 'image' as a URL
    console.log("Category Name:", categoryName);
    console.log("Image URL:", image); // This should log the image URL

    if (!categoryName || !image) {
      return res
        .status(400)
        .send({ message: "Category name and image URL are required" });
    }

    const newCategory = new Category({
      name: categoryName,
      image: image, // Save the image URL instead of image path
    });

    await newCategory.save();

    res
      .status(201)
      .send({ message: "Category added successfully", category: newCategory });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error" });
  }
});

// API to get the categories
// API to get the categories
app.get("/categories", async (req, res) => {
  const categories = await Category.find({});
  console.log(categories);
  res.send(categories);
});



// Get products by category name
app.get("/category/:name", async (req, res) => {
  try {
    const category = req.params.name;
    const products = await Product.find({ categoryName: category });

    if (!products || products.length === 0) {
      res.status(404).send({ message: "No products found for this category." });
    } else {
      res.send(products);
    }
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Get product by ID
app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }
    res.send(product);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

app.post("/products", async (req, res) => {
  try {
    const {
      productName,
      categoryName,
      color,
      productImage, // Array of Image URLs
      brand,
      price,
      discount,
      status,
      stock,
      sizeWeight, // Expected array of { size: String, weight: Number }
      details,
      longDetails,
    } = req.body;

    // Log to check the request body
    console.log(req.body);

    // Validate required fields
    if (
      !productName ||
      !categoryName ||
      !productImage ||
      !Array.isArray(productImage) ||
      productImage.length === 0 || // Check that productImage is an array with at least 1 image
      !brand ||
      !price ||
      !details ||
      !longDetails
    ) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields" });
    }

    // No strict validation for sizeWeight
    for (const item of sizeWeight) {
      // Here, we don't need to check if both size and weight are missing.
      // The user can post without either size or weight, and it's valid.
      if (!item.size && !item.weight) {
        // It's okay, no error should be returned.
        continue;
      }
    }

    // Create and save the new product
    const newProduct = new Product({
      productName,
      categoryName,
      color,
      productImage, // Now accepts an array of image URLs
      brand,
      price,
      discount,
      status,
      stock,
      sizeWeight, // Array of size and/or weight
      details,
      longDetails,
    });

    // Save the product to the database
    await newProduct.save();

    res.status(201).json({
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Server error. Unable to add product." });
  }
});

// Start the server only after the MongoDB connection is established
app.listen(port, () => {
  console.log(`Vholamart Is Running Now on port ${port}`);
});
