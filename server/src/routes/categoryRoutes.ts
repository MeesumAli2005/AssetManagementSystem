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

const router = express.Router();

router.get("/", requireAuth, getAllCategories);

router.get("/:id", requireAuth, getCategoryById);

router.post("/", requireAuth, requireRole("administrator"), createCategory);

router.put("/:id", requireAuth, requireRole("administrator"), updateCategory);

router.delete(
  "/:id",
  requireAuth,
  requireRole("administrator"),
  deleteCategory,
);

router.post(
  "/:id/specs",
  requireAuth,
  requireRole("administrator"),
  addSpecToCategory,
);

router.delete(
  "/specs/:specId",
  requireAuth,
  requireRole("administrator"),
  deleteSpec,
);

export default router;
