import express from "express";
import {
  createDepartment,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";

import { requireAuth, requireRole } from "../middleware/auth.js";
import { ROLES } from "../constants.js";

const router = express.Router();

// Anyone logged in can VIEW departments
router.get("/", requireAuth, getAllDepartments);

// Only admins can CREATE, UPDATE, or DELETE departments
router.post("/", requireAuth, requireRole(ROLES.ADMINISTRATOR), createDepartment);
router.put("/:id", requireAuth, requireRole(ROLES.ADMINISTRATOR), updateDepartment);
router.delete(
  "/:id",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  deleteDepartment,
);

export default router;
