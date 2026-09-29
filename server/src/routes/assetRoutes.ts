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
  getMyPendingAcknowledgementsCount,
  getMyAcknowledgements,
  getAcknowledgementById,
  acknowledgeAssignment,
  setUsageState,
  getAssetStats,
} from "../controllers/assetController.js";

import {
  uploadDocument,
  getDocumentsForAsset,
  createDocumentAccessLink,
} from "../controllers/documentController.js";

import { requireAuth, requireRole } from "../middleware/auth.js";
import { ROLES } from "../constants.js";
import upload from "../middleware/upload.js";
import { validateBody, validateIdParam } from "../middleware/validate.js";
import {
  createAssetSchema,
  retireOrDisposeAssetSchema,
  setUsageStateSchema,
  updateAssetSchema,
} from "../schemas.js";

const router = express.Router();

router.get("/", requireAuth, requireRole(ROLES.ADMINISTRATOR), getAllAssets);

router.get("/mine", requireAuth, getMyAssignedAssets);

router.get(
  "/pending-acknowledgements",
  requireAuth,
  getPendingAcknowledgements,
);

// Must come before /:id — otherwise Express would match
// "my-pending-acknowledgements-count" itself as the :id param.
router.get(
  "/my-pending-acknowledgements-count",
  requireAuth,
  getMyPendingAcknowledgementsCount,
);

router.get("/my-acknowledgements", requireAuth, getMyAcknowledgements);

router.get("/acknowledgements/:id", requireAuth, getAcknowledgementById);

router.get("/stats", requireAuth, requireRole(ROLES.ADMINISTRATOR), getAssetStats);

router.get("/:id", requireAuth, getAssetById);

router.post(
  "/",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  validateBody(createAssetSchema),
  createAsset,
);

router.put(
  "/:id",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  validateIdParam("id"),
  validateBody(updateAssetSchema),
  updateAsset,
);

router.post(
  "/:id/retire",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  validateIdParam("id"),
  validateBody(retireOrDisposeAssetSchema),
  retireAsset,
);

router.post(
  "/:id/dispose",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  validateIdParam("id"),
  validateBody(retireOrDisposeAssetSchema),
  disposeAsset,
);

router.post(
  "/:id/acknowledge",
  requireAuth,
  validateIdParam("id"),
  acknowledgeAssignment,
);

router.patch(
  "/:id/usage-state",
  requireAuth,
  validateIdParam("id"),
  validateBody(setUsageStateSchema),
  setUsageState,
);

// document uploading by admin only — no body schema here since this is a
// multipart/form-data upload, not JSON; document_type already has a safe
// fallback in the controller itself.
router.post(
  "/:asset_id/documents",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  validateIdParam("asset_id"),
  upload.single("file"),
  uploadDocument,
);

router.get(
  "/:asset_id/documents",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  validateIdParam("asset_id"),
  getDocumentsForAsset,
);

// mints a one-time link for viewing a single document — see
// documentController.createDocumentAccessLink / serveOneTimeDocument
router.post(
  "/:asset_id/documents/:doc_id/link",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  validateIdParam("asset_id"),
  validateIdParam("doc_id"),
  createDocumentAccessLink,
);

export default router;
