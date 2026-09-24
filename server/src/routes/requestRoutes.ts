import express from "express";

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
} from "../controllers/requestController.js";

import { requireAuth, requireRole } from "../middleware/auth.js";
import { ROLES } from "../constants.js";

const router = express.Router();

router.post("/", requireAuth, createRequest);

router.get("/mine", requireAuth, getMyRequests);

router.get("/", requireAuth, requireRole(ROLES.ADMINISTRATOR), getAllRequests);

router.get("/:id", requireAuth, getRequestById);

router.post(
  "/:id/notes",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  addRequestNote,
);

router.patch(
  "/:id/review",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  reviewRequest,
);

router.patch(
  "/:id/complete-return",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  completeReturn,
);

router.patch("/:id/acknowledge-return", requireAuth, acknowledgeReturn);

router.patch(
  "/:id/complete-repair",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  completeRepair,
);

router.post(
  "/:id/assign",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  assignAssetToRequest,
);

export default router;
