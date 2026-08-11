import express from 'express';
import { createEmployeeAccount, resetEmployeePassword } from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrator-only account management (requires an administrator JWT)
 */

/**
 * @swagger
 * /api/admin/employees:
 *   post:
 *     summary: Create an employee or administrator account (admin only)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, temporary_password]
 *             properties:
 *               full_name: { type: string }
 *               email: { type: string, format: email }
 *               temporary_password: { type: string, format: password }
 *               role: { type: string, enum: [employee, administrator], description: 'Defaults to employee if omitted/invalid' }
 *     responses:
 *       201:
 *         description: Account created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 email: { type: string }
 *                 role: { type: string }
 *                 message: { type: string }
 *       400: { description: Missing required fields, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       403: { description: Caller is not an administrator, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       409: { description: Email already registered, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
// Both routes: must be logged in AND must be an administrator.
// requireAuth runs first (populates req.user from the JWT), then
// requireRole checks req.user.role — this is the order it MUST be in,
// since requireRole depends on req.user already existing.
router.post('/employees', requireAuth, requireRole('administrator'), createEmployeeAccount);

/**
 * @swagger
 * /api/admin/employees/reset-password:
 *   post:
 *     summary: Reset any user's password (admin only — this is the "forgot password" mechanism)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, temporary_password]
 *             properties:
 *               user_id: { type: integer }
 *               temporary_password: { type: string, format: password }
 *     responses:
 *       200: { description: Password reset }
 *       400: { description: Missing required fields, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       403: { description: Caller is not an administrator, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: User not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.post('/employees/reset-password', requireAuth, requireRole('administrator'), resetEmployeePassword);

export default router;
