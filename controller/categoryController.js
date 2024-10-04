
import { Product, Category, } from '../model/index.model.js'

// Add new category
export const addCategory = async (req, res) => {
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
};

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).send(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

// Get products by category name
export const getProductsByCategory=  async (req, res) => {
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
  };