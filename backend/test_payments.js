import app, { server } from './server.js';
import mongoose from 'mongoose';
import { disconnectDB } from './src/config/db.js';
import Product from './src/models/Product.js';

const BASE_URL = 'http://localhost:5000/api';

const runPaymentTests = async () => {
  console.log('--- Starting Step 6: Stripe Payment Integration Tests ---');

  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => mongoose.connection.once('open', resolve));
  }

  try {
    // 1. Setup user
    console.log('1. Setting up customer account...');
    const userRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Payment Tester',
        email: 'payment_tester@example.com',
        password: 'Password123!',
      }),
    });
    const userData = await userRes.json();
    const token = userData.data.token;

    // 2. Create product
    console.log('2. Creating test product ($49.99, stock: 15)...');
    const product = await Product.create({
      name: 'Wireless Bluetooth Earbuds',
      description: 'Compact wireless earbuds with charging case.',
      price: 49.99,
      category: 'Electronics',
      stock: 15,
    });

    // 3. Test empty items
    console.log('3. Testing payment intent with empty items...');
    const emptyRes = await fetch(`${BASE_URL}/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items: [] }),
    });
    const emptyData = await emptyRes.json();
    if (emptyRes.status !== 400) {
      throw new Error(`Empty items not rejected! Status: ${emptyRes.status}`);
    }
    console.log(`   Empty items cleanly rejected: "${emptyData.message}"`);

    // 4. Test unauthenticated request
    console.log('4. Testing unauthenticated payment intent request...');
    const unauthRes = await fetch(`${BASE_URL}/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ product: product._id, quantity: 1 }] }),
    });
    if (unauthRes.status !== 401) {
      throw new Error('Unauthenticated request was not blocked!');
    }
    console.log('   Unauthenticated request cleanly blocked (Status 401).');

    // 5. Test valid payment intent creation
    console.log('5. Testing valid payment intent creation (3 items @ $49.99 = $149.97)...');
    const payRes = await fetch(`${BASE_URL}/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: [
          {
            product: product._id,
            quantity: 3,
            price: 1.0, // Client fake price — MUST be ignored by backend
          },
        ],
      }),
    });
    const payData = await payRes.json();

    if (payRes.status !== 200 || !payData.clientSecret) {
      throw new Error(`Payment intent failed: ${JSON.stringify(payData)}`);
    }

    if (payData.amount !== 149.97) {
      throw new Error(`Expected calculated amount 149.97, got: ${payData.amount}`);
    }

    console.log(`   Payment intent successfully generated!`);
    console.log(`   Server calculated amount: $${payData.amount}`);
    console.log(`   Client secret generated: ${payData.clientSecret.substring(0, 20)}...`);

    console.log('\n ALL Step 6 Stripe Payment Tests PASSED successfully!');
  } catch (err) {
    console.error(' Step 6 Payment Test Failed:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
    await disconnectDB();
    console.log('Server and database closed cleanly.');
  }
};

setTimeout(runPaymentTests, 1500);
