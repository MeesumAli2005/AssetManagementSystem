import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  addSpecToCategory,
  deleteSpec,
} from "../controllers/categoryController.js";

import { requireAuth, requireRole } from "../middleware/auth.js";
import { ROLES } from "../constants.js";
import { validateBody, validateIdParam } from "../middleware/validate.js";
import {
  addSpecToCategorySchema,
  createCategorySchema,
  updateCategorySchema,
} from "../schemas.js";

const router = express.Router();

router.get("/", requireAuth, getAllCategories);

router.get("/:id", requireAuth, getCategoryById);

router.post(
  "/",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  validateBody(createCategorySchema),
  createCategory,
);

router.put(
  "/:id",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  validateIdParam("id"),
  validateBody(updateCategorySchema),
  updateCategory,
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  validateIdParam("id"),
  deleteCategory,
);

router.post(
  "/:id/specs",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  validateIdParam("id"),
  validateBody(addSpecToCategorySchema),
  addSpecToCategory,
);

router.delete(
  "/specs/:specId",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  validateIdParam("specId"),
  deleteSpec,
);

export default router;
