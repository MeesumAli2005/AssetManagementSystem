import express from 'express';

import {
  createRequest,
  getMyRequests,
  getAllRequests,
  getRequestById,
  reviewRequest,
  assignAssetToRequest,
  completeReturn,
  acknowledgeReturn,
  completeRepair,
  addRequestNote,
} from '../controllers/requestController.js';

import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Requests
 *     description: Employee asset/return/repair requests — submission, admin review, and fulfillment
 */

/**
 * @swagger
 * /api/requests:
 *   post:
 *     summary: Submit a request (employee)
 *     tags: [Requests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [request_type, reason]
 *             properties:
 *               request_type: { type: string, enum: [asset, return, repair] }
 *               category_id: { type: integer, description: Required for an "asset" request }
 *               asset_id: { type: integer, description: Required for a "return" or "repair" request — must be assigned to you }
 *               reason: { type: string }
 *     responses:
 *       201: { description: Request submitted }
 *       400: { description: Missing/invalid fields, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       403: { description: 'asset_id is not assigned to you', content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.post('/', requireAuth, createRequest);

/**
 * @swagger
 * /api/requests/mine:
 *   get:
 *     summary: List the logged-in employee's own requests, for status tracking
 *     tags: [Requests]
 *     responses:
 *       200: { description: List of requests }
 */
router.get('/mine', requireAuth, getMyRequests);

/**
 * @swagger
 * /api/requests:
 *   get:
 *     summary: List all requests (admin queue)
 *     tags: [Requests]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, approved, rejected, completed, sent_for_repair] }
 *         description: 'status=pending also includes "approved" and "sent_for_repair" — requests that are still waiting on an admin action.'
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Matches employee name/email, asset name/tag, category name, or reason — across every status.
 *     responses:
 *       200: { description: List of requests }
 *       403: { description: Not an administrator, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.get('/', requireAuth, requireRole('administrator'), getAllRequests);

/**
 * @swagger
 * /api/requests/{id}:
 *   get:
 *     summary: Get full details of a single request, of any type. Admins can view any request; an employee can only view their own.
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Request detail }
 *       403: { description: Not your request, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Request not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.get('/:id', requireAuth, getRequestById);

/**
 * @swagger
 * /api/requests/{id}/notes:
 *   post:
 *     summary: Add an internal note to a request (admin). Allowed regardless of the request's current status — pending, approved, rejected, completed, or sent_for_repair. Never shown to the employee; records who wrote it and what the status was at that moment.
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [note]
 *             properties:
 *               note: { type: string }
 *     responses:
 *       201: { description: Note added }
 *       400: { description: note is required, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       403: { description: Not an administrator, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Request not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.post('/:id/notes', requireAuth, requireRole('administrator'), addRequestNote);

/**
 * @swagger
 * /api/requests/{id}/review:
 *   patch:
 *     summary: Approve or reject a pending request (admin). Asset requests move to "approved" pending /assign. Return requests move to "approved" and the asset is immediately unassigned, pending /complete-return. Repair requests move straight to "sent_for_repair" (with an optional repair_details note) and the asset is marked under_repair, pending /complete-repair.
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [approved, rejected] }
 *               review_notes: { type: string, description: 'Optional admin note shown to the employee, settable on approve or reject, for any request type' }
 *               repair_details: { type: string, description: 'Optional admin-only note (diagnosis/plan) when approving a "repair" request — never shown to the employee' }
 *     responses:
 *       200: { description: Request reviewed }
 *       400: { description: Invalid status, or request already reviewed, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       403: { description: Not an administrator, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Request not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.patch('/:id/review', requireAuth, requireRole('administrator'), reviewRequest);

/**
 * @swagger
 * /api/requests/{id}/complete-return:
 *   patch:
 *     summary: Mark an approved return request completed once the asset is physically received back (admin)
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes: { type: string }
 *     responses:
 *       200: { description: Return marked completed }
 *       400: { description: Not a return request, or not yet approved, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       403: { description: Not an administrator, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Request not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.patch('/:id/complete-return', requireAuth, requireRole('administrator'), completeReturn);

/**
 * @swagger
 * /api/requests/{id}/acknowledge-return:
 *   patch:
 *     summary: Confirm you've physically sent the asset back, for a completed return request you submitted (employee)
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Return acknowledged }
 *       400: { description: Not ready to be acknowledged, or already acknowledged, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       403: { description: Not your request, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Request not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.patch('/:id/acknowledge-return', requireAuth, acknowledgeReturn);

/**
 * @swagger
 * /api/requests/{id}/complete-repair:
 *   patch:
 *     summary: Mark a sent_for_repair repair request completed — asset goes back to "assigned" for the original employee (admin)
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               repair_notes: { type: string }
 *     responses:
 *       200: { description: Repair marked completed }
 *       400: { description: Not a repair request, or not sent for repair, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       403: { description: Not an administrator, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Request not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.patch('/:id/complete-repair', requireAuth, requireRole('administrator'), completeRepair);

/**
 * @swagger
 * /api/requests/{id}/assign:
 *   post:
 *     summary: Assign a specific available asset to fulfill an approved "asset"-type request (admin)
 *     tags: [Requests]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [asset_id]
 *             properties:
 *               asset_id: { type: integer }
 *     responses:
 *       200: { description: Asset assigned, request completed }
 *       400: { description: 'Request not approved, asset not available, or category mismatch', content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       403: { description: Not an administrator, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Request not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.post('/:id/assign', requireAuth, requireRole('administrator'), assignAssetToRequest);

export default router;
