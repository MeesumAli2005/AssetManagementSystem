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

const router = express.Router();

router.post("/", requireAuth, createRequest);

router.get("/mine", requireAuth, getMyRequests);

router.get("/", requireAuth, requireRole("administrator"), getAllRequests);

router.get("/:id", requireAuth, getRequestById);

router.post(
  "/:id/notes",
  requireAuth,
  requireRole("administrator"),
  addRequestNote,
);

router.patch(
  "/:id/review",
  requireAuth,
  requireRole("administrator"),
  reviewRequest,
);

router.patch(
  "/:id/complete-return",
  requireAuth,
  requireRole("administrator"),
  completeReturn,
);

router.patch("/:id/acknowledge-return", requireAuth, acknowledgeReturn);

router.patch(
  "/:id/complete-repair",
  requireAuth,
  requireRole("administrator"),
  completeRepair,
);

router.post(
  "/:id/assign",
  requireAuth,
  requireRole("administrator"),
  assignAssetToRequest,
);

export default router;
