import express from 'express';
import {
  registerUser,
  loginUser,
  getMe,
} from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Admin-only test endpoint to verify role authorization
router.get('/admin-test', protect, adminOnly, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome Admin! Access granted to protected admin resources.',
    user: req.user,
  });
});

export default router;
