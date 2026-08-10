import express from 'express';
import {
  signup,
  login,
  logout,
  changePassword,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
 
const router = express.Router();
 
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', requireAuth, logout);
router.post('/change-password', requireAuth, changePassword); // must be logged in — we need req.user.id
 
export default router;
 