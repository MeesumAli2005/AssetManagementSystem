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

const router = express.Router();

router.get("/", requireAuth, getAllCategories);

router.get("/:id", requireAuth, getCategoryById);

router.post("/", requireAuth, requireRole(ROLES.ADMINISTRATOR), createCategory);

router.put("/:id", requireAuth, requireRole(ROLES.ADMINISTRATOR), updateCategory);

router.delete(
  "/:id",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  deleteCategory,
);

router.post(
  "/:id/specs",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  addSpecToCategory,
);

router.delete(
  "/specs/:specId",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  deleteSpec,
);

export default router;
