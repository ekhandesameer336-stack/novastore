import Stripe from 'stripe';
import Product from '../models/Product.js';

// @route   POST /api/create-payment-intent
// @desc    Calculate order total server-side and create Stripe PaymentIntent
// @access  Private (Logged-in customer)
export const createPaymentIntent = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart cannot be empty. Please add items to checkout.',
      });
    }

    // SERVER-SIDE TOTAL CALCULATION DIRECTLY FROM MONGOOSE
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found.`,
        });
      }

      const quantity = Number(item.quantity);
      if (!quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for product "${product.name}".`,
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}`,
        });
      }

      totalAmount += product.price * quantity;
    }

    // Round total to 2 decimal places
    totalAmount = Math.round(totalAmount * 100) / 100;
    // Stripe expects amount in integer cents (e.g. $10.50 -> 1050 cents)
    const amountInCents = Math.round(totalAmount * 100);

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    // If a valid Stripe test key is provided, use the real Stripe SDK
    if (stripeKey && stripeKey.startsWith('sk_test_') && !stripeKey.includes('placeholder')) {
      const stripe = new Stripe(stripeKey);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          userId: req.user._id.toString(),
          itemsCount: items.length.toString(),
        },
      });

      return res.status(200).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        amount: totalAmount,
        currency: 'usd',
      });
    }

    // Mock/Dev fallback mode when user has not yet configured their personal Stripe test key
    console.log(
      `[Stripe Dev Fallback] Calculated server total: $${totalAmount} (${amountInCents} cents). Using simulated payment intent for local testing.`
    );

    const mockPaymentIntentId = `pi_test_mock_${Date.now()}`;
    const mockClientSecret = `${mockPaymentIntentId}_secret_${Math.random().toString(36).substring(2, 12)}`;

    return res.status(200).json({
      success: true,
      clientSecret: mockClientSecret,
      paymentIntentId: mockPaymentIntentId,
      amount: totalAmount,
      currency: 'usd',
      note: 'Using simulated payment intent until STRIPE_SECRET_KEY (sk_test_...) is added to backend/.env',
    });
  } catch (error) {
    next(error);
  }
};
