// requireAuth checks the jwt, requireRole checks what's in it
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import type { AuthenticatedUser } from "../types.js";

// Required env var, no sensible default — same reasoning as db.ts.
const JWT_SECRET = process.env.JWT_SECRET!;

export function checkTokenValidity(
  headers: { authorization?: string | undefined },
  ignoreExpiration = false,
): AuthenticatedUser | null {
  const authHeader = headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1]!;
  try {
    // We only ever sign plain-object payloads (see authController.js's
    // login), never a bare string, so this cast is safe.
    const decoded = jwt.verify(token, JWT_SECRET, {
      ignoreExpiration,
    }) as AuthenticatedUser;
    return decoded;
  } catch (err) {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const decoded = checkTokenValidity(req.headers, false);

  if (!decoded) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  req.user = decoded;
  next();
}

// Still requires a valid, signed token — just doesn't reject an expired
// one. Used only for logout, so someone whose token expired can still log
// out client-side instead of getting stuck unable to clear their session.
// (Previously named requireAuthOptional, which suggested auth itself was
// optional here — it isn't; only the expiry check is skipped.)
export function requireAuthIgnoreExpiry(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const decoded = checkTokenValidity(req.headers, true);

  if (!decoded) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  req.user = decoded;
  next();
}

//checking the allowed roles
export function requireRole(...allowedRoles: AuthenticatedUser["role"][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Not enough permissions" });
    }
    next();
  };
}
