import express from 'express';
import { createPaymentIntent } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/create-payment-intent
// @desc    Calculate total server-side and generate Stripe payment intent
// @access  Private (Logged-in customer)
router.post('/', protect, createPaymentIntent);

export default router;
