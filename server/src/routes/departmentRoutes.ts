import express from "express";
import {
  createDepartment,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";

import { requireAuth, requireRole } from "../middleware/auth.js";
import { ROLES } from "../constants.js";
import { validateBody, validateIdParam } from "../middleware/validate.js";
import { createDepartmentSchema, updateDepartmentSchema } from "../schemas.js";

const router = express.Router();

// Anyone logged in can VIEW departments
router.get("/", requireAuth, getAllDepartments);

// Only admins can CREATE, UPDATE, or DELETE departments
router.post(
  "/",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  validateBody(createDepartmentSchema),
  createDepartment,
);
router.put(
  "/:id",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  validateIdParam("id"),
  validateBody(updateDepartmentSchema),
  updateDepartment,
);
router.delete(
  "/:id",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  validateIdParam("id"),
  deleteDepartment,
);

export default router;
