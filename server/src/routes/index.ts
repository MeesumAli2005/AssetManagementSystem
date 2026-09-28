import express from "express";

import authRoutes from "./authRoutes.js";
import adminRoutes from "./adminRoutes.js";

import categoryRoutes from "./categoryRoutes.js";
import assetRoutes from "./assetRoutes.js";

import departmentRoutes from "./departmentRoutes.js";
import employeeRoutes from "./employeeRoutes.js";
import requestRoutes from "./requestRoutes.js";

import { requireAuth, requireRole } from "../middleware/auth.js";
import { ROLES } from "../constants.js";
import { serveOneTimeDocument } from "../controllers/documentController.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);

router.use("/categories", categoryRoutes);
router.use("/assets", assetRoutes);

router.use("/departments", departmentRoutes);
router.use("/employees", employeeRoutes);

router.use("/requests", requestRoutes);

// Uploaded documents (receipts, repair records) are admin-only, and never
// served from a permanent path — a document is only ever reachable through
// a one-time link minted by POST /assets/:asset_id/documents/:doc_id/link,
// and that link stops working the instant it's used once (see
// documentAccessTokens.ts). Still gated by role/auth on top of that, so a
// stolen-but-unused token is also useless to anyone but an admin.
router.get(
  "/uploads/one-time/:token",
  requireAuth,
  requireRole(ROLES.ADMINISTRATOR),
  serveOneTimeDocument,
);

export default router;