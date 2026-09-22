import app, { server } from './server.js';
import mongoose from 'mongoose';
import { disconnectDB } from './src/config/db.js';

const testHealthEndpoint = async () => {
  console.log('Testing /api/health endpoint...');

  if (mongoose.connection.readyState !== 1) {
    console.log('Waiting for MongoDB connection readyState === 1...');
    await new Promise((resolve) => {
      mongoose.connection.once('open', resolve);
    });
  }

  console.log('MongoDB is ready. Making GET /api/health request...');

  try {
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    console.log('Received response from /api/health:', JSON.stringify(data, null, 2));

    if (response.status === 200 && data.status === 'ok' && data.database.status === 'Connected') {
      console.log(' Health check test PASSED!');
      server.close();
      await disconnectDB();
      console.log('Server and database shut down cleanly.');
    } else {
      console.error(' Health check verification FAILED: unexpected payload');
      server.close();
      await disconnectDB();
      process.exit(1);
    }
  } catch (err) {
    console.error(' Health check request error:', err.message);
    server.close();
    await disconnectDB();
    process.exit(1);
  }
};

setTimeout(testHealthEndpoint, 1500);
