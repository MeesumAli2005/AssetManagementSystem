import express from "express";
import {
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  setEmployeeActiveStatus,
  getMyProfile,
  updateMyProfile,
} from "../controllers/employeeController.js";

import { createEmployeeAccount } from "../controllers/adminController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { ROLES } from "../constants.js";
import { validateBody, validateIdParam } from "../middleware/validate.js";
import {
  createEmployeeAccountSchema,
  setEmployeeActiveStatusSchema,
  updateEmployeeSchema,
  updateMyProfileSchema,
} from "../schemas.js";

const router = express.Router();

/// self service routes for logged in employees
router.get("/me", requireAuth, getMyProfile);
router.put(
  "/me",
  requireAuth,
  validateBody(updateMyProfileSchema),
  updateMyProfile,
);

// Employees viewing/managing "their own" stuff (like their own profile)
// will be handled through separate routes, all these are admin only

router.get("/", requireAuth, requireRole(ROLES.ADMINISTRATOR), getAllEmployees);
router.get("/:id", requireAuth, requireRole(ROLES.ADMINISTRATOR), getEmployeeById);
router.post(
  "/",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  validateBody(createEmployeeAccountSchema),
  createEmployeeAccount,
);
router.put(
  "/:id",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  validateIdParam("id"),
  validateBody(updateEmployeeSchema),
  updateEmployee,
);
router.patch(
  "/:id/status",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  validateIdParam("id"),
  validateBody(setEmployeeActiveStatusSchema),
  setEmployeeActiveStatus,
);

export default router;
