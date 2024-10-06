import { Product } from "../model/index.model.js";


// Add new product
export const addProduct = async (req, res) => {
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
};


// Get product by ID
export const singleProducts = async (req, res) => {
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
  };


// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).send(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// Delete product by ID
export const deleteProductById = async (req, res) => {
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
};
