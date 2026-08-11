import express from 'express';
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  addSpecToCategory,
  deleteSpec,
} from '../controllers/categoryController.js';


import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Asset categories and their spec definitions (any logged-in user can view; admin-only to write)
 */

// Any logged-in user can VIEW categories (employees need this list when
// requesting an asset later), but only admins can create/edit/delete them.

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: List all categories with their specs
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Category' }
 */
router.get('/', requireAuth, getAllCategories);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get one category with its specs
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Category detail
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Category' }
 *       404: { description: Category not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.get('/:id', requireAuth, getCategoryById);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a category, optionally with its spec definitions (admin only)
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               specs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [spec_name]
 *                   properties:
 *                     spec_name: { type: string }
 *                     spec_type: { type: string, enum: [text, number, boolean, dropdown] }
 *                     is_required: { type: boolean }
 *     responses:
 *       201:
 *         description: Category created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Category' }
 *       400: { description: Missing/invalid fields, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       403: { description: Not an administrator, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       409: { description: Category name already exists, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.post('/', requireAuth, requireRole('administrator'), createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Rename a category (admin only)
 *     tags: [Categories]
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
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       200: { description: Category updated }
 *       400: { description: Missing name, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       403: { description: Not an administrator, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Category not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.put('/:id', requireAuth, requireRole('administrator'), updateCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category and its specs (admin only; blocked if any asset uses it)
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Category and its specs deleted }
 *       403: { description: Not an administrator, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Category not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       409: { description: Category still has assets assigned to it, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.delete('/:id', requireAuth, requireRole('administrator'), deleteCategory);



/**
 * @swagger
 * /api/categories/{id}/specs:
 *   post:
 *     summary: Add a spec definition to a category (admin only)
 *     tags: [Categories]
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
 *             required: [spec_name]
 *             properties:
 *               spec_name: { type: string }
 *               spec_type: { type: string, enum: [text, number, boolean, dropdown] }
 *               is_required: { type: boolean }
 *     responses:
 *       201:
 *         description: Spec created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CategorySpec' }
 *       400: { description: Missing/invalid fields, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       403: { description: Not an administrator, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Category not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.post('/:id/specs', requireAuth, requireRole('administrator'), addSpecToCategory);

/**
 * @swagger
 * /api/categories/specs/{specId}:
 *   delete:
 *     summary: Delete a spec definition (admin only)
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: specId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Spec deleted }
 *       403: { description: Not an administrator, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       404: { description: Spec not found, content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 *       500: { description: 'Spec is still in use by asset_spec_values (FK restrict)', content: { application/json: { schema: { $ref: '#/components/schemas/Error' } } } }
 */
router.delete('/specs/:specId', requireAuth, requireRole('administrator'), deleteSpec);

export default router;
