import Order from '../models/Order.js';
import Product from '../models/Product.js';

// @route   POST /api/orders
// @desc    Create a new order with server-calculated prices from the database
// @access  Private (Logged-in customer)
export const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentIntentId, paymentStatus } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items provided. Cart cannot be empty.',
      });
    }

    if (
      !shippingAddress ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.zip ||
      !shippingAddress.country
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a complete shipping address (street, city, state, zip, country).',
      });
    }

    // SERVER-SIDE PRICE CALCULATION AND STOCK CHECK
    // Never trust prices sent from the client
    const verifiedOrderItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} does not exist.`,
        });
      }

      const quantity = Number(item.quantity);
      if (!quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for product "${product.name}". Must be at least 1.`,
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Requested: ${quantity}, Available: ${product.stock}`,
        });
      }

      // Decrement stock in database
      product.stock -= quantity;
      await product.save();

      const priceAtPurchase = product.price;
      calculatedTotal += priceAtPurchase * quantity;

      verifiedOrderItems.push({
        product: product._id,
        quantity,
        priceAtPurchase,
      });
    }

    // Round total to 2 decimal places to avoid floating point math precision issues
    const totalAmount = Math.round(calculatedTotal * 100) / 100;

    const order = await Order.create({
      user: req.user._id,
      items: verifiedOrderItems,
      totalAmount,
      shippingAddress,
      paymentStatus: paymentStatus === 'paid' ? 'paid' : 'pending',
      orderStatus: 'processing',
      paymentIntentId: paymentIntentId || '',
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/orders/my
// @desc    Get order history for the logged-in customer
// @access  Private (Logged-in customer)
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images price category')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/orders
// @desc    Get all orders across all users
// @access  Private (Admin only)
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/orders/:id/status
// @desc    Update order status or payment status
// @access  Private (Admin only)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const validOrderStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    const validPaymentStatuses = ['pending', 'paid', 'failed'];

    if (orderStatus) {
      if (!validOrderStatuses.includes(orderStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid orderStatus. Must be one of: ${validOrderStatuses.join(', ')}`,
        });
      }
      order.orderStatus = orderStatus;
    }

    if (paymentStatus) {
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid paymentStatus. Must be one of: ${validPaymentStatuses.join(', ')}`,
        });
      }
      order.paymentStatus = paymentStatus;
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};
