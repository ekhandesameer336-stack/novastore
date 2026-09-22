import app, { server } from './server.js';
import mongoose from 'mongoose';
import { disconnectDB } from './src/config/db.js';

const BASE_URL = 'http://localhost:5000/api';

const runProductTests = async () => {
  console.log('--- Starting Step 4: Product APIs Verification ---');

  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => mongoose.connection.once('open', resolve));
  }

  try {
    // 1. Setup Admin and Customer accounts
    console.log('1. Setting up Admin and Customer accounts...');
    const adminRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Product Manager Admin',
        email: 'admin_prod@example.com',
        password: 'AdminPassword123!',
        role: 'admin',
      }),
    });
    const adminData = await adminRes.json();
    const adminToken = adminData.data.token;

    const customerRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Shopper Bob',
        email: 'bob_prod@example.com',
        password: 'BobPassword123!',
        role: 'customer',
      }),
    });
    const customerData = await customerRes.json();
    const customerToken = customerData.data.token;

    // 2. Test Customer Cannot Create Product
    console.log('2. Verifying non-admin cannot create a product...');
    const unauthorizedCreate = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        name: 'Hacked Product',
        description: 'Should fail',
        price: 10,
        category: 'Hacks',
      }),
    });
    if (unauthorizedCreate.status !== 403) {
      throw new Error(`Customer was able to create product! Status: ${unauthorizedCreate.status}`);
    }
    console.log('   Non-admin creation successfully blocked with 403 Forbidden.');

    // 3. Admin Creates Products
    console.log('3. Admin creating products...');
    const createP1 = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Mechanical RGB Gaming Keyboard',
        description: 'RGB backlit mechanical keyboard with blue switches.',
        price: 89.99,
        category: 'Electronics',
        stock: 25,
      }),
    });
    const p1Data = await createP1.json();
    const p1Id = p1Data.data._id;

    const createP2 = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Ergonomic Office Chair',
        description: 'High back mesh ergonomic chair with lumbar support.',
        price: 249.5,
        category: 'Furniture',
        stock: 12,
      }),
    });
    const p2Data = await createP2.json();

    const createP3 = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Wireless Noise-Cancelling Headphones',
        description: 'Over-ear Bluetooth headphones with 30h battery life.',
        price: 179.99,
        category: 'Electronics',
        stock: 40,
      }),
    });
    const p3Data = await createP3.json();
    console.log('   3 products created successfully.');

    // 4. Test Public Get Products
    console.log('4. Testing public product listing...');
    const listRes = await fetch(`${BASE_URL}/products`);
    const listData = await listRes.json();
    if (listRes.status !== 200 || listData.count !== 3) {
      throw new Error(`Expected 3 products, found ${listData.count}`);
    }
    console.log(`   Public listing returned ${listData.count} products.`);

    // 5. Test Search Filter
    console.log('5. Testing search filter (?search=keyboard)...');
    const searchRes = await fetch(`${BASE_URL}/products?search=keyboard`);
    const searchData = await searchRes.json();
    if (searchData.count !== 1 || searchData.data[0].name !== 'Mechanical RGB Gaming Keyboard') {
      throw new Error(`Search filter failed: expected 1 match, found ${searchData.count}`);
    }
    console.log(`   Search filter successfully returned matching product: "${searchData.data[0].name}"`);

    // 6. Test Category Filter
    console.log('6. Testing category filter (?category=Electronics)...');
    const catRes = await fetch(`${BASE_URL}/products?category=Electronics`);
    const catData = await catRes.json();
    if (catData.count !== 2) {
      throw new Error(`Category filter failed: expected 2 products, found ${catData.count}`);
    }
    console.log(`   Category filter returned ${catData.count} electronics products.`);

    // 7. Test Categories Endpoint
    console.log('7. Testing distinct categories endpoint (/api/products/categories)...');
    const allCatsRes = await fetch(`${BASE_URL}/products/categories`);
    const allCatsData = await allCatsRes.json();
    if (!allCatsData.data.includes('Electronics') || !allCatsData.data.includes('Furniture')) {
      throw new Error('Distinct categories list missing expected categories');
    }
    console.log(`   Distinct categories: ${allCatsData.data.join(', ')}`);

    // 8. Test Get Single Product
    console.log('8. Testing get single product by ID...');
    const singleRes = await fetch(`${BASE_URL}/products/${p1Id}`);
    const singleData = await singleRes.json();
    if (singleRes.status !== 200 || singleData.data._id !== p1Id) {
      throw new Error('Could not fetch single product by ID');
    }
    console.log(`   Successfully fetched: "${singleData.data.name}"`);

    // 9. Test Update Product (Admin)
    console.log('9. Testing update product as Admin...');
    const updateRes = await fetch(`${BASE_URL}/products/${p1Id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        price: 79.99,
        stock: 50,
      }),
    });
    const updateData = await updateRes.json();
    if (updateRes.status !== 200 || updateData.data.price !== 79.99 || updateData.data.stock !== 50) {
      throw new Error('Failed to update product details');
    }
    console.log(`   Product updated successfully. New price: $${updateData.data.price}, stock: ${updateData.data.stock}`);

    // 10. Test Delete Product (Admin)
    console.log('10. Testing delete product as Admin...');
    const deleteRes = await fetch(`${BASE_URL}/products/${p1Id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (deleteRes.status !== 200) {
      throw new Error('Failed to delete product as admin');
    }

    const checkDeletedRes = await fetch(`${BASE_URL}/products/${p1Id}`);
    if (checkDeletedRes.status !== 404) {
      throw new Error('Deleted product was still found!');
    }
    console.log('   Product deleted successfully and correctly returns 404 when requested.');

    console.log('\n ALL Step 4 Product API Tests PASSED successfully!');
  } catch (err) {
    console.error(' Step 4 Product Test Failed:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
    await disconnectDB();
    console.log('Server and database closed cleanly.');
  }
};

setTimeout(runProductTests, 1500);
