import { User, Order, Product} from '../model/index.model.js'

// Place a new order
export const placeOrder = async (req, res) => {
    try {
      const { cartItems, shippingOption, paymentMethod, shippingCost, totalCost, customer, userId, address } = req.body;
      console.log("first", userId)
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Prepare the products array for the order
      const products = await Promise.all(cartItems.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }
        return {
          product: product._id,
          quantity: item.quantity,
          price: item.price,  // Price from frontend (locked at time of order)
        };
      }));
  
      const newOrder = new Order({
        user: userId,
        products,
        totalPrice: totalCost,
        shippingCost,
        shippingOption,
        paymentMethod,
        customer: {
          name: customer.name || user.name,
          email: customer.email || user.email,
          mobile: customer.mobile || user.mobile,
        },
        address: address, 
      });
  
      await newOrder.save();
      res.status(201).json({ message: 'Order placed successfully', order: newOrder });
    } catch (error) {
      res.status(500).json({ message: 'Error placing order', error: error.message });
    }
  };
  

// Get all orders for a user
export const getUserOrders = async (req, res) => {
    try {
      const { userId } = req.params;  // Get userId from URL params
      
      // Populate 'products.product' and include 'productName' and 'productImage' from the Product schema
      const orders = await Order.find({ user: userId })
        .populate({
          path: 'products.product',
          select: 'productName productImage'  // Selecting specific fields to populate
        });
  
      if (!orders.length) {
        return res.status(404).json({ message: 'No orders found for this user' });
      }
  
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
  };
  
// Get a specific order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('products.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

// Update an order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();
    res.status(200).json({ message: 'Order updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
};

// Cancel or delete an order
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling order', error: error.message });
  }
};
