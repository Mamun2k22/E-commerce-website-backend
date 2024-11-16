import mongoose from 'mongoose';
import { Product, AddToCart} from '../model/index.model.js'


export const addToCart = async (req, res) => {
  const { productId, userId, quantity, selectedSize,  selectedWeight, selectedColor, } = req.body;
console.log("add to cart product", req.body) ;
  try {
    // Fetch the product to get the price
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Calculate item price (product price)
    const itemPrice = product.price;  // Now use itemPrice, no more totalprice here

    // Check if the user already has this product in the cart
    const existingCartItem = await AddToCart.findOne({ productId, userId });

    if (existingCartItem) {
      // If product is already in the cart, update quantity
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
      return res.status(200).json({ message: 'Cart updated successfully', cartItem: existingCartItem });
    }

    // If product is not in the cart, create a new cart item
    const newCartItem = new AddToCart({
      productId,
      userId,
      quantity,
      selectedSize,
      selectedWeight,
      selectedColor,
      itemPrice,
    });

    await newCartItem.save();
    res.status(201).json({ message: 'Product added to cart', cartItem: newCartItem });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


export const getCarts = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Populate the product details (name and image) when fetching cart items
    const cartItems = await AddToCart.find({ userId: id })
      .populate('productId', 'productName productImage sizeWeight color'); // Populate productName and productImage

    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ message: 'No cart items found' });
    }

    res.status(200).json({ cartItems });
  } catch (error) {
    console.error('Error fetching carts:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


export const removeFromCart = async (req, res) => {
  const { userId, itemId } = req.params;

  // Validate if userId and itemId are valid ObjectIds
  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ message: 'Invalid user ID or item ID' });
  }

  try {
    // Delete the item based on userId and the item's _id (instead of itemId)
    const result = await AddToCart.deleteOne({ userId, _id: itemId });

    // Check if the item was found and deleted
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error removing product from cart:', error);
    res.status(500).json({ message: 'Failed to delete item', error: error.message });
  }
};

export const updateCartQuantity = async (req, res) => {
  const { itemId, userId } = req.params;
  const { quantity } = req.body;

  if (quantity < 1) {
    return res.status(400).json({ message: 'Quantity must be at least 1' });
  }

  try {
    // Find the cart item by itemId and userId
    const cartItem = await AddToCart.findOne({ _id: itemId, userId });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Update the quantity
    cartItem.quantity = quantity;

    // Save the updated cart item
    await cartItem.save();

    res.status(200).json({ message: 'Cart quantity updated successfully', cartItem });
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};





