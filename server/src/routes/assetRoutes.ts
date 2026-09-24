import express from "express";

import {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  retireAsset,
  disposeAsset,
  getMyAssignedAssets,
  getPendingAcknowledgements,
  getMyAcknowledgements,
  getAcknowledgementById,
  acknowledgeAssignment,
  setUsageState,
  getAssetStats,
} from "../controllers/assetController.js";

import {
  uploadDocument,
  getDocumentsForAsset,
} from "../controllers/documentController.js";

import { requireAuth, requireRole } from "../middleware/auth.js";
import { ROLES } from "../constants.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", requireAuth, requireRole(ROLES.ADMINISTRATOR), getAllAssets);

router.get("/mine", requireAuth, getMyAssignedAssets);

router.get(
  "/pending-acknowledgements",
  requireAuth,
  getPendingAcknowledgements,
);

router.get("/my-acknowledgements", requireAuth, getMyAcknowledgements);

router.get("/acknowledgements/:id", requireAuth, getAcknowledgementById);

router.get("/stats", requireAuth, requireRole(ROLES.ADMINISTRATOR), getAssetStats);

router.get("/:id", requireAuth, getAssetById);

router.post("/", requireAuth, requireRole(ROLES.ADMINISTRATOR), createAsset);

router.put("/:id", requireAuth, requireRole(ROLES.ADMINISTRATOR), updateAsset);

router.post(
  "/:id/retire",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  retireAsset,
);

router.post(
  "/:id/dispose",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  disposeAsset,
);

router.post("/:id/acknowledge", requireAuth, acknowledgeAssignment);

router.patch("/:id/usage-state", requireAuth, setUsageState);

// document uploading by admin only
router.post(
  "/:asset_id/documents",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  upload.single("file"),
  uploadDocument,
);

router.get(
  "/:asset_id/documents",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  getDocumentsForAsset,
);

export default router;
