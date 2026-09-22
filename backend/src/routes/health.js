import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// @route   GET /api/health
// @desc    Health check endpoint to verify backend and database connection
// @access  Public
router.get('/', (req, res) => {
  const dbStateMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };

  const dbStatus = dbStateMap[mongoose.connection.readyState] || 'Unknown';

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      readyState: mongoose.connection.readyState,
    },
    service: 'ecommerce-backend',
  });
});

export default router;
