import express from 'express';

import {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  retireAsset,
  getMyAssignedAssets,
  getPendingAcknowledgements,
  acknowledgeAssignment,
  setUsageState,
} from '../controllers/assetController.js';

import {uploadDocument, getDocumentsForAsset } from '../controllers/documentController.js';

import { requireAuth, requireRole } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Assets
 *     description: Asset inventory — create, view, update, retire (admin only — employees do not have inventory access)
 *   - name: Documents
 *     description: Supporting documents (receipts, repair records) attached to an asset
 */

/**
 * @swagger
 * /api/assets:
 *   get:
 *     summary: List assets, with optional search/filter
 *     tags: [Assets]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Matches against asset name or asset_tag
 *       - in: query
 *         name: category_id
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [available, assigned, under_repair, retired] }
 *       - in: query
 *         name: condition
 *         schema: { type: string, enum: [new, good, fair, damaged] }
 *       - in: query
 *         name: department_id
 *         schema: { type: integer }
 *         description: Filters to assets currently assigned to someone in this department
 *       - in: query
 *         name: assignee_id
 *         schema: { type: integer }
 *         description: Filters to assets currently assigned to this specific user
 *       - in: query
 *         name: assigned
 *         schema: { type: string, enum: [true, false] }
 *         description: true = has an assignee, false = unassigned, omitted = either
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated list of assets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Asset' }
 *                 page: { type: integer }
 *                 limit: { type: integer }
 *                 total: { type: integer }
 *                 totalPages: { type: integer }
 */
router.get('/', requireAuth, requireRole('administrator'), getAllAssets);

/**
 * @swagger
 * /api/assets/mine:
 *   get:
 *     summary: List assets currently assigned to the logged-in employee, with a status/condition summary
 *     tags: [Assets]
 *     responses:
 *       200:
 *         description: Assigned assets plus a bucketed summary (active/dormant/under_repair)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { type: object } }
 *                 summary:
 *                   type: object
 *                   properties:
 *                     active: { type: integer }
 *                     dormant: { type: integer }
 *                     under_repair: { type: integer }
 */
router.get('/mine', requireAuth, getMyAssignedAssets);

/**
 * @swagger
 * /api/assets/pending-acknowledgements:
 *   get:
 *     summary: List assignments made to the logged-in employee that they haven't acknowledged receipt of yet
 *     tags: [Assets]
 *     responses:
 *       200: { description: List of pending assignments }
 */
router.get('/pending-acknowledgements', requireAuth, getPendingAcknowledgements);

/**
 * @swagger
 * /api/assets/{id}:
 *   get:
 *     summary: Get one asset with its history, documents, and spec values. Admins can view any asset; employees can only view an asset they currently or previously had assigned to them.
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Asset detail
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AssetDetail' }
 *       403: { description: 'Employee has no history with this asset', content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Asset not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.get('/:id', requireAuth, getAssetById);

/**
 * @swagger
 * /api/assets:
 *   post:
 *     summary: Create an asset (admin only)
 *     tags: [Assets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [asset_tag, name, category_id]
 *             properties:
 *               asset_tag: { type: string }
 *               name: { type: string }
 *               category_id: { type: integer }
 *               purchase_date: { type: string, format: date }
 *               purchase_cost: { type: number }
 *               condition: { type: string, enum: [new, good, fair, damaged], default: new }
 *               spec_values:
 *                 type: array
 *                 items: { $ref: '#/components/schemas/SpecValue' }
 *     responses:
 *       201:
 *         description: Asset created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id: { type: integer }
 *                 asset_tag: { type: string }
 *                 name: { type: string }
 *       400: { description: 'Missing required fields, invalid condition, or spec_values fail category validation', content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       403: { description: Not an administrator, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       409: { description: asset_tag already exists, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.post('/', requireAuth, requireRole('administrator'), createAsset);

/**
 * @swagger
 * /api/assets/{id}:
 *   put:
 *     summary: Update an asset (admin only). Logs status_change/condition_change history entries when those fields change.
 *     tags: [Assets]
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
 *               name: { type: string }
 *               category_id: { type: integer }
 *               purchase_date: { type: string, format: date }
 *               purchase_cost: { type: number }
 *               status: { type: string, enum: [available, assigned, under_repair, retired] }
 *               condition: { type: string, enum: [new, good, fair, damaged] }
 *               spec_values:
 *                 type: array
 *                 items: { $ref: '#/components/schemas/SpecValue' }
 *     responses:
 *       200: { description: Asset updated }
 *       400: { description: Invalid status/condition or spec_values fail category validation, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       403: { description: Not an administrator, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Asset not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.put('/:id', requireAuth, requireRole('administrator'), updateAsset);

/**
 * @swagger
 * /api/assets/{id}/retire:
 *   post:
 *     summary: Retire an asset (admin only). History is preserved, never deleted.
 *     tags: [Assets]
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
 *               reason: { type: string, description: 'Defaults to "Asset retired" if omitted' }
 *     responses:
 *       200: { description: Asset retired }
 *       403: { description: Not an administrator, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Asset not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.post('/:id/retire', requireAuth, requireRole('administrator'), retireAsset);

/**
 * @swagger
 * /api/assets/{id}/acknowledge:
 *   post:
 *     summary: Acknowledge receipt of an asset assigned to you (employee self-service)
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Acknowledged }
 *       404: { description: No pending assignment to acknowledge for this asset, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.post('/:id/acknowledge', requireAuth, acknowledgeAssignment);

/**
 * @swagger
 * /api/assets/{id}/usage-state:
 *   patch:
 *     summary: Mark an asset assigned to you as active or dormant (employee self-service)
 *     tags: [Assets]
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
 *             required: [usage_state]
 *             properties:
 *               usage_state: { type: string, enum: [active, dormant] }
 *     responses:
 *       200: { description: Usage state updated }
 *       400: { description: Invalid usage_state, or asset isn't currently assigned, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       403: { description: Asset isn't assigned to you, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Asset not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.patch('/:id/usage-state', requireAuth, setUsageState);

/**
 * @swagger
 * /api/assets/{asset_id}/documents:
 *   post:
 *     summary: Upload a supporting document for an asset (admin only)
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: asset_id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF, PNG, or JPG — max 10MB
 *               document_type:
 *                 type: string
 *                 enum: [receipt, repair_record, other]
 *                 default: other
 *     responses:
 *       201:
 *         description: Document uploaded
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AssetDocument' }
 *       400: { description: No file uploaded, or file type/size rejected, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       403: { description: Not an administrator, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Asset not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
// document uploading by admin only
router.post(
  '/:asset_id/documents',
  requireAuth,
  requireRole('administrator'),
  upload.single('file'),
  uploadDocument
);

/**
 * @swagger
 * /api/assets/{asset_id}/documents:
 *   get:
 *     summary: List documents attached to an asset
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: asset_id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/AssetDocument' }
 */
router.get('/:asset_id/documents', requireAuth, requireRole('administrator'), getDocumentsForAsset);

export default router;
