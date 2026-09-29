import express from "express";
import rateLimit from "express-rate-limit";
import {
  login,
  logout,
  changePassword,
} from "../controllers/authController.js";
import { requireAuth, requireAuthOptional } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { changePasswordSchema, loginSchema } from "../schemas.js";

const router = express.Router();

// Caps attempts per IP, not per account — an account-based limit could be
// abused by an outsider to lock a real user out just by repeatedly failing
// their email.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Try again in a few minutes." },
});

//router.post('/signup', signup);

router.post("/login", loginLimiter, validateBody(loginSchema), login);

router.post("/logout", requireAuthOptional, logout);

router.post(
  "/change-password",
  requireAuth,
  validateBody(changePasswordSchema),
  changePassword,
); // must be logged in — we need req.user.id

export default router;
