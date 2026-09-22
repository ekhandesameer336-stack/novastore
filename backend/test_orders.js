import app, { server } from './server.js';
import mongoose from 'mongoose';
import { disconnectDB } from './src/config/db.js';

const BASE_URL = 'http://localhost:5000/api';

const runOrderTests = async () => {
  console.log('--- Starting Step 5: Order APIs & Server-Side Calculation Tests ---');

  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => mongoose.connection.once('open', resolve));
  }

  try {
    // 1. Setup Admin & Customer
    console.log('1. Setting up accounts...');
    const adminRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Orders Admin',
        email: 'admin_orders@example.com',
        password: 'AdminPassword123!',
        role: 'admin',
      }),
    });
    const adminData = await adminRes.json();
    const adminToken = adminData.data.token;

    const custRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Customer Charlie',
        email: 'charlie@example.com',
        password: 'CharliePassword123!',
        role: 'customer',
      }),
    });
    const custData = await custRes.json();
    const custToken = custData.data.token;

    // 2. Create a test product
    console.log('2. Creating inventory product ($99.50, stock: 10)...');
    const prodRes = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Smart Speaker with Voice Assistant',
        description: 'High fidelity smart speaker with hands-free assistance.',
        price: 99.5,
        category: 'Electronics',
        stock: 10,
      }),
    });
    const prodData = await prodRes.json();
    const productId = prodData.data._id;

    // 3. Test Empty Cart Rejection
    console.log('3. Testing order submission with empty cart...');
    const emptyOrderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`,
      },
      body: JSON.stringify({
        items: [],
        shippingAddress: {
          street: '123 Main St',
          city: 'Boston',
          state: 'MA',
          zip: '02108',
          country: 'USA',
        },
      }),
    });
    const emptyOrderData = await emptyOrderRes.json();
    if (emptyOrderRes.status !== 400) {
      throw new Error(`Empty order was not rejected! Status: ${emptyOrderRes.status}`);
    }
    console.log(`   Empty order cleanly rejected: "${emptyOrderData.message}"`);

    // 4. Test Server-Side Price Calculation & Price Tampering Prevention
    console.log('4. Testing server-side price calculation (tampering prevention)...');
    // Attempting to send a fake price of $0.99 instead of $99.50
    const createOrderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`,
      },
      body: JSON.stringify({
        items: [
          {
            product: productId,
            quantity: 2,
            price: 0.99, // Tampered client price — server MUST ignore this
          },
        ],
        shippingAddress: {
          street: '456 Elm St',
          city: 'Boston',
          state: 'MA',
          zip: '02108',
          country: 'USA',
        },
      }),
    });
    const createOrderData = await createOrderRes.json();
    if (createOrderRes.status !== 201) {
      throw new Error(`Order creation failed: ${JSON.stringify(createOrderData)}`);
    }

    const order = createOrderData.data;
    // Expected: 2 * 99.50 = 199.00
    if (order.totalAmount !== 199.0) {
      throw new Error(`Server accepted tampered price! Total amount was: ${order.totalAmount}, expected: 199.00`);
    }
    console.log(`   Server correctly calculated total from database: $${order.totalAmount} (client fake price was ignored).`);

    // Verify stock was reduced from 10 to 8
    const checkProdRes = await fetch(`${BASE_URL}/products/${productId}`);
    const checkProdData = await checkProdRes.json();
    if (checkProdData.data.stock !== 8) {
      throw new Error(`Stock was not properly decremented! Current stock: ${checkProdData.data.stock}`);
    }
    console.log(`   Inventory stock successfully decremented to ${checkProdData.data.stock}.`);

    // 5. Test Insufficient Stock Handling
    console.log('5. Testing insufficient stock rejection...');
    const outOfStockRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${custToken}`,
      },
      body: JSON.stringify({
        items: [{ product: productId, quantity: 20 }], // only 8 available
        shippingAddress: {
          street: '456 Elm St',
          city: 'Boston',
          state: 'MA',
          zip: '02108',
          country: 'USA',
        },
      }),
    });
    const outOfStockData = await outOfStockRes.json();
    if (outOfStockRes.status !== 400 || !outOfStockData.message.includes('Insufficient stock')) {
      throw new Error(`Insufficient stock did not return 400: ${JSON.stringify(outOfStockData)}`);
    }
    console.log(`   Insufficient stock correctly rejected: "${outOfStockData.message}"`);

    // 6. Test Get My Orders (Customer)
    console.log('6. Testing customer order history (/api/orders/my)...');
    const myOrdersRes = await fetch(`${BASE_URL}/orders/my`, {
      headers: { Authorization: `Bearer ${custToken}` },
    });
    const myOrdersData = await myOrdersRes.json();
    if (myOrdersRes.status !== 200 || myOrdersData.count !== 1) {
      throw new Error(`Failed to fetch customer orders: ${JSON.stringify(myOrdersData)}`);
    }
    console.log(`   Customer order history retrieved: ${myOrdersData.count} order(s).`);

    // 7. Test Customer Cannot View All Orders
    console.log('7. Verifying non-admin cannot view all orders (/api/orders)...');
    const custGetAllRes = await fetch(`${BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${custToken}` },
    });
    if (custGetAllRes.status !== 403) {
      throw new Error(`Customer was allowed to access all orders! Status: ${custGetAllRes.status}`);
    }
    console.log('   Non-admin access to all orders successfully blocked (Status 403).');

    // 8. Test Admin View All Orders
    console.log('8. Testing Admin viewing all orders...');
    const adminGetAllRes = await fetch(`${BASE_URL}/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminGetAllData = await adminGetAllRes.json();
    if (adminGetAllRes.status !== 200 || adminGetAllData.count < 1) {
      throw new Error('Admin failed to retrieve all orders');
    }
    console.log(`   Admin successfully retrieved all orders in system (Count: ${adminGetAllData.count}).`);

    // 9. Test Order Status Update (Admin)
    console.log('9. Testing Admin updating order status to "shipped"...');
    const updateStatusRes = await fetch(`${BASE_URL}/orders/${order._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        orderStatus: 'shipped',
        paymentStatus: 'paid',
      }),
    });
    const updateStatusData = await updateStatusRes.json();
    if (
      updateStatusRes.status !== 200 ||
      updateStatusData.data.orderStatus !== 'shipped' ||
      updateStatusData.data.paymentStatus !== 'paid'
    ) {
      throw new Error(`Status update failed: ${JSON.stringify(updateStatusData)}`);
    }
    console.log(`   Order status successfully updated to: ${updateStatusData.data.orderStatus} (Payment: ${updateStatusData.data.paymentStatus})`);

    console.log('\n ALL Step 5 Order API Tests PASSED successfully!');
  } catch (err) {
    console.error(' Step 5 Order Test Failed:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
    await disconnectDB();
    console.log('Server and database closed cleanly.');
  }
};

setTimeout(runOrderTests, 1500);
