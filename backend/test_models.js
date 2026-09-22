import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './src/config/db.js';
import User from './src/models/User.js';
import Product from './src/models/Product.js';
import Order from './src/models/Order.js';

const runModelTests = async () => {
  console.log('--- Starting Step 2: Database Models Verification ---');
  await connectDB();

  try {
    // 1. Test User Model & Password Hashing
    console.log('1. Testing User model and bcrypt hashing...');
    const plainPassword = 'SecretPassword123!';
    const user = await User.create({
      name: 'Jane Customer',
      email: 'jane@example.com',
      password: plainPassword,
      role: 'customer',
      address: {
        street: '123 Tech Lane',
        city: 'Metropolis',
        state: 'CA',
        zip: '90210',
        country: 'USA',
      },
    });

    if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
      throw new Error(`Password was not hashed! Raw value: ${user.password}`);
    }
    console.log('   Password correctly hashed with bcrypt salt.');

    const isMatch = await user.matchPassword(plainPassword);
    const isWrongMatch = await user.matchPassword('WrongPassword');
    if (!isMatch || isWrongMatch) {
      throw new Error('Password comparison method failed.');
    }
    console.log('   Password verification method works correctly.');

    // 2. Test Product Model
    console.log('2. Testing Product model defaults & constraints...');
    const product = await Product.create({
      name: 'Wireless Noise-Canceling Headphones',
      description: 'Premium wireless headphones with active noise cancellation.',
      price: 199.99,
      category: 'Electronics',
      images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
    });

    if (product.stock !== 0 || product.ratingAverage !== 0 || product.ratingCount !== 0) {
      throw new Error('Product defaults were not applied properly.');
    }
    console.log('   Product defaults verified: stock=0, ratingAverage=0, ratingCount=0.');

    // 3. Test Order Model
    console.log('3. Testing Order model references and defaults...');
    const order = await Order.create({
      user: user._id,
      items: [
        {
          product: product._id,
          quantity: 2,
          priceAtPurchase: 199.99,
        },
      ],
      totalAmount: 399.98,
      shippingAddress: {
        street: '123 Tech Lane',
        city: 'Metropolis',
        state: 'CA',
        zip: '90210',
        country: 'USA',
      },
    });

    if (order.paymentStatus !== 'pending' || order.orderStatus !== 'processing') {
      throw new Error('Order default statuses not set properly.');
    }
    console.log('   Order verified with pending payment and processing status.');

    // 4. Test Validation Rejection (e.g. invalid role)
    console.log('4. Testing validation rules...');
    let validationFailed = false;
    try {
      await User.create({
        name: 'Invalid User',
        email: 'invalid@example.com',
        password: '123', // < 6 chars
        role: 'superadmin', // Invalid enum
      });
    } catch (valErr) {
      validationFailed = true;
      console.log('   Invalid data correctly rejected by Mongoose validation:', valErr.message);
    }

    if (!validationFailed) {
      throw new Error('Mongoose failed to reject invalid schema data.');
    }

    console.log('\n ALL Step 2 Model Tests PASSED successfully!');
  } catch (error) {
    console.error(' Step 2 Verification Failed:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
    console.log('Database disconnected.');
  }
};

runModelTests();
