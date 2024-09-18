import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import User from './model/user.model.js';
import Product from './model/product.model.js';
import Category from './model/category.model.js';
import jwt from 'jsonwebtoken';

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Vholamart Is Running Now');
});

// MongoDB connection using Mongoose
const uri = process.env.MONGO_URL;
if (!uri) {
  throw new Error('MongoDB connection string is not defined in the environment variables');
}

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Register API
app.post('/signup', async (req, res) => {
  const { name, mobile, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({
      name,
      mobile,
      email,
      password,
    });
    await newUser.save();

    const token = generateToken(newUser);
    res.status(201).json({ token, user: { id: newUser._id, name: newUser.name, email: newUser.email } });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Login API
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).send({ message: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.status(200).send({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).send({ message: 'Error logging in', error });
  }
});

// Middleware to protect routes
const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).send({ message: 'Not authorized, no token' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Not authorized, token failed' });
    }

    req.user = decoded.id;
    next();
  });
};

// Protected route example
app.get('/protected', protect, (req, res) => {
  res.send({ message: 'This is a protected route', userId: req.user });
});

// Get all products
app.get('/products', async (req, res) => {
  const products = await Product.find({});
  res.send(products);
});

// API to get the categories
app.get('/categories', async (req, res) => {
  const categories = await Category.find({});
  console.log(categories)
  res.send(categories);
});

// Get products by category name
app.get('/category/:name', async (req, res) => {
  try {
    const category = req.params.name;
    const products = await Product.find({ categoryName: category });

    if (!products || products.length === 0) {
      res.status(404).send({ message: 'No products found for this category.' });
    } else {
      res.send(products);
    }
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Get product by ID
app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }
    res.send(product);
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Start the server only after the MongoDB connection is established
app.listen(port, () => {
  console.log(`Vholamart Is Running Now on port ${port}`);
});
