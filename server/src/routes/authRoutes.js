import express from 'express';
import {
  login,
  logout,
  changePassword,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Signup, login, logout, and password change
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Self-signup (always creates an employee account)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               full_name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
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
 *       400: { description: Missing required fields, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       409: { description: Email already registered, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
//router.post('/signup', signup);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponse' }
 *       401: { description: Invalid email or password, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       403: { description: Account is deactivated, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out (client discards the token — this call is mainly for logging)
 *     tags: [Auth]
 *     responses:
 *       200: { description: Logged out }
 *       401: { description: No or invalid token, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.post('/logout', requireAuth, logout);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change your own password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [current_password, new_password, confirm_password]
 *             properties:
 *               current_password: { type: string, format: password }
 *               new_password: { type: string, format: password }
 *               confirm_password: { type: string, format: password }
 *     responses:
 *       200: { description: Password changed }
 *       400: { description: Missing fields or new/confirm mismatch, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       401: { description: No/invalid token, or current_password is wrong, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.post('/change-password', requireAuth, changePassword); // must be logged in — we need req.user.id

export default router;
