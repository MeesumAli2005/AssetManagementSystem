import express from 'express';
import { createEmployeeAccount, resetEmployeePassword } from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Both routes: must be logged in AND must be an administrator.
// requireAuth runs first (populates req.user from the JWT), then
// requireRole checks req.user.role — this is the order it MUST be in,
// since requireRole depends on req.user already existing.
router.post('/employees', requireAuth, requireRole('administrator'), createEmployeeAccount);
router.post('/employees/reset-password', requireAuth, requireRole('administrator'), resetEmployeePassword);

export default router;