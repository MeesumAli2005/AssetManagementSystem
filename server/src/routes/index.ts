import express from "express";

import authRoutes from "./authRoutes.js";
import adminRoutes from "./adminRoutes.js";

import categoryRoutes from "./categoryRoutes.js";
import assetRoutes from "./assetRoutes.js";

import departmentRoutes from "./departmentRoutes.js";
import employeeRoutes from "./employeeRoutes.js";
import requestRoutes from "./requestRoutes.js";

import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);

router.use("/categories", categoryRoutes);
router.use("/assets", assetRoutes);

router.use("/departments", departmentRoutes);
router.use("/employees", employeeRoutes);

router.use("/requests", requestRoutes);

// Uploaded documents (receipts, repair records) may contain sensitive info —
// require a valid login before serving any file back.
router.use("/uploads", requireAuth, express.static("uploads"));

export default router;