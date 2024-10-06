import { Product, UserProductId} from '../model/index.model.js'

// POST API to add a product to the cart
export const addToCart = async (req, res) => {
  const { productId, userId, quantity } = req.body;
  console.log(req.body);

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
};

// GET API to access all carts for a specific user
export const getCarts = async (req, res) => {
  const { id } = req.query; // Expecting the `id` query parameter for user ID

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const cartItems = await UserProductId.find({ userId: id }); // Find cart items by userId

    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ message: 'No cart items found' });
    }

    res.status(200).json({ cartItems });
  } catch (error) {
    console.error('Error fetching carts:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
