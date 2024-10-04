// colorController.js

import { Color } from '../model/index.model.js'

// Add new color
export const addColor = async (req, res) => {
  const { name, code } = req.body;

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
};

// Get all colors
export const getColors = async (req, res) => {
  try {
    const colors = await Color.find({});
    res.status(200).json(colors);
  } catch (error) {
    console.error("Error fetching colors:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
