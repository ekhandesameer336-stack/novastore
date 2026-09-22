import app, { server } from './server.js';
import mongoose from 'mongoose';
import { disconnectDB } from './src/config/db.js';

const BASE_URL = 'http://localhost:5000/api/auth';

const runAuthTests = async () => {
  console.log('--- Starting Step 3: Authentication & Authorization Tests ---');

  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => mongoose.connection.once('open', resolve));
  }

  try {
    // 1. Test Customer Registration
    console.log('1. Testing User Registration (Customer)...');
    const regRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Johnson',
        email: 'alice@example.com',
        password: 'securePassword123',
        address: { city: 'New York', street: '5th Ave', zip: '10001', country: 'USA' },
      }),
    });
    const regData = await regRes.json();
    if (regRes.status !== 201 || !regData.data.token) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }
    console.log('   Registration successful! JWT token generated.');

    // 2. Test Duplicate Email Registration
    console.log('2. Testing Duplicate Email Registration rejection...');
    const dupRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Johnson Duplicate',
        email: 'alice@example.com',
        password: 'anotherPassword',
      }),
    });
    const dupData = await dupRes.json();
    if (dupRes.status !== 400 || !dupData.message.includes('already exists')) {
      throw new Error(`Duplicate email was not properly rejected: ${JSON.stringify(dupData)}`);
    }
    console.log(`   Duplicate email cleanly rejected (Status ${dupRes.status}): "${dupData.message}"`);

    // 3. Test Login with Wrong Password
    console.log('3. Testing Login with WRONG password...');
    const wrongLoginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice@example.com',
        password: 'WrongPassword456!',
      }),
    });
    const wrongLoginData = await wrongLoginRes.json();
    if (wrongLoginRes.status !== 401 || wrongLoginData.success !== false) {
      throw new Error(`Wrong password did not return 401: ${JSON.stringify(wrongLoginData)}`);
    }
    console.log(`   Wrong password cleanly rejected (Status ${wrongLoginRes.status}): "${wrongLoginData.message}"`);

    // 4. Test Login with Correct Password
    console.log('4. Testing Login with CORRECT password...');
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice@example.com',
        password: 'securePassword123',
      }),
    });
    const loginData = await loginRes.json();
    if (loginRes.status !== 200 || !loginData.data.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    const customerToken = loginData.data.token;
    console.log('   Login successful! Bearer token obtained.');

    // 5. Test Access Protected Route without Token
    console.log('5. Testing Protected Route without Token...');
    const noTokenRes = await fetch(`${BASE_URL}/me`);
    const noTokenData = await noTokenRes.json();
    if (noTokenRes.status !== 401) {
      throw new Error('Protected route allowed access without token!');
    }
    console.log(`   Unauthorized access cleanly blocked (Status 401): "${noTokenData.message}"`);

    // 6. Test Access Protected Route with Customer Token
    console.log('6. Testing Protected Route with Customer Token...');
    const meRes = await fetch(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const meData = await meRes.json();
    if (meRes.status !== 200 || meData.data.email !== 'alice@example.com') {
      throw new Error(`Protected /me failed: ${JSON.stringify(meData)}`);
    }
    console.log(`   Customer profile successfully retrieved for: ${meData.data.name}`);

    // 7. Test Admin Route Access as Customer (Forbidden)
    console.log('7. Testing Admin-Only route as a Customer (Must be 403)...');
    const adminForbiddenRes = await fetch(`${BASE_URL}/admin-test`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const adminForbiddenData = await adminForbiddenRes.json();
    if (adminForbiddenRes.status !== 403) {
      throw new Error(`Customer was improperly granted admin access! Status: ${adminForbiddenRes.status}`);
    }
    console.log(`   Admin access cleanly blocked for non-admin (Status 403): "${adminForbiddenData.message}"`);

    // 8. Test Admin Registration and Admin Route Access
    console.log('8. Testing Admin Route as an Admin user...');
    const adminRegRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Super Admin',
        email: 'admin@example.com',
        password: 'adminPassword123',
        role: 'admin',
      }),
    });
    const adminRegData = await adminRegRes.json();
    const adminToken = adminRegData.data.token;

    const adminAccessRes = await fetch(`${BASE_URL}/admin-test`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminAccessData = await adminAccessRes.json();
    if (adminAccessRes.status !== 200) {
      throw new Error(`Admin could not access admin route: ${JSON.stringify(adminAccessData)}`);
    }
    console.log(`   Admin access successfully granted to: ${adminAccessData.user.name}`);

    console.log('\n ALL Step 3 Authentication & Authorization Tests PASSED successfully!');
  } catch (err) {
    console.error(' Step 3 Auth Test Failed:', err.message);
    process.exitCode = 1;
  } finally {
    server.close();
    await disconnectDB();
    console.log('Server and database closed cleanly.');
  }
};

setTimeout(runAuthTests, 1500);
