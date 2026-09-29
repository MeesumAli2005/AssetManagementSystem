import express from "express";

import {
  createRequest,
  getMyRequests,
  getAllRequests,
  getPendingRequestCount,
  getRequestById,
  reviewRequest,
  assignAssetToRequest,
  completeReturn,
  acknowledgeReturn,
  completeRepair,
  addRequestNote,
} from "../controllers/requestController.js";

import { requireAuth, requireRole } from "../middleware/auth.js";
import { ROLES } from "../constants.js";
import { validateBody, validateIdParam } from "../middleware/validate.js";
import {
  addRequestNoteSchema,
  assignAssetToRequestSchema,
  completeRepairSchema,
  completeReturnSchema,
  createRequestSchema,
  reviewRequestSchema,
} from "../schemas.js";

const router = express.Router();

router.post("/", requireAuth, validateBody(createRequestSchema), createRequest);

router.get("/mine", requireAuth, getMyRequests);

// Must come before /:id — otherwise Express would match "pending-count"
// itself as the :id param.
router.get(
  "/pending-count",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  getPendingRequestCount,
);

router.get("/", requireAuth, requireRole(ROLES.ADMINISTRATOR), getAllRequests);

router.get("/:id", requireAuth, getRequestById);

router.post(
  "/:id/notes",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  validateIdParam("id"),
  validateBody(addRequestNoteSchema),
  addRequestNote,
);

router.patch(
  "/:id/review",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  validateIdParam("id"),
  validateBody(reviewRequestSchema),
  reviewRequest,
);

router.patch(
  "/:id/complete-return",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  validateIdParam("id"),
  validateBody(completeReturnSchema),
  completeReturn,
);

router.patch(
  "/:id/acknowledge-return",
  requireAuth,
  validateIdParam("id"),
  acknowledgeReturn,
);

router.patch(
  "/:id/complete-repair",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  validateIdParam("id"),
  validateBody(completeRepairSchema),
  completeRepair,
);

router.post(
  "/:id/assign",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  validateIdParam("id"),
  validateBody(assignAssetToRequestSchema),
  assignAssetToRequest,
);

export default router;
